"use client"

import { Suspense, useEffect, useState } from "react"
import { fetchTimelineItems } from "@/lib/api"
import { BackofficeHeader } from "@/components/backoffice-header"
import { TimelineView } from "@/components/timeline-view"
import { ContentCreator } from "@/components/content-creator"
import { BackofficeSidebar } from "@/components/backoffice-sidebar"
import { UserProfileCard } from "@/components/user-profile-card"
import { useAuth } from "@/lib/auth"

export default function BackofficePage() {
  const [items, setItems] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const loadItems = async () => {
      const fetchedItems = await fetchTimelineItems(user?.username || "", "private", undefined, sessionStorage.getItem("auth-token") || "")
      setItems(fetchedItems)
    }
    loadItems()
  }, []);


  return (
    <div className="min-h-screen bg-slate-50">
      <BackofficeHeader />
      <div className="flex">
        <BackofficeSidebar items={items} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Eu Digital</h1>
            <p className="text-slate-600">Faça a gestão do seu conteúdo pessoal e configure a sua visibilidade</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-screen">
            <div className="xl:col-span-1 space-y-6">
              <UserProfileCard showAdminActions={false} />
              <ContentCreator author={user?.username || ""} />
            </div>

            <div className="xl:col-span-2">
              <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
                <TimelineView items={items} isPublic={false} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
