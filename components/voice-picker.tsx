import {
    Popover, PopoverContent, PopoverTrigger,
  } from "@/components/ui/popover";
  import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
  } from "@/components/ui/command";
  import { ChevronDown, Wand2, Check } from "lucide-react";
import { Button } from "./ui/button";
  
export const VoicePicker = ({
    value,
    onChange,
    options,
  }: {
    value: { id: string; label: string; hint?: string } | null;
    onChange: (v: { id: string; label: string; hint?: string }) => void;
    options: Array<{ id: string; label: string; hint?: string }>;
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <Wand2 className="h-4 w-4 opacity-80" />
            {value ? value.label : "Pick a voice"}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-72 border-white/10 bg-[#0b0b15] p-0 text-white"
        >
          <Command>
            <CommandInput placeholder="Search voices…" />
            <CommandList>
              <CommandEmpty>No voices found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    onSelect={() => onChange(opt)}
                    className="flex items-start gap-2"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-500" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{opt.label}</div>
                      {opt.hint && (
                        <div className="text-xs text-white/60">{opt.hint}</div>
                      )}
                    </div>
                    {value?.id === opt.id && (
                      <Check className="ml-auto h-4 w-4 text-purple-300" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
  