"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Img = { url: string; alt: string };

/**
 * Mobile: native swipe (scroll-snap) with dots.
 * Desktop: thumbnails + hover zoom that follows the cursor.
 * Both: tap/click opens a fullscreen viewer with tap-to-zoom and panning.
 */
export function ProductGallery({ images, name, soldOut }: { images: Img[]; name: string; soldOut: boolean }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((i: number) => {
    const n = images.length;
    const next = (i + n) % n;
    setActive(next);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }, [images.length]);

  function onScroll() {
    const t = trackRef.current;
    if (!t) return;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    if (i !== active) setActive(i);
  }

  if (images.length === 0) {
    return <div className="grid aspect-[4/5] place-items-center bg-graphite text-sm text-ash">No images yet</div>;
  }

  return (
    <div className="lg:grid lg:grid-cols-[76px_1fr] lg:gap-4">
      {/* Thumbnails (desktop) */}
      <div className="no-scrollbar hidden max-h-[80vh] flex-col gap-3 overflow-y-auto lg:flex">
        {images.map((img, i) => (
          <button
            key={img.url + i}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-bone transition duration-300",
              i === active ? "opacity-100 ring-1 ring-paper/70" : "opacity-45 hover:opacity-80",
            )}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === active}
          >
            <Image src={img.url} alt="" fill sizes="76px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Mobile swipe track */}
      <div className="relative -mx-5 md:mx-0 lg:hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-roledescription="carousel"
          aria-label={`${name} images`}
        >
          {images.map((img, i) => (
            <button
              key={img.url + i}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-bone"
              onClick={() => setLightbox(true)}
              aria-label={`Open image ${i + 1} fullscreen`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className={cn("object-cover", soldOut && "grayscale-[30%]")}
              />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden>
            {images.map((_, i) => (
              <span key={i} className={cn("h-[3px] rounded-full bg-ink/70 transition-all duration-500", i === active ? "w-6 bg-ink" : "w-1.5 opacity-40")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop main image with hover zoom */}
      <div className="hidden lg:block">
        <HoverZoom img={images[active]} onOpen={() => setLightbox(true)} soldOut={soldOut} />
      </div>

      <Lightbox images={images} index={active} open={lightbox} onClose={() => setLightbox(false)} onIndex={goTo} />
    </div>
  );
}

function HoverZoom({ img, onOpen, soldOut }: { img: Img; onOpen: () => void; soldOut: boolean }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [zoom, setZoom] = useState(false);
  return (
    <div
      className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-bone"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onClick={onOpen}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={img.url}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={img.url}
            alt={img.alt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className={cn("object-cover transition-transform duration-500 ease-out", soldOut && "grayscale-[30%]")}
            style={{ transform: zoom ? "scale(1.9)" : "scale(1)", transformOrigin: origin }}
          />
        </motion.div>
      </AnimatePresence>
      <span className="pointer-events-none absolute bottom-4 right-4 bg-ink/70 p-2 text-paper opacity-0 backdrop-blur transition group-hover:opacity-100">
        <Expand size={16} strokeWidth={1.4} />
      </span>
    </div>
  );
}

function Lightbox({
  images,
  index,
  open,
  onClose,
  onIndex,
}: {
  images: Img[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => setZoomed(false), [index, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(index + 1);
      if (e.key === "ArrowLeft") onIndex(index - 1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, onClose, onIndex]);

  const img = images[index];

  return (
    <AnimatePresence>
      {open && img && (
        <motion.div
          className="fixed inset-0 z-[90] bg-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={img.url + zoomed}
                className={cn("absolute inset-0", zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: zoomed ? 2.2 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                drag={zoomed ? true : "x"}
                dragConstraints={zoomed ? { left: -400, right: 400, top: -500, bottom: 500 } : { left: 0, right: 0 }}
                dragElastic={zoomed ? 0.1 : 0.4}
                onDragEnd={(_, info) => {
                  if (zoomed) return;
                  if (info.offset.x < -60) onIndex(index + 1);
                  else if (info.offset.x > 60) onIndex(index - 1);
                }}
                onTap={() => setZoomed((z) => !z)}
              >
                <Image src={img.url} alt={img.alt} fill sizes="100vw" className="pointer-events-none select-none object-contain" draggable={false} />
              </motion.div>
            </AnimatePresence>
          </div>
          <button onClick={onClose} className="absolute right-4 top-4 z-10 bg-ink/70 p-3 text-paper backdrop-blur" aria-label="Close viewer">
            <X size={20} strokeWidth={1.4} />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={() => onIndex(index - 1)} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 bg-ink/70 p-3 text-paper backdrop-blur" aria-label="Previous image">
                <ChevronLeft size={20} strokeWidth={1.4} />
              </button>
              <button onClick={() => onIndex(index + 1)} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 bg-ink/70 p-3 text-paper backdrop-blur" aria-label="Next image">
                <ChevronRight size={20} strokeWidth={1.4} />
              </button>
            </>
          )}
          <p className="eyebrow absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-stone">
            {index + 1} / {images.length} · Tap to {zoomed ? "zoom out" : "zoom"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
