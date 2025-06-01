"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Filter, Tag } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface ContentFiltersProps {
  author?: string
  selectedTag?: string
}

export function ContentFilters({ author, selectedTag }: ContentFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTag ? [selectedTag] : [])

  // Tipos de conteúdo disponíveis
  const contentTypes = [
    { id: "photo", label: "Fotografias", icon: "📸", count: 45 },
    { id: "text", label: "Textos", icon: "💭", count: 67 },
    { id: "academic", label: "Académico", icon: "🎓", count: 12 },
    { id: "sport", label: "Desporto", icon: "🏃", count: 23 },
    { id: "file", label: "Ficheiros", icon: "📄", count: 18 },
    { id: "event", label: "Eventos", icon: "📅", count: 34 },
  ]

  const popularTags = [
    "reflexão",
    "natureza",
    "viagem",
    "saúde",
    "família",
    "trabalho",
    "fotografia",
    "corrida",
    "leitura",
    "música",
  ]

  const toggleType = (typeId: string) => {
    let updatedTypes: string[]
    if (selectedTypes.includes(typeId)) {
      updatedTypes = selectedTypes.filter((id) => id !== typeId)
    } else {
      updatedTypes = [...selectedTypes, typeId]
    }
  
    setSelectedTypes(updatedTypes)
  
    const params = new URLSearchParams()
  
    if (updatedTypes.length > 0) {
      updatedTypes.forEach((type) => params.append("type", type))
    }
  
    if (selectedTags.length > 0) {
      params.set("tag", selectedTags[0]) // Only one tag allowed
    }
  
    const base = author ? `/author/${encodeURIComponent(author)}` : pathname
    const query = params.toString()
    router.push(`${base}${query ? `?${query}` : ""}`)
  }

  const toggleTag = (tag: string) => {
    let updatedTags: string[] = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [tag]
  
    setSelectedTags(updatedTags)
  
    const params = new URLSearchParams()
  
    if (selectedTypes.length > 0) {
      selectedTypes.forEach((type) => params.append("type", type))
    }
  
    if (updatedTags.length > 0) {
      params.set("tag", updatedTags[0])
    }
  
    const base = author ? `/author/${encodeURIComponent(author)}` : pathname
    const query = params.toString()
    router.push(`${base}${query ? `?${query}` : ""}`)
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setSelectedTags([])
  
    const base = author ? `/author/${encodeURIComponent(author)}` : pathname
    router.push(base)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tipos de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {contentTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedTypes.includes(type.id) ? "default" : "ghost"}
              className="w-full justify-between h-auto p-3"
              onClick={() => toggleType(type.id)}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{type.icon}</span>
                <span className="text-sm">{type.label}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Navegação Temporal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            Este mês
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Últimos 3 meses
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Este ano
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Arquivo completo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
