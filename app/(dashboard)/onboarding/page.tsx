"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ONBOARDING_STEPS, ONBOARDING_PROGRESS_STEPS } from "@/lib/constants"
import { ConnectPlatformStep } from "@/features/onboarding/components/connect-platform-step"
import { DefineVoiceStep } from "@/features/onboarding/components/define-voice-step"
import { FirstRepurposeStep } from "@/features/onboarding/components/first-repurpose-step"
import { toast } from "sonner"

interface OnboardingProgress {
  currentStep: number
  platformConnected: string | null
  voiceProfileId: string | null
  isCompleted: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 1,
    platformConnected: null,
    voiceProfileId: null,
    isCompleted: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load onboarding progress
  useEffect(() => {
    if (!isLoaded || !user) return

    const loadProgress = async () => {
      try {
        const response = await fetch("/api/onboarding/progress", {
          credentials: "include",
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.progress) {
            setProgress(data.progress)
            // If already completed, redirect to main app
            if (data.progress.isCompleted) {
              router.push("/")
              return
            }
          }
        }
      } catch (error) {
        console.error("Failed to load onboarding progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [isLoaded, user, router])

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    const newProgress = { ...progress, ...updates }
    setProgress(newProgress)

    try {
      await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProgress),
        credentials: "include",
      })
    } catch (error) {
      console.error("Failed to update progress:", error)
      toast.error("Failed to save progress")
    }
  }

  const handleStepComplete = (stepData: any) => {
    const currentStepNum = progress.currentStep

    if (currentStepNum === ONBOARDING_STEPS.CONNECT_PLATFORM) {
      updateProgress({
        platformConnected: stepData.platform,
        currentStep: ONBOARDING_STEPS.DEFINE_VOICE,
      })
    } else if (currentStepNum === ONBOARDING_STEPS.DEFINE_VOICE) {
      updateProgress({
        voiceProfileId: stepData.voiceProfileId,
        currentStep: ONBOARDING_STEPS.FIRST_REPURPOSE,
      })
    } else if (currentStepNum === ONBOARDING_STEPS.FIRST_REPURPOSE) {
      updateProgress({
        isCompleted: true,
      })
      toast.success("Welcome to BrandVoice.ai! 🎉")
      setTimeout(() => router.push("/"), 1500)
    }
  }

  const handleSkipStep = () => {
    if (progress.currentStep === ONBOARDING_STEPS.DEFINE_VOICE) {
      updateProgress({
        currentStep: ONBOARDING_STEPS.FIRST_REPURPOSE,
      })
    }
  }

  const renderCurrentStep = () => {
    switch (progress.currentStep) {
      case ONBOARDING_STEPS.CONNECT_PLATFORM:
        return (
          <ConnectPlatformStep
            onComplete={handleStepComplete}
            selectedPlatform={progress.platformConnected}
          />
        )
      case ONBOARDING_STEPS.DEFINE_VOICE:
        return (
          <DefineVoiceStep
            onComplete={handleStepComplete}
            onSkip={handleSkipStep}
            existingVoiceId={progress.voiceProfileId}
          />
        )
      case ONBOARDING_STEPS.FIRST_REPURPOSE:
        return (
          <FirstRepurposeStep
            onComplete={handleStepComplete}
            platform={progress.platformConnected}
            voiceProfileId={progress.voiceProfileId}
          />
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your onboarding progress...</p>
        </div>
      </div>
    )
  }

  const progressPercentage = ((progress.currentStep - 1) / (Object.keys(ONBOARDING_STEPS).length - 1)) * 100

  return (
    <div className="py-8">
        {/* Progress Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to BrandVoice.ai</h1>
            <p className="text-gray-300">Let's get you set up in just a few steps</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm">
              {ONBOARDING_PROGRESS_STEPS.map((step) => (
                <div
                  key={step.step}
                  className={`text-center flex-1 ${
                    step.step === progress.currentStep
                      ? "text-purple-300 font-medium"
                      : step.step < progress.currentStep
                      ? "text-green-400"
                      : "text-gray-500"
                  }`}
                >
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs opacity-75">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
