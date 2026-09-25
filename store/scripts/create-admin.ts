/**
 * Create (or reset the password of) an admin account.
 *
 *   npm run admin:create -- --email you@example.com --password "a-long-password"
 *
 * Or interactively: npm run admin:create
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "readline/promises";

const db = new PrismaClient();

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const email = (arg("email") ?? (await rl.question("Admin email: "))).trim().toLowerCase();
  const password = arg("password") ?? (await rl.question("Password (min 10 characters): "));
  const name = arg("name") ?? null;
  rl.close();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address.");
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    // Resetting the password also signs out every existing session.
    await db.adminUser.update({ where: { email }, data: { passwordHash, sessionVersion: { increment: 1 } } });
    console.log(`✓ Password updated for ${email}`);
  } else {
    await db.adminUser.create({ data: { email, passwordHash, name } });
    console.log(`✓ Admin account created for ${email}`);
  }
}

main()
  .catch((e) => {
    console.error("✗", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
