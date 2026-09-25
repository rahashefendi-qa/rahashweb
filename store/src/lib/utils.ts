import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function siteUrl(path = "") {
  // On Vercel the production domain is available automatically if NEXT_PUBLIC_SITE_URL isn't set.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/$/, "");
  return `${base}${path}`;
}

export function formatDate(date: Date | string, withTime = true) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Beirut",
  }).format(new Date(date));
}
