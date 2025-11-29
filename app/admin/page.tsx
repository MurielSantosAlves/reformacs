"use client"

import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminLogin } from "@/components/admin-login"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        if (response.ok) {
          setAuthenticated(true)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setAuthenticated(false)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    )
  }

  if (!authenticated) {
    return <AdminLogin onLoginSuccess={() => setAuthenticated(true)} />
  }

  return (
    <>
      <AdminDashboard onLogout={handleLogout} />
    </>
  )
}
