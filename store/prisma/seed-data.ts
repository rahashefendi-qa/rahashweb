import type { BagSpec } from "../scripts/lib/bag-svg";

/**
 * Example catalogue used to seed a fresh database.
 * All names, prices, stock levels and specifications are PLACEHOLDERS —
 * replace them with your real product information in the admin dashboard.
 */
export const SEED_CATEGORIES = [
  { name: "Crossbody Bags", slug: "crossbody", description: "Compact, hands-free everyday carry.", position: 0 },
  { name: "Shoulder Bags", slug: "shoulder", description: "Structured silhouettes worn close to the body.", position: 1 },
  { name: "Hand-Carry Bags", slug: "hand-carry", description: "Top-handle pieces that also carry on a strap.", position: 2 },
];

export type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  featured?: boolean;
  newArrival?: boolean;
  color: string;
  material: string;
  dimensions: string;
  strapDetails: string;
  description: string;
  details: string[];
  spec: BagSpec;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: "Signature Black Crossbody",
    slug: "signature-black-crossbody",
    category: "crossbody",
    price: 8500,
    stock: 12,
    featured: true,
    color: "Black",
    material: "Structured textured finish",
    dimensions: "22 × 17 × 7 cm",
    strapDetails: "Adjustable, detachable crossbody strap (max drop 60 cm)",
    description:
      "A clean, structured crossbody in deep black with a sculpted front flap and polished silver-tone clasp. Compact enough for everyday carry, sharp enough for the evening.",
    details: ["Magnetic flap closure", "Interior slip pocket", "Silver-tone hardware", "Fits phone, wallet, keys and sunglasses"],
    spec: { shape: "crossbody", body: "#1c1c1c", hardware: "silver" },
  },
  {
    name: "Classic Brown Crossbody",
    slug: "classic-brown-crossbody",
    category: "crossbody",
    price: 8000,
    stock: 8,
    featured: true,
    color: "Chestnut brown",
    material: "Smooth finish",
    dimensions: "22 × 17 × 7 cm",
    strapDetails: "Adjustable crossbody strap (max drop 60 cm)",
    description:
      "A warm chestnut take on our signature silhouette. Minimal lines, dark-metal hardware and a structured body that keeps its shape.",
    details: ["Flap closure with metal clasp", "Two interior compartments", "Dark gunmetal hardware"],
    spec: { shape: "crossbody", body: "#5a3a26", hardware: "gunmetal" },
  },
  {
    name: "Urban Green Shoulder Bag",
    slug: "urban-green-shoulder-bag",
    category: "shoulder",
    price: 9500,
    stock: 6,
    featured: true,
    newArrival: true,
    color: "Forest green",
    material: "Textured finish",
    dimensions: "26 × 14 × 8 cm",
    strapDetails: "Fixed shoulder strap plus detachable long strap",
    description:
      "An understated deep-green shoulder bag with softly rounded corners. Worn under the arm or across the body — a quiet statement in a darker palette.",
    details: ["Two carry options", "Flap closure", "Silver-tone hardware", "Interior card slots"],
    spec: { shape: "shoulder", body: "#1f3a2e", hardware: "silver" },
  },
  {
    name: "Minimal Black Messenger",
    slug: "minimal-black-messenger",
    category: "crossbody",
    price: 11000,
    stock: 5,
    featured: true,
    color: "Black",
    material: "Structured matte finish",
    dimensions: "28 × 20 × 8 cm",
    strapDetails: "Wide adjustable strap (max drop 65 cm)",
    description:
      "A small messenger with a full-length flap and generous interior. Fits a small tablet, notebook and your daily essentials without losing its clean profile.",
    details: ["Full-length flap", "Fits a small tablet", "Rear slip pocket", "Gunmetal hardware"],
    spec: { shape: "messenger", body: "#141414", hardware: "gunmetal" },
  },
  {
    name: "Premium Compact Shoulder Bag",
    slug: "premium-compact-shoulder-bag",
    category: "shoulder",
    price: 9000,
    stock: 7,
    newArrival: true,
    color: "Stone grey",
    material: "Patterned coated finish",
    dimensions: "25 × 13 × 7 cm",
    strapDetails: "Adjustable shoulder strap",
    description:
      "A compact grey shoulder bag with a subtle woven-look pattern. Refined, lightweight and easy to pair with a monochrome wardrobe.",
    details: ["Woven-look pattern", "Flap closure", "Silver-tone hardware"],
    spec: { shape: "shoulder", body: "#6d6b67", hardware: "silver", pattern: "weave" },
  },
  {
    name: "Structured Grey Hand-Carry",
    slug: "structured-grey-hand-carry",
    category: "hand-carry",
    price: 10500,
    stock: 4,
    featured: true,
    color: "Charcoal grey",
    material: "Structured textured finish",
    dimensions: "21 × 16 × 9 cm",
    strapDetails: "Top handle + detachable adjustable strap",
    description:
      "A compact top-handle bag in charcoal that switches easily from hand-carry to crossbody. Architectural lines with a softly polished clasp.",
    details: ["Top handle", "Detachable strap included", "Flap with metal clasp", "Interior zip pocket"],
    spec: { shape: "hand", body: "#3a3b3d", hardware: "silver" },
  },
  {
    name: "Patterned Canvas Messenger",
    slug: "patterned-canvas-messenger",
    category: "crossbody",
    price: 12000,
    salePrice: 9900,
    stock: 3,
    color: "Taupe / brown",
    material: "Patterned coated canvas-look finish",
    dimensions: "27 × 19 × 7 cm",
    strapDetails: "Adjustable crossbody strap",
    description:
      "A patterned messenger in warm taupe with contrast brown trim. Distinctive texture, practical size and a structured front flap.",
    details: ["Diagonal pattern", "Contrast trim", "Rear slip pocket", "Gunmetal hardware"],
    spec: { shape: "messenger", body: "#6b5a48", hardware: "gunmetal", pattern: "diagonal" },
  },
  {
    name: "Midnight Compact Crossbody",
    slug: "midnight-compact-crossbody",
    category: "crossbody",
    price: 8800,
    stock: 0,
    color: "Midnight charcoal",
    material: "Patterned finish",
    dimensions: "20 × 15 × 6 cm",
    strapDetails: "Adjustable crossbody strap",
    description:
      "Our most compact crossbody in a midnight tone with a tonal woven-look pattern. Currently sold out — join the list to hear when it returns.",
    details: ["Tonal pattern", "Flap closure", "Silver-tone hardware"],
    spec: { shape: "crossbody", body: "#25272b", hardware: "silver", pattern: "weave" },
  },
  {
    name: "Espresso Top-Handle Bag",
    slug: "espresso-top-handle-bag",
    category: "hand-carry",
    price: 11500,
    stock: 5,
    newArrival: true,
    color: "Espresso brown",
    material: "Smooth finish",
    dimensions: "22 × 17 × 9 cm",
    strapDetails: "Top handle + detachable adjustable strap",
    description:
      "A rich espresso top-handle with a structured body and dark-metal details. Carry it by hand or wear it across the body.",
    details: ["Top handle", "Detachable strap", "Two interior compartments", "Gunmetal hardware"],
    spec: { shape: "hand", body: "#3b2619", hardware: "gunmetal" },
  },
];
