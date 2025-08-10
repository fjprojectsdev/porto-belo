"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Check, X } from "lucide-react"
import { offlineSupabase } from "@/lib/supabase-offline"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  user_type: "sindico" | "morador" | "prestador"
  full_name: string | null
  username: string
}

interface SalaoReservation {
  id: string
  event_date: string
  event_time: string
  description: string | null
  status: "pendente" | "aprovado" | "rejeitado"
  approved_at: string | null
  created_at: string
  profiles: {
    full_name: string | null
    username: string
    block: string | null
    apartment: string | null
  }
}

export default function SalaoFestasTab({ user }: { user: User }) {
  const [reservations, setReservations] = useState<SalaoReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const isSindico = user.user_type === "sindico"

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    const { data, error } = await offlineSupabase
      .from("salao_festas")
      .select(`
        *,
        profiles (
          full_name,
          username,
          block,
          apartment
        )
      `)
      .order("event_date", { ascending: true })

    if (error) {
      toast({
        title: "Erro ao carregar reservas",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setReservations(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (formData: FormData) => {
    const event_date = formData.get("event_date") as string
    const event_time = formData.get("event_time") as string
    const description = formData.get("description") as string

    // Check if date is not in the past
    const selectedDate = new Date(`${event_date}T${event_time}`)
    if (selectedDate < new Date()) {
      toast({
        title: "Data inválida",
        description: "Não é possível agendar para datas passadas.",
        variant: "destructive",
      })
      return
    }

    // Check if date is already booked
    const existingReservation = reservations.find((r) => r.event_date === event_date && r.status === "aprovado")

    if (existingReservation) {
      toast({
        title: "Data indisponível",
        description: "Esta data já está reservada.",
        variant: "destructive",
      })
      return
    }

    const { error } = await offlineSupabase.from("salao_festas").insert({
      event_date,
      event_time,
      description: description || null,
      requested_by: user.id,
    })

    if (error) {
      toast({
        title: "Erro ao solicitar reserva",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Solicitação enviada com sucesso!" })
      setDialogOpen(false)
      loadReservations()
    }
  }

  const handleApproveReject = async (id: string, status: "aprovado" | "rejeitado") => {
    const { error } = await offlineSupabase
      .from("salao_festas")
      .update({
        status,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      toast({
        title: "Erro ao atualizar reserva",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: status === "aprovado" ? "Reserva aprovada!" : "Reserva rejeitada!",
      })
      loadReservations()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado":
        return "default"
      case "rejeitado":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aprovado":
        return "Aprovado"
      case "rejeitado":
        return "Rejeitado"
      default:
        return "Pendente"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando reservas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Salão de Festas</h2>
          <p className="text-gray-600">Agendamento do salão de festas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Solicitar Reserva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Reserva do Salão</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Data do Evento</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_time">Horário</Label>
                <Input id="event_time" name="event_time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Evento</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Descreva brevemente o tipo de evento..."
                />
              </div>
              <Button type="submit" className="w-full">
                Enviar Solicitação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {reservations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhuma reserva encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {new Date(reservation.event_date).toLocaleDateString("pt-BR")}
                      <Clock className="h-4 w-4 ml-2" />
                      {reservation.event_time}
                    </CardTitle>
                    <CardDescription>
                      Solicitado por {reservation.profiles.full_name || reservation.profiles.username}
                      {reservation.profiles.block &&
                        reservation.profiles.apartment &&
                        ` • ${reservation.profiles.block} ${reservation.profiles.apartment}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(reservation.status)}>{getStatusLabel(reservation.status)}</Badge>
                    {isSindico && reservation.status === "pendente" && (
                      <div className="flex space-x-1">
                        <Button size="sm" onClick={() => handleApproveReject(reservation.id, "aprovado")}>
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproveReject(reservation.id, "rejeitado")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              {reservation.description && (
                <CardContent>
                  <p className="text-gray-700">{reservation.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Solicitado em {new Date(reservation.created_at).toLocaleDateString("pt-BR")}
                    {reservation.approved_at && (
                      <>
                        {" "}
                        • {getStatusLabel(reservation.status)} em{" "}
                        {new Date(reservation.approved_at).toLocaleDateString("pt-BR")}
                      </>
                    )}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
