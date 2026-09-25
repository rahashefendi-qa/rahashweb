"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { INTRO_KEY as KEY } from "@/lib/intro";

/**
 * Full-screen brand intro, shown once per browser session.
 * An inline script in the root layout (INTRO_DECIDE_SCRIPT) decides *before first paint*
 * whether to show it, so returning visitors and reduced-motion users never see a flash.
 */
export function IntroAnimation({ storeName }: { storeName: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "1") {
      setShow(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const t = setTimeout(finish, 2300);
    return () => clearTimeout(t);
  }, []);

  function finish() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
    document.body.style.overflow = "";
    delete document.documentElement.dataset.intro;
  }

  const letters = storeName.split("");

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            key="intro"
            aria-hidden
            className="intro fixed inset-0 z-[90] hidden items-center justify-center bg-ink"
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            initial={{ clipPath: "inset(0 0 0% 0)" }}
          >
            <div className="flex flex-col items-center">
              <div className="display flex overflow-hidden text-[clamp(2.2rem,8vw,5.5rem)] tracking-[0.18em]">
                {letters.map((l, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.045, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    {l === " " ? " " : l}
                  </motion.span>
                ))}
              </div>
              <motion.span
                className="mt-6 block h-px bg-brass"
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.p
                className="eyebrow mt-5 text-stone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                Men&apos;s bags — Lebanon
              </motion.p>
            </div>
            <button
              onClick={finish}
              className="eyebrow absolute bottom-8 right-6 text-stone transition hover:text-paper"
              tabIndex={-1}
            >
              Skip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`html[data-intro="1"] .intro{display:flex}`}</style>
    </>
  );
}
