"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface AdminLoginProps {
  onLoginSuccess: () => void
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        setUsername("")
        setPassword("")
        onLoginSuccess()
      } else {
        const data = await response.json()
        setError(data.error || "Erro na autenticação")
      }
    } catch (err) {
      setError("Erro ao conectar com servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Painel Admin</h1>
          <p className="text-muted-foreground"> CCB-DUMONT</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Usuário</label>
            <Input
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Senha</label>
            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>

          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          <Button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Autenticando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
