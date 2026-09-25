import type { ManagedImage } from "@/components/admin/ImageManager";

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  details: string;
  price: number;
  salePrice: number | null;
  stock: number;
  soldOut: boolean;
  featured: boolean;
  newArrival: boolean;
  active: boolean;
  categoryId: string | null;
  color: string | null;
  material: string | null;
  dimensions: string | null;
  strapDetails: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ManagedImage[];
};

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  details: "",
  price: 0,
  salePrice: null,
  stock: 1,
  soldOut: false,
  featured: false,
  newArrival: true,
  active: true,
  categoryId: null,
  color: null,
  material: null,
  dimensions: null,
  strapDetails: null,
  seoTitle: null,
  seoDescription: null,
  images: [],
};
