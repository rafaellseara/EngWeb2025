"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, MapPin, Tag, Calendar, Upload, ImageIcon, Activity, FileText, Users } from "lucide-react"
import { createItem } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface ContentCreatorProps {
  author: string
}

export function ContentCreator({ author }: ContentCreatorProps) {
  const { user } = useAuth()
  const [contentType, setContentType] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    location: "",
    caption: "",
    summary: "",
    institution: "",
    course: "",
    grade: "",
    scale: "20",
    activity: "",
    value: "",
    unit: "km",
    originalName: "",
    format: "pdf",
    fileSize: 1024,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    participants: "",
    activityDate: new Date().toISOString().split("T")[0],
    evaluationDate: new Date().toISOString().split("T")[0],
  })

  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()

  const contentTypes = [
    { value: "photo", label: "Fotografia", icon: "📸" },
    { value: "text", label: "Texto", icon: "💭" },
    { value: "academic", label: "Resultado Académico", icon: "🎓" },
    { value: "sport", label: "Registo Desportivo", icon: "🏃" },
    { value: "file", label: "Ficheiro", icon: "📄" },
    { value: "event", label: "Evento", icon: "📅" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitMessage({
          type: "error",
          text: "Por favor, selecione apenas arquivos de imagem."
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitMessage({
          type: "error",
          text: "A imagem deve ter no máximo 5MB."
        })
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear any previous error messages
      setSubmitMessage(null)
    }
  }

  const convertImageToBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      location: "",
      caption: "",
      summary: "",
      institution: "",
      course: "",
      grade: "",
      scale: "20",
      activity: "",
      value: "",
      unit: "km",
      originalName: "",
      format: "pdf",
      fileSize: 1024,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      participants: "",
      activityDate: new Date().toISOString().split("T")[0],
      evaluationDate: new Date().toISOString().split("T")[0],
    })
    setTags([])
    setIsPublic(false)
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const actualAuthor = user?.username || author
      const contentId = crypto.randomUUID()
      const createdAt = new Date().toISOString()
      const visibility = isPublic ? "public" : "private"

      let payload: FormData | Record<string, any>

      if (contentType === "photo") {
        if (!selectedImage) throw new Error("Por favor, selecione uma imagem.")

        const form = new FormData()
        form.append("id", contentId)
        form.append("author", actualAuthor)
        form.append("type", contentType)
        form.append("visibility", visibility)
        form.append("createdAt", createdAt)
        tags.forEach((tag) => form.append("tags[]", tag))

        form.append("caption", formData.caption)
        form.append("format", selectedImage.type.split("/")[1])
        form.append("originalName", selectedImage.name)
        form.append("size", selectedImage.size.toString())
        form.append("image", selectedImage)
        if (formData.location) {
          form.append("location", formData.location)
        }

        payload = form
      } else {
        const json: Record<string, any> = {
          id: contentId,
          author: actualAuthor,
          type: contentType,
          visibility,
          createdAt,
          tags,
        }

        switch (contentType) {
          case "text":
            json.title = formData.title
            json.content = formData.content
            json.summary = formData.summary
            break
          case "academic":
            json.institution = formData.institution
            json.course = formData.course
            json.grade = formData.grade
            json.scale = formData.scale
            json.evaluationDate = new Date(formData.evaluationDate).toISOString()
            break
          case "sport":
            json.activity = formData.activity
            json.value = formData.value
            json.unit = formData.unit
            json.location = formData.location
            json.activityDate = new Date(formData.activityDate).toISOString()
            break
          case "event":
            json.title = formData.title
            json.description = formData.content
            json.location = formData.location
            json.startDate = new Date(formData.startDate).toISOString()
            json.endDate = new Date(formData.endDate).toISOString()
            json.participants = formData.participants
            break
          case "file":
            json.originalName = formData.originalName
            json.description = formData.content
            json.size = formData.fileSize
            json.format = formData.format
            break
        }

        payload = json
      }

      const result = await createItem(contentType, payload, sessionStorage.getItem("auth-token") || "")

      if (result) {
        setSubmitMessage({ type: "success", text: "Conteúdo criado com sucesso!" })
        location.reload()
      } else {
        throw new Error("Falha ao criar conteúdo")
      }

    } catch (error) {
      console.error("Erro ao criar conteúdo:", error)
      setSubmitMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao criar conteúdo. Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }



  // Renderizar campos específicos com base no tipo de conteúdo
  const renderContentTypeFields = () => {
    if (!contentType) return null

    switch (contentType) {
      case "photo":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="caption" className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Legenda</span>
              </Label>
              <Input
                id="caption"
                name="caption"
                value={formData.caption}
                onChange={handleInputChange}
                placeholder="Descreva esta foto..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoUpload" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Carregar Imagem</span>
              </Label>
              <div className="border-2 border-dashed border-slate-200 rounded-md p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                  const input = document.getElementById('photoUpload') as HTMLInputElement
                  if (input) input.click()
                }}
              >
                {imagePreview ? (
                  <div className="space-y-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full max-h-32 mx-auto rounded-md object-cover"
                    />
                    <p className="text-sm text-slate-600">{selectedImage?.name}</p>
                    <p className="text-xs text-slate-400">
                      {selectedImage && `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB`}
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                        const input = document.getElementById('photoUpload') as HTMLInputElement
                        if (input) input.value = ''
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Clique para selecionar ou arraste uma imagem</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG ou GIF até 5MB</p>
                  </>
                )}
                <Input 
                  id="photoUpload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Localização (opcional)</span>
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Onde esta foto foi tirada?"
              />
            </div>
          </>
        )

      case "text":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center space-x-2">
                <span>Título</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Título do texto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center space-x-2">
                <span>Conteúdo</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Escreva o seu texto aqui..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="flex items-center space-x-2">
                <span>Resumo (opcional)</span>
              </Label>
              <Input
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Breve resumo do texto"
              />
            </div>
          </>
        )

      case "academic":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="course" className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Curso</span>
              </Label>
              <Input
                id="course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="Nome do curso"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution" className="flex items-center space-x-2">
                <span>Instituição</span>
              </Label>
              <Input
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                placeholder="Nome da instituição"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade" className="flex items-center space-x-2">
                  <span>Nota</span>
                </Label>
                <Input
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="Sua nota"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scale" className="flex items-center space-x-2">
                  <span>Escala</span>
                </Label>
                <Select
                  name="scale"
                  value={formData.scale}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, scale: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">0-20</SelectItem>
                    <SelectItem value="10">0-10</SelectItem>
                    <SelectItem value="5">0-5</SelectItem>
                    <SelectItem value="100">0-100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluationDate" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Data de Avaliação</span>
              </Label>
              <Input
                id="evaluationDate"
                name="evaluationDate"
                type="date"
                value={formData.evaluationDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )

      case "sport":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="activity" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Atividade</span>
              </Label>
              <Input
                id="activity"
                name="activity"
                value={formData.activity}
                onChange={handleInputChange}
                placeholder="Tipo de atividade (ex: Corrida)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value" className="flex items-center space-x-2">
                  <span>Valor</span>
                </Label>
                <Input
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="Distância, tempo, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="flex items-center space-x-2">
                  <span>Unidade</span>
                </Label>
                <Select
                  name="unit"
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km">Quilómetros (km)</SelectItem>
                    <SelectItem value="m">Metros (m)</SelectItem>
                    <SelectItem value="min">Minutos (min)</SelectItem>
                    <SelectItem value="h">Horas (h)</SelectItem>
                    <SelectItem value="kcal">Calorias (kcal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Localização (opcional)</span>
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Onde realizou a atividade?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityDate" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Data da Atividade</span>
              </Label>
              <Input
                id="activityDate"
                name="activityDate"
                type="date"
                value={formData.activityDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )

      case "file":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="originalName" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Nome do Arquivo</span>
              </Label>
              <Input
                id="originalName"
                name="originalName"
                value={formData.originalName}
                onChange={handleInputChange}
                placeholder="Nome do arquivo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileUpload" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Carregar Arquivo</span>
              </Label>
              <div className="border-2 border-dashed border-slate-200 rounded-md p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Clique para selecionar ou arraste um arquivo</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOC, XLS, etc. até 10MB</p>
                <Input id="fileUpload" type="file" className="hidden" onChange={() => {}} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center space-x-2">
                <span>Descrição (opcional)</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Descreva o conteúdo deste arquivo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format" className="flex items-center space-x-2">
                  <span>Formato</span>
                </Label>
                <Select
                  name="format"
                  value={formData.format}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="xls">XLS</SelectItem>
                    <SelectItem value="txt">TXT</SelectItem>
                    <SelectItem value="zip">ZIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )

      case "event":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center space-x-2">
                <span>Título do Evento</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nome do evento"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center space-x-2">
                <span>Descrição</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Descreva o evento..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Localização</span>
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Onde ocorrerá o evento?"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Início</span>
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Fim</span>
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Participantes (opcional)</span>
              </Label>
              <Input
                id="participants"
                name="participants"
                value={formData.participants}
                onChange={handleInputChange}
                placeholder="Nomes separados por vírgula"
              />
              <p className="text-xs text-slate-500">Separa os nomes com vírgulas (ex: João, Maria, Carlos)</p>
            </div>
          </>
        )

      default:
        return null
    }
  }

  // Verificar se o formulário está válido com base no tipo de conteúdo
  const isFormValid = () => {
    if (!contentType) return false

    switch (contentType) {
      case "photo":
        return !!formData.caption && !!selectedImage
      case "text":
        return !!formData.title && !!formData.content
      case "academic":
        return !!formData.course && !!formData.institution && !!formData.grade
      case "sport":
        return !!formData.activity && !!formData.value && !!formData.unit
      case "file":
        return !!formData.originalName
      case "event":
        return !!formData.title && !!formData.content && !!formData.location && !!formData.startDate
      default:
        return false
    }
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Novo Conteúdo</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submitMessage && (
          <div
            className={`p-3 mb-4 rounded-md ${
              submitMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 w-full">
            <Label htmlFor="type">Tipo de Conteúdo</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" className="w-full"/>
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderContentTypeFields()}

          {contentType && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center space-x-1">
                  <Tag className="w-4 h-4" />
                  <span>Tags</span>
                </Label>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nova tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <span>#{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="public" className="text-sm font-medium">
                  Tornar público
                </Label>
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <Button type="submit" className="w-full" disabled={!isFormValid() || isSubmitting}>
                {isSubmitting ? "A publicar..." : "Publicar"}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
