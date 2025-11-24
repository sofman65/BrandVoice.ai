"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import {
  ONBOARDING_STEPS,
  ONBOARDING_PROGRESS_STEPS,
} from "@/lib/constants";

import { ConnectPlatformStep } from "@/features/onboarding/components/connect-platform-step";
import { DefineVoiceStep } from "@/features/onboarding/components/define-voice-step";
import { FirstRepurposeStep } from "@/features/onboarding/components/first-repurpose-step";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser(); 

  const [progress, setProgress] = useState({
    currentStep: 1,
    platformConnected: null,
    voiceProfileId: null,
    isCompleted: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  /** Load Onboarding Progress */
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch("/api/onboarding/progress", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.progress) {
            setProgress(data.progress);
            if (data.progress.isCompleted) {
              router.push("/");
              return;
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [isLoaded, user, router]);

  /** Save Progress */
  const updateProgress = async (updates: any) => {
    const merged = { ...progress, ...updates };
    setProgress(merged);

    try {
      await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
        credentials: "include",
      });
    } catch {
      toast.error("Failed to save progress");
    }
  };

  /** Step Completion Handlers */
  const handleStepComplete = (data: any) => {
    switch (progress.currentStep) {
      case ONBOARDING_STEPS.CONNECT_PLATFORM:
        updateProgress({
          platformConnected: data.platform,
          currentStep: ONBOARDING_STEPS.DEFINE_VOICE,
        });
        break;

      case ONBOARDING_STEPS.DEFINE_VOICE:
        updateProgress({
          voiceProfileId: data.voiceProfileId,
          currentStep: ONBOARDING_STEPS.FIRST_REPURPOSE,
        });
        break;

      case ONBOARDING_STEPS.FIRST_REPURPOSE:
        updateProgress({ isCompleted: true });
        toast.success("Welcome to BrandVoice.ai! 🎉");
        setTimeout(() => router.push("/"), 1300);
        break;
    }
  };

  const handleSkip = () => {
    if (progress.currentStep === ONBOARDING_STEPS.DEFINE_VOICE) {
      updateProgress({ currentStep: ONBOARDING_STEPS.FIRST_REPURPOSE });
    }
  };

  /** Step Renderer */
  const renderStep = () => {
    switch (progress.currentStep) {
      case ONBOARDING_STEPS.CONNECT_PLATFORM:
        return (
          <ConnectPlatformStep
            onComplete={handleStepComplete}
            selectedPlatform={progress.platformConnected}
          />
        );

      case ONBOARDING_STEPS.DEFINE_VOICE:
        return (
          <DefineVoiceStep
            onComplete={handleStepComplete}
            onSkip={handleSkip}
          />
        );

      case ONBOARDING_STEPS.FIRST_REPURPOSE:
        return (
          <FirstRepurposeStep
            onComplete={handleStepComplete}
            platform={progress.platformConnected}
            voiceProfileId={progress.voiceProfileId}
          />
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-white/70">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  /** Progress Percentage */
  const progressValue =
    ((progress.currentStep - 1) /
      (Object.keys(ONBOARDING_STEPS).length - 1)) *
    100;

  return (
    <div className="px-4 py-10">
      {/* Onboarding Header */}
      <div className="max-w-2xl mx-auto mb-10 text-center space-y-3">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Welcome to BrandVoice.ai 👋
        </h1>
        <p className="text-white/60">
          Let’s get your workspace ready in three quick steps.
        </p>

        {/* Progress Indicator */}
        <div className="mt-6 space-y-3">
          <Progress value={progressValue} className="h-2 rounded-full bg-white/10" />

          <div className="flex justify-between text-xs text-white/50">
            {ONBOARDING_PROGRESS_STEPS.map((step) => {
              const isCurrent = step.step === progress.currentStep;
              const isCompleted = step.step < progress.currentStep;

              return (
                <div
                  key={step.step}
                  className={`flex-1 text-center ${
                    isCurrent
                      ? "text-primary font-medium"
                      : isCompleted
                      ? "text-green-400"
                      : "text-white/40"
                  }`}
                >
                  <div>{step.title}</div>
                </div>    
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Container */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-10">{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
