// Delivers a message straight to each recipient domain's MX over SMTP (port 25,
// STARTTLS when offered). No mail provider account is involved; receiving
// servers judge the sender by SPF for the envelope domain and by the sending
// IP's reverse DNS.
import { randomUUID } from "node:crypto";
import { resolveMx } from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";

export type MailAttachment = {
  filename: string;
  contentType: string;
  content: Uint8Array;
};

export type OutgoingMail = {
  fromAddress: string;
  fromName: string;
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
};

export type DeliveryOptions = {
  heloName: string;
  port?: number;
  timeoutMs?: number;
  lookupMx?: (domain: string) => Promise<{ exchange: string; priority: number }[]>;
  tlsOptions?: tls.ConnectionOptions;
};

export type DomainResult = {
  domain: string;
  accepted: string[];
  rejected: { address: string; reply: string }[];
  error?: string;
};

const CRLF = "\r\n";

function encodeHeader(value: string) {
  const clean = value.replace(/[\r\n]+/g, " ");
  return /^[\x20-\x7e]*$/.test(clean)
    ? clean
    : `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

function base64Lines(content: Uint8Array | string) {
  const encoded = Buffer.from(content).toString("base64");
  return encoded.replace(/.{1,76}/g, (line) => `${line}${CRLF}`);
}

function assertAddress(address: string) {
  if (!/^[^\s<>@,;"]+@[^\s<>@,;"]+\.[^\s<>@,;"]+$/.test(address)) {
    throw new Error(`Invalid email address: ${address}`);
  }
  return address;
}

export function buildMessage(mail: OutgoingMail, now = new Date()) {
  const from = assertAddress(mail.fromAddress);
  const domain = from.split("@")[1];
  const mixed = `mixed-${randomUUID()}`;
  const alternative = `alt-${randomUUID()}`;
  const headers = [
    `From: ${encodeHeader(mail.fromName)} <${from}>`,
    `To: ${mail.to.map(assertAddress).join(", ")}`,
    ...(mail.replyTo ? [`Reply-To: ${assertAddress(mail.replyTo)}`] : []),
    `Subject: ${encodeHeader(mail.subject)}`,
    `Date: ${now.toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${randomUUID()}@${domain}>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${mixed}"`,
  ];
  const parts = [
    `--${mixed}`,
    `Content-Type: multipart/alternative; boundary="${alternative}"`,
    "",
    `--${alternative}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Lines(mail.text),
    `--${alternative}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Lines(mail.html),
    `--${alternative}--`,
    "",
  ];
  for (const attachment of mail.attachments ?? []) {
    const name = attachment.filename.replace(/["\\\r\n]+/g, "_");
    parts.push(
      `--${mixed}`,
      `Content-Type: ${attachment.contentType}; name="${encodeHeader(name)}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${encodeHeader(name)}"`,
      "",
      base64Lines(attachment.content),
    );
  }
  parts.push(`--${mixed}--`, "");
  // Base64 bodies never start a line with ".", so no dot-stuffing is needed.
  return `${headers.join(CRLF)}${CRLF}${CRLF}${parts.join(CRLF)}`;
}

type Reply = { code: number; text: string };

class SmtpConnection {
  private socket: net.Socket | tls.TLSSocket;
  private buffer = "";
  private waiting: ((reply: Reply) => void) | null = null;
  private failure: Error | null = null;
  private failed: ((error: Error) => void) | null = null;

  constructor(socket: net.Socket) {
    this.socket = socket;
    this.attach(socket);
  }

  private attach(socket: net.Socket | tls.TLSSocket) {
    socket.setEncoding("utf8");
    socket.on("data", (chunk: string) => {
      this.buffer += chunk;
      this.flush();
    });
    socket.on("error", (error) => this.fail(error));
    socket.on("close", () => this.fail(new Error("SMTP connection closed")));
  }

  private fail(error: Error) {
    if (this.failure) return;
    this.failure = error;
    this.failed?.(error);
  }

  private flush() {
    if (!this.waiting) return;
    const lines = this.buffer.split(CRLF);
    for (let index = 0; index < lines.length - 1; index += 1) {
      if (/^\d{3} /.test(lines[index]) || /^\d{3}$/.test(lines[index])) {
        const replyLines = lines.slice(0, index + 1);
        this.buffer = lines.slice(index + 1).join(CRLF);
        const resolve = this.waiting;
        this.waiting = null;
        resolve?.({
          code: Number(lines[index].slice(0, 3)),
          text: replyLines.map((line) => line.slice(4)).join("\n"),
        });
        return;
      }
    }
  }

  read(timeoutMs: number) {
    return new Promise<Reply>((resolve, reject) => {
      if (this.failure) return reject(this.failure);
      const timer = setTimeout(() => reject(new Error("SMTP reply timed out")), timeoutMs);
      this.failed = (error) => {
        clearTimeout(timer);
        reject(error);
      };
      this.waiting = (reply) => {
        clearTimeout(timer);
        this.failed = null;
        resolve(reply);
      };
      this.flush();
    });
  }

  async command(line: string, timeoutMs: number) {
    this.socket.write(`${line}${CRLF}`);
    return this.read(timeoutMs);
  }

  async startTls(servername: string, options: tls.ConnectionOptions | undefined) {
    const plain = this.socket as net.Socket;
    plain.removeAllListeners("data");
    plain.removeAllListeners("error");
    plain.removeAllListeners("close");
    const secure = await new Promise<tls.TLSSocket>((resolve, reject) => {
      const upgraded = tls.connect({ socket: plain, servername, ...options }, () => resolve(upgraded));
      upgraded.once("error", reject);
    });
    this.socket = secure;
    this.buffer = "";
    this.attach(secure);
  }

  end() {
    this.socket.end();
  }
}

function connect(host: string, port: number, timeoutMs: number) {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Connection to ${host}:${port} timed out`));
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function deliverToHost(
  host: string,
  from: string,
  recipients: string[],
  message: string,
  options: DeliveryOptions,
): Promise<Omit<DomainResult, "domain">> {
  const timeoutMs = options.timeoutMs ?? 15_000;
  const smtp = new SmtpConnection(await connect(host, options.port ?? 25, timeoutMs));
  try {
    const expect = (reply: Reply, codes: number[], step: string) => {
      if (!codes.includes(reply.code)) throw new Error(`${step}: ${reply.code} ${reply.text}`);
      return reply;
    };
    expect(await smtp.read(timeoutMs), [220], "greeting");
    let ehlo = expect(await smtp.command(`EHLO ${options.heloName}`, timeoutMs), [250], "EHLO");
    if (/^STARTTLS\b/im.test(ehlo.text)) {
      expect(await smtp.command("STARTTLS", timeoutMs), [220], "STARTTLS");
      await smtp.startTls(host, options.tlsOptions);
      ehlo = expect(await smtp.command(`EHLO ${options.heloName}`, timeoutMs), [250], "EHLO after STARTTLS");
    }
    expect(await smtp.command(`MAIL FROM:<${from}>`, timeoutMs), [250], "MAIL FROM");
    const accepted: string[] = [];
    const rejected: { address: string; reply: string }[] = [];
    for (const address of recipients) {
      const reply = await smtp.command(`RCPT TO:<${address}>`, timeoutMs);
      if (reply.code === 250 || reply.code === 251) accepted.push(address);
      else rejected.push({ address, reply: `${reply.code} ${reply.text}` });
    }
    if (!accepted.length) {
      await smtp.command("QUIT", timeoutMs).catch(() => undefined);
      return { accepted, rejected };
    }
    expect(await smtp.command("DATA", timeoutMs), [354], "DATA");
    const final = await smtp.command(`${message}${CRLF}.`, Math.max(timeoutMs, 30_000));
    if (final.code !== 250) {
      return {
        accepted: [],
        rejected: [...rejected, ...accepted.map((address) => ({ address, reply: `${final.code} ${final.text}` }))],
      };
    }
    await smtp.command("QUIT", timeoutMs).catch(() => undefined);
    return { accepted, rejected };
  } finally {
    smtp.end();
  }
}

export async function sendDirect(mail: OutgoingMail, options: DeliveryOptions) {
  const message = buildMessage(mail);
  const from = assertAddress(mail.fromAddress);
  const lookupMx = options.lookupMx ?? resolveMx;
  const byDomain = new Map<string, string[]>();
  for (const address of mail.to.map(assertAddress)) {
    const domain = address.split("@")[1].toLowerCase();
    byDomain.set(domain, [...(byDomain.get(domain) ?? []), address]);
  }
  const results: DomainResult[] = [];
  for (const [domain, recipients] of byDomain) {
    let hosts: string[];
    try {
      hosts = (await lookupMx(domain))
        .sort((left, right) => left.priority - right.priority)
        .map((record) => record.exchange);
    } catch (error) {
      results.push({ domain, accepted: [], rejected: [], error: `MX lookup failed: ${(error as Error).message}` });
      continue;
    }
    let result: DomainResult = { domain, accepted: [], rejected: [], error: "No MX host accepted the connection" };
    for (const host of hosts.length ? hosts : [domain]) {
      try {
        result = { domain, ...(await deliverToHost(host, from, recipients, message, options)) };
        break;
      } catch (error) {
        result = { domain, accepted: [], rejected: [], error: `${host}: ${(error as Error).message}` };
      }
    }
    results.push(result);
  }
  return {
    delivered: results.some((result) => result.accepted.length > 0),
    results,
  };
}
