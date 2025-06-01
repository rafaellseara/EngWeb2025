import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = "uma_chave_super_secreta"
const API_BASE = process.env.API_BASE || "http://localhost:3000/api"

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json()

    if (!emailOrUsername || !password) {
      return NextResponse.json({ error: "emailOrUsername e password são obrigatórios." }, { status: 400 })
    }

    // Fazer requisição para a API externa de autenticação
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrUsername, password }),
      credentials: "include"
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Erro no login" }, { status: response.status })
    }

    // Criar resposta com cookie seguro
    const nextResponse = NextResponse.json({
      user: data.user,
      token: data.token,
      message: "Login realizado com sucesso",
    })

    return nextResponse
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
