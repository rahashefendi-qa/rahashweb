"use client";

import { motion } from "framer-motion";

export function OrderConfirmedAnimation() {
  return (
    <svg viewBox="0 0 64 64" className="mx-auto h-16 w-16 text-brass" aria-hidden>
      <motion.circle
        cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M20 33 l8 8 l16 -18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
      />
    </svg>
  );
}
