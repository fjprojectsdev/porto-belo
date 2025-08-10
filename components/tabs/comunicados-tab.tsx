"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { offlineSupabase } from "@/lib/supabase-offline"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  user_type: "sindico" | "morador" | "prestador"
}

interface Comunicado {
  id: string
  title: string
  content: string
  created_at: string
  profiles: {
    full_name: string | null
    username: string
  }
}

export default function ComunicadosTab({ user }: { user: User }) {
  const [comunicados, setComunicados] = useState<Comunicado[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingComunicado, setEditingComunicado] = useState<Comunicado | null>(null)

  const isSindico = user.user_type === "sindico"

  useEffect(() => {
    loadComunicados()
  }, [])

  const loadComunicados = async () => {
    const { data, error } = await offlineSupabase
      .from("comunicados")
      .select(`
        *,
        profiles (
          full_name,
          username
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar comunicados",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setComunicados(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string
    const content = formData.get("content") as string

    if (editingComunicado) {
      const { error } = await offlineSupabase
        .from("comunicados")
        .update({ title, content })
        .eq("id", editingComunicado.id)

      if (error) {
        toast({
          title: "Erro ao atualizar comunicado",
          description: error.message,
          variant: "destructive",
        })
        return
      }
      toast({ title: "Comunicado atualizado com sucesso!" })
    } else {
      const { error } = await offlineSupabase.from("comunicados").insert({ title, content, created_by: user.id })

      if (error) {
        toast({
          title: "Erro ao criar comunicado",
          description: error.message,
          variant: "destructive",
        })
        return
      }
      toast({ title: "Comunicado criado com sucesso!" })
    }

    setDialogOpen(false)
    setEditingComunicado(null)
    loadComunicados()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este comunicado?")) return

    const { error } = await offlineSupabase.from("comunicados").delete().eq("id", id)

    if (error) {
      toast({
        title: "Erro ao excluir comunicado",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Comunicado excluído com sucesso!" })
      loadComunicados()
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando comunicados...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comunicados</h2>
          <p className="text-gray-600">Informações importantes da administração</p>
        </div>
        {isSindico && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingComunicado(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Comunicado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingComunicado ? "Editar Comunicado" : "Novo Comunicado"}</DialogTitle>
              </DialogHeader>
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" name="title" defaultValue={editingComunicado?.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea id="content" name="content" defaultValue={editingComunicado?.content} rows={6} required />
                </div>
                <Button type="submit" className="w-full">
                  {editingComunicado ? "Atualizar" : "Publicar"} Comunicado
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {comunicados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhum comunicado encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          comunicados.map((comunicado) => (
            <Card key={comunicado.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{comunicado.title}</CardTitle>
                    <CardDescription>
                      Por {comunicado.profiles.full_name || comunicado.profiles.username} •{" "}
                      {new Date(comunicado.created_at).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  {isSindico && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingComunicado(comunicado)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(comunicado.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{comunicado.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
