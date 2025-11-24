"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PLATFORM_OPTIONS } from "@/lib/constants"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface ConnectPlatformStepProps {
  onComplete: (data: { platform: string }) => void
  selectedPlatform?: string | null
}

export function ConnectPlatformStep({ onComplete, selectedPlatform }: ConnectPlatformStepProps) {
  const [selected, setSelected] = useState(selectedPlatform || null)

  const handleContinue = () => {
    if (selected) onComplete({ platform: selected })
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold tracking-tight text-white">
          Connect your content source
        </h2>
        <p className="text-lg text-white/60 max-w-xl mx-auto">
          Choose your primary platform. You can add more anytime.
        </p>
      </div>

      {/* Platform Grid */}
      <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLATFORM_OPTIONS.map((platform) => {
          const isSelected = selected === platform.id

          return (
            <motion.div
              key={platform.id}
              whileHover={{ scale: platform.available ? 1.03 : 1 }}
              className="cursor-pointer"
              onClick={() => platform.available && setSelected(platform.id)}
            >
              <Card
                className={`rounded-2xl transition-all border 
                  ${isSelected ? "border-primary/40 bg-primary/10" : "border-white/10 bg-white/5"}
                  ${!platform.available && "opacity-40 cursor-not-allowed"}
                `}
              >
                <CardHeader className="pb-3 text-center">
                  <div className="relative w-fit mx-auto mb-4">
                    <div className={`h-16 w-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${platform.color}`}>
                      <platform.icon className="h-8 w-8 text-white" />
                    </div>

                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-md">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <CardTitle className="text-white text-lg">{platform.name}</CardTitle>
                  <CardDescription className="text-white/60">{platform.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-4">
                  {!platform.available && (
                    <p className="text-xs text-white/40">Coming soon</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Continue Button */}
      <div className="text-center space-y-2">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selected}
          className="px-10 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </Button>

        {!selected && (
          <p className="text-white/40 text-sm">Select a platform to continue</p>
        )}
      </div>
    </div>
  )
}
