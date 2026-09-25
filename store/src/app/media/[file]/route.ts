import { readFile } from "fs/promises";
import path from "path";
import { LOCAL_UPLOAD_DIR } from "@/lib/storage";

// Serves images uploaded with the local-disk fallback (development only).
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(LOCAL_UPLOAD_DIR, path.basename(file)));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
