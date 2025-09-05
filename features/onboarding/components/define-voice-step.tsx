"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { TONE_OPTIONS } from "@/lib/constants"
import { Loader2, Sparkles, Plus, X } from "lucide-react"
import { toast } from "sonner"

interface DefineVoiceStepProps {
  onComplete: (data: { voiceProfileId: string }) => void
  onSkip: () => void
  existingVoiceId?: string | null
}

export function DefineVoiceStep({ onComplete, onSkip, existingVoiceId }: DefineVoiceStepProps) {
  const [selectedTone, setSelectedTone] = useState<string>("friendly")
  const [audience, setAudience] = useState<string>("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState<string>("")
  const [customTone, setCustomTone] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddKeyword = () => {
    if (keywordInput.trim() && keywords.length < 8) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput("")
    }
  }

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  const handleSaveVoice = async () => {
    if (!audience.trim()) {
      toast.error("Please describe your audience")
      return
    }

    if (selectedTone === "custom" && !customTone.trim()) {
      toast.error("Please describe your custom tone")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/voice-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Default",
          tone: selectedTone === "custom" ? customTone : selectedTone,
          audience: audience.trim(),
          keywords: keywords, // Send as array
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to save voice profile")
      }

      const data = await response.json()
      toast.success("Voice profile saved! 🎉")
      onComplete({ voiceProfileId: data.voiceProfile.id })
    } catch (error) {
      console.error("Error saving voice profile:", error)
      toast.error("Failed to save voice profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Make it sound like you</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Set your brand voice so your repurposed content sounds authentic. You can update this anytime.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Tone Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-white">Choose your tone</Label>
          <div className="grid sm:grid-cols-2 gap-3">
            {TONE_OPTIONS.map((tone) => (
              <Card
                key={tone.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTone === tone.id
                    ? "ring-2 ring-purple-400 bg-purple-500/20 border-purple-400/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                onClick={() => setSelectedTone(tone.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">{tone.label}</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    {tone.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Custom Tone Input */}
          {selectedTone === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-tone" className="text-white">
                Describe your custom tone
              </Label>
              <Textarea
                id="custom-tone"
                placeholder="e.g., Witty but informative, like a knowledgeable friend explaining complex topics..."
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Audience */}
        <div className="space-y-2">
          <Label htmlFor="audience" className="text-lg font-semibold text-white">
            Who's your audience?
          </Label>
          <Input
            id="audience"
            placeholder="e.g., Tech founders, solo creators, marketing professionals..."
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
          />
          <p className="text-gray-400 text-sm">
            This helps us tailor the content to resonate with your specific audience
          </p>
        </div>

        {/* Keywords */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-white">
            Keywords to emphasize (optional)
          </Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., AI, productivity, growth..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordInputKeyPress}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                disabled={keywords.length >= 8}
              />
              <Button
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim() || keywords.length >= 8}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1"
                  >
                    {keyword}
                    <Button
                      onClick={() => handleRemoveKeyword(index)}
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0.5 hover:bg-purple-500/30"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            <p className="text-gray-400 text-sm">
              Add up to 8 keywords that are important to your brand or industry
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={handleSaveVoice}
            disabled={isLoading || !audience.trim() || (selectedTone === "custom" && !customTone.trim())}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving Your Voice...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Save My Voice
              </>
            )}
          </Button>
          
          <Button
            onClick={onSkip}
            variant="ghost"
            size="lg"
            className="text-gray-400 hover:text-white hover:bg-white/10 px-8 py-3 text-lg"
          >
            Skip for Now
          </Button>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            You can always update your voice settings later from your profile
          </p>
        </div>
      </div>
    </div>
  )
}
