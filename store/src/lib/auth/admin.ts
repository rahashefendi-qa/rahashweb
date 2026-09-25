import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Used so that "unknown email" and "wrong password" take the same time.
const DUMMY_HASH = "$2b$12$zKqzMcOWmWN8e2SkgLsUvOqNyKonbPtZzOQQMupIIW11BD7xUXLAO";

export async function authenticate(email: string, password: string) {
  const user = await db.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return null;
  await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return user;
}

export async function createSessionCookie(user: { id: string; email: string; sessionVersion: number }) {
  const token = await signSession({ sub: user.id, email: user.email, v: user.sessionVersion });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Returns the signed-in admin, re-validated against the database, or null. */
export async function getAdmin() {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.adminUser.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, sessionVersion: true },
  });
  if (!user || user.sessionVersion !== session.v) return null;
  return user;
}

/** Guard for admin pages and server actions. Never trust the middleware alone. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
