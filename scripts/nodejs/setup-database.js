// Node.js script to setup the database automatically
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://nopvezehowzppptvmsxo.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcHZlemVob3d6cHBwdHZtc3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjYzMTgsImV4cCI6MjA3MDQwMjMxOH0.WzpfeIwDHXTm4A7W7YBFVTOXPIxc1lwyQXn7bX8kOIU"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupDatabase() {
  console.log("🚀 Starting database setup...")

  try {
    // Create tables
    console.log("📋 Creating tables...")
    const createTablesScript = `
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

      CREATE TABLE IF NOT EXISTS comunicados (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

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

      CREATE TABLE IF NOT EXISTS coleta_lixo (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL,
        day_name TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

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
    `

    const { error: tablesError } = await supabase.rpc("exec_sql", { sql: createTablesScript })
    if (tablesError) {
      console.warn("⚠️ Tables creation warning:", tablesError.message)
    } else {
      console.log("✅ Tables created successfully")
    }

    // Enable RLS
    console.log("🔒 Enabling Row Level Security...")
    const rlsScript = `
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
      ALTER TABLE classificados ENABLE ROW LEVEL SECURITY;
      ALTER TABLE coleta_lixo ENABLE ROW LEVEL SECURITY;
      ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE salao_festas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
      ALTER TABLE sugestoes ENABLE ROW LEVEL SECURITY;
    `

    const { error: rlsError } = await supabase.rpc("exec_sql", { sql: rlsScript })
    if (rlsError) {
      console.warn("⚠️ RLS setup warning:", rlsError.message)
    } else {
      console.log("✅ RLS enabled successfully")
    }

    // Create sindico account
    console.log("👤 Creating sindico account...")
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "sindica@condominio.local",
      password: "patricia",
      options: {
        data: {
          username: "sindica",
          full_name: "Patricia - Síndica",
          user_type: "sindico",
        },
      },
    })

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("✅ Sindico account already exists")
      } else {
        console.error("❌ Error creating sindico account:", authError.message)
      }
    } else {
      console.log("✅ Sindico account created successfully")
    }

    // Insert sample data
    console.log("📝 Inserting sample data...")
    const seedScript = `
      INSERT INTO coleta_lixo (day_of_week, day_name, active) VALUES
      (1, 'Segunda-feira', true),
      (4, 'Quinta-feira', true)
      ON CONFLICT DO NOTHING;
    `

    const { error: seedError } = await supabase.rpc("exec_sql", { sql: seedScript })
    if (seedError) {
      console.warn("⚠️ Seed data warning:", seedError.message)
    } else {
      console.log("✅ Sample data inserted successfully")
    }

    console.log("🎉 Database setup completed successfully!")
    console.log("")
    console.log("🔑 Login credentials:")
    console.log("   Username: sindica")
    console.log("   Password: patricia")
    console.log("")
    console.log("🌐 You can now access the application!")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
  }
}

// Run the setup
setupDatabase()
