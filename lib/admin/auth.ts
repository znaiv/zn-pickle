import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "courtflow:admin";

function base64UrlEncode(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(b64, "base64");
}

function sign(payloadB64: string, secret: string) {
  return base64UrlEncode(createHmac("sha256", secret).update(payloadB64).digest());
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function createAdminCookieValue(input: { username: string; ttlSeconds?: number }) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");

  const ttl = input.ttlSeconds ?? 60 * 60 * 24 * 14; // 14 days
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const payload = base64UrlEncode(JSON.stringify({ u: input.username, exp }));
  const sig = sign(payload, secret);
  return `${payload}.${sig}`;
}

export function verifyAdminCookieValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  try {
    const decoded = JSON.parse(base64UrlDecode(payload).toString("utf8")) as { exp?: number };
    if (!decoded.exp) return false;
    return Math.floor(Date.now() / 1000) < decoded.exp;
  } catch {
    return false;
  }
}

