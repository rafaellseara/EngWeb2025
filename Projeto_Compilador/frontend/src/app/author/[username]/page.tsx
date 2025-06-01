// src/app/author/[username]/page.tsx

import { Suspense } from "react"
import { fetchTimelineItems } from "@/lib/api"
import { TimelineView } from "@/components/timeline-view"
import { PublicHeader } from "@/components/public-header"
import { ContentFilters } from "@/components/content-filters"
import { notFound } from "next/navigation"

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tag?: string, type?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const username = decodeURIComponent(resolvedParams.username)
  const tag = resolvedSearchParams?.tag
  const type = resolvedSearchParams?.type
  var items = await fetchTimelineItems(username, "public", tag)

  if (items.length === 0) {
    notFound()
  }

  items = items.filter(item => item.type == type || type === undefined)

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PublicHeader currentAuthor={username} />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Perfil de {username}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore a jornada cronológica de {username} através de momentos, pensamentos e experiências.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <ContentFilters author={username} selectedTag={tag} />
          </aside>

          <section className="lg:col-span-3">
            <Suspense fallback={<div className="text-center py-8">Carregando timeline...</div>}>
              <TimelineView items={items} isPublic={true} />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  )
}
