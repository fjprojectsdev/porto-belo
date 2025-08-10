"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Wifi,
  WifiOff,
} from "lucide-react"
import { getCurrentUser, signOut, isOfflineMode } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import ComunicadosTab from "./tabs/comunicados-tab"
import ClassificadosTab from "./tabs/classificados-tab"
import ColetaLixoTab from "./tabs/coleta-lixo-tab"
import EncomendasTab from "./tabs/encomendas-tab"
import SalaoFestasTab from "./tabs/salao-festas-tab"
import ServicosTab from "./tabs/servicos-tab"
import SugestoesTab from "./tabs/sugestoes-tab"
import PerfilTab from "./tabs/perfil-tab"

export default function DashboardLayout() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }
      setUser(currentUser)
      setOffline(isOfflineMode())
    } catch (error) {
      console.error("Error loading user:", error)
      router.push("/")
      return
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    toast({ title: "Logout realizado com sucesso!" })
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isSindico = user.user_type === "sindico"
  const isPrestador = user.user_type === "prestador"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Condomínio App</h1>
                <p className="text-sm text-gray-500">
                  Bem-vindo, {user.full_name || user.username}
                  {user.block && user.apartment && ` - ${user.block} ${user.apartment}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {offline && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Modo Offline
                </Badge>
              )}
              {!offline && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              )}
              <Badge variant={isSindico ? "default" : isPrestador ? "secondary" : "outline"}>
                {isSindico ? "Síndico" : isPrestador ? "Prestador" : "Morador"}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {offline && (
        <Alert className="mx-4 mt-4 bg-orange-50 border-orange-200">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo Offline Ativo:</strong> Você está usando o sistema sem conexão com a internet. Todas as
            alterações serão salvas localmente.
          </AlertDescription>
        </Alert>
      )}

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
            <ComunicadosTab user={user} />
          </TabsContent>

          <TabsContent value="classificados">
            <ClassificadosTab user={user} />
          </TabsContent>

          <TabsContent value="coleta">
            <ColetaLixoTab user={user} />
          </TabsContent>

          <TabsContent value="encomendas">
            <EncomendasTab user={user} />
          </TabsContent>

          <TabsContent value="salao">
            <SalaoFestasTab user={user} />
          </TabsContent>

          <TabsContent value="servicos">
            <ServicosTab user={user} />
          </TabsContent>

          <TabsContent value="sugestoes">
            <SugestoesTab user={user} />
          </TabsContent>

          <TabsContent value="perfil">
            <PerfilTab user={user} onUserUpdate={setUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
