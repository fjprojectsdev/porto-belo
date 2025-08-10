"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Home,
  MessageSquare,
  ShoppingCart,
  Trash2,
  Package,
  Calendar,
  Wrench,
  Lightbulb,
  User,
  LogOut,
  Plus,
  Check,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

// Demo data
const demoUser = {
  id: "demo-sindico",
  username: "sindica",
  full_name: "Patricia - Síndica",
  user_type: "sindico" as const,
  block: null,
  apartment: null,
}

const demoComunicados = [
  {
    id: "1",
    title: "Manutenção do Elevador",
    content:
      "Informamos que o elevador do Bloco A passará por manutenção preventiva na próxima segunda-feira, das 8h às 17h.",
    created_at: "2024-01-15T10:00:00Z",
    profiles: { full_name: "Patricia - Síndica", username: "sindica" },
  },
  {
    id: "2",
    title: "Nova Regra para Pets",
    content: "A partir de fevereiro, todos os pets devem usar coleira e guia nas áreas comuns do condomínio.",
    created_at: "2024-01-10T14:30:00Z",
    profiles: { full_name: "Patricia - Síndica", username: "sindica" },
  },
]

const demoClassificados = [
  {
    id: "1",
    title: "Sofá 3 lugares - Semi novo",
    description: "Sofá em excelente estado, cor cinza, muito confortável. Motivo da venda: mudança.",
    price: 800,
    type: "venda" as const,
    created_at: "2024-01-12T16:20:00Z",
    profiles: {
      full_name: "João Silva",
      username: "joao",
      block: "B01",
      apartment: "Apt101",
      phone: "(11) 99999-1234",
    },
  },
  {
    id: "2",
    title: "Procuro Bicicleta Infantil",
    description: "Procuro bicicleta para criança de 6 anos, preferencialmente aro 16.",
    price: null,
    type: "compra" as const,
    created_at: "2024-01-08T09:15:00Z",
    profiles: {
      full_name: "Maria Santos",
      username: "maria",
      block: "B03",
      apartment: "Apt205",
      phone: "(11) 98888-5678",
    },
  },
]

const demoEncomendas = [
  {
    id: "1",
    recipient_name: "Carlos Oliveira",
    block: "B02",
    apartment: "Apt150",
    description: "Caixa da Amazon - Livros",
    received_at: "2024-01-15T14:30:00Z",
    delivered: false,
    delivered_at: null,
  },
  {
    id: "2",
    recipient_name: "Ana Costa",
    block: "B01",
    apartment: "Apt105",
    description: "Mercado Livre - Roupas",
    received_at: "2024-01-14T11:20:00Z",
    delivered: true,
    delivered_at: "2024-01-14T18:45:00Z",
  },
]

export default function DemoDashboard() {
  const [comunicados, setComunicados] = useState(demoComunicados)
  const [classificados, setClassificados] = useState(demoClassificados)
  const [encomendas, setEncomendas] = useState(demoEncomendas)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = () => {
    toast({ title: "Logout realizado com sucesso!" })
    router.push("/")
  }

  const handleAddComunicado = (formData: FormData) => {
    const title = formData.get("title") as string
    const content = formData.get("content") as string

    const newComunicado = {
      id: Date.now().toString(),
      title,
      content,
      created_at: new Date().toISOString(),
      profiles: { full_name: "Patricia - Síndica", username: "sindica" },
    }

    setComunicados([newComunicado, ...comunicados])
    setDialogOpen(false)
    toast({ title: "Comunicado criado com sucesso!" })
  }

  const handleMarkDelivered = (id: string) => {
    setEncomendas(
      encomendas.map((e) => (e.id === id ? { ...e, delivered: true, delivered_at: new Date().toISOString() } : e)),
    )
    toast({ title: "Encomenda marcada como entregue!" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Condomínio App</h1>
                <p className="text-sm text-gray-500">Bem-vindo, {demoUser.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="default">Síndico</Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="comunicados" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="comunicados" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comunicados</span>
            </TabsTrigger>
            <TabsTrigger value="classificados" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Classificados</span>
            </TabsTrigger>
            <TabsTrigger value="coleta" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Coleta</span>
            </TabsTrigger>
            <TabsTrigger value="encomendas" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Encomendas</span>
            </TabsTrigger>
            <TabsTrigger value="salao" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Salão</span>
            </TabsTrigger>
            <TabsTrigger value="servicos" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Serviços</span>
            </TabsTrigger>
            <TabsTrigger value="sugestoes" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Sugestões</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comunicados">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Comunicados</h2>
                  <p className="text-gray-600">Informações importantes da administração</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Comunicado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Comunicado</DialogTitle>
                    </DialogHeader>
                    <form action={handleAddComunicado} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo</Label>
                        <Textarea id="content" name="content" rows={6} required />
                      </div>
                      <Button type="submit" className="w-full">
                        Publicar Comunicado
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {comunicados.map((comunicado) => (
                  <Card key={comunicado.id}>
                    <CardHeader>
                      <CardTitle className="text-xl">{comunicado.title}</CardTitle>
                      <CardDescription>
                        Por {comunicado.profiles.full_name} •{" "}
                        {new Date(comunicado.created_at).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{comunicado.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classificados">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Classificados</h2>
                  <p className="text-gray-600">Compra e venda entre moradores</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classificados.map((classificado) => (
                  <Card key={classificado.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={classificado.type === "venda" ? "default" : "secondary"}>
                          {classificado.type === "venda" ? "Venda" : "Procuro"}
                        </Badge>
                        {classificado.price && <Badge variant="outline">R$ {classificado.price.toFixed(2)}</Badge>}
                      </div>
                      <CardTitle className="text-lg">{classificado.title}</CardTitle>
                      <CardDescription>
                        {classificado.profiles.full_name}
                        {classificado.profiles.block &&
                          ` • ${classificado.profiles.block} ${classificado.profiles.apartment}`}
                        {classificado.profiles.phone && ` • ${classificado.profiles.phone}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm">{classificado.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coleta">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Coleta de Lixo</h2>
                <p className="text-gray-600">Dias da semana para coleta de lixo</p>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximas Coletas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-medium text-green-800">Segunda-feira</span>
                      <span className="text-green-600">20/01/2024</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-medium text-green-800">Quinta-feira</span>
                      <span className="text-green-600">23/01/2024</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="encomendas">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Encomendas</h2>
                <p className="text-gray-600">Controle de encomendas na portaria</p>
              </div>

              <div className="grid gap-4">
                {encomendas.map((encomenda) => (
                  <Card key={encomenda.id} className={encomenda.delivered ? "bg-green-50" : ""}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{encomenda.recipient_name}</CardTitle>
                          <CardDescription>
                            {encomenda.block} {encomenda.apartment} • Recebida em{" "}
                            {new Date(encomenda.received_at).toLocaleDateString("pt-BR")}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={encomenda.delivered ? "default" : "secondary"}>
                            {encomenda.delivered ? "Entregue" : "Pendente"}
                          </Badge>
                          {!encomenda.delivered && (
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
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="salao">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Salão de Festas</h3>
              <p className="text-gray-600">Funcionalidade de reserva do salão de festas</p>
            </div>
          </TabsContent>

          <TabsContent value="servicos">
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Serviços</h3>
              <p className="text-gray-600">Serviços oferecidos por moradores e prestadores</p>
            </div>
          </TabsContent>

          <TabsContent value="sugestoes">
            <div className="text-center py-12">
              <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sugestões</h3>
              <p className="text-gray-600">Envie suas ideias para melhorar o condomínio</p>
            </div>
          </TabsContent>

          <TabsContent value="perfil">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
                <p className="text-gray-600">Informações da conta</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usuário:</span>
                    <span className="font-medium">{demoUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{demoUser.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <Badge variant="default">Síndico</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
