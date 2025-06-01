"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  ImageIcon,
  Activity,
  GraduationCap,
  Calendar,
  MessageSquare,
  Upload,
  Download,
  Share2,
} from "lucide-react"
import type { TimelineItem } from "@/lib/api"

interface AdminSidebarProps {
  items: TimelineItem[]
}

export function BackofficeSidebar({ items }: AdminSidebarProps) {
  const countByType = items.reduce(
    (acc, item) => {
      const type = item.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const publicItems = items.filter((item) => item.visibility === "public").length
  const privateItems = items.filter((item) => item.visibility !== "public").length

  const stats = [
    { icon: FileText, label: "Total de Itens", value: items.length, color: "text-blue-600" },
    { icon: ImageIcon, label: "Fotografias", value: countByType["photo"] || 0, color: "text-green-600" },
    { icon: MessageSquare, label: "Textos", value: countByType["text"] || 0, color: "text-purple-600" },
    { icon: GraduationCap, label: "Académico", value: countByType["academic"] || 0, color: "text-orange-600" },
    { icon: Activity, label: "Desporto", value: countByType["sport"] || 0, color: "text-red-600" },
    { icon: Calendar, label: "Eventos", value: countByType["event"] || 0, color: "text-indigo-600" },
  ]

  return (
    <aside className="w-80 bg-white border-r border-slate-200 p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Upload className="w-4 h-4 mr-2" />
            Importar Dados
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Itens públicos</span>
              <Badge>{publicItems}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Itens privados</span>
              <Badge variant="secondary">{privateItems}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
