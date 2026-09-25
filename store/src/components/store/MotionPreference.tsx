"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext<{ reduced: boolean; toggle: () => void }>({ reduced: false, toggle: () => {} });

/** Lets visitors turn motion off even if their OS setting doesn't ask for it. */
export function MotionPreference({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      setReduced(localStorage.getItem("reduce-motion") === "1");
    } catch {}
  }, []);

  function toggle() {
    setReduced((r) => {
      const next = !r;
      try {
        localStorage.setItem("reduce-motion", next ? "1" : "0");
      } catch {}
      if (next) document.documentElement.dataset.reduceMotion = "1";
      else delete document.documentElement.dataset.reduceMotion;
      return next;
    });
  }

  return (
    <Ctx.Provider value={{ reduced, toggle }}>
      <MotionConfig reducedMotion={reduced ? "always" : "user"}>{children}</MotionConfig>
    </Ctx.Provider>
  );
}

export function useMotionPreference() {
  return useContext(Ctx);
}

export function MotionToggle() {
  const { reduced, toggle } = useMotionPreference();
  return (
    <button onClick={toggle} className="transition hover:text-paper" aria-pressed={reduced}>
      Animations: {reduced ? "Off" : "On"}
    </button>
  );
}
