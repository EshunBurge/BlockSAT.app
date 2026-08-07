"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FloatingScorePopup } from "@/stores/gameStore";

export function FloatingScorePopups({ popups, onDone }: { popups: FloatingScorePopup[]; onDone: (id: string) => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -60, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            onAnimationComplete={() => onDone(p.id)}
            className="absolute text-xl font-extrabold text-scheme-accent text-glow"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            +{p.amount}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
