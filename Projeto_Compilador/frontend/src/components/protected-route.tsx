"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"

const PUBLIC_PATHS = ["/auth/login", "/auth/register"]

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!loading) {
      const isPublic = PUBLIC_PATHS.includes(pathname)

      if (!user && !isPublic) {
        router.replace("/auth/login")
      } else if (user && isPublic) {
        router.replace("/")
      } else {
        setAllowed(true)
      }
    }
  }, [user, loading, pathname, router])

  if (loading || !allowed) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <Loader2 className="animate-spin h-8 w-8 text-slate-800" />
      </div>
    )
  }

  return <>{children}</>
}
