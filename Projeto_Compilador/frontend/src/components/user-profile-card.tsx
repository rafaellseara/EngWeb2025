"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth"
import Link from "next/link"

interface UserProfileCardProps {
  showAdminActions?: boolean
}

export function UserProfileCard({ showAdminActions = false }: UserProfileCardProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-500 mb-4">Você não está logado</p>
          <div className="space-x-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Registrar</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Meu Perfil</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="font-medium">{user.username}</span>
            <Badge variant="secondary" className="text-xs">
              Você
            </Badge>
          </div>

          {user.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">{user.email}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Membro desde hoje</span>
          </div>
        </div>

        {showAdminActions && (
          <div className="space-y-2 pt-4 border-t">
            <Link href="/admin">
              <Button className="w-full" size="sm">
                Ir para Admin
              </Button>
            </Link>
            <Link href={`/author/${encodeURIComponent(user.username)}`}>
              <Button variant="outline" className="w-full" size="sm">
                Ver Perfil Público
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
