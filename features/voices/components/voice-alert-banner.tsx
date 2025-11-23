"use client"

import React, { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function VoiceAlertBanner() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const dismissed = sessionStorage.getItem("voice-alert-dismissed")
    if (dismissed) return

    const checkVoices = async () => {
      try {
        const res = await fetch("/api/voice-profiles", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setShow(!data.profiles || data.profiles.length === 0)
        }
      } finally {
        setLoading(false)
      }
    }

    checkVoices()
  }, [])

  if (loading || !show) return null

  return (
    <Alert className="mb-6 bg-black/20 border border-white/10 backdrop-blur-lg">
      <Sparkles className="h-4 w-4 text-white/70" />
      <div className="flex items-center justify-between w-full">
        <AlertDescription className="text-white/70 flex-1">
          <span className="font-medium text-white">Using default AI voice.</span>{" "}
          Create your own voice profile for authentic, consistent content.
        </AlertDescription>

        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            className="bg-white/10 border border-white/10 text-white hover:bg-white/20"
            onClick={() => router.push("/onboarding?step=2")}
          >
            Set My Voice
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-white/40 hover:text-white"
            onClick={() => {
              sessionStorage.setItem("voice-alert-dismissed", "true")
              setShow(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}
