"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save } from "lucide-react"
import { offlineSupabase } from "@/lib/supabase-offline"
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  username: string
  full_name: string | null
  phone: string | null
  block: string | null
  apartment: string | null
  user_type: "sindico" | "morador" | "prestador"
}

interface PerfilTabProps {
  user: UserProfile
  onUserUpdate: (user: UserProfile) => void
}

export default function PerfilTab({ user, onUserUpdate }: PerfilTabProps) {
  const [loading, setLoading] = useState(false)

  const blocks = Array.from({ length: 17 }, (_, i) => `B${String(i + 1).padStart(2, "0")}`)
  const apartments = Array.from({ length: 20 }, (_, i) => `Apt${String(i + 101)}`)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)

    const full_name = formData.get("full_name") as string
    const phone = formData.get("phone") as string
    const block = formData.get("block") as string
    const apartment = formData.get("apartment") as string

    const updateData: any = {
      full_name: full_name || null,
      phone: phone || null,
    }

    // Only update block/apartment if user is not a service provider
    if (user.user_type !== "prestador") {
      updateData.block = block || null
      updateData.apartment = apartment || null
    }

    const { data, error } = await offlineSupabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Perfil atualizado com sucesso!" })
      onUserUpdate(data)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>Atualize seus dados pessoais. Apenas você pode editar essas informações.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input id="username" value={user.username} disabled className="bg-gray-50" />
                <p className="text-xs text-gray-500">O nome de usuário não pode ser alterado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_type">Tipo de Usuário</Label>
                <div className="flex items-center h-10">
                  <Badge
                    variant={
                      user.user_type === "sindico"
                        ? "default"
                        : user.user_type === "prestador"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {user.user_type === "sindico"
                      ? "Síndico"
                      : user.user_type === "prestador"
                        ? "Prestador de Serviço"
                        : "Morador"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" name="full_name" defaultValue={user.full_name || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={user.phone || ""} />
              </div>
            </div>

            {user.user_type !== "prestador" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="block">Bloco</Label>
                  <Select name="block" defaultValue={user.block || "N/A"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o bloco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">Não informado</SelectItem>
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
                  <Select name="apartment" defaultValue={user.apartment || "N/A"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o apartamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">Não informado</SelectItem>
                      {apartments.map((apt) => (
                        <SelectItem key={apt} value={apt}>
                          {apt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Usuário:</span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo:</span>
            <Badge
              variant={
                user.user_type === "sindico" ? "default" : user.user_type === "prestador" ? "secondary" : "outline"
              }
            >
              {user.user_type === "sindico"
                ? "Síndico"
                : user.user_type === "prestador"
                  ? "Prestador de Serviço"
                  : "Morador"}
            </Badge>
          </div>
          {user.user_type !== "prestador" && user.block && user.apartment && (
            <div className="flex justify-between">
              <span className="text-gray-600">Localização:</span>
              <span className="font-medium">
                {user.block} {user.apartment}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
