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
import { Plus, Edit, Trash2, ShoppingCart, DollarSign } from "lucide-react"
import { offlineSupabase } from "@/lib/supabase-offline"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  user_type: "sindico" | "morador" | "prestador"
}

interface Classificado {
  id: string
  title: string
  description: string
  price: number | null
  type: "venda" | "compra"
  created_at: string
  created_by: string
  profiles: {
    full_name: string | null
    username: string
    phone: string | null
    block: string | null
    apartment: string | null
  }
}

export default function ClassificadosTab({ user }: { user: User }) {
  const [classificados, setClassificados] = useState<Classificado[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClassificado, setEditingClassificado] = useState<Classificado | null>(null)
  const [filter, setFilter] = useState<"all" | "venda" | "compra">("all")

  const isSindico = user.user_type === "sindico"

  useEffect(() => {
    loadClassificados()
  }, [])

  const loadClassificados = async () => {
    const { data, error } = await offlineSupabase
      .from("classificados")
      .select(`
        *,
        profiles (
          full_name,
          username,
          phone,
          block,
          apartment
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar classificados",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setClassificados(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const type = formData.get("type") as "venda" | "compra"

    const classificadoData = {
      title,
      description,
      price: price ? Number.parseFloat(price) : null,
      type,
    }

    if (editingClassificado) {
      const { error } = await offlineSupabase
        .from("classificados")
        .update(classificadoData)
        .eq("id", editingClassificado.id)

      if (error) {
        toast({
          title: "Erro ao atualizar classificado",
          description: error.message,
          variant: "destructive",
        })
        return
      }
      toast({ title: "Classificado atualizado com sucesso!" })
    } else {
      const { error } = await offlineSupabase.from("classificados").insert({ ...classificadoData, created_by: user.id })

      if (error) {
        toast({
          title: "Erro ao criar classificado",
          description: error.message,
          variant: "destructive",
        })
        return
      }
      toast({ title: "Classificado criado com sucesso!" })
    }

    setDialogOpen(false)
    setEditingClassificado(null)
    loadClassificados()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este classificado?")) return

    const { error } = await offlineSupabase.from("classificados").delete().eq("id", id)

    if (error) {
      toast({
        title: "Erro ao excluir classificado",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Classificado excluído com sucesso!" })
      loadClassificados()
    }
  }

  const canEdit = (classificado: Classificado) => {
    return isSindico || classificado.created_by === user.id
  }

  const filteredClassificados = classificados.filter((c) => filter === "all" || c.type === filter)

  if (loading) {
    return <div className="text-center py-8">Carregando classificados...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Classificados</h2>
          <p className="text-gray-600">Compra e venda entre moradores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClassificado(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Anúncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingClassificado ? "Editar Anúncio" : "Novo Anúncio"}</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" defaultValue={editingClassificado?.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" defaultValue={editingClassificado?.type || "venda"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="compra">Procuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (opcional)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingClassificado?.price || ""}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingClassificado?.description}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingClassificado ? "Atualizar" : "Publicar"} Anúncio
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          Todos
        </Button>
        <Button variant={filter === "venda" ? "default" : "outline"} size="sm" onClick={() => setFilter("venda")}>
          <ShoppingCart className="h-4 w-4 mr-1" />
          Vendas
        </Button>
        <Button variant={filter === "compra" ? "default" : "outline"} size="sm" onClick={() => setFilter("compra")}>
          Procuro
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClassificados.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhum classificado encontrado.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredClassificados.map((classificado) => (
            <Card key={classificado.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={classificado.type === "venda" ? "default" : "secondary"}>
                        {classificado.type === "venda" ? "Venda" : "Procuro"}
                      </Badge>
                      {classificado.price && (
                        <Badge variant="outline">
                          <DollarSign className="h-3 w-3 mr-1" />
                          R$ {classificado.price.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{classificado.title}</CardTitle>
                    <CardDescription>
                      {classificado.profiles.full_name || classificado.profiles.username}
                      {classificado.profiles.block &&
                        classificado.profiles.apartment &&
                        ` • ${classificado.profiles.block} ${classificado.profiles.apartment}`}
                      {classificado.profiles.phone && ` • ${classificado.profiles.phone}`}
                    </CardDescription>
                  </div>
                  {canEdit(classificado) && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingClassificado(classificado)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(classificado.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">{classificado.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(classificado.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
