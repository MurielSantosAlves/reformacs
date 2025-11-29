"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle } from "lucide-react"

interface ReformaPhase {
  id: string
  name: string
  percentage: number
  status: "concluida" | "pendente"
}

interface ReformaImage {
  id: string
  url: string
  caption: string
}

interface ReformaData {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  progress_percentage: number
  total_invested: number
  images: ReformaImage[]
  phases: ReformaPhase[]
}

export function HomePage() {
  const [data, setData] = useState<ReformaData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/reforma")
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Carregando informações da reforma...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-muted-foreground mb-4">Nenhuma informação disponível no momento.</p>
          <a href="/admin" className="text-primary font-semibold hover:underline">
            Ir para o painel administrativo
          </a>
        </Card>
      </div>
    )
  }

  const startDate = new Date(data.start_date).toLocaleDateString("pt-BR")
  const endDate = new Date(data.end_date).toLocaleDateString("pt-BR")
  const daysRemaining = Math.ceil((new Date(data.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const formattedInvestment = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(typeof data.total_invested === "number" ? data.total_invested : 0)

  const fasesConcluidas = data.phases.filter((phase) => phase.status === "concluida")
  const fasesPendentes = data.phases.filter((phase) => phase.status === "pendente")

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-balance">Reforma - CCB-DUMONT</h1>
            <p className="text-lg md:text-xl opacity-90 text-balance">Acompanhe o progresso das obras de renovação</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Progress Overview */}
        <Card className="mb-12 p-6 md:p-8 bg-card border-border">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Progresso Geral</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-foreground">{data.progress_percentage}% Concluído</span>
                    <Badge className="bg-accent text-accent-foreground">
                      {daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Concluído"}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500 rounded-full"
                      style={{ width: `${data.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Investido até o Momento</p>
                  <p className="text-2xl font-bold text-primary">{formattedInvestment}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-secondary/10 border-secondary/20">
                <p className="text-sm text-muted-foreground mb-1">Início da Obra</p>
                <p className="text-lg font-semibold text-foreground">{startDate}</p>
              </Card>
              <Card className="p-4 bg-accent/10 border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">Conclusão Prevista</p>
                <p className="text-lg font-semibold text-foreground">{endDate}</p>
              </Card>
            </div>
          </div>

          {/* Phase Details - Organized by Status */}
          {data.phases && data.phases.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-6 text-foreground">Fases da Obra</h3>

              {fasesConcluidas.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h4 className="text-md font-semibold text-foreground">
                      Etapas Concluídas ({fasesConcluidas.length})
                    </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {fasesConcluidas.map((phase) => (
                      <div
                        key={phase.id}
                        className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {phase.name}
                          </span>
                          <span className="text-sm font-semibold text-green-600">{phase.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-600 h-full transition-all duration-500"
                            style={{ width: `${phase.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fasesPendentes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Circle className="w-5 h-5 text-muted-foreground" />
                    <h4 className="text-md font-semibold text-foreground">
                      Etapas Pendentes ({fasesPendentes.length})
                    </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {fasesPendentes.map((phase) => (
                      <div key={phase.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-foreground flex items-center gap-2">
                            <Circle className="w-4 h-4 text-muted-foreground" />
                            {phase.name}
                          </span>
                          <span className="text-sm font-semibold text-primary">{phase.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${phase.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <Card className="mb-12 p-6 md:p-8 bg-card border-border mt-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Sobre a Reforma</h2>
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{data.description}</p>
          </Card>

          {/* Gallery */}
          {data.images && data.images.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-8 text-foreground">Galeria de Imagens</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.images.map((image) => (
                  <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border">
                    <div className="relative w-full h-64 bg-muted">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-foreground font-semibold text-center">{image.caption}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 CCB-DUMONT. Todos os direitos reservados.</p>
          <p className="mt-2 text-sm">
            <a href="/admin" className="text-primary hover:underline font-semibold">
              Painel Administrativo
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
