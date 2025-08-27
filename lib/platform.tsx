"use client"
import * as React from "react"
import { Video, Instagram as InstagramIcon } from "lucide-react"

import type { MissionPlatform } from "@/lib/types"

export function PlatformIcon({ platform, className }: { platform: MissionPlatform; className?: string }) {
  if (platform === "youtube") {
    return <Video className={className} aria-hidden />
  }
  return <InstagramIcon className={className} aria-hidden />
}


