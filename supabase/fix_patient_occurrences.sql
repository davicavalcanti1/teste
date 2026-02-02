-- ============================================================================
-- CORREÇÃO RÁPIDA: Adicionar campos à tabela patient_occurrences
-- ============================================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================================

-- Adicionar campos de setor e data da ocorrência
ALTER TABLE public.patient_occurrences
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS occurrence_date DATE;

-- Verificar se foi criado com sucesso
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patient_occurrences' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Campos adicionados com sucesso!';
  RAISE NOTICE 'Campos: sector (TEXT) e occurrence_date (DATE)';
END $$;
