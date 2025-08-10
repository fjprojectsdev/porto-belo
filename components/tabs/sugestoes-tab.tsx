"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Lightbulb, MessageSquare } from "lucide-react"
import { offlineSupabase } from "@/lib/supabase-offline"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  user_type: "sindico" | "morador" | "prestador"
}

interface Sugestao {
  id: string
  title: string
  description: string
  status: "pendente" | "analisando" | "implementado" | "rejeitado"
  response: string | null
  responded_at: string | null
  created_at: string
  created_by: string
  profiles: {
    full_name: string | null
    username: string
    block: string | null
    apartment: string | null
  }
}

export default function SugestoesTab({ user }: { user: User }) {
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [responseDialogOpen, setResponseDialogOpen] = useState(false)
  const [selectedSugestao, setSelectedSugestao] = useState<Sugestao | null>(null)

  const isSindico = user.user_type === "sindico"

  useEffect(() => {
    loadSugestoes()
  }, [])

  const loadSugestoes = async () => {
    const { data, error } = await offlineSupabase
      .from("sugestoes")
      .select(`
        *,
        profiles (
          full_name,
          username,
          block,
          apartment
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar sugestões",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setSugestoes(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    const { error } = await offlineSupabase.from("sugestoes").insert({
      title,
      description,
      created_by: user.id,
    })

    if (error) {
      toast({
        title: "Erro ao enviar sugestão",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Sugestão enviada com sucesso!" })
      setDialogOpen(false)
      loadSugestoes()
    }
  }

  const handleResponse = async (formData: FormData) => {
    if (!selectedSugestao) return

    const status = formData.get("status") as "analisando" | "implementado" | "rejeitado"
    const response = formData.get("response") as string

    const { error } = await offlineSupabase
      .from("sugestoes")
      .update({
        status,
        response,
        responded_by: user.id,
        responded_at: new Date().toISOString(),
      })
      .eq("id", selectedSugestao.id)

    if (error) {
      toast({
        title: "Erro ao responder sugestão",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Resposta enviada com sucesso!" })
      setResponseDialogOpen(false)
      setSelectedSugestao(null)
      loadSugestoes()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "implementado":
        return "default"
      case "analisando":
        return "secondary"
      case "rejeitado":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "implementado":
        return "Implementado"
      case "analisando":
        return "Em Análise"
      case "rejeitado":
        return "Rejeitado"
      default:
        return "Pendente"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando sugestões...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sugestões</h2>
          <p className="text-gray-600">Envie suas ideias para melhorar o condomínio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sugestão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Nova Sugestão</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Sugestão</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição Detalhada</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Descreva sua sugestão em detalhes..."
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Enviar Sugestão
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Response Dialog for Sindico */}
      {isSindico && (
        <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Responder Sugestão</DialogTitle>
            </DialogHeader>
            <form action={handleResponse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="analisando">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analisando">Em Análise</SelectItem>
                    <SelectItem value="implementado">Implementado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="response">Resposta</Label>
                <Textarea id="response" name="response" rows={4} placeholder="Digite sua resposta..." required />
              </div>
              <Button type="submit" className="w-full">
                Enviar Resposta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-6">
        {sugestoes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhuma sugestão encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          sugestoes.map((sugestao) => (
            <Card key={sugestao.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <Badge variant={getStatusColor(sugestao.status)}>{getStatusLabel(sugestao.status)}</Badge>
                    </div>
                    <CardTitle className="text-lg">{sugestao.title}</CardTitle>
                    <CardDescription>
                      Por {sugestao.profiles.full_name || sugestao.profiles.username}
                      {sugestao.profiles.block &&
                        sugestao.profiles.apartment &&
                        ` • ${sugestao.profiles.block} ${sugestao.profiles.apartment}`}{" "}
                      • {new Date(sugestao.created_at).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  {isSindico && sugestao.status === "pendente" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSugestao(sugestao)
                        setResponseDialogOpen(true)
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Responder
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{sugestao.description}</p>

                {sugestao.response && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-800 mb-2">Resposta da Administração:</h4>
                    <p className="text-blue-700">{sugestao.response}</p>
                    {sugestao.responded_at && (
                      <p className="text-sm text-blue-600 mt-2">
                        Respondido em {new Date(sugestao.responded_at).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
