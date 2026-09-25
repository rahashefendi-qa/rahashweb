import { z } from "zod";
import { GOVERNORATE_NAMES, normalizeLebanesePhone } from "./lebanon";

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));

export const lebanesePhone = z
  .string()
  .trim()
  .min(7, "Enter your phone number")
  .max(20)
  .transform((v, ctx) => {
    const n = normalizeLebanesePhone(v);
    if (!n) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid Lebanese number, e.g. 03 123 456 or 71 123 456" });
      return z.NEVER;
    }
    return n;
  });

export const checkoutSchema = z
  .object({
    fullName: trimmed(100).min(2, "Enter your full name"),
    phone: lebanesePhone,
    email: z
      .string()
      .trim()
      .max(160)
      .optional()
      .transform((v) => (v ? v.toLowerCase() : null))
      .refine((v) => v === null || z.string().email().safeParse(v).success, "Enter a valid email or leave it empty"),
    governorate: z.enum(GOVERNORATE_NAMES, { errorMap: () => ({ message: "Choose your governorate" }) }),
    city: trimmed(80).min(2, "Enter your city"),
    area: trimmed(80).min(2, "Enter your area / neighbourhood"),
    address: trimmed(300).min(5, "Enter your full address (street, landmark)"),
    building: optionalText(120),
    notes: optionalText(500),
    paymentMethod: z.enum(["COD", "WISH_MONEY"], { errorMap: () => ({ message: "Choose a payment method" }) }),
    paymentReference: optionalText(120),
    items: z
      .array(z.object({ productId: z.string().min(1).max(40), quantity: z.number().int().min(1).max(20) }))
      .min(1, "Your cart is empty")
      .max(30),
    // honeypot field — real users never fill it
    website: z.string().max(0).optional(),
  });

export type CheckoutInput = z.input<typeof checkoutSchema>;

/** Absolute https URL (Cloudinary) or a site-relative path (/media, /placeholders). */
const imageUrl = z
  .string()
  .max(1000)
  .refine((u) => /^https:\/\/[^\s]+$/.test(u) || /^\/(media|placeholders)\/[\w.-]+$/.test(u), "Invalid image URL");

const cents = z.number().int().min(0).max(100_000_00);

export const productSchema = z
  .object({
    name: trimmed(120).min(2, "Name is required"),
    slug: trimmed(90).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes").optional().or(z.literal("")),
    description: trimmed(5000),
    details: trimmed(3000),
    price: cents,
    salePrice: cents.nullable(),
    stock: z.number().int().min(0).max(100000),
    soldOut: z.boolean(),
    featured: z.boolean(),
    newArrival: z.boolean(),
    active: z.boolean(),
    categoryId: z.string().max(40).nullable(),
    color: optionalText(80),
    material: optionalText(160),
    dimensions: optionalText(160),
    strapDetails: optionalText(300),
    seoTitle: optionalText(120),
    seoDescription: optionalText(300),
    images: z
      .array(
        z.object({
          url: imageUrl,
          storageId: z.string().max(300).nullable().optional(),
          alt: optionalText(200),
          width: z.number().int().positive().nullable().optional(),
          height: z.number().int().positive().nullable().optional(),
        }),
      )
      .max(12, "Up to 12 images per product"),
  })
  .refine((p) => p.salePrice == null || p.salePrice < p.price, {
    message: "Sale price must be lower than the regular price",
    path: ["salePrice"],
  });

export type ProductInput = z.infer<typeof productSchema>;

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https:\/\//.test(v), "Must start with https://");

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .optional()
  .transform((v) => (v ? v.toLowerCase() : null))
  .refine((v) => v === null || z.string().email().safeParse(v).success, "Invalid email");

export const settingsSchema = z.object({
  storeName: trimmed(60).min(1, "Store name is required"),
  tagline: trimmed(120),
  logoUrl: imageUrl.nullable(),
  heroImageUrl: imageUrl.nullable(),
  storeEmail: optionalEmail,
  adminEmail: optionalEmail,
  phone: optionalText(40),
  whatsapp: optionalText(40),
  currency: z.string().trim().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code, e.g. USD"),
  deliveryFee: cents,
  governorateFees: z.record(z.enum(GOVERNORATE_NAMES), cents),
  freeDeliveryOver: cents.nullable(),
  codEnabled: z.boolean(),
  wishMoneyEnabled: z.boolean(),
  wishMoneyName: optionalText(120),
  wishMoneyNumber: optionalText(60),
  wishMoneyInstructions: trimmed(1000),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
});

export const notifySchema = z.object({
  productId: z.string().min(1).max(40),
  contact: z.string().trim().min(5).max(160),
});
