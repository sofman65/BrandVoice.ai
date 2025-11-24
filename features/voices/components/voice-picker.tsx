"use client"

import { useState } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { ChevronDown, Wand2, Check, Plus, User } from "lucide-react"
import { useVoiceProfiles } from "@/features/voices/api/use-voice-profiles"
import { CreateVoiceDialog } from "@/features/voices/components/create-voice-dialog"
import { VoiceProfile } from "@/lib/types"

export function VoicePicker({ value, onChange }: { value: VoiceProfile | null; onChange: (value: VoiceProfile) => void }) {
  const [openCreate, setOpenCreate] = useState(false)
  const { data, isLoading } = useVoiceProfiles()

  const profiles = data?.profiles || []

  const options = profiles.map((p) => ({
    id: p.id,
    label: p.name,
    hint: `${p.tone} • ${p.audience}`,
    isDefault: p.isDefault,
  }))

  if (!value && options.length > 0) {
    const defaultVoice = options.find((v) => v.isDefault) || options[0]
    onChange({
      id: defaultVoice.id,
      name: defaultVoice.label,
      tone: defaultVoice.label,
      audience: defaultVoice.label,
      keywords: [],
      vocabulary: [],
      cta: "",
      hashtags: [],
      style: "",
      isDefault: defaultVoice.isDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date(),
    })
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            disabled={isLoading}
            className="h-9 gap-2 rounded-lg border border-white/10 bg-black/20 text-white hover:bg-black/30"
          >
            <Wand2 className="h-4 w-4 text-white/60" />
            {isLoading
              ? "Loading..."
              : value
              ? value.name
              : "Pick voice"}
            <ChevronDown className="h-4 w-4 text-white/60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0 bg-black/30 border border-white/10 backdrop-blur-xl text-white">
          <Command>
            <CommandInput placeholder="Search voices…" />
            <CommandList>
              <CommandEmpty className="text-white/60 p-4">
                No voices found.
              </CommandEmpty>

              {options.length > 0 && (
                <CommandGroup heading="Your Voices" className="text-white/50">
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.id}
                      className="px-3 py-2 gap-3"
                      onSelect={() => onChange({
                        id: opt.id,
                        name: opt.label,
                        tone: opt.hint,
                        audience: opt.hint,
                        keywords: [],
                        vocabulary: [],
                        cta: "",
                        hashtags: [],
                        style: "",
                        isDefault: opt.isDefault,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        userId: "",
                        basePresetId: "",
                      })}
                    >
                      <User className="h-4 w-4 text-white/50 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white">{opt.label}</div>
                        <div className="text-white/50 text-xs">{opt.hint}</div>
                      </div>
                      {value?.id === opt.id && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandGroup className="border-t border-white/10">
                <CommandItem
                  className="px-3 py-3 gap-3"
                  onSelect={() => setOpenCreate(true)}
                >
                  <div className="h-8 w-8 rounded-lg bg-black/20 border border-white/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white">Create New Voice</div>
                    <div className="text-white/60 text-xs">
                      Define your brand’s personality
                    </div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateVoiceDialog
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={(profile) =>
          onChange({
            id: profile.id,
            name: profile.name,
            tone: profile.tone,
            audience: profile.audience,
            keywords: profile.keywords,
            vocabulary: profile.vocabulary,
            cta: profile.cta,
            hashtags: profile.hashtags,
            style: profile.style,
            isDefault: profile.isDefault,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            userId: profile.userId,
            basePresetId: profile.basePresetId,
          })
        }  
      />
    </>
  )
}
