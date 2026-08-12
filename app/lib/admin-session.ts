export const ADMIN_COOKIE_NAME = "industria_admin_session";
export const ADMIN_SESSION_LIFETIME_SECONDS = 8 * 60 * 60;

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

async function hmac(value: string, secret: string) {
  if (secret.length < 24) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return Buffer.from(signature).toString("base64url");
}

async function constantTimeEqual(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all(
    [left, right].map(async (value) => {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(value),
      );
      return new Uint8Array(digest);
    }),
  );

  let difference = leftHash.length ^ rightHash.length;
  for (
    let index = 0;
    index < Math.max(leftHash.length, rightHash.length);
    index += 1
  ) {
    difference |= (leftHash[index] ?? 0) ^ (rightHash[index] ?? 0);
  }
  return difference === 0;
}

export async function createAdminSessionWithSecret(secret: string) {
  const payload = toBase64Url(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_LIFETIME_SECONDS,
    }),
  );
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function verifyAdminSessionWithSecret(
  token: string | undefined,
  secret: string | undefined,
) {
  if (!token || !secret || secret.length < 24) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  try {
    const expected = await hmac(payload, secret);
    if (!(await constantTimeEqual(signature, expected))) return false;
    const parsed = JSON.parse(fromBase64Url(payload)) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export { constantTimeEqual };
