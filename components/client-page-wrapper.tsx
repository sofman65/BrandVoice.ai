"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PageTransition } from "./PageTransition";

export default function ClientPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  // Determine direction for animation
  const direction = useRef<"left" | "right">("right");

  useEffect(() => {
    if (prevPath.current) {
      // Compare route lengths
      const prevDepth = prevPath.current.split("/").filter(Boolean).length;
      const currDepth = pathname.split("/").filter(Boolean).length;

      // Example:
      // /mission  → /mission/123 (go deeper) → slide LEFT
      // /mission/123 → /mission (go up) → slide RIGHT
      direction.current = currDepth >= prevDepth ? "left" : "right";
    }

    prevPath.current = pathname;
  }, [pathname]);

  return (
    <PageTransition keyRoute={pathname}>
      <div className="mx-auto w-full max-w-[1180px] px-4 md:px-6 py-6">
        {children}
      </div>
    </PageTransition>
  );
}
