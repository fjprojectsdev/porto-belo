-- Porto-Belo - Tabelas básicas

create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  bloco text,
  apartamento text,
  role text default 'resident',
  created_at timestamptz default now()
);

create table sugestoes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  nome text,
  bloco text,
  apartamento text,
  telefone text,
  mensagem text not null,
  created_at timestamptz default now()
);

create table comunicados (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author_id uuid references profiles(id),
  published boolean default true,
  created_at timestamptz default now()
);

create table encomendas (
  id uuid primary key default gen_random_uuid(),
  destinatario text not null,
  bloco text,
  apartamento text,
  entregue boolean default false,
  obs text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

create table servicos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  nome_servico text,
  descricao text,
  contato text,
  created_at timestamptz default now()
);

create table classificados (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  titulo text,
  descricao text,
  preco text,
  created_at timestamptz default now()
);

-- Enable RLS examples (enable then add policies in the console or via SQL)
-- ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Example policy (create via SQL or Supabase Console):
/*
create policy "servico_owner_or_admin" on servicos
for all using (
  auth.role() = 'authenticated' and (
    profile_id = auth.uid() or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  )
);
*/
