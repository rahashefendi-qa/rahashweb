import "server-only";
import { headers } from "next/headers";
import { db } from "./db";

/**
 * Fixed-window rate limiter backed by Postgres so it works across
 * serverless instances. Returns true when the request is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date();
  const windowStartCutoff = new Date(now.getTime() - windowSeconds * 1000);
  try {
    const rows = await db.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "windowStart")
      VALUES (${key}, 1, ${now})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."windowStart" < ${windowStartCutoff} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "windowStart" = CASE WHEN "RateLimit"."windowStart" < ${windowStartCutoff} THEN ${now} ELSE "RateLimit"."windowStart" END
      RETURNING "count"`;
    return (rows[0]?.count ?? 0) <= limit;
  } catch (err) {
    // Never block customers because the limiter itself failed.
    console.error("[rate-limit] failed", err);
    return true;
  }
}

export async function clientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
