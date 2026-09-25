import "server-only";
import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

/**
 * Image storage.
 *  - Production: Cloudinary (set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).
 *  - Local development fallback: files written to ./uploads and served by /media/[file].
 *    (Serverless hosts such as Vercel have no persistent disk, so Cloudinary is required there.)
 * Every upload is re-encoded with sharp: EXIF stripped, auto-rotated, max 2000px, WebP.
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

export type StoredImage = { url: string; storageId: string; width: number; height: number };

function cloudinaryConfigured() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function storageMode(): "cloudinary" | "local" | "unconfigured" {
  if (cloudinaryConfigured()) return "cloudinary";
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_LOCAL_UPLOADS === "true") return "local";
  return "unconfigured";
}

export async function storeImage(input: Buffer, folder = "products"): Promise<StoredImage> {
  // Decoding with sharp also proves the file really is an image.
  const { data, info } = await sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer({ resolveWithObject: true });

  const mode = storageMode();
  if (mode === "cloudinary") {
    configureCloudinary();
    const prefix = process.env.CLOUDINARY_FOLDER || "store";
    const result = await new Promise<{ secure_url: string; public_id: string; width: number; height: number }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: `${prefix}/${folder}`, resource_type: "image", format: "webp" }, (err, res) =>
            err || !res ? reject(err ?? new Error("Upload failed")) : resolve(res),
          )
          .end(data);
      },
    );
    return { url: result.secure_url, storageId: `cloudinary:${result.public_id}`, width: result.width, height: result.height };
  }

  if (mode === "local") {
    await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.webp`;
    await writeFile(path.join(LOCAL_UPLOAD_DIR, name), data);
    return { url: `/media/${name}`, storageId: `local:${name}`, width: info.width, height: info.height };
  }

  throw new Error("Image storage is not configured. Set the CLOUDINARY_* environment variables.");
}

export async function deleteImage(storageId: string | null | undefined) {
  if (!storageId) return;
  try {
    if (storageId.startsWith("cloudinary:") && cloudinaryConfigured()) {
      configureCloudinary();
      await cloudinary.uploader.destroy(storageId.slice("cloudinary:".length));
    } else if (storageId.startsWith("local:")) {
      const name = path.basename(storageId.slice("local:".length));
      await unlink(path.join(LOCAL_UPLOAD_DIR, name));
    }
  } catch (err) {
    console.warn("[storage] delete failed", storageId, err);
  }
}
