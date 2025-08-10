"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { signIn, signUp, createSindicoAccount, testSupabaseConnection } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Building2, Users, UserPlus, LogIn, Info, CheckCircle, AlertTriangle, Play } from "lucide-react"

export default function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [isServiceProvider, setIsServiceProvider] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const [systemReady, setSystemReady] = useState(false)
  const [setupLoading, setSetupLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    initializeSystem()
  }, [])

  const initializeSystem = async () => {
    try {
      // In preview environment, skip connection test and go straight to offline mode
      if (
        typeof window !== "undefined" &&
        (window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("preview"))
      ) {
        console.log("Preview environment detected - using offline mode")
        setSystemReady(true)
        setSetupLoading(false)
        return
      }

      // Test connection for non-preview environments
      const { success } = await testSupabaseConnection()

      if (success) {
        // Try to create sindico account if it doesn't exist
        const sindicoResult = await createSindicoAccount()
        if (sindicoResult.error && !sindicoResult.error.message.includes("already registered")) {
          console.warn("Sindico account creation warning:", sindicoResult.error)
        }
      }

      setSystemReady(true)
    } catch (error) {
      console.error("System initialization error:", error)
      // Allow login attempts even if setup fails
      setSystemReady(true)
    } finally {
      setSetupLoading(false)
    }
  }

  const handleSignIn = async (formData: FormData) => {
    setLoading(true)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (!username || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha usuário e senha",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const { error } = await signIn(username, password)

    if (error) {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao Condomínio App",
      })
      router.push("/dashboard")
    }
    setLoading(false)
  }

  const handleSignUp = async (formData: FormData) => {
    setLoading(true)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const full_name = formData.get("full_name") as string
    const phone = formData.get("phone") as string
    const block = formData.get("block") as string
    const apartment = formData.get("apartment") as string

    if (!username || !password || !full_name) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (!isServiceProvider && (!block || !apartment)) {
      toast({
        title: "Campos obrigatórios",
        description: "Moradores devem informar bloco e apartamento",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const userData = {
      full_name,
      phone: phone || undefined,
      block: isServiceProvider ? undefined : block,
      apartment: isServiceProvider ? undefined : apartment,
      user_type: isServiceProvider ? ("prestador" as const) : ("morador" as const),
    }

    const { error } = await signUp(username, password, userData)

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message.includes("already registered")
          ? "Este usuário já existe"
          : "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Conta criada com sucesso. Faça login para continuar.",
      })
      setActiveTab("signin")
    }
    setLoading(false)
  }

  const handleDemoAccess = () => {
    toast({
      title: "Acessando demonstração",
      description: "Carregando dashboard de exemplo...",
    })
    router.push("/dashboard?demo=true")
  }

  const blocks = Array.from({ length: 17 }, (_, i) => `B${String(i + 1).padStart(2, "0")}`)
  const apartments = Array.from({ length: 20 }, (_, i) => `Apt${String(i + 101)}`)

  if (setupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Inicializando sistema...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Condomínio App</h1>
                <p className="text-sm text-gray-600">Sistema de Gestão Residencial</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {systemReady ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sistema Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Modo Limitado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Bem-vindo ao seu
                <span className="text-blue-600 block">Condomínio Digital</span>
              </h2>
              <p className="text-xl text-gray-600">
                Gerencie comunicados, classificados, encomendas e muito mais em um só lugar.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Para Moradores</h3>
                  <p className="text-sm text-gray-600">Acesse comunicados, classificados e serviços</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg border border-purple-100">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Para Síndicos</h3>
                  <p className="text-sm text-gray-600">Controle total sobre o condomínio</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg border border-green-100">
                <div className="bg-green-100 p-2 rounded-lg">
                  <UserPlus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Para Prestadores</h3>
                  <p className="text-sm text-gray-600">Ofereça seus serviços aos moradores</p>
                </div>
              </div>
            </div>

            {/* Demo Access */}
            <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Play className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Experimente a demonstração!</strong>
                    <br />
                    Veja todas as funcionalidades em ação
                  </div>
                  <Button size="sm" onClick={handleDemoAccess} className="ml-4">
                    <Play className="h-3 w-3 mr-1" />
                    Demo
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            {/* Demo Credentials */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Conta de demonstração (Síndico):</strong>
                <br />
                Usuário: <code className="bg-blue-100 px-1 rounded">sindica</code> | Senha:{" "}
                <code className="bg-blue-100 px-1 rounded">patricia</code>
              </AlertDescription>
            </Alert>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {activeTab === "signin" ? "Entrar na sua conta" : "Criar nova conta"}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {activeTab === "signin" ? "Acesse o sistema do condomínio" : "Cadastre-se para acessar o sistema"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-4">
                    <form action={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Usuário</Label>
                        <Input
                          id="username"
                          name="username"
                          placeholder="Digite seu usuário"
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Digite sua senha"
                          required
                          className="h-11"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Entrando...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <LogIn className="h-4 w-4" />
                            Entrar
                          </div>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <form action={handleSignUp} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="signup-username">Usuário *</Label>
                          <Input
                            id="signup-username"
                            name="username"
                            placeholder="Escolha um usuário"
                            required
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Senha *</Label>
                          <Input
                            id="signup-password"
                            name="password"
                            type="password"
                            placeholder="Crie uma senha"
                            required
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo *</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          placeholder="Seu nome completo"
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="(11) 99999-9999" className="h-11" />
                      </div>

                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          id="service-provider"
                          checked={isServiceProvider}
                          onCheckedChange={(checked) => setIsServiceProvider(checked as boolean)}
                        />
                        <Label htmlFor="service-provider" className="text-sm">
                          Sou prestador de serviço
                        </Label>
                      </div>

                      {!isServiceProvider && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="block">Bloco *</Label>
                            <Select name="block" required>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione" />
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
                            <Label htmlFor="apartment">Apartamento *</Label>
                            <Select name="apartment" required>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione" />
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
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Criando conta...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Criar Conta
                          </div>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Mobile Demo Access */}
            <div className="lg:hidden mt-6 space-y-4">
              <Button onClick={handleDemoAccess} className="w-full bg-transparent" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Ver Demonstração
              </Button>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conta demo:</strong> sindica / patricia
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
