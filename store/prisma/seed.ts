/**
 * Seeds categories, example products (with placeholder images) and default settings.
 * Safe to re-run: existing records (matched by slug) are left untouched.
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "./seed-data";

const db = new PrismaClient();

async function main() {
  await db.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: process.env.STORE_NAME || "YOUR BRAND",
      adminEmail: process.env.ADMIN_EMAIL || null,
      storeEmail: process.env.STORE_EMAIL || null,
      phone: process.env.STORE_PHONE || null,
      whatsapp: process.env.STORE_WHATSAPP || null,
      wishMoneyNumber: process.env.WISH_MONEY_NUMBER || null,
      wishMoneyName: process.env.WISH_MONEY_NAME || null,
      governorateFees: { Beirut: 300 },
    },
  });

  const categoryIds: Record<string, string> = {};
  for (const c of SEED_CATEGORIES) {
    const cat = await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    categoryIds[c.slug] = cat.id;
  }

  let created = 0;
  for (const [index, p] of SEED_PRODUCTS.entries()) {
    const exists = await db.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        details: p.details.join("\n"),
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        featured: p.featured ?? false,
        newArrival: p.newArrival ?? false,
        color: p.color,
        material: p.material,
        dimensions: p.dimensions,
        strapDetails: p.strapDetails,
        categoryId: categoryIds[p.category],
        // stagger creation dates so "Newest" sorting is meaningful
        createdAt: new Date(Date.now() - (SEED_PRODUCTS.length - index) * 86_400_000),
        images: {
          create: [1, 2, 3, 4].map((n, i) => ({
            url: `/placeholders/${p.slug}-${n}.webp`,
            alt: `${p.name} — view ${n}`,
            width: 1200,
            height: 1500,
            position: i,
          })),
        },
      },
    });
    created++;
  }
  console.log(`Seed complete: ${SEED_CATEGORIES.length} categories, ${created} new products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
