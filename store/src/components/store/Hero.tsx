"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ image, headline, sub }: { image: string; headline: string; sub: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const words = headline.split(" ");

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink">
      <motion.div style={{ y, scale }} className="absolute inset-0 will-change-transform">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease }}
        >
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-[60%_center] md:object-center" />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

      <motion.div style={{ opacity: fade }} className="container-x relative flex h-full flex-col justify-end pb-[max(4.5rem,12vh)]">
        <motion.p
          className="eyebrow text-brass-soft"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease }}
        >
          The new collection
        </motion.p>
        <h1 className="display mt-5 text-[clamp(3.4rem,11vw,9.5rem)]">
          {words.map((w, i) => (
            <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 1.1, ease }}
              >
                {i === words.length - 1 ? <em className="italic">{w}</em> : w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div
          className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.9, ease }}
        >
          <p className="max-w-md text-base leading-relaxed text-paper/75 md:text-lg">{sub}</p>
          <div className="flex gap-3">
            <ButtonLink href="/shop" size="lg">Shop collection</ButtonLink>
            <ButtonLink href="/category/new-arrivals" size="lg" variant="outline" className="hidden sm:inline-flex">
              New arrivals
            </ButtonLink>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        aria-hidden
      >
        <span className="block h-10 w-px origin-top animate-pulse bg-paper/40" />
      </motion.div>
    </section>
  );
}
