-- Add sector and occurrence_date fields to patient_occurrences table
-- Migration: 2026-01-30

ALTER TABLE public.patient_occurrences
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS occurrence_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN public.patient_occurrences.sector IS 'Setor onde ocorreu a reclamação';
COMMENT ON COLUMN public.patient_occurrences.occurrence_date IS 'Data em que ocorreu a reclamação';
