-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE classificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE coleta_lixo ENABLE ROW LEVEL SECURITY;
ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE salao_festas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugestoes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Sindico can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);

-- Comunicados policies
CREATE POLICY "Everyone can view comunicados" ON comunicados FOR SELECT USING (true);
CREATE POLICY "Only sindico can insert comunicados" ON comunicados FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);
CREATE POLICY "Only sindico can update comunicados" ON comunicados FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);
CREATE POLICY "Only sindico can delete comunicados" ON comunicados FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);

-- Classificados policies
CREATE POLICY "Everyone can view classificados" ON classificados FOR SELECT USING (true);
CREATE POLICY "Users can insert own classificados" ON classificados FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own classificados" ON classificados FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Sindico can update any classificados" ON classificados FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);
CREATE POLICY "Users can delete own classificados" ON classificados FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Sindico can delete any classificados" ON classificados FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);

-- Coleta lixo policies
CREATE POLICY "Everyone can view coleta_lixo" ON coleta_lixo FOR SELECT USING (true);
CREATE POLICY "Only sindico can manage coleta_lixo" ON coleta_lixo FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);

-- Encomendas policies
CREATE POLICY "Everyone can view encomendas" ON encomendas FOR SELECT USING (true);
CREATE POLICY "Only sindico can manage encomendas" ON encomendas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);

-- Salao festas policies
CREATE POLICY "Everyone can view salao_festas" ON salao_festas FOR SELECT USING (true);
CREATE POLICY "Users can insert own requests" ON salao_festas FOR INSERT WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Users can update own requests" ON salao_festas FOR UPDATE USING (auth.uid() = requested_by AND status = 'pendente');
CREATE POLICY "Sindico can update any request" ON salao_festas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);

-- Servicos policies
CREATE POLICY "Everyone can view servicos" ON servicos FOR SELECT USING (true);
CREATE POLICY "Users can insert servicos" ON servicos FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own servicos" ON servicos FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Sindico can manage any servicos" ON servicos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);

-- Sugestoes policies
CREATE POLICY "Everyone can view sugestoes" ON sugestoes FOR SELECT USING (true);
CREATE POLICY "Users can insert sugestoes" ON sugestoes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own sugestoes" ON sugestoes FOR UPDATE USING (auth.uid() = created_by AND status = 'pendente');
CREATE POLICY "Sindico can manage any sugestoes" ON sugestoes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'sindico')
);
