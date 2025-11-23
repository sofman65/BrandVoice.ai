"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

export function PageTransition({
  children,
  keyRoute,
}: {
  children: ReactNode;
  keyRoute: string;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={true}>
      <motion.div
        key={keyRoute}
        className="min-h-screen"
        initial={{ opacity: 0, y: 4, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.985 }}
        transition={{
          duration: 0.16,
          ease: [0.16, 1, 0.3, 1], // Linear’s springy ease
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
