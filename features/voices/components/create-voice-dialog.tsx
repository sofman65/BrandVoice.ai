"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateVoiceProfile } from "@/features/voices/api/use-voice-profiles"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { VoiceProfile } from "@/lib/types"

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "playful", label: "Playful" },
  { value: "bold", label: "Bold" },
  { value: "custom", label: "Custom" },
]

export function CreateVoiceDialog({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: (voiceProfile: VoiceProfile) => void }) {
  const [name, setName] = useState("")
  const [tone, setTone] = useState("")
  const [customTone, setCustomTone] = useState("")
  const [audience, setAudience] = useState("")
  const [keywords, setKeywords] = useState("")
  const [style, setStyle] = useState("")
  const [cta, setCta] = useState("")

  const createVoiceProfile = useCreateVoiceProfile()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!tone || !audience) {
      toast.error("Please fill in all required fields")
      return
    }

    const finalTone = tone === "custom" ? customTone : tone

    try {
      const result = await createVoiceProfile.mutateAsync({
        name: name || "My Voice",
        tone: finalTone,
        audience,
        keywords: keywords
          ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
          : undefined,
        style: style || undefined,
        cta: cta || undefined,
      })

      toast.success("Voice profile created")
      onSuccess?.(result.voiceProfile)
      handleClose()
    } catch {
      toast.error("Failed to create voice profile")
    }
  }

  const handleClose = () => {
    setName("")
    setTone("")
    setCustomTone("")
    setAudience("")
    setKeywords("")
    setStyle("")
    setCta("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-black/30 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white font-semibold">
            Create Voice Profile
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Define how your brand speaks across all generated content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-white/80">Voice Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Founder Voice"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label className="text-white/80">Tone *</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Choose tone" />
              </SelectTrigger>
              <SelectContent className="bg-black/30 border-white/10 text-white backdrop-blur-lg">
                {TONE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tone === "custom" && (
            <div className="space-y-2">
              <Label className="text-white/80">Custom Tone *</Label>
              <Input
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                placeholder="Describe the tone"
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
          )}

          {/* Audience */}
          <div className="space-y-2">
            <Label className="text-white/80">Target Audience *</Label>
            <Input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., tech founders, creators, consultants"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label className="text-white/80">Key Vocabulary</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="comma-separated keywords"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label className="text-white/80">Writing Style</Label>
            <Textarea
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Short, punchy, story-driven..."
              className="bg-black/20 border-white/10 text-white min-h-[80px]"
            />
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <Label className="text-white/80">CTA Style</Label>
            <Input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="Invite conversation, avoid salesy tone..."
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-white/60 hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createVoiceProfile.isPending}
              className="bg-white/10 border border-white/10 hover:bg-white/20 text-white"
            >
              {createVoiceProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Voice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
