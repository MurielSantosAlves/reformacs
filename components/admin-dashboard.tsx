"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface ReformaData {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  progressPercentage: number
  totalInvested: number
  images: Array<{
    id: string
    url: string
    caption: string
  }>
  phases: Array<{
    id: string
    name: string
    percentage: number
    status: "concluida" | "pendente"
  }>
}

interface AdminDashboardProps {
  onLogout?: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [data, setData] = useState<ReformaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedData, setEditedData] = useState<ReformaData | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "images" | "phases">("info")
  const [newImageCaption, setNewImageCaption] = useState("")
  const [newPhaseName, setNewPhaseName] = useState("")
  const [newPhasePercentage, setNewPhasePercentage] = useState(0)
  const [newPhaseStatus, setNewPhaseStatus] = useState<"concluida" | "pendente">("pendente")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/reforma")
        const result = await response.json()

        if (result && result.id) {
          const mappedData = {
            id: result.id,
            title: result.title,
            description: result.description,
            startDate: result.start_date || result.startDate,
            endDate: result.end_date || result.endDate,
            progressPercentage: result.progress_percentage || result.progressPercentage || 0,
            totalInvested: typeof result.total_invested === "string" ? Number(result.total_invested) : (result.total_invested || result.totalInvested || 0),
            images: Array.isArray(result.images) ? result.images : [],
            phases: Array.isArray(result.phases) ? result.phases : [],
          }
          setData(mappedData)
          setEditedData(mappedData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    if (!editedData) return

     setSaving(true)
    try {
      console.log("[SALVAR] Dados enviados:", editedData)
      const response = await fetch("/api/reforma", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      })

      if (response.ok) {
        const updated = await response.json()
        console.log("[SALVAR] Dados recebidos:", updated)
        setData(updated)
        alert("Dados salvos com sucesso!")
      } else {
        const errorText = await response.text()
        console.error("[SALVAR] Erro na resposta:", errorText)
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar os dados")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !newImageCaption.trim()) {
      alert("Por favor, selecione uma imagem e adicione uma legenda")
      return
    }

    setUploadingImage(true)
    setUploadProgress("Enviando imagem...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro no upload")
      }

      const uploadedFile = await response.json()

      if (editedData) {
        const newImage = {
          id: crypto.randomUUID(),
          url: uploadedFile.url,
          caption: newImageCaption,
        }

        const updatedData = {
          ...editedData,
          images: [...editedData.images, newImage],
        }

        setEditedData(updatedData)
        setNewImageCaption("")
        setUploadProgress("Imagem enviada com sucesso!")

        setTimeout(() => {
          setUploadProgress("")
        }, 2000)
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      setUploadProgress("Erro ao enviar imagem")
      setTimeout(() => {
        setUploadProgress("")
      }, 2000)
    } finally {
      setUploadingImage(false)
      e.target.value = ""
    }
  }

  const handleRemoveImage = async (image: { id: string; url: string }) => {
    if (!editedData) return

    try {
      await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: image.url }),
      })

      setEditedData({
        ...editedData,
        images: editedData.images.filter((img) => img.id !== image.id),
      })
    } catch (error) {
      console.error("Erro ao deletar:", error)
      alert("Erro ao deletar imagem")
    }
  }

  const handleAddPhase = () => {
    if (!editedData || !newPhaseName) return

    const newPhase = {
      id: crypto.randomUUID(),
      name: newPhaseName,
      percentage: newPhasePercentage,
      status: newPhaseStatus,
    }

    setEditedData({
      ...editedData,
      phases: [...editedData.phases, newPhase],
    })

    setNewPhaseName("")
    setNewPhasePercentage(0)
    setNewPhaseStatus("pendente")
  }

  const handleRemovePhase = (id: string) => {
    if (!editedData) return

    setEditedData({
      ...editedData,
      phases: editedData.phases.filter((phase) => phase.id !== id),
    })
  }

  const handlePhasePercentageChange = (id: string, newPercentage: number) => {
    if (!editedData) return

    setEditedData({
      ...editedData,
      phases: editedData.phases.map((phase) => (phase.id === id ? { ...phase, percentage: newPercentage } : phase)),
    })
  }

  const handlePhaseStatusChange = (id: string, newStatus: "concluida" | "pendente") => {
    if (!editedData) return

    setEditedData({
      ...editedData,
      phases: editedData.phases.map((phase) => (phase.id === id ? { ...phase, status: newStatus } : phase)),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando painel administrativo...</p>
      </div>
    )
  }

  if (!editedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Erro ao carregar os dados</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <div className="flex gap-4">
              <a href="/" className="text-primary-foreground hover:underline opacity-90">
                Voltar ao site
              </a>
              {onLogout && (
                <button onClick={onLogout} className="text-primary-foreground hover:underline opacity-90">
                  Sair
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8">
          {(["info", "images", "phases"] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "outline"}
              className={activeTab === tab ? "bg-primary" : ""}
            >
              {tab === "info" && "Informações"}
              {tab === "images" && "Imagens"}
              {tab === "phases" && "Fases"}
            </Button>
          ))}
        </div>

        {activeTab === "info" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Informações Principais</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Título</label>
                  <Input
                    value={editedData.title}
                    onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descrição</label>
                  <Textarea
                    value={editedData.description}
                    onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                    rows={6}
                    className="w-full"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Data de Início</label>
                    <Input
                      type="date"
                      value={editedData.startDate.split("T")[0]}
                      onChange={(e) => setEditedData({ ...editedData, startDate: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Data de Término</label>
                    <Input
                      type="date"
                      value={editedData.endDate.split("T")[0]}
                      onChange={(e) => setEditedData({ ...editedData, endDate: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Progresso Geral (%): {editedData.progressPercentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editedData.progressPercentage}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        progressPercentage: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Total Investido (R$): {editedData.totalInvested.toLocaleString("pt-BR")}
                  </label>
                  <Input
                    type="number"
                    value={editedData.totalInvested}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        totalInvested: Number(e.target.value),
                      })
                    }
                    placeholder="Digite o valor em reais"
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? "Salvando..." : "Salvar Informações"}
              </Button>
            </Card>
          </div>
        )}

        {activeTab === "images" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Adicionar Imagem</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Selecione a Imagem</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descrição/Legenda</label>
                  <Input
                    placeholder="Ex: Fundação concluída"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    className="w-full"
                  />
                </div>

                {uploadProgress && <p className="text-sm text-muted-foreground">{uploadProgress}</p>}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Imagens Atuais</h2>

              {editedData.images.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma imagem adicionada ainda.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editedData.images.map((image) => (
                      <div key={image.id} className="border border-border rounded-lg overflow-hidden">
                        <div className="relative w-full h-32 bg-muted">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.caption}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold mb-2">{image.caption}</p>
                          <Button
                            size="sm"
                            onClick={() => handleRemoveImage(image)}
                            variant="destructive"
                            className="w-full"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {saving ? "Salvando..." : "Salvar Imagens"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "phases" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Adicionar Fase</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nome da Fase</label>
                  <Input
                    placeholder="Ex: Alvenaria"
                    value={newPhaseName}
                    onChange={(e) => setNewPhaseName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Status</label>
                  <select
                    value={newPhaseStatus}
                    onChange={(e) => setNewPhaseStatus(e.target.value as "concluida" | "pendente")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Progresso (%): {newPhasePercentage}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newPhasePercentage}
                    onChange={(e) => setNewPhasePercentage(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button onClick={handleAddPhase} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Adicionar Fase
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Fases da Obra</h2>

              {editedData.phases.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma fase adicionada ainda.</p>
              ) : (
                <div className="space-y-4">
                  {editedData.phases.map((phase) => (
                    <div key={phase.id} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-semibold">{phase.name}</p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                              phase.status === "concluida"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {phase.status === "concluida" ? "Concluída" : "Pendente"}
                          </span>
                        </div>
                        <Button size="sm" onClick={() => handleRemovePhase(phase.id)} variant="destructive">
                          Remover
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-2">Status da Fase</label>
                          <select
                            value={phase.status}
                            onChange={(e) =>
                              handlePhaseStatusChange(phase.id, e.target.value as "concluida" | "pendente")
                            }
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="concluida">Concluída</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-muted-foreground mb-2">
                            Progresso: {phase.percentage}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={phase.percentage}
                            onChange={(e) => handlePhasePercentageChange(phase.id, Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {saving ? "Salvando..." : "Salvar Fases"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
