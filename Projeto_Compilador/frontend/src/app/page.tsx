"use client"

import { Suspense, useEffect, useState } from "react"
import { fetchAuthors } from "@/lib/api"
import { PublicHeader } from "@/components/public-header"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, ArrowRight, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [authors, setAuthors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAuthors = async () => {
      const authorsList = await fetchAuthors()
      setAuthors(authorsList)
      setIsLoading(false)
    }
    loadAuthors()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Eu Digital</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Uma plataforma para registar e explorar a jornada cronológica de momentos, pensamentos e experiências.
          </p>

          {user && (
            <div className="mt-6 p-4 rounded-lg max-w-md mx-auto">
              <p>
                Bem-vindo de volta, <strong>{user.username}</strong>!
              </p>
              <Link href="/backoffice">
                <Button className="mt-6" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar novo item
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">Escolha um perfil para explorar</h2>
          </div>

          <Suspense fallback={<div className="text-center py-8">Carregando autores...</div>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isLoading && authors.length > 0 ? (
                authors.map((author) => (
                  <Card key={author} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5" />
                          <span>{author}</span>
                        </div>
                        {user && user.username === author && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Eu</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        Explore a linha do tempo e conteúdos compartilhados por {author}.
                      </p>
                      <Link href={`/author/${encodeURIComponent(author)}`}>
                        <Button className="w-full">
                          Ver perfil <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              ) : isLoading ? (
                <div className="col-span-2 text-center py-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-500">
                  <p>Nenhum autor encontrado.</p>
                </div>
              )}
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
