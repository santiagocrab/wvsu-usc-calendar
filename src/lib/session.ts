import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || process.env.SESSION_SECRET || "dev-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(): string {
  const payload = `admin:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  if (password.length !== adminPassword.length) return false;
  try {
    return timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));
  } catch {
    return false;
  }
}
