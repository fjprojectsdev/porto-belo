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
import { Plus, Edit, Trash2, Phone, Wrench } from "lucide-react"
import { offlineSupabase } from "@/lib/supabase-offline"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  user_type: "sindico" | "morador" | "prestador"
}

interface Servico {
  id: string
  title: string
  description: string
  provider_name: string
  phone: string | null
  category: string | null
  created_by: string
  created_at: string
  profiles: {
    full_name: string | null
    username: string
    user_type: string
  }
}

const CATEGORIES = [
  "Limpeza",
  "Manutenção",
  "Jardinagem",
  "Pintura",
  "Elétrica",
  "Hidráulica",
  "Marcenaria",
  "Informática",
  "Aulas Particulares",
  "Cuidados Pessoais",
  "Outros",
]

export default function ServicosTab({ user }: { user: User }) {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const isSindico = user.user_type === "sindico"

  useEffect(() => {
    loadServicos()
  }, [])

  const loadServicos = async () => {
    const { data, error } = await offlineSupabase
      .from("servicos")
      .select(`
        *,
        profiles (
          full_name,
          username,
          user_type
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setServicos(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const provider_name = formData.get("provider_name") as string
    const phone = formData.get("phone") as string
    const category = formData.get("category") as string

    const servicoData = {
      title,
      description,
      provider_name,
      phone: phone || null,
      category: category || null,
    }

    if (editingServico) {
      const { error } = await offlineSupabase.from("servicos").update(servicoData).eq("id", editingServico.id)

      if (error) {
        toast({
          title: "Erro ao atualizar serviço",
          description: error.message,
          variant: "destructive",
        })
        return
      }
      toast({ title: "Serviço atualizado com sucesso!" })
    } else {
      const { error } = await offlineSupabase.from("servicos").insert({ ...servicoData, created_by: user.id })

      if (error) {
        toast({
          title: "Erro ao criar serviço",
          description: error.message,
          variant: "destructive",
        })
        return
      }
      toast({ title: "Serviço criado com sucesso!" })
    }

    setDialogOpen(false)
    setEditingServico(null)
    loadServicos()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return

    const { error } = await offlineSupabase.from("servicos").delete().eq("id", id)

    if (error) {
      toast({
        title: "Erro ao excluir serviço",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Serviço excluído com sucesso!" })
      loadServicos()
    }
  }

  const canEdit = (servico: Servico) => {
    return isSindico || servico.created_by === user.id
  }

  const filteredServicos = servicos.filter((s) => categoryFilter === "all" || s.category === categoryFilter)

  if (loading) {
    return <div className="text-center py-8">Carregando serviços...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Serviços</h2>
          <p className="text-gray-600">Serviços oferecidos por moradores e prestadores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingServico(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Oferecer Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingServico ? "Editar Serviço" : "Oferecer Novo Serviço"}</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Serviço</Label>
                <Input id="title" name="title" defaultValue={editingServico?.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" defaultValue={editingServico?.category || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider_name">Nome do Prestador</Label>
                <Input id="provider_name" name="provider_name" defaultValue={editingServico?.provider_name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone para Contato</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={editingServico?.phone || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Serviço</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingServico?.description}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingServico ? "Atualizar" : "Publicar"} Serviço
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={categoryFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("all")}
        >
          Todos
        </Button>
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={categoryFilter === category ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredServicos.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhum serviço encontrado.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredServicos.map((servico) => (
            <Card key={servico.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      {servico.category && <Badge variant="outline">{servico.category}</Badge>}
                      <Badge variant={servico.profiles.user_type === "prestador" ? "default" : "secondary"}>
                        {servico.profiles.user_type === "prestador" ? "Prestador" : "Morador"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{servico.title}</CardTitle>
                    <CardDescription>
                      Por {servico.provider_name}
                      {servico.phone && (
                        <span className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {servico.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {canEdit(servico) && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingServico(servico)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(servico.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">{servico.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Publicado em {new Date(servico.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
