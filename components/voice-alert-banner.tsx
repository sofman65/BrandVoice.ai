"use client"

import React, { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function VoiceAlertBanner() {
  const [showAlert, setShowAlert] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkVoiceProfile = async () => {
      try {
        const response = await fetch("/api/voice-profiles", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          // Show alert if user has no voice profiles
          setShowAlert(!data.profiles || data.profiles.length === 0)
        }
      } catch (error) {
        console.error("Failed to check voice profiles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkVoiceProfile()
  }, [])

  const handleSetVoice = () => {
    router.push("/onboarding?step=2") // Go directly to voice setup
  }

  const handleDismiss = () => {
    setShowAlert(false)
    // Remember dismissal for this session
    sessionStorage.setItem("voice-alert-dismissed", "true")
  }

  // Don't show if loading, dismissed this session, or user has voice profiles
  if (isLoading || !showAlert || sessionStorage.getItem("voice-alert-dismissed")) {
    return null
  }

  return (
    <Alert className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <Sparkles className="h-4 w-4 text-purple-400" />
      <div className="flex items-center justify-between w-full">
        <AlertDescription className="text-purple-200 flex-1">
          <strong>Make your content sound authentic!</strong> This content was generated with our default AI voice. 
          <span className="ml-1">Define your own voice to make it truly yours.</span>
        </AlertDescription>
        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={handleSetVoice}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Set My Voice Now
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}
