-- Migration: Restructure Occurrences Tables
-- Date: 2026-02-02
-- Description: 
-- 1. Rename occurrences -> occurrences_laudo
-- 2. Create generic_occurrences
-- 3. Move 'livre'/'simples' to generic_occurrences
-- 4. Add JSONB columns (history, comments, capas, anexos) to all tables
-- 5. Migrate satellite data
-- 6. Renumber protocols (3063 prefix)
-- 7. Drop satellite tables

BEGIN;

--------------------------------------------------------------------------------
-- 1. Create Generic Occurrences Table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generic_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    protocolo TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'simples', -- 'simples', 'livre'
    custom_type TEXT,
    
    target_type TEXT, -- 'paciente', 'funcionario'
    
    -- Person Info (JSONB for flexibility)
    person_info JSONB DEFAULT '{}'::jsonb, 
    /* { 
       "name": "...", 
       "phone": "...", 
       "birth_date": "...",
       "id": "..." (if employee)
    } */
    
    descricao TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'registrada',
    
    -- Common JSONB columns
    historico_status JSONB DEFAULT '[]'::jsonb,
    comentarios JSONB DEFAULT '[]'::jsonb,
    dados_capa JSONB DEFAULT '{}'::jsonb,
    anexos JSONB DEFAULT '[]'::jsonb,
    
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Generic Occurrences
ALTER TABLE public.generic_occurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view generic occurrences" ON public.generic_occurrences
    FOR SELECT USING (auth.role() = 'authenticated');
    
CREATE POLICY "Users can insert generic occurrences" ON public.generic_occurrences
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Users can update generic occurrences" ON public.generic_occurrences
    FOR UPDATE USING (auth.role() = 'authenticated');

--------------------------------------------------------------------------------
-- 2. Modify & Rename Main Occurrences Table
--------------------------------------------------------------------------------

-- First, move 'livre'/'simples' data to generic_occurrences before renaming
-- Assuming 'custom_type' column exists from previous migrations for 'livre' type
INSERT INTO public.generic_occurrences (
    id, tenant_id, protocolo, tipo, custom_type, descricao, 
    status, criado_por, criado_em, atualizado_em, person_info
)
SELECT 
    id, tenant_id, protocolo, 
    CASE WHEN tipo::text = 'livre' THEN 'livre' ELSE 'simples' END,
    custom_type,
    descricao_detalhada,
    status::text,
    criado_por,
    criado_em,
    atualizado_em,
    jsonb_build_object(
        'name', paciente_nome_completo,
        'phone', paciente_telefone,
        'birth_date', paciente_data_nascimento
    )
FROM public.occurrences
WHERE tipo::text IN ('livre', 'simples');

-- Delete moved rows
DELETE FROM public.occurrences WHERE tipo::text IN ('livre', 'simples');

-- Rename table
ALTER TABLE public.occurrences RENAME TO occurrences_laudo;

-- Add JSONB columns to occurrences_laudo
ALTER TABLE public.occurrences_laudo ADD COLUMN IF NOT EXISTS historico_status JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.occurrences_laudo ADD COLUMN IF NOT EXISTS comentarios JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.occurrences_laudo ADD COLUMN IF NOT EXISTS dados_capa JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.occurrences_laudo ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb;

--------------------------------------------------------------------------------
-- 3. Update Other Occurrences Tables (Admin, Nursing, Patient)
--------------------------------------------------------------------------------

-- Administrative
ALTER TABLE public.administrative_occurrences ADD COLUMN IF NOT EXISTS historico_status JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.administrative_occurrences ADD COLUMN IF NOT EXISTS comentarios JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.administrative_occurrences ADD COLUMN IF NOT EXISTS dados_capa JSONB DEFAULT '{}'::jsonb;
-- Already has attachments (jsonb) but let's standardize name if needed. 
-- Schema says 'attachments' jsonb. We will stick with 'attachments' or adding 'anexos'?
-- Let's alias/use 'anexos' for consistency if possible, or just keep 'attachments'.
-- User asked for 'anexos' column in proposal.
ALTER TABLE public.administrative_occurrences ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb;
-- Migrate existing 'attachments' to 'anexos' if needed, or just use 'anexos' forward.
UPDATE public.administrative_occurrences SET anexos = attachments WHERE attachments IS NOT NULL AND anexos = '[]'::jsonb;

-- Nursing
ALTER TABLE public.nursing_occurrences ADD COLUMN IF NOT EXISTS historico_status JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.nursing_occurrences ADD COLUMN IF NOT EXISTS comentarios JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.nursing_occurrences ADD COLUMN IF NOT EXISTS dados_capa JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.nursing_occurrences ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb;
UPDATE public.nursing_occurrences SET anexos = attachments WHERE attachments IS NOT NULL AND anexos = '[]'::jsonb;

-- Patient
ALTER TABLE public.patient_occurrences ADD COLUMN IF NOT EXISTS historico_status JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.patient_occurrences ADD COLUMN IF NOT EXISTS comentarios JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.patient_occurrences ADD COLUMN IF NOT EXISTS dados_capa JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.patient_occurrences ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb;

--------------------------------------------------------------------------------
-- 4. Migrate Satellite Data (Status, Comments, Capas, Attachments)
--------------------------------------------------------------------------------

-- Only for occurrences_laudo as satellite tables were linked to 'occurrences'
-- 4.1 Comments
WITH aggregated_comments AS (
    SELECT 
        occurrence_id, 
        jsonb_agg(jsonb_build_object(
            'id', id,
            'content', content,
            'created_by', criado_por,
            'created_at', criado_em
        ) ORDER BY criado_em ASC) as comments_json
    FROM public.occurrence_comments
    GROUP BY occurrence_id
)
UPDATE public.occurrences_laudo
SET comentarios = aggregated_comments.comments_json
FROM aggregated_comments
WHERE public.occurrences_laudo.id = aggregated_comments.occurrence_id;

-- 4.2 Status History
WITH aggregated_history AS (
    SELECT 
        occurrence_id, 
        jsonb_agg(jsonb_build_object(
            'from', status_de,
            'to', status_para,
            'changed_by', alterado_por,
            'changed_at', alterado_em,
            'reason', motivo
        ) ORDER BY alterado_em ASC) as history_json
    FROM public.occurrence_status_history
    GROUP BY occurrence_id
)
UPDATE public.occurrences_laudo
SET historico_status = aggregated_history.history_json
FROM aggregated_history
WHERE public.occurrences_laudo.id = aggregated_history.occurrence_id;

-- 4.3 Capas
-- Assuming 1:1 usually, but let's take the latest if multiple (though it should be unique 1:1 logic)
WITH latest_capa AS (
    SELECT DISTINCT ON (occurrence_id)
        occurrence_id,
        jsonb_build_object(
            'causa_raiz', causa_raiz,
            'acao', acao,
            'responsavel', responsavel,
            'prazo', prazo,
            'status', status,
            'criado_em', criado_em
        ) as capa_data
    FROM public.occurrence_capas
    ORDER BY occurrence_id, criado_em DESC
)
UPDATE public.occurrences_laudo
SET dados_capa = latest_capa.capa_data
FROM latest_capa
WHERE public.occurrences_laudo.id = latest_capa.occurrence_id;

-- 4.4 Attachments (Table -> JSONB)
WITH aggregated_attachments AS (
    SELECT 
        occurrence_id, 
        jsonb_agg(jsonb_build_object(
            'id', id,
            'file_name', file_name,
            'file_url', file_url,
            'file_type', file_type,
            'uploaded_by', uploaded_by,
            'uploaded_at', uploaded_em
        )) as attachments_json
    FROM public.occurrence_attachments
    GROUP BY occurrence_id
)
UPDATE public.occurrences_laudo
SET anexos = aggregated_attachments.attachments_json
FROM aggregated_attachments
WHERE public.occurrences_laudo.id = aggregated_attachments.occurrence_id;

--------------------------------------------------------------------------------
-- 5. Renumber Protocols (The 3063 Standardization)
--------------------------------------------------------------------------------

-- Function to generate the new protocol string
CREATE OR REPLACE FUNCTION generate_standard_protocol(prefix text, sequence int) RETURNS text AS $$
BEGIN
    RETURN prefix || LPAD(sequence::text, 4, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5.1 Laudo (Prefix 306301)
WITH seq AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC) as rn
    FROM public.occurrences_laudo
)
UPDATE public.occurrences_laudo
SET protocolo = generate_standard_protocol('306301', seq.rn::int)
FROM seq
WHERE public.occurrences_laudo.id = seq.id;

-- 5.2 Administrativa (Prefix 306302)
-- Note: Administrative table has 'protocol' column (English) or PROTOCOLO?
-- Checking file 20260116153000 -> column is 'protocol'.
WITH seq AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM public.administrative_occurrences
)
UPDATE public.administrative_occurrences
SET protocol = generate_standard_protocol('306302', seq.rn::int)
FROM seq
WHERE public.administrative_occurrences.id = seq.id;

-- 5.3 Nursing (Prefix 306303)
-- Checking file 20260119093000 -> column is 'protocol'.
WITH seq AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM public.nursing_occurrences
)
UPDATE public.nursing_occurrences
SET protocol = generate_standard_protocol('306303', seq.rn::int)
FROM seq
WHERE public.nursing_occurrences.id = seq.id;

-- 5.4 Patient (Prefix 306304)
-- Checking file 20260120160000 -> column is 'protocol'.
WITH seq AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM public.patient_occurrences
)
UPDATE public.patient_occurrences
SET protocol = generate_standard_protocol('306304', seq.rn::int)
FROM seq
WHERE public.patient_occurrences.id = seq.id;

-- 5.5 Generic (New table, kept as is or numbered?)
-- User said: "se for não tabelada não deve gerar um código assim, pode ser genérico"
-- We leave generic_occurrences protocols as they were (from copy) or generate new simple ones if needed.
-- But since we copied them, they have old protocols (likely 'OCC-...').
-- Let's update them to 'GEN-SEQUENCE' just to be clean? 
-- User said: "não deve gerar um código assim... pode ser genérico".
-- Let's rewrite them to 'GEN-0001', etc.
WITH seq AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC) as rn
    FROM public.generic_occurrences
)
UPDATE public.generic_occurrences
SET protocolo = 'GEN-' || TO_CHAR(criado_em, 'YYYY') || '-' || LPAD(seq.rn::text, 4, '0')
FROM seq
WHERE public.generic_occurrences.id = seq.id;


--------------------------------------------------------------------------------
-- 6. Update Protocol Generation Functions
--------------------------------------------------------------------------------

-- 6.1 Laudo
CREATE OR REPLACE FUNCTION public.generate_laudo_protocol(p_tenant_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  -- Get count + 1 (Approximate sequence, better to use a real sequence object but MAX works for now)
  -- Or strictly count based on 306301 prefix
  SELECT COALESCE(MAX(SUBSTRING(protocolo FROM 7)::INTEGER), 0) + 1
  INTO next_seq
  FROM public.occurrences_laudo
  WHERE protocolo LIKE '306301%';
  
  RETURN '306301' || LPAD(next_seq::text, 4, '0');
END;
$$;

-- 6.2 Administrative
CREATE OR REPLACE FUNCTION public.generate_admin_protocol_number(p_tenant_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(protocol FROM 7)::INTEGER), 0) + 1
  INTO next_seq
  FROM public.administrative_occurrences
  WHERE protocol LIKE '306302%';
  
  RETURN '306302' || LPAD(next_seq::text, 4, '0');
END;
$$;

-- 6.3 Nursing
CREATE OR REPLACE FUNCTION public.generate_nursing_protocol_number(p_tenant_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(protocol FROM 7)::INTEGER), 0) + 1
  INTO next_seq
  FROM public.nursing_occurrences
  WHERE protocol LIKE '306303%';
  
  RETURN '306303' || LPAD(next_seq::text, 4, '0');
END;
$$;

-- 6.4 Patient
-- Need to create a function or update if exists
CREATE OR REPLACE FUNCTION public.generate_patient_protocol_number(p_tenant_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(protocol FROM 7)::INTEGER), 0) + 1
  INTO next_seq
  FROM public.patient_occurrences
  WHERE protocol LIKE '306304%';
  
  RETURN '306304' || LPAD(next_seq::text, 4, '0');
END;
$$;

-- 6.5 Generic
CREATE OR REPLACE FUNCTION public.generate_generic_protocol() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  next_seq INTEGER;
  year_str TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  
  -- Pattern GEN-YYYY-XXXX
  SELECT COALESCE(MAX(NULLIF(regexp_replace(protocolo, '.*-', ''), '')::INTEGER), 0) + 1
  INTO next_seq
  FROM public.generic_occurrences
  WHERE protocolo LIKE 'GEN-' || year_str || '-%';
  
  RETURN 'GEN-' || year_str || '-' || LPAD(next_seq::text, 4, '0');
END;
$$;

--------------------------------------------------------------------------------
-- 7. Drop Satellite Tables
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.occurrence_status_history CASCADE;
DROP TABLE IF EXISTS public.occurrence_comments CASCADE;
DROP TABLE IF EXISTS public.occurrence_capas CASCADE;
DROP TABLE IF EXISTS public.occurrence_attachments CASCADE;

COMMIT;
