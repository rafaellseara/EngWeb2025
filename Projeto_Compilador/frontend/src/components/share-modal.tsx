"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Share2, Twitter, Facebook, Copy, Check } from "lucide-react"
import { type TimelineItem, getItemType } from "@/lib/api"

interface ShareModalProps {
  item: TimelineItem
  trigger?: React.ReactNode
}

export function ShareModal({ item, trigger }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Gerar URL pública para o item
  const getItemUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://eudigital.com"
    return `${baseUrl}/author/${encodeURIComponent(item.author)}/item/${item.id}`
  }

  // Gerar texto de compartilhamento baseado no tipo de item
  const getShareText = () => {
    const itemType = getItemType(item)

    switch (itemType) {
      case "photo":
        const photo = item as any
        return photo.caption || "Confira esta foto no meu diário digital!"

      case "text":
        const text = item as any
        return "\"" + (text.content || text.content.substring(0, 100) + "...") + "\""

      case "academic":
        const academic = item as any
        return `Concluí ${academic.course} na ${academic.institution} com nota ${academic.grade}/${academic.scale}!`

      case "sport":
        const sport = item as any
        return `${sport.activity}: ${sport.value} ${sport.unit}! 🏃‍♂️`

      case "event":
        const event = item as any
        return `Participei no evento: ${event.title}`

      case "file":
        const file = item as any
        return `Confira o ficheiro ${file.originalName} no eu digital!`

      default:
        return "Confira este conteúdo no meu diário digital!"
    }
  }

  const shareText = getShareText()
  const itemUrl = getItemUrl()

  // URLs de compartilhamento para redes sociais
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(itemUrl)}&hashtags=eudigital,diariodigital`

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?link=${encodeURIComponent(itemUrl)}}`

  // Função para copiar link
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(itemUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  // Função para abrir compartilhamento em nova janela
  const openShareWindow = (url: string) => {
    window.open(url, "share", "width=600,height=400,scrollbars=yes,resizable=yes")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-slate-500 cursor-pointer">
            <Share2 className="w-4 h-4 mr-1" />
            Partilhar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partilhar conteúdo</DialogTitle>
          <DialogDescription>Escolha como deseja partilhar este conteúdo</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Texto de compartilhamento */}
          <div className="space-y-2">
            <Label htmlFor="share-text">Texto para partilha</Label>
            <Textarea id="share-text" value={shareText} readOnly rows={3} className="resize-none" />
          </div>

          {/* URL do item */}
          <div className="space-y-2">
            <Label htmlFor="share-url">Link</Label>
            <div className="flex space-x-2">
              <Input id="share-url" value={itemUrl} readOnly />
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-9">
                {copied ? <Check className="w-4 h-5" /> : <Copy className="w-4 h-5" />}
              </Button>
            </div>
          </div>

          {/* Botões de redes sociais */}
          <div className="space-y-3">
            <Label>Partilhar em redes sociais</Label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => openShareWindow(twitterUrl)}
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => openShareWindow(facebookUrl)}
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
