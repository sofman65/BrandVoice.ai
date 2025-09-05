"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PLATFORM_OPTIONS } from "@/lib/constants"
import { Check } from "lucide-react"

interface ConnectPlatformStepProps {
  onComplete: (data: { platform: string }) => void
  selectedPlatform?: string | null
}

export function ConnectPlatformStep({ onComplete, selectedPlatform }: ConnectPlatformStepProps) {
  const [selected, setSelected] = useState<string | null>(selectedPlatform || null)

  const handlePlatformSelect = (platformId: string) => {
    setSelected(platformId)
  }

  const handleContinue = () => {
    if (selected) {
      onComplete({ platform: selected })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Connect your content source</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Pick a platform to start repurposing your videos. You can connect more platforms later.
        </p>
      </div>

      {/* Platform Options */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PLATFORM_OPTIONS.map((platform) => (
          <Card
            key={platform.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selected === platform.id
                ? "ring-2 ring-purple-400 bg-purple-500/20 border-purple-400/50"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            } ${!platform.available ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => platform.available && handlePlatformSelect(platform.id)}
          >
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div
                  className={`mx-auto w-16 h-16 rounded-xl bg-gradient-to-r ${platform.color} p-4 mb-4 flex items-center justify-center`}
                >
                  <platform.icon className="h-8 w-8 text-white" />
                </div>
                {selected === platform.id && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-white text-xl">{platform.name}</CardTitle>
              <CardDescription className="text-gray-300">
                {platform.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              {!platform.available && (
                <Badge variant="secondary" className="bg-gray-600 text-gray-300">
                  Coming Soon
                </Badge>
              )}
              {platform.available && selected === platform.id && (
                <Badge className="bg-green-500 text-white">
                  Selected
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <Button
          onClick={handleContinue}
          disabled={!selected}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
        {!selected && (
          <p className="text-gray-400 text-sm mt-2">Please select a platform to continue</p>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-2">
        <p className="text-gray-400 text-sm">
          Don't worry, you can connect additional platforms anytime from your dashboard
        </p>
      </div>
    </div>
  )
}
