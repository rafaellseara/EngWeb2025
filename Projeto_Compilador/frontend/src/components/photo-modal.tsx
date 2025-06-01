"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"

interface PhotoModalProps {
  open: boolean
  onClose: () => void
  src: string
  alt?: string
}

export function PhotoModal({ open, onClose, src, alt }: PhotoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>
      </DialogTitle>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <img src={src} alt={alt || "Photo"} className="w-full h-auto object-contain" />
      </DialogContent>
    </Dialog>
  )
}
