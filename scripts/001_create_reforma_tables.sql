-- Criar tabela principal de dados da reforma
CREATE TABLE IF NOT EXISTS public.reforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  total_invested DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de imagens
CREATE TABLE IF NOT EXISTS public.reforma_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reforma_id UUID NOT NULL REFERENCES public.reforma(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de fases
CREATE TABLE IF NOT EXISTS public.reforma_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reforma_id UUID NOT NULL REFERENCES public.reforma(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('concluida', 'pendente')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_reforma_images_reforma_id ON public.reforma_images(reforma_id);
CREATE INDEX IF NOT EXISTS idx_reforma_phases_reforma_id ON public.reforma_phases(reforma_id);

-- Inserir dados iniciais com UUID válido
INSERT INTO public.reforma (id, title, description, start_date, end_date, progress_percentage, total_invested)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Reforma da Igreja CCB-DUMONT',
  'Bem-vindo ao portal de acompanhamento da reforma da Igreja CCB-DUMONT. 

Esta página foi criada para manter a comunidade informada sobre o progresso das obras de renovação de nosso templo. Aqui você encontrará informações atualizadas sobre:

• Datas de início e conclusão das obras
• Percentual geral de progresso
• Detalhes das diferentes fases da reforma
• Galeria de imagens documentando o processo

A reforma é um importante investimento na manutenção e melhoramento de nosso espaço sagrado. Acompanhe conosco esta jornada de renovação!',
  NOW(),
  NOW() + INTERVAL '7 months',
  35,
  150000
)
ON CONFLICT DO NOTHING;

-- Inserir fases iniciais
INSERT INTO public.reforma_phases (reforma_id, name, percentage, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Fundação', 100, 'concluida'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Alvenaria', 80, 'concluida'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Cobertura', 40, 'pendente'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Pintura e Acabamentos', 10, 'pendente')
ON CONFLICT DO NOTHING;
