# YOUR BRAND — Men's Bags E-commerce (Lebanon)

A complete store for premium men's crossbody, shoulder and hand-carry bags, built for Lebanon. It includes a real database, admin dashboard, image uploads, order emails, Cash on Delivery and Wish Money.

> **Content note:** the example products, prices, dimensions and materials, and the rendered bag images, are **placeholders**. Replace them with your real information and photography in the admin dashboard. Keep descriptions accurate. Never describe products as authentic, original or affiliated with any fashion house, and don't use third-party brand names or logos.

---

## 1. Architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Server rendering for SEO and speed. Server Actions keep secrets on the server. |
| Styling / motion | **Tailwind CSS v4 + Framer Motion** | Design tokens in `globals.css` and subtle animations that respect reduced-motion settings. |
| Database | **PostgreSQL + Prisma** | Any Postgres works: Supabase, Neon, Railway or local. Includes migrations. |
| Images | **Cloudinary** (production), local disk (development) | Uploads are re-encoded with `sharp` (WebP, max 2000px, EXIF stripped). `next/image` serves AVIF/WebP at responsive sizes. |
| Email | **Resend** or **any SMTP server** | Real delivery. Every order records whether its emails were sent. |
| Auth | Custom admin auth: **bcrypt + signed JWT cookie (jose)** | No third-party auth service needed. |
| Hosting | **Vercel** (recommended) | Zero-config Next.js. `vercel-build` runs database migrations on each deploy. |

```
Browser ──▶ Next.js (Vercel)
             ├─ Storefront pages (server-rendered, cached ~60s, revalidated on admin changes)
             ├─ Server Actions: placeOrder, admin CRUD (validated with Zod, auth-checked)
             ├─ /api/admin/upload ──▶ sharp ──▶ Cloudinary
             ├─ Prisma ──▶ PostgreSQL
             └─ after(response) ──▶ Resend / SMTP (order emails)
```

## 2. Folder structure

```
store/
├── prisma/
│   ├── schema.prisma          database schema
│   ├── migrations/            SQL migrations (order numbers start at #1001)
│   ├── seed.ts                example categories, products and settings
│   └── seed-data.ts           the placeholder catalogue
├── scripts/
│   ├── create-admin.ts        create an admin or reset a password
│   └── generate-placeholders.ts  renders the placeholder bag images
├── public/placeholders/       generated placeholder images (replace via admin)
└── src/
    ├── middleware.ts          blocks /admin and /api/admin without a valid session
    ├── app/
    │   ├── (store)/           public site: /, /shop, /category/[slug], /product/[slug],
    │   │                      /cart, /checkout, /order/[token] (confirmation)
    │   ├── admin/login        admin sign-in
    │   ├── admin/(panel)/     dashboard, orders, products, categories, customers, settings, account
    │   ├── actions/           Server Actions (checkout, admin CRUD, auth, notify-me)
    │   ├── api/admin/upload   image upload endpoint
    │   ├── media/[file]       serves locally uploaded images (development)
    │   ├── sitemap.ts, robots.ts, opengraph-image.tsx
    ├── components/
    │   ├── store/             Header, Hero, ProductCard, QuickView, ProductGallery, CartDrawer,
    │   │                      CheckoutForm, ShopFilters, IntroAnimation, …
    │   ├── admin/             AdminNav, ProductForm, ImageManager, OrderForms, SettingsForm, …
    │   └── ui/                Button, Price, QtyStepper
    └── lib/
        ├── db.ts, settings.ts, products.ts, orders.ts   data and business logic
        ├── auth/              password hashing, sessions, requireAdmin()
        ├── email/             provider (Resend/SMTP) and email templates
        ├── storage.ts         Cloudinary or local uploads
        ├── validation.ts      Zod schemas shared by browser and server
        ├── lebanon.ts         governorates, cities, Lebanese phone validation
        └── rate-limit.ts      Postgres-backed rate limiter
```

## 3. Database schema (summary)

- **Category**: name, slug, description, position.
- **Product**: name, slug, description, details, price / salePrice (cents), stock, soldOut, featured, newArrival, active, color, material, dimensions, strapDetails, SEO fields, category.
- **ProductImage**: url, storageId, alt, width/height, position (position 0 is the main image).
- **StockNotification**: "Notify me" requests (email or phone). Email requests are sent automatically when the product is back in stock.
- **Customer**: name, phone (unique, normalised to `+961…`), email.
- **Order**: sequential `number` (#1001…), unguessable `publicToken`, status, a snapshot of the customer and address, payment method and reference, subtotal/delivery/total, `stockDeducted`, internal notes and email delivery status.
- **OrderItem**: snapshot of product name, price and image; quantity; line total.
- **OrderStatusChange**: status history (who changed it, when, and an optional note).
- **Settings**: a single row holding store name, logo, hero image, emails, phone, WhatsApp, currency, delivery fees (default, per governorate, free-over threshold), payment toggles, Wish Money details and social links.
- **AdminUser**: email, bcrypt hash, `sessionVersion` (increase it to sign out every device).
- **RateLimit**: login, order and upload throttling.

All money is stored as **integer cents** to avoid rounding errors.

## 4. Order, stock and payment flow

1. The customer checks out. The browser sends only product IDs and quantities.
2. The server **re-validates everything**: Zod validation, Lebanese phone check, honeypot, rate limit (6 orders per 10 minutes per IP), product visibility and **stock**, current prices (including sale price) and the delivery fee for the chosen governorate.
3. The order is saved in one transaction (customer upserted by phone) and receives the next order number.
4. The customer sees **Order Confirmed** with the order number. Emails are sent right after the response: the **admin alert** (`NEW ORDER #1234` in the format you asked for) and the **customer confirmation** if they gave an email. Success or failure is stored on the order and shown in the dashboard, with a **Resend order emails** button.
5. The dashboard and orders list refresh automatically every 30 seconds. The sidebar shows a count of pending orders.
6. When you move an order to **Confirmed** (or any later status), stock is **deducted atomically**. If stock is short, the change is refused and nothing is deducted. **Cancelling** a confirmed order restores the stock.
7. When stock reaches 0 (or you tick "Mark as sold out"), the product shows a **Sold Out** badge, ordering is disabled, and a **Notify me** form appears.

**Wish Money:** there is no public Wish Money API, so the site **does not pretend to process payments**. At checkout the customer sees your Wish Money number, the account name, the exact amount and your instructions. They can paste the transfer reference, either at checkout or later via you. You check the payment in your Wish Money app and confirm the order in the dashboard. You can also add or edit the reference on the order page.

## 5. Authentication and security

- Admin passwords are hashed with **bcrypt (cost 12)**. Admin accounts are created from the command line only; there is no public sign-up.
- Sessions are **HS256 JWTs** signed with `AUTH_SECRET`, stored in an `httpOnly`, `SameSite=Lax` cookie that is `Secure` in production and lasts 7 days.
- Two layers of protection: `middleware.ts` blocks `/admin/*` and `/api/admin/*` without a valid token. Every admin page, Server Action and API route also calls `requireAdmin()`, which re-checks the user and `sessionVersion` in the database. Changing your password signs out every other device.
- Login is rate-limited per IP and per account, with constant-time responses for unknown emails.
- All input is validated on the server with Zod. Prisma parameterises every query (no SQL injection), and React escapes output (no XSS). Email templates escape customer data.
- Uploads: admin-only, same-origin check, type and size limits, and every file is re-encoded by `sharp`.
- Security headers: HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. Admin pages are `noindex`.
- Secrets live only in environment variables. Nothing sensitive is sent to the browser: `toPublicSettings()` whitelists what the storefront can see.

---

## 6. Run it locally

**Requirements:** Node.js 20.9+ and PostgreSQL 14+ (local, Docker, or a free Supabase/Neon database).

```bash
cd store
npm install
cp .env.example .env          # then edit .env (see below)
```

Minimum `.env` for local development:

```bash
DATABASE_URL="postgresql://store:store@localhost:5432/store?schema=public"
DIRECT_URL="postgresql://store:store@localhost:5432/store?schema=public"
AUTH_SECRET="paste-a-long-random-string-here-at-least-32-chars"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Quick local Postgres with Docker, if you don't have one:

```bash
docker run -d --name store-db -e POSTGRES_USER=store -e POSTGRES_PASSWORD=store -e POSTGRES_DB=store -p 5432:5432 postgres:16
```

Create the tables, add example data, and create your admin account:

```bash
npx prisma migrate deploy        # creates all tables
npm run db:seed                  # optional: example categories and products
npm run admin:create -- --email you@example.com --password "choose-a-long-password"
npm run dev
```

- Store: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>

Other useful commands: `npm run typecheck`, `npm run lint`, `npm run build && npm start` (production mode), and `npm run db:studio` (browse the database).

## 7. Deploy (Vercel + Supabase or Neon + Cloudinary + Resend)

1. **Database:** create a project on [Supabase](https://supabase.com) or [Neon](https://neon.tech) and copy the two connection strings into `DATABASE_URL` (pooled) and `DIRECT_URL` (direct). With Supabase, add `?pgbouncer=true` to the pooled URL.
2. **Images:** create a free [Cloudinary](https://cloudinary.com) account and copy the cloud name, API key and API secret.
3. **Email:** see section 8.
4. **Vercel:** import this GitHub repository and set **Root Directory = `store`**. Add every variable from `.env.example` under *Settings → Environment Variables*, and set `NEXT_PUBLIC_SITE_URL` to your real domain.
5. Deploy. The `vercel-build` script (`scripts/vercel-build.sh`) runs the migrations automatically. It also runs `scripts/bootstrap.ts`, which creates the first admin from `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` (only while no admin exists) and adds the example products when `SEED_EXAMPLE_PRODUCTS=true` and the store is empty.
6. Alternatively, create the admin from your computer against the production database:
   ```bash
   DATABASE_URL="<production DIRECT_URL>" npm run admin:create -- --email you@example.com --password "…"
   ```

**Shortcut on Vercel:** instead of setting up Supabase and Cloudinary yourself, open the project's **Storage** tab and create a **Neon** (Postgres) database and a **Blob** store. Vercel adds `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `BLOB_READ_WRITE_TOKEN` for you, and the build script uses them automatically.
7. Add your domain in Vercel → *Domains*.

Any Node host (Railway, Render, a VPS) also works: run `npm run build`, `npx prisma migrate deploy` and `npm start`. Cloudinary is required on hosts without a persistent disk.

## 8. Configure email

New-order alerts go to **Admin → Settings → Admin email** (or `ADMIN_EMAIL` on first run).

**Option A — Resend (recommended)**
1. Sign up at [resend.com](https://resend.com), add and verify your domain (DNS records), and create an API key.
2. Set `RESEND_API_KEY="re_…"` and `EMAIL_FROM="YOUR BRAND <orders@yourdomain.com>"`. The sender address must be on the verified domain.

**Option B — SMTP (for example Gmail)**
1. In your Google account, enable 2-Step Verification, then create an **App Password**.
2. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=you@gmail.com`, `SMTP_PASS=<app password>` and `EMAIL_FROM="YOUR BRAND <you@gmail.com>"`.

Test it by placing an order. The order page in the dashboard shows **Admin email: sent** or the exact error. The dashboard also shows a warning banner while email isn't configured.

## 9. Configure Wish Money

**Admin → Settings → Payments**
- Turn on **Wish Money**.
- Enter your **Wish Money number / account** and **account holder name**.
- Edit the **instructions** customers see at checkout.

Wish Money stays hidden at checkout until a number is set. Cash on Delivery can be turned on or off in the same place, but at least one payment method must stay enabled.

## 10. Add your first product

1. **Admin → Products → Add product.**
2. Enter the name. The URL is generated automatically.
3. Add a description, and details with one bullet per line.
4. **Images:** click *Add images* or drag several photos in. Drag to reorder, or use ← → and ★ (set as main image). The first image is the main image. Remove any image with the trash icon.
5. Set the price, an optional sale price, the stock quantity and the category, then choose visibility, *Featured on homepage* and *New arrival*.
6. Fill in colour, material, dimensions and strap details.
7. Click **Create product**. It appears on the site immediately.

You can also **duplicate** products (the copy starts hidden with stock 0), **delete** them (past orders keep their details), and edit stock inline from the product list.

Replacing the placeholders: open each seeded product and swap the images and text, or delete them. The homepage hero image and your logo are uploaded in **Settings → Brand**.

## 11. Manage orders

**Admin → Orders**: search by order #, name, phone, email or city, and filter by status or payment method.
Open an order to:
- see the items, totals, customer, address and notes, with one-tap **Call** and **WhatsApp** buttons,
- change the status: *Pending → Confirmed → Preparing → Shipped → Delivered*, or *Cancelled*, with an optional note (kept in the order history),
- add **internal notes** and the Wish Money reference,
- check email delivery status and **resend** the emails.

**Customers** lists everyone who ordered, with order count and total spent.

## 12. Customising

- **Brand name, headline, logo, hero image, contact details, delivery fees, currency and socials:** Admin → Settings, no code needed.
- **Colours and fonts:** `src/app/globals.css` (`@theme` tokens) and `src/app/layout.tsx`.
- **Governorates and city suggestions:** `src/lib/lebanon.ts`.
- **Homepage copy:** `src/app/(store)/page.tsx`.

---

## بالعربي — وين بحط معلوماتي؟

- **إيميلك لاستلام الطلبات:** لوحة التحكم ← Settings ← *Admin email*.
- **رقم هاتفك وواتساب:** Settings ← *Phone number* و *WhatsApp number*.
- **رقم حساب Wish Money واسم صاحب الحساب:** Settings ← Payments ← *Wish Money number / account* و *Account holder name*.
- **رسوم التوصيل:** Settings ← Delivery، ويمكن تحديد سعر مختلف لكل محافظة.
- **مفاتيح الإيميل وقاعدة البيانات والصور:** توضع فقط في ملف `.env` محلياً أو في Vercel ← Environment Variables. **لا تضعها في الكود ولا ترفعها على GitHub.**
