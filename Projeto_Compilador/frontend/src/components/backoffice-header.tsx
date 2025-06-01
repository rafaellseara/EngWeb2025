"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, LogOut, Home, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function BackofficeHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-slate-800 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              📖 Eu Digital
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-300 cursor-pointer">
                <Home className="w-4 h-4 mr-1" />
                Início
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="text-slate-300 cursor-pointer" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
