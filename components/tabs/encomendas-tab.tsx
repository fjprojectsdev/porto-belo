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
import { Plus, Package, Check } from "lucide-react"
import { offlineSupabase } from "@/lib/supabase-offline"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  user_type: "sindico" | "morador" | "prestador"
}

interface Encomenda {
  id: string
  recipient_name: string
  block: string
  apartment: string
  description: string | null
  received_at: string
  delivered: boolean
  delivered_at: string | null
  created_at: string
}

export default function EncomendasTab({ user }: { user: User }) {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "delivered">("all")

  const isSindico = user.user_type === "sindico"
  const blocks = Array.from({ length: 17 }, (_, i) => `B${String(i + 1).padStart(2, "0")}`)
  const apartments = Array.from({ length: 20 }, (_, i) => `Apt${String(i + 101)}`)

  useEffect(() => {
    loadEncomendas()
  }, [])

  const loadEncomendas = async () => {
    const { data, error } = await offlineSupabase
      .from("encomendas")
      .select("*")
      .order("received_at", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar encomendas",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setEncomendas(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (formData: FormData) => {
    const recipient_name = formData.get("recipient_name") as string
    const block = formData.get("block") as string
    const apartment = formData.get("apartment") as string
    const description = formData.get("description") as string

    const { error } = await offlineSupabase.from("encomendas").insert({
      recipient_name,
      block,
      apartment,
      description: description || null,
      created_by: user.id,
    })

    if (error) {
      toast({
        title: "Erro ao registrar encomenda",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Encomenda registrada com sucesso!" })
      setDialogOpen(false)
      loadEncomendas()
    }
  }

  const handleMarkDelivered = async (id: string) => {
    const { error } = await offlineSupabase
      .from("encomendas")
      .update({
        delivered: true,
        delivered_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      toast({
        title: "Erro ao marcar como entregue",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Encomenda marcada como entregue!" })
      loadEncomendas()
    }
  }

  const filteredEncomendas = encomendas.filter((e) => {
    if (filter === "pending") return !e.delivered
    if (filter === "delivered") return e.delivered
    return true
  })

  if (loading) {
    return <div className="text-center py-8">Carregando encomendas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Encomendas</h2>
          <p className="text-gray-600">Controle de encomendas na portaria</p>
        </div>
        {isSindico && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Encomenda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Encomenda</DialogTitle>
              </DialogHeader>
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Nome do Destinatário</Label>
                  <Input id="recipient_name" name="recipient_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block">Bloco</Label>
                  <Select name="block" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o bloco" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((block) => (
                        <SelectItem key={block} value={block}>
                          {block}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">Apartamento</Label>
                  <Select name="apartment" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o apartamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments.map((apt) => (
                        <SelectItem key={apt} value={apt}>
                          {apt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <Button type="submit" className="w-full">
                  Registrar Encomenda
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex space-x-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          Todas
        </Button>
        <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
          <Package className="h-4 w-4 mr-1" />
          Pendentes
        </Button>
        <Button
          variant={filter === "delivered" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("delivered")}
        >
          <Check className="h-4 w-4 mr-1" />
          Entregues
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredEncomendas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhuma encomenda encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          filteredEncomendas.map((encomenda) => (
            <Card key={encomenda.id} className={encomenda.delivered ? "bg-green-50" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{encomenda.recipient_name}</CardTitle>
                    <CardDescription>
                      {encomenda.block} {encomenda.apartment} • Recebida em{" "}
                      {new Date(encomenda.received_at).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(encomenda.received_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={encomenda.delivered ? "default" : "secondary"}>
                      {encomenda.delivered ? "Entregue" : "Pendente"}
                    </Badge>
                    {isSindico && !encomenda.delivered && (
                      <Button size="sm" onClick={() => handleMarkDelivered(encomenda.id)}>
                        <Check className="h-4 w-4 mr-1" />
                        Marcar Entregue
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {encomenda.description && (
                <CardContent>
                  <p className="text-gray-700">{encomenda.description}</p>
                  {encomenda.delivered && encomenda.delivered_at && (
                    <p className="text-sm text-green-600 mt-2">
                      Entregue em {new Date(encomenda.delivered_at).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(encomenda.delivered_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
