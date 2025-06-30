"use client"

import { MdContentCopy } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/utils"
import toast from "react-hot-toast"

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await copyToClipboard(text)
      toast.success("Copied!")
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className={className} aria-label="Copy to clipboard">
      <MdContentCopy className="h-4 w-4" />
    </Button>
  )
}
