"use client"

import { useState } from "react"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import { ChevronDown, Wand2, Check, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceProfiles } from "@/features/voices/api/use-voice-profiles"
import { CreateVoiceDialog } from "@/features/voices/components/create-voice-dialog"
import { VoiceProfile } from "@/lib/types"

interface VoiceOption {
  id: string
  label: string
  hint?: string
  isDefault?: boolean
}

interface VoicePickerProps {
  value: VoiceOption | null
  onChange: (voice: VoiceOption) => void
}

export const VoicePicker = ({ value, onChange }: VoicePickerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { data: voiceProfilesData, isLoading } = useVoiceProfiles()
  
  const voiceProfiles = voiceProfilesData?.profiles || []
  
  // Convert voice profiles to options
  const voiceOptions: VoiceOption[] = voiceProfiles.map((profile: VoiceProfile) => ({
    id: profile.id,
    label: profile.name,
    hint: `${profile.tone} • ${profile.audience}`,
    isDefault: profile.isDefault
  }))

  // Add "Create Voice" option
  const allOptions: VoiceOption[] = [
    ...voiceOptions,
    {
      id: 'create-new',
      label: 'Create New Voice',
      hint: 'Define your brand voice'
    }
  ]

  const handleSelect = (option: VoiceOption) => {
    if (option.id === 'create-new') {
      setIsCreateDialogOpen(true)
    } else {
      onChange(option)
    }
  }

  const handleVoiceCreated = (voiceProfile: VoiceProfile) => {
    const newOption: VoiceOption = {
      id: voiceProfile.id,
      label: voiceProfile.name,
      hint: `${voiceProfile.tone} • ${voiceProfile.audience}`,
      isDefault: voiceProfile.isDefault
    }
    onChange(newOption)
  }

  // Auto-select default voice if none selected
  if (!value && voiceOptions.length > 0) {
    const defaultVoice = voiceOptions.find(v => v.isDefault) || voiceOptions[0]
    onChange(defaultVoice)
  }
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10"
            disabled={isLoading}
          >
            <Wand2 className="h-4 w-4 opacity-80" />
            {isLoading ? "Loading..." : value ? value.label : voiceOptions.length === 0 ? "Create Voice" : "Pick a voice"}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-80 border-white/10 bg-[#0b0b15] p-0 text-white"
        >
          <Command>
            <CommandInput placeholder="Search voices…" />
            <CommandList>
              <CommandEmpty>
                {voiceOptions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400">
                    No voices yet. Create your first voice to get started!
                  </div>
                ) : (
                  "No voices found."
                )}
              </CommandEmpty>
              
              {voiceOptions.length > 0 && (
                <CommandGroup heading="Your Voices">
                  {voiceOptions.map((opt) => (
                    <CommandItem
                      key={opt.id}
                      onSelect={() => handleSelect(opt)}
                      className="flex items-start gap-3 p-3"
                    >
                      <div className="mt-0.5">
                        <User className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{opt.label}</div>
                          {opt.isDefault && (
                            <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-300">
                              Default
                            </span>
                          )}
                        </div>
                        {opt.hint && (
                          <div className="text-xs text-white/60 mt-0.5">{opt.hint}</div>
                        )}
                      </div>
                      {value?.id === opt.id && (
                        <Check className="h-4 w-4 text-purple-300" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              <CommandGroup>
                <CommandItem
                  onSelect={() => handleSelect({ id: 'create-new', label: 'Create New Voice', hint: 'Define your brand voice' })}
                  className="flex items-center gap-3 p-3 border-t border-white/10"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                    <Plus className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">Create New Voice</div>
                    <div className="text-xs text-white/60">Define your brand voice</div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateVoiceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleVoiceCreated}
      />
    </>
  )
}
  