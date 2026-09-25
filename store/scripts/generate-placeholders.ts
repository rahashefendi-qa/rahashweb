/**
 * Renders the placeholder product images to /public/placeholders as WebP.
 * Run with: npm run images:placeholders
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { bagSvg, heroSvg, type BagView } from "./lib/bag-svg";
import { SEED_PRODUCTS } from "../prisma/seed-data";

const OUT = path.join(process.cwd(), "public", "placeholders");
const VIEWS: BagView[] = ["front", "mood", "detail", "back"];

async function render(svg: string, file: string, width: number) {
  const buf = await sharp(Buffer.from(svg)).resize({ width }).webp({ quality: 82 }).toBuffer();
  await writeFile(path.join(OUT, file), buf);
  console.log("✓", file, `${Math.round(buf.length / 1024)}kb`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const p of SEED_PRODUCTS) {
    for (const [i, view] of VIEWS.entries()) {
      await render(bagSvg(p.spec, view), `${p.slug}-${i + 1}.webp`, 1200);
    }
  }
  const bySlug = (s: string) => SEED_PRODUCTS.find((p) => p.slug === s)!.spec;
  await render(
    heroSvg([bySlug("classic-brown-crossbody"), bySlug("signature-black-crossbody"), bySlug("urban-green-shoulder-bag")]),
    "hero.webp",
    2400,
  );
  await render(bagSvg(bySlug("minimal-black-messenger"), "mood"), "editorial.webp", 1200);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
