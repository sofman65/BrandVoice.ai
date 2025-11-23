"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = { className?: string };

/**
 * Minimal BrandSignature:
 * - subtle purple glow
 * - very soft teal/yellow blend
 * - one ambient wave (not animated path)
 * - tiny parallax fade
 */
export function BrandSignature({ className }: Props) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {/* Soft background aura */}
      <motion.div
        aria-hidden
        className="absolute top-[20%] left-[15%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_60%)] blur-[80px]"
        animate={{ opacity: [0.4, 0.6, 0.5] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />

      {/* Secondary ambient glow */}
      <motion.div
        aria-hidden
        className="absolute bottom-[15%] right-[12%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(46,230,212,0.15),transparent_70%)] blur-[90px]"
        animate={{ opacity: [0.25, 0.4, 0.3] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />

      {/* A single elegant wave */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[240px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-[0.25]"
        animate={{ opacity: [0.2, 0.35, 0.25] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 600 240" className="h-full w-full">
          <defs>
            <linearGradient id="bv-wave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2EE6D4" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d="M20 120 Q160 80 300 120 T580 120"
            fill="none"
            stroke="url(#bv-wave)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}
