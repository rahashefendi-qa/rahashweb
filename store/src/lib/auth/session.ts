import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe session token helpers (used by middleware and server code).
 * Tokens are HS256 JWTs stored in an httpOnly, SameSite=Lax cookie.
 */
export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { sub: string; email: string; v: number };

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, v: payload.v })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setAudience("admin")
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"], audience: "admin" });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || typeof payload.v !== "number") return null;
    return { sub: payload.sub, email: payload.email, v: payload.v };
  } catch {
    return null;
  }
}
