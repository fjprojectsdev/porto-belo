"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Database, User, Play } from "lucide-react"
import { createSindicoAccount } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

export default function SetupHelper() {
  const [sindicoCreated, setSindicoCreated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [configComplete, setConfigComplete] = useState(false)

  useEffect(() => {
    // Check if environment variables are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setConfigComplete(!!(supabaseUrl && supabaseAnonKey))
  }, [])

  const handleCreateSindico = async () => {
    setLoading(true)
    try {
      const { data, error } = await createSindicoAccount()

      if (error) {
        // If user already exists, that's actually fine
        if (error.message.includes("already registered")) {
          toast({
            title: "Conta já existe!",
            description: "A conta do síndico já foi criada anteriormente.",
          })
          setSindicoCreated(true)
        } else {
          toast({
            title: "Erro ao criar conta do síndico",
            description: error.message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Conta do síndico criada!",
          description: "Agora você pode fazer login com sindica/patricia",
        })
        setSindicoCreated(true)
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Verifique se os scripts SQL foram executados no Supabase.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleAccessApp = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Configuração do Condomínio App</CardTitle>
            <CardDescription>Configure seu aplicativo seguindo os passos abaixo</CardDescription>
          </CardHeader>
        </Card>

        {/* Step 1: Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {configComplete ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Database className="h-5 w-5" />}
              1. Variáveis de Ambiente
              {configComplete && <Badge className="ml-2">✓ Configurado</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configComplete ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Configuração Completa!</AlertTitle>
                <AlertDescription>
                  Suas variáveis de ambiente do Supabase estão configuradas corretamente.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuração Necessária</AlertTitle>
                <AlertDescription>
                  As variáveis de ambiente ainda não foram detectadas. Certifique-se de que o arquivo .env.local foi
                  criado.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_URL</label>
                <code className="block bg-white p-2 rounded border text-sm mt-1">
                  https://nopvezehowzppptvmsxo.supabase.co
                </code>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                <code className="block bg-white p-2 rounded border text-sm mt-1 break-all">
                  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcHZlemVob3d6cHBwdHZtc3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjYzMTgsImV4cCI6MjA3MDQwMjMxOH0.WzpfeIwDHXTm4A7W7YBFVTOXPIxc1lwyQXn7bX8kOIU
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Database Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              2. Configurar Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Execute os Scripts SQL</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Execute os scripts na seguinte ordem no SQL Editor do Supabase:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>01-create-tables.sql - Cria as tabelas</li>
                  <li>02-setup-rls.sql - Configura as políticas de segurança</li>
                  <li>03-create-functions.sql - Cria funções e triggers</li>
                  <li>04-seed-data.sql - Insere dados iniciais</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => window.open("https://supabase.com/dashboard/project/nopvezehowzppptvmsxo/sql", "_blank")}
              >
                Abrir SQL Editor do Supabase
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Create Sindico Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              3. Criar Conta do Síndico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Credenciais do Síndico:</h4>
              <div className="space-y-1">
                <p className="text-blue-700">
                  • <strong>Usuário:</strong> <Badge variant="outline">sindica</Badge>
                </p>
                <p className="text-blue-700">
                  • <strong>Senha:</strong> <Badge variant="outline">patricia</Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600">Clique para criar a conta do síndico no sistema:</p>
              <Button onClick={handleCreateSindico} disabled={loading || !configComplete} className="min-w-[120px]">
                {loading ? "Criando..." : sindicoCreated ? "✓ Criado" : "Criar Conta"}
              </Button>
            </div>

            {sindicoCreated && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Conta criada com sucesso!</AlertTitle>
                <AlertDescription>Agora você pode fazer login com as credenciais sindica/patricia</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Step 4: Access App */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              4. Acessar o Aplicativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Após executar os scripts SQL e criar a conta do síndico, você pode acessar o aplicativo.
            </p>
            <Button onClick={handleAccessApp} className="w-full" size="lg">
              🏠 Acessar Condomínio App
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
