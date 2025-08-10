// Offline data management
export const OFFLINE_DATA = {
  comunicados: [
    {
      id: "1",
      title: "Manutenção do Elevador - Bloco A",
      content:
        "Informamos que o elevador do Bloco A passará por manutenção preventiva na próxima segunda-feira, das 8h às 17h. Pedimos a compreensão de todos os moradores.",
      created_at: "2024-01-15T10:00:00Z",
      created_by: "offline-sindico-id",
      profiles: { full_name: "Patricia - Síndica", username: "sindica" },
    },
    {
      id: "2",
      title: "Nova Regra para Pets",
      content:
        "A partir de fevereiro, todos os pets devem usar coleira e guia nas áreas comuns do condomínio. Esta medida visa garantir a segurança de todos.",
      created_at: "2024-01-10T14:30:00Z",
      created_by: "offline-sindico-id",
      profiles: { full_name: "Patricia - Síndica", username: "sindica" },
    },
    {
      id: "3",
      title: "Horário da Piscina",
      content:
        "O horário de funcionamento da piscina foi alterado:\n\nSegunda a Sexta: 6h às 22h\nSábados e Domingos: 8h às 20h\n\nContamos com a colaboração de todos!",
      created_at: "2024-01-08T09:15:00Z",
      created_by: "offline-sindico-id",
      profiles: { full_name: "Patricia - Síndica", username: "sindica" },
    },
  ],

  classificados: [
    {
      id: "1",
      title: "Sofá 3 lugares - Semi novo",
      description:
        "Sofá em excelente estado, cor cinza, muito confortável. Motivo da venda: mudança. Aceito propostas!",
      price: 800,
      type: "venda" as const,
      created_at: "2024-01-12T16:20:00Z",
      created_by: "offline-morador-1",
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
      description:
        "Procuro bicicleta para criança de 6 anos, preferencialmente aro 16. Pode ser usada, desde que em bom estado.",
      price: null,
      type: "compra" as const,
      created_at: "2024-01-08T09:15:00Z",
      created_by: "offline-morador-2",
      profiles: {
        full_name: "Maria Santos",
        username: "maria",
        block: "B03",
        apartment: "Apt205",
        phone: "(11) 98888-5678",
      },
    },
    {
      id: "3",
      title: "Mesa de Jantar 6 lugares",
      description: "Mesa de madeira maciça com 6 cadeiras. Muito bem conservada. Ideal para família grande.",
      price: 1200,
      type: "venda" as const,
      created_at: "2024-01-05T11:30:00Z",
      created_by: "offline-morador-1",
      profiles: {
        full_name: "João Silva",
        username: "joao",
        block: "B01",
        apartment: "Apt101",
        phone: "(11) 99999-1234",
      },
    },
  ],

  encomendas: [
    {
      id: "1",
      recipient_name: "Carlos Oliveira",
      block: "B02",
      apartment: "Apt150",
      description: "Caixa da Amazon - Livros",
      received_at: "2024-01-15T14:30:00Z",
      delivered: false,
      delivered_at: null,
      created_by: "offline-sindico-id",
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
      created_by: "offline-sindico-id",
    },
    {
      id: "3",
      recipient_name: "Pedro Santos",
      block: "B03",
      apartment: "Apt205",
      description: "Correios - Documentos",
      received_at: "2024-01-13T16:10:00Z",
      delivered: false,
      delivered_at: null,
      created_by: "offline-sindico-id",
    },
    {
      id: "4",
      recipient_name: "Lucia Ferreira",
      block: "B01",
      apartment: "Apt110",
      description: "Shopee - Eletrônicos",
      received_at: "2024-01-12T09:45:00Z",
      delivered: true,
      delivered_at: "2024-01-12T19:30:00Z",
      created_by: "offline-sindico-id",
    },
  ],

  coleta_lixo: [
    {
      id: "1",
      day_of_week: 1,
      day_name: "Segunda-feira",
      active: true,
    },
    {
      id: "2",
      day_of_week: 4,
      day_name: "Quinta-feira",
      active: true,
    },
  ],

  salao_festas: [
    {
      id: "1",
      requested_by: "offline-morador-1",
      event_date: "2024-01-25",
      event_time: "19:00",
      description: "Aniversário de 15 anos da minha filha",
      status: "pendente" as const,
      approved_by: null,
      approved_at: null,
      created_at: "2024-01-10T14:20:00Z",
      profiles: {
        full_name: "João Silva",
        username: "joao",
        block: "B01",
        apartment: "Apt101",
      },
    },
    {
      id: "2",
      requested_by: "offline-morador-2",
      event_date: "2024-01-20",
      event_time: "18:00",
      description: "Confraternização da família",
      status: "aprovado" as const,
      approved_by: "offline-sindico-id",
      approved_at: "2024-01-08T10:30:00Z",
      created_at: "2024-01-05T16:45:00Z",
      profiles: {
        full_name: "Maria Santos",
        username: "maria",
        block: "B03",
        apartment: "Apt205",
      },
    },
  ],

  servicos: [
    {
      id: "1",
      title: "Aulas de Piano",
      description:
        "Professora formada em música oferece aulas de piano para crianças e adultos. Experiência de 10 anos.",
      provider_name: "Ana Música",
      phone: "(11) 97777-8888",
      category: "Aulas Particulares",
      created_by: "offline-morador-2",
      created_at: "2024-01-12T10:15:00Z",
      profiles: {
        full_name: "Maria Santos",
        username: "maria",
        user_type: "morador",
      },
    },
    {
      id: "2",
      title: "Serviços de Limpeza",
      description: "Limpeza residencial completa. Experiência, confiabilidade e preços justos. Atendo todos os blocos.",
      provider_name: "Limpeza Total",
      phone: "(11) 96666-7777",
      category: "Limpeza",
      created_by: "offline-prestador-1",
      created_at: "2024-01-08T14:30:00Z",
      profiles: {
        full_name: "Empresa Limpeza",
        username: "limpeza",
        user_type: "prestador",
      },
    },
  ],

  sugestoes: [
    {
      id: "1",
      title: "Melhorar Iluminação do Estacionamento",
      description:
        "Sugiro a instalação de mais lâmpadas no estacionamento, principalmente na área dos fundos. Está muito escuro à noite.",
      created_by: "offline-morador-1",
      status: "pendente" as const,
      response: null,
      responded_by: null,
      responded_at: null,
      created_at: "2024-01-10T20:30:00Z",
      profiles: {
        full_name: "João Silva",
        username: "joao",
        block: "B01",
        apartment: "Apt101",
      },
    },
    {
      id: "2",
      title: "Academia no Condomínio",
      description:
        "Que tal instalarmos uma pequena academia na área de lazer? Seria muito útil para todos os moradores.",
      created_by: "offline-morador-2",
      status: "analisando" as const,
      response: "Estamos analisando a viabilidade financeira desta sugestão. Em breve daremos um retorno.",
      responded_by: "offline-sindico-id",
      responded_at: "2024-01-08T11:15:00Z",
      created_at: "2024-01-05T16:20:00Z",
      profiles: {
        full_name: "Maria Santos",
        username: "maria",
        block: "B03",
        apartment: "Apt205",
      },
    },
  ],
}

// Get data from localStorage or default
export function getOfflineData(table: keyof typeof OFFLINE_DATA) {
  const stored = localStorage.getItem(`offline_${table}`)
  if (stored) {
    return JSON.parse(stored)
  }
  return OFFLINE_DATA[table]
}

// Save data to localStorage
export function saveOfflineData(table: keyof typeof OFFLINE_DATA, data: any[]) {
  localStorage.setItem(`offline_${table}`, JSON.stringify(data))
}

// Add new item to offline data
export function addOfflineItem(table: keyof typeof OFFLINE_DATA, item: any) {
  const currentData = getOfflineData(table)
  const newData = [item, ...currentData]
  saveOfflineData(table, newData)
  return newData
}

// Update item in offline data
export function updateOfflineItem(table: keyof typeof OFFLINE_DATA, id: string, updates: any) {
  const currentData = getOfflineData(table)
  const newData = currentData.map((item: any) => (item.id === id ? { ...item, ...updates } : item))
  saveOfflineData(table, newData)
  return newData
}

// Delete item from offline data
export function deleteOfflineItem(table: keyof typeof OFFLINE_DATA, id: string) {
  const currentData = getOfflineData(table)
  const newData = currentData.filter((item: any) => item.id !== id)
  saveOfflineData(table, newData)
  return newData
}
