"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle } from "lucide-react"
import { toast } from "@/app/hooks/use-toast"
import { useAuth } from "@/lib/auth"

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

interface CommentsModalProps {
  open: boolean
  onClose: () => void
  itemId: string
  itemType: string
}

export function CommentsModal({ open, onClose, itemId, itemType }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (open && itemId && itemType) {
      loadComments()
    }
  }, [open, itemId, itemType])

  const loadComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/${itemType}/${itemId}/comments`)
      if (response.ok) {
        const data = await response.json()
        const parsedComments: Comment[] = data.map((c: any) => ({
          id: c.id || c._id,
          content: c.content,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt || c.createdAt,
          author: {
            id: typeof c.author === "string" ? c.author : c.author?.id || "desconhecido",
            name: typeof c.author === "string" ? c.author : c.author?.name || "Anónimo",
            avatar: typeof c.author === "object" ? c.author?.avatar : undefined,
          },
        }))
        setComments(parsedComments)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os comentários.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar comentários:", error)
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar comentários.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`http://localhost:3000/api/${itemType}/${itemId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim(), author: { name: user?.username } }),
      })

      if (response.ok) {
        const data = await response.json()
        const c = data.comment || data
        const parsed: Comment = {
          id: c.id || c._id,
          content: c.content,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt || c.createdAt,
          author: {
            id: typeof c.author === "string" ? c.author : c.author?.id || "desconhecido",
            name: typeof c.author === "string" ? c.author : c.author?.name || "Anónimo",
            avatar: typeof c.author === "object" ? c.author?.avatar : undefined,
          },
        }
        setComments((prev) => [...prev, parsed])
        setNewComment("")
        toast({
          title: "Sucesso",
          description: "Comentário adicionado com sucesso!",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Erro",
          description: errorData.message || "Não foi possível adicionar o comentário.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error)
      toast({
        title: "Erro",
        description: "Erro de conexão ao enviar comentário.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Agora mesmo"
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInHours < 48) return "Ontem"

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comentários ({comments.length})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ainda não há comentários.</p>
                <p className="text-sm">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-slate-900">{comment.author.name}</span>
                          <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t pt-4 mt-4">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={submitting}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{newComment.length}/500 caracteres</span>
                <Button
                  type="submit"
                  disabled={!newComment.trim() || submitting || newComment.length > 500}
                  size="sm"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Comentar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
