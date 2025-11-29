import { type NextRequest, NextResponse } from "next/server"

const ADMIN_USER = "admin"
const ADMIN_PASSWORD = "admin2025@"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 })
    }

    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
      // Criar resposta com cookie de autenticação
      const response = NextResponse.json({ success: true })
      response.cookies.set("admin_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 horas
      })
      return response
    }

    return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
