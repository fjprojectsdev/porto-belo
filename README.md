# Porto-Belo (React + Vite + Supabase)

Projeto base para o app do condomínio "Porto Belo". Contém integração com Supabase, PWA manifest e SQL para criar tabelas.

## Como usar

1. Renomeie `.env.example` para `.env` e preencha as variáveis:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2. Instale dependências:
```
npm install
```

3. Rodar em desenvolvimento:
```
npm run dev
```

4. Para deploy automático no Vercel, crie um repositório, suba o código e adicione as variáveis de ambiente no painel do Vercel.

---
Arquivos importantes:
- `supabase.sql` - SQL para criar tabelas básicas e policies propostas.
- `src/lib/supabaseClient.js` - cliente Supabase pronto para usar.
- `manifest.json` - PWA manifest.
