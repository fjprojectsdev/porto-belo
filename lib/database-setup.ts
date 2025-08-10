import { supabase } from "./supabase"

export async function setupDatabase() {
  try {
    // Execute all SQL scripts in order
    const scripts = [
      // Script 1: Create tables
      `
      -- Create users table with profile information
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users ON DELETE CASCADE,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT,
        phone TEXT,
        block TEXT,
        apartment TEXT,
        user_type TEXT CHECK (user_type IN ('sindico', 'morador', 'prestador')) DEFAULT 'morador',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        PRIMARY KEY (id)
      );

      -- Create comunicados table
      CREATE TABLE IF NOT EXISTS comunicados (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create classificados table
      CREATE TABLE IF NOT EXISTS classificados (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2),
        type TEXT CHECK (type IN ('venda', 'compra')) NOT NULL,
        created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create coleta_lixo table
      CREATE TABLE IF NOT EXISTS coleta_lixo (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL,
        day_name TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create encomendas table
      CREATE TABLE IF NOT EXISTS encomendas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        recipient_name TEXT NOT NULL,
        block TEXT NOT NULL,
        apartment TEXT NOT NULL,
        description TEXT,
        received_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        delivered BOOLEAN DEFAULT false,
        delivered_at TIMESTAMP WITH TIME ZONE,
        created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create salao_festas table
      CREATE TABLE IF NOT EXISTS salao_festas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        requested_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL,
        description TEXT,
        status TEXT CHECK (status IN ('pendente', 'aprovado', 'rejeitado')) DEFAULT 'pendente',
        approved_by UUID REFERENCES profiles(id),
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create servicos table
      CREATE TABLE IF NOT EXISTS servicos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        phone TEXT,
        category TEXT,
        created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create sugestoes table
      CREATE TABLE IF NOT EXISTS sugestoes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
        status TEXT CHECK (status IN ('pendente', 'analisando', 'implementado', 'rejeitado')) DEFAULT 'pendente',
        response TEXT,
        responded_by UUID REFERENCES profiles(id),
        responded_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
      `,

      // Script 2: Setup RLS
      `
      -- Enable RLS on all tables
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
      ALTER TABLE classificados ENABLE ROW LEVEL SECURITY;
      ALTER TABLE coleta_lixo ENABLE ROW LEVEL SECURITY;
      ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE salao_festas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
      ALTER TABLE sugestoes ENABLE ROW LEVEL SECURITY;
      `,

      // Script 3: Create policies
      `
      -- Profiles policies
      CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON profiles FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
      CREATE POLICY IF NOT EXISTS "Sindico can update any profile" ON profiles FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );

      -- Comunicados policies
      CREATE POLICY IF NOT EXISTS "Everyone can view comunicados" ON comunicados FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "Only sindico can insert comunicados" ON comunicados FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );
      CREATE POLICY IF NOT EXISTS "Only sindico can update comunicados" ON comunicados FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );
      CREATE POLICY IF NOT EXISTS "Only sindico can delete comunicados" ON comunicados FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );

      -- Classificados policies
      CREATE POLICY IF NOT EXISTS "Everyone can view classificados" ON classificados FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "Users can insert own classificados" ON classificados FOR INSERT WITH CHECK (auth.uid() = created_by);
      CREATE POLICY IF NOT EXISTS "Users can update own classificados" ON classificados FOR UPDATE USING (auth.uid() = created_by);
      CREATE POLICY IF NOT EXISTS "Sindico can update any classificados" ON classificados FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );
      CREATE POLICY IF NOT EXISTS "Users can delete own classificados" ON classificados FOR DELETE USING (auth.uid() = created_by);
      CREATE POLICY IF NOT EXISTS "Sindico can delete any classificados" ON classificados FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );

      -- Coleta lixo policies
      CREATE POLICY IF NOT EXISTS "Everyone can view coleta_lixo" ON coleta_lixo FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "Only sindico can manage coleta_lixo" ON coleta_lixo FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );

      -- Encomendas policies
      CREATE POLICY IF NOT EXISTS "Everyone can view encomendas" ON encomendas FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "Only sindico can manage encomendas" ON encomendas FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );

      -- Salao festas policies
      CREATE POLICY IF NOT EXISTS "Everyone can view salao_festas" ON salao_festas FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "Users can insert own requests" ON salao_festas FOR INSERT WITH CHECK (auth.uid() = requested_by);
      CREATE POLICY IF NOT EXISTS "Users can update own requests" ON salao_festas FOR UPDATE USING (auth.uid() = requested_by AND status = 'pendente');
      CREATE POLICY IF NOT EXISTS "Sindico can update any request" ON salao_festas FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );

      -- Servicos policies
      CREATE POLICY IF NOT EXISTS "Everyone can view servicos" ON servicos FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "Users can insert servicos" ON servicos FOR INSERT WITH CHECK (auth.uid() = created_by);
      CREATE POLICY IF NOT EXISTS "Users can update own servicos" ON servicos FOR UPDATE USING (auth.uid() = created_by);
      CREATE POLICY IF NOT EXISTS "Sindico can manage any servicos" ON servicos FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );

      -- Sugestoes policies
      CREATE POLICY IF NOT EXISTS "Everyone can view sugestoes" ON sugestoes FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "Users can insert sugestoes" ON sugestoes FOR INSERT WITH CHECK (auth.uid() = created_by);
      CREATE POLICY IF NOT EXISTS "Users can update own sugestoes" ON sugestoes FOR UPDATE USING (auth.uid() = created_by AND status = 'pendente');
      CREATE POLICY IF NOT EXISTS "Sindico can manage any sugestoes" ON sugestoes FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
      );
      `,

      // Script 4: Create functions
      `
      -- Function to handle new user registration
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, username, full_name, user_type)
        VALUES (
          new.id,
          COALESCE(new.raw_user_meta_data->>'username', new.email),
          COALESCE(new.raw_user_meta_data->>'full_name', ''),
          COALESCE(new.raw_user_meta_data->>'user_type', 'morador')
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Trigger for new user registration
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

      -- Function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = TIMEZONE('utc'::text, NOW());
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Add triggers for updated_at
      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      DROP TRIGGER IF EXISTS update_comunicados_updated_at ON comunicados;
      CREATE TRIGGER update_comunicados_updated_at BEFORE UPDATE ON comunicados FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      DROP TRIGGER IF EXISTS update_classificados_updated_at ON classificados;
      CREATE TRIGGER update_classificados_updated_at BEFORE UPDATE ON classificados FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      DROP TRIGGER IF EXISTS update_coleta_lixo_updated_at ON coleta_lixo;
      CREATE TRIGGER update_coleta_lixo_updated_at BEFORE UPDATE ON coleta_lixo FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      DROP TRIGGER IF EXISTS update_salao_festas_updated_at ON salao_festas;
      CREATE TRIGGER update_salao_festas_updated_at BEFORE UPDATE ON salao_festas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      DROP TRIGGER IF EXISTS update_servicos_updated_at ON servicos;
      CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      DROP TRIGGER IF EXISTS update_sugestoes_updated_at ON sugestoes;
      CREATE TRIGGER update_sugestoes_updated_at BEFORE UPDATE ON sugestoes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      `,

      // Script 5: Seed data
      `
      -- Insert default garbage collection days (Segunda e Quinta)
      INSERT INTO coleta_lixo (day_of_week, day_name, active) VALUES
      (1, 'Segunda-feira', true),
      (4, 'Quinta-feira', true)
      ON CONFLICT DO NOTHING;
      `,
    ]

    // Execute each script
    for (let i = 0; i < scripts.length; i++) {
      const { error } = await supabase.rpc("exec_sql", { sql: scripts[i] })
      if (error) {
        console.warn(`Script ${i + 1} warning:`, error)
        // Continue even if there are warnings
      }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Database setup error:", error)
    return { success: false, error }
  }
}
