"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar } from "lucide-react"
import { offlineSupabase } from "@/lib/supabase-offline"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  user_type: "sindico" | "morador" | "prestador"
}

interface ColetaLixo {
  id: string
  day_of_week: number
  day_name: string
  active: boolean
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
]

export default function ColetaLixoTab({ user }: { user: User }) {
  const [coletaDias, setColetaDias] = useState<ColetaLixo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const isSindico = user.user_type === "sindico"

  useEffect(() => {
    loadColetaDias()
  }, [])

  const loadColetaDias = async () => {
    const { data, error } = await offlineSupabase.from("coleta_lixo").select("*").order("day_of_week")

    if (error) {
      toast({
        title: "Erro ao carregar dias de coleta",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setColetaDias(data || [])
    }
    setLoading(false)
  }

  const handleAddDay = async (formData: FormData) => {
    const dayOfWeek = Number.parseInt(formData.get("day_of_week") as string)
    const dayName = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || ""

    // Check if day already exists
    const existingDay = coletaDias.find((d) => d.day_of_week === dayOfWeek)
    if (existingDay) {
      toast({
        title: "Dia já cadastrado",
        description: "Este dia da semana já está na lista de coleta.",
        variant: "destructive",
      })
      return
    }

    const { error } = await offlineSupabase
      .from("coleta_lixo")
      .insert({ day_of_week: dayOfWeek, day_name: dayName, active: true })

    if (error) {
      toast({
        title: "Erro ao adicionar dia",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Dia de coleta adicionado com sucesso!" })
      setDialogOpen(false)
      loadColetaDias()
    }
  }

  const handleToggleDay = async (id: string, active: boolean) => {
    const { error } = await offlineSupabase.from("coleta_lixo").update({ active: !active }).eq("id", id)

    if (error) {
      toast({
        title: "Erro ao atualizar dia",
        description: error.message,
        variant: "destructive",
      })
    } else {
      loadColetaDias()
    }
  }

  const handleDeleteDay = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este dia de coleta?")) return

    const { error } = await offlineSupabase.from("coleta_lixo").delete().eq("id", id)

    if (error) {
      toast({
        title: "Erro ao remover dia",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Dia de coleta removido com sucesso!" })
      loadColetaDias()
    }
  }

  const getNextCollectionDates = () => {
    const today = new Date()
    const nextDates: { day: string; date: string }[] = []

    coletaDias
      .filter((d) => d.active)
      .forEach((dia) => {
        const daysUntilNext = (dia.day_of_week - today.getDay() + 7) % 7
        const nextDate = new Date(today)
        nextDate.setDate(today.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext))

        nextDates.push({
          day: dia.day_name,
          date: nextDate.toLocaleDateString("pt-BR"),
        })
      })

    return nextDates.sort(
      (a, b) =>
        new Date(a.date.split("/").reverse().join("-")).getTime() -
        new Date(b.date.split("/").reverse().join("-")).getTime(),
    )
  }

  if (loading) {
    return <div className="text-center py-8">Carregando dias de coleta...</div>
  }

  const nextDates = getNextCollectionDates()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coleta de Lixo</h2>
          <p className="text-gray-600">Dias da semana para coleta de lixo</p>
        </div>
        {isSindico && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Dia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Dia de Coleta</DialogTitle>
              </DialogHeader>
              <form action={handleAddDay} className="space-y-4">
                <div className="space-y-2">
                  <Select name="day_of_week" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia da semana" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Adicionar Dia
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {nextDates.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Coletas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {nextDates.map((next, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium text-green-800">{next.day}</span>
                  <span className="text-green-600">{next.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coletaDias.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhum dia de coleta configurado.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          coletaDias.map((dia) => (
            <Card key={dia.id} className={dia.active ? "border-green-200" : "border-gray-200 opacity-60"}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{dia.day_name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={dia.active ? "default" : "secondary"}>{dia.active ? "Ativo" : "Inativo"}</Badge>
                    {isSindico && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleDay(dia.id, dia.active)}>
                          {dia.active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDay(dia.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
