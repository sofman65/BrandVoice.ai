// components/brand/logo.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
type Variant = "mark" | "full";
type Tone = "mono" | "gradient";

export interface LogoProps {
  className?: string;
  size?: Size;
  variant?: Variant;      // icon only vs icon + wordmark
  tone?: Tone;            // gradient or mono for wordmark
  label?: string;
}

const sizeMap: Record<Size, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Logo({
  className,
  size = "lg",
  variant = "full",
  tone = "mono",
  label = "BrandVoice.ai",
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      {/* Corrected + normalized SVG */}
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeMap[size], "shrink-0")}
        role="img"
        aria-label="BrandVoice logo"
      >
        <g fill="currentColor" transform="scale(0.32) translate(20, 20)">
          {/* LEFT BV SHAPE */}
          <path d="M 7562.82,11511.4 V 13101 L 8622.5,14160.6 V 12571 h 2384.3 l 993.3,993.3 
                  993.2,-993.3 -1059.7,-1059.7 z 
                  M 8622.5,12836 9682.19,13895.7 h 1192.41 l 132.2,132.8 -132.2,132.1 H 7562.82 
                  l -1059.68,1059.7 h 4768.56 l 1192.4,-1191.8 -464,-464.1 -728.4,-728.4 H 8622.5" />

          {/* RIGHT BV SHAPE */}
          <path d="M 11933.6,8779.7 V 11511.5 l 1059.7,1059.7 V 9839.38 Z 
                  m 397.8,0 3708.8,3708.9 h 1456.7 L 13788,8779.7 Z" />
        </g>
      </svg>

      {/* Wordmark */}
      {variant === "full" && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            tone === "gradient"
              ? "bg-gradient-to-r from-fuchsia-400 via-purple-400 to-sky-400 bg-clip-text text-transparent"
              : "text-white"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
