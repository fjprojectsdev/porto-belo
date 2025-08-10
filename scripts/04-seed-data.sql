-- Insert default garbage collection days (Segunda e Quinta)
INSERT INTO coleta_lixo (day_of_week, day_name, active) VALUES
(1, 'Segunda-feira', true),
(4, 'Quinta-feira', true)
ON CONFLICT DO NOTHING;
