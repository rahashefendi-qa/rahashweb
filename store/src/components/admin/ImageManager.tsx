"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ManagedImage = {
  key: string;
  url: string;
  storageId?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export async function uploadImage(file: File, folder: "products" | "brand" = "products") {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data as { url: string; storageId: string; width: number; height: number };
}

/**
 * Multi-image manager: upload (multiple / drag-and-drop), reorder by dragging
 * or with arrow buttons, set main image, edit alt text and delete.
 * The first image is the main image.
 */
export function ImageManager({ images, onChange, max = 12 }: { images: ManagedImage[]; onChange: (imgs: ManagedImage[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const latest = useRef(images);
  latest.current = images;

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files).slice(0, Math.max(0, max - images.length));
    if (list.length === 0) {
      setError(`Maximum ${max} images.`);
      return;
    }
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const r = await uploadImage(file);
          onChange([...latest.current, { key: r.storageId, url: r.url, storageId: r.storageId, width: r.width, height: r.height, alt: null }]);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function makeMain(i: number) {
    const next = [...images];
    const [img] = next.splice(i, 1);
    onChange([img, ...next]);
  }

  return (
    <div>
      <Reorder.Group axis="x" values={images} onReorder={onChange} className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" as="ul">
        {images.map((img, i) => (
          <Reorder.Item key={img.key} value={img} className="group relative border border-line bg-ink" as="li">
            <div className="relative aspect-[4/5] cursor-grab bg-bone active:cursor-grabbing">
              <Image src={img.url} alt={img.alt ?? ""} fill sizes="200px" className="pointer-events-none object-cover" draggable={false} />
              {i === 0 && <span className="absolute left-2 top-2 bg-paper px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-ink">Main</span>}
              <GripVertical size={16} className="absolute right-2 top-2 text-ink/60" />
            </div>
            <div className="flex items-center justify-between gap-1 p-1.5">
              <div className="flex">
                <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}><ArrowLeft size={13} /></IconBtn>
                <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1}><ArrowRight size={13} /></IconBtn>
                {i !== 0 && <IconBtn label="Set as main image" onClick={() => makeMain(i)}><Star size={13} /></IconBtn>}
              </div>
              <IconBtn label="Remove image" danger onClick={() => onChange(images.filter((x) => x.key !== img.key))}><Trash2 size={13} /></IconBtn>
            </div>
            <input
              value={img.alt ?? ""}
              onChange={(e) => onChange(images.map((x) => (x.key === img.key ? { ...x, alt: e.target.value } : x)))}
              placeholder="Alt text (optional)"
              className="w-full border-t border-line bg-transparent px-2 py-1.5 text-xs placeholder:text-ash focus:outline-none"
              maxLength={200}
            />
          </Reorder.Item>
        ))}

        {images.length < max && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 border border-dashed text-xs text-stone transition",
                dragOver ? "border-paper bg-graphite" : "border-line hover:border-stone hover:text-paper",
              )}
            >
              {uploading > 0 ? <><Spinner /> Uploading {uploading}…</> : <><ImagePlus size={22} strokeWidth={1.2} /> Add images<span className="text-ash">or drop files here</span></>}
            </button>
          </li>
        )}
      </Reorder.Group>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="mt-3 text-xs text-ash">Drag to reorder. The first image is the main image. JPG/PNG/WebP up to 10 MB — images are optimised automatically.</p>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={cn("p-1.5 text-stone transition hover:text-paper disabled:opacity-25", danger && "hover:text-danger")}>
      {children}
    </button>
  );
}
