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

interface CreateVoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (voiceProfile: any) => void
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'playful', label: 'Playful' },
  { value: 'bold', label: 'Bold' },
  { value: 'custom', label: 'Custom' },
]

export function CreateVoiceDialog({ isOpen, onClose, onSuccess }: CreateVoiceDialogProps) {
  const [name, setName] = useState("")
  const [tone, setTone] = useState("")
  const [customTone, setCustomTone] = useState("")
  const [audience, setAudience] = useState("")
  const [keywords, setKeywords] = useState("")
  const [style, setStyle] = useState("")
  const [cta, setCta] = useState("")

  const createVoiceProfile = useCreateVoiceProfile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tone || !audience) {
      toast.error("Please fill in all required fields")
      return
    }

    const finalTone = tone === 'custom' ? customTone : tone

    try {
      const result = await createVoiceProfile.mutateAsync({
        name: name || "My Voice",
        tone: finalTone,
        audience,
        keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
        style: style || undefined,
        cta: cta || undefined,
      })

      toast.success("Voice profile created successfully!")
      onSuccess?.(result.voiceProfile)
      handleClose()
    } catch (error) {
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
      <DialogContent className="sm:max-w-[500px] bg-[#0b0b15] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Create Your Voice</DialogTitle>
          <DialogDescription className="text-gray-400">
            Define how you want your content to sound. This will be used for all future generations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Voice Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Professional Voice"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone *</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose your tone" />
              </SelectTrigger>
              <SelectContent className="bg-[#0b0b15] border-white/10 text-white">
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tone === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customTone">Custom Tone *</Label>
              <Input
                id="customTone"
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                placeholder="Describe your custom tone"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience *</Label>
            <Input
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., Tech entrepreneurs, Content creators"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords to Emphasize</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="innovation, growth, productivity (comma-separated)"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Writing Style</Label>
            <Textarea
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Describe your preferred writing style..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta">Call-to-Action Style</Label>
            <Input
              id="cta"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="e.g., Ask engaging questions, invite discussion"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createVoiceProfile.isPending}
              className="bg-purple-600 hover:bg-purple-700"
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
