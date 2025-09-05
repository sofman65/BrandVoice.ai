"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface OnboardingWrapperProps {
  children: React.ReactNode
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    // Skip onboarding check for certain routes
    const skipRoutes = ['/onboarding', '/sign-in', '/sign-up']
    if (skipRoutes.some(route => pathname.startsWith(route))) {
      setIsCheckingOnboarding(false)
      return
    }

    // Only check onboarding for authenticated users
    if (!user) {
      setIsCheckingOnboarding(false)
      return
    }

    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch("/api/onboarding/progress", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          
          // If no progress exists or onboarding is not completed, redirect
          if (!data.progress || !data.progress.isCompleted) {
            router.push("/onboarding")
            return
          }
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error)
        // On error, let user through (might be returning user)
      } finally {
        setIsCheckingOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [isLoaded, user, pathname, router])

  // Show loading while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
