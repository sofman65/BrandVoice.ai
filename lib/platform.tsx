"use client"
import * as React from "react"
import { Video, Instagram as InstagramIcon } from "lucide-react"

import type { Platform } from "@/lib/store"

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  if (platform === "youtube") {
    return <Video className={className} aria-hidden />
  }
  return <InstagramIcon className={className} aria-hidden />
}


