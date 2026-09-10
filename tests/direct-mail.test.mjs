import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import tls from "node:tls";
import { buildMessage, sendDirect } from "../app/lib/direct-mail.ts";

// A minimal SMTP server that records the dialogue and the DATA payload.
function fakeSmtp({ rejectRecipient = null, dataReply = "250 2.0.0 OK queued", tlsCredentials = null } = {}) {
  const sessions = [];
  const server = net.createServer((plainSocket) => {
    const session = { commands: [], data: "", secure: false };
    sessions.push(session);
    let inData = false;
    let buffer = "";
    const serve = (socket) => {
      socket.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        while (true) {
          if (inData) {
            const end = buffer.indexOf("\r\n.\r\n");
            if (end === -1) return;
            session.data = buffer.slice(0, end);
            buffer = buffer.slice(end + 5);
            inData = false;
            socket.write(`${dataReply}\r\n`);
            continue;
          }
          const index = buffer.indexOf("\r\n");
          if (index === -1) return;
          const line = buffer.slice(0, index);
          buffer = buffer.slice(index + 2);
          session.commands.push(line);
          if (line.startsWith("EHLO")) {
            const starttls = tlsCredentials && !session.secure ? "250-STARTTLS\r\n" : "";
            socket.write(`250-fake.test\r\n${starttls}250 8BITMIME\r\n`);
          } else if (line === "STARTTLS") {
            socket.write("220 2.0.0 Ready to start TLS\r\n");
            socket.removeAllListeners("data");
            const secure = new tls.TLSSocket(socket, { isServer: true, ...tlsCredentials });
            session.secure = true;
            serve(secure);
            return;
          } else if (line.startsWith("MAIL FROM")) socket.write("250 2.1.0 OK\r\n");
          else if (line.startsWith("RCPT TO")) {
            socket.write(rejectRecipient && line.includes(rejectRecipient) ? "550 5.1.1 No such user\r\n" : "250 2.1.5 OK\r\n");
          } else if (line === "DATA") {
            inData = true;
            socket.write("354 Go ahead\r\n");
          } else if (line === "QUIT") {
            socket.end("221 2.0.0 Bye\r\n");
            return;
          } else socket.write("502 5.5.1 Unrecognized\r\n");
        }
      });
      socket.on("error", () => {});
    };
    plainSocket.write("220 fake.test ESMTP\r\n");
    serve(plainSocket);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, sessions, port: server.address().port })));
}

function selfSignedCredentials() {
  const directory = mkdtempSync(path.join(tmpdir(), "direct-mail-test-"));
  const key = path.join(directory, "key.pem");
  const cert = path.join(directory, "cert.pem");
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", cert, "-days", "1", "-subj", "/CN=127.0.0.1"], { stdio: "ignore" });
  return { key: readFileSync(key), cert: readFileSync(cert) };
}

const mail = {
  fromAddress: "requests@aihamyn.ae",
  fromName: "AIHAMYN HAMPA TRADING – FZCO RFQ",
  to: ["info@aihamyn.ae", "owner@example.com"],
  replyTo: "buyer@example.org",
  subject: "Website enquiry | Équipement",
  text: "Name: Test\nCompany: Тест",
  html: "<p>Test</p>",
  attachments: [{ filename: "spec.pdf", contentType: "application/pdf", content: new Uint8Array([0x25, 0x50, 0x44, 0x46]) }],
};

test("builds a standards-shaped MIME message", () => {
  const message = buildMessage(mail, new Date("2026-09-10T10:00:00Z"));
  assert.match(message, /^From: =\?UTF-8\?B\?[^?]+\?= <requests@aihamyn\.ae>\r\n/);
  assert.match(message, /\r\nTo: info@aihamyn\.ae, owner@example\.com\r\n/);
  assert.match(message, /\r\nReply-To: buyer@example\.org\r\n/);
  assert.match(message, /\r\nSubject: =\?UTF-8\?B\?/);
  assert.match(message, /\r\nMessage-ID: <[0-9a-f-]+@aihamyn\.ae>\r\n/);
  assert.match(message, /Content-Disposition: attachment; filename="spec\.pdf"/);
  assert.ok(!/\r\n\./.test(message), "no line starts with a dot");
  assert.ok(!/[^\r]\n/.test(message), "every line ends with CRLF");
  assert.throws(() => buildMessage({ ...mail, replyTo: "bad\r\nBcc: x@y.z" }));
});

test("delivers through the MX of every recipient domain", async () => {
  const smtp = await fakeSmtp();
  const lookups = [];
  const result = await sendDirect(mail, {
    heloName: "mail.aihamyn.ae",
    port: smtp.port,
    lookupMx: async (domain) => {
      lookups.push(domain);
      return [{ exchange: "127.0.0.1", priority: 10 }];
    },
  });
  smtp.server.close();
  assert.equal(result.delivered, true);
  assert.deepEqual(lookups.sort(), ["aihamyn.ae", "example.com"]);
  assert.equal(smtp.sessions.length, 2);
  for (const session of smtp.sessions) {
    assert.equal(session.commands[0], "EHLO mail.aihamyn.ae");
    assert.equal(session.commands[1], "MAIL FROM:<requests@aihamyn.ae>");
    assert.match(session.data, /Subject: /);
  }
});

test("reports rejected recipients and a refused message", async () => {
  const smtp = await fakeSmtp({ rejectRecipient: "info@aihamyn.ae" });
  const partial = await sendDirect({ ...mail, to: ["info@aihamyn.ae"] }, {
    heloName: "mail.aihamyn.ae",
    port: smtp.port,
    lookupMx: async () => [{ exchange: "127.0.0.1", priority: 10 }],
  });
  smtp.server.close();
  assert.equal(partial.delivered, false);
  assert.match(partial.results[0].rejected[0].reply, /^550/);

  const refusing = await fakeSmtp({ dataReply: "550 5.7.25 The IP address sending this message does not have a PTR record" });
  const refused = await sendDirect({ ...mail, to: ["owner@example.com"] }, {
    heloName: "mail.aihamyn.ae",
    port: refusing.port,
    lookupMx: async () => [{ exchange: "127.0.0.1", priority: 10 }],
  });
  refusing.server.close();
  assert.equal(refused.delivered, false);
  assert.match(refused.results[0].rejected[0].reply, /5\.7\.25/);
});

test("upgrades to TLS when the server offers STARTTLS", async () => {
  let credentials;
  try {
    credentials = selfSignedCredentials();
  } catch {
    return; // openssl is not available on this machine
  }
  const smtp = await fakeSmtp({ tlsCredentials: credentials });
  const result = await sendDirect({ ...mail, to: ["owner@example.com"] }, {
    heloName: "mail.aihamyn.ae",
    port: smtp.port,
    lookupMx: async () => [{ exchange: "127.0.0.1", priority: 10 }],
    tlsOptions: { rejectUnauthorized: false },
  });
  smtp.server.close();
  assert.equal(result.delivered, true, JSON.stringify(result));
  const [session] = smtp.sessions;
  assert.equal(session.secure, true);
  assert.deepEqual(session.commands.slice(0, 4), ["EHLO mail.aihamyn.ae", "STARTTLS", "EHLO mail.aihamyn.ae", "MAIL FROM:<requests@aihamyn.ae>"]);
  assert.match(session.data, /Content-Type: multipart\/mixed/);
});

test("gives up cleanly when no MX host answers", async () => {
  const result = await sendDirect({ ...mail, to: ["owner@example.com"] }, {
    heloName: "mail.aihamyn.ae",
    port: 1,
    timeoutMs: 2_000,
    lookupMx: async () => [{ exchange: "127.0.0.1", priority: 10 }],
  });
  assert.equal(result.delivered, false);
  assert.match(result.results[0].error, /127\.0\.0\.1/);
});
