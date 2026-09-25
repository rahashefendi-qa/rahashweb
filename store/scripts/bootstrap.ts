/**
 * Runs on every Vercel deploy (see scripts/vercel-build.sh). Safe to re-run:
 *  - Creates the first admin from INITIAL_ADMIN_EMAIL + INITIAL_ADMIN_PASSWORD, but only if
 *    the database has no admin yet (it never overwrites or resets an existing account).
 *  - Seeds example products only when SEED_EXAMPLE_PRODUCTS=true and the store has no products.
 */
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (email && password) {
    const admins = await db.adminUser.count();
    if (admins === 0) {
      if (password.length < 10) throw new Error("INITIAL_ADMIN_PASSWORD must be at least 10 characters.");
      await db.adminUser.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`[bootstrap] created first admin ${email}`);
    }
  }

  if (process.env.SEED_EXAMPLE_PRODUCTS === "true" && (await db.product.count()) === 0) {
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  }
}

main()
  .catch((e) => {
    console.error("[bootstrap]", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
