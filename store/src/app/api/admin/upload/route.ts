import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth/admin";
import { rateLimit } from "@/lib/rate-limit";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, storeImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Same-origin check (defence in depth on top of SameSite cookies)
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await rateLimit(`upload:${admin.id}`, 120, 3600))) {
    return NextResponse.json({ error: "Too many uploads, try again later." }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = form?.get("folder") === "brand" ? "brand" : "products";
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Use JPG, PNG, WebP or AVIF images." }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 413 });

  try {
    const stored = await storeImage(Buffer.from(await file.arrayBuffer()), folder);
    return NextResponse.json(stored);
  } catch (err) {
    console.error("[upload]", err);
    const message = err instanceof Error && err.message.includes("not configured") ? err.message : "Upload failed. Is the file a valid image?";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
