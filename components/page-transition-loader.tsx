"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function PageTransitionLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 300)
    }

    // Interceptar navegação
    const originalPush = router.push
    const originalPrefetch = router.prefetch

    router.push = function (...args) {
      handleStart()
      return originalPush.apply(this, args)
    }

    router.prefetch = function (...args) {
      return originalPrefetch.apply(this, args)
    }

    // Detectar mudança de rota
    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [router])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner animado */}
        <div className="relative h-12 w-12">
          <div
            className="absolute inset-0 rounded-full border-4 border-primary/20"
            style={{
              borderTopColor: "rgb(var(--color-primary))",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
