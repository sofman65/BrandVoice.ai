"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TONE_OPTIONS } from "@/lib/constants"
import { Plus, X, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface DefineVoiceStepProps {
  onComplete: (data: { voiceProfileId: string }) => void
  onSkip: () => void
}

export function DefineVoiceStep({ onComplete, onSkip }: DefineVoiceStepProps) {
  const [tone, setTone] = useState("friendly")
  const [audience, setAudience] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [customTone, setCustomTone] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [loading, setLoading] = useState(false)

  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 8) {
      setKeywords((prev) => [...prev, keywordInput.trim()])
      setKeywordInput("")
    }
  }

  const removeKeyword = (i: number) => {
    setKeywords((prev) => prev.filter((_, idx) => idx !== i))
  }

  const saveVoice = async () => {
    if (!audience.trim()) return toast.error("Please describe your audience")

    if (tone === "custom" && !customTone.trim()) {
      return toast.error("Please describe your custom tone")
    }

    setLoading(true)

    try {
      const res = await fetch("/api/voice-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: "Default Voice",
          tone: tone === "custom" ? customTone : tone,
          audience,
          keywords
        })
      })

      const data = await res.json()
      onComplete({ voiceProfileId: data.voiceProfile.id })
      toast.success("Voice saved!")
    } catch {
      toast.error("Failed to save voice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold text-white">Define your brand voice</h2>
        <p className="text-lg text-white/60 max-w-xl mx-auto">
          Choose your tone, audience and key themes. You can refine this anytime.
        </p>
      </div>

      <div className="space-y-10 max-w-2xl mx-auto">

        {/* Tone */}
        <div className="space-y-3">
          <Label className="text-white text-lg">Tone</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            {TONE_OPTIONS.map((t) => {
              const isSelected = tone === t.id

              return (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => setTone(t.id)}
                >
                  <Card className={`rounded-xl transition-all border 
                    ${isSelected ? "border-primary/50 bg-primary/10" : "border-white/10 bg-white/5"}
                  `}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white">{t.label}</CardTitle>
                      <CardDescription className="text-white/60">{t.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {tone === "custom" && (
            <Textarea
              className="bg-white/10 border-white/20 text-white"
              placeholder="Describe your custom tone..."
              value={customTone}
              onChange={(e) => setCustomTone(e.target.value)}
            />
          )}
        </div>

        {/* Audience */}
        <div className="space-y-2">
          <Label className="text-white text-lg">Audience</Label>
          <Input
            className="bg-white/10 border-white/20 text-white"
            placeholder="e.g., tech founders, solo creators, marketers"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label className="text-white text-lg">Keywords (optional)</Label>

          <div className="flex gap-2">
            <Input
              className="bg-white/10 border-white/20 text-white"
              placeholder="Add a keyword..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === ",") && (e.preventDefault(), addKeyword())
              }
            />
            <Button
              variant="outline"
              onClick={addKeyword}
              disabled={!keywordInput.trim()}
              className="border-white/20 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* keyword chips */}
          <div className="flex flex-wrap gap-2">
            {keywords.map((k, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-primary/20 text-primary-200 border border-primary/30 rounded-full text-sm flex items-center gap-1"
              >
                {k}
                <button onClick={() => removeKeyword(i)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            disabled={loading}
            onClick={saveVoice}
            className="bg-primary text-white px-8 py-3 rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
            Save My Voice
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={onSkip}
            className="text-white/60 hover:bg-white/10"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  )
}
