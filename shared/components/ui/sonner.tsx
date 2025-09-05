"use client"

import { Toaster as SonnerToaster } from "sonner"

/**
 * Global toast provider (shadcn / sonner).
 * Rich colours + close button, positioned top-right.
 */
export function Toaster() {
  return <SonnerToaster richColors closeButton position="top-right" />
}
