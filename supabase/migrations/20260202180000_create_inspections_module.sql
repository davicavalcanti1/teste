-- Migration: Create Inspections Module (Split Tables Strategy)
-- Description: Separate tables for each inspection type, united by a View for dashboards.

-- 1. Create Common ENUMs
CREATE TYPE public.inspection_status_chamado AS ENUM (
    'aberto',
    'finalizado'
);

-- ==============================================================================
-- TABLE 1: DISPENSER (Chamado Flow)
-- ==============================================================================
CREATE TABLE public.inspections_dispenser (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    protocolo TEXT UNIQUE NOT NULL,
    localizacao TEXT NOT NULL,
    
    -- Specific fields
    problema TEXT NOT NULL, -- "faltando insumo", "quebrado", "sujo", "outro"
    descricao TEXT,         -- Description if 'outro'
    
    -- Status
    status public.inspection_status_chamado DEFAULT 'aberto',
    
    -- Metadata
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null if anonymous QR Code
    
    -- Closing info
    finalizado_em TIMESTAMP WITH TIME ZONE,
    finalizado_por TEXT,
    observacoes_finalizacao TEXT
);
-- Indexes
CREATE INDEX idx_disp_protocolo ON public.inspections_dispenser(protocolo);
CREATE INDEX idx_disp_status ON public.inspections_dispenser(status);
CREATE INDEX idx_disp_criado_em ON public.inspections_dispenser(criado_em DESC);


-- ==============================================================================
-- TABLE 2: BANHEIRO (Chamado Flow)
-- ==============================================================================
CREATE TABLE public.inspections_banheiro (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    protocolo TEXT UNIQUE NOT NULL,
    localizacao TEXT NOT NULL,
    
    -- Specific fields
    problema TEXT NOT NULL,
    descricao TEXT NOT NULL,
    
    -- Status
    status public.inspection_status_chamado DEFAULT 'aberto',
    
    -- Metadata
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL, 
    
    -- Closing info
    finalizado_em TIMESTAMP WITH TIME ZONE,
    finalizado_por TEXT,
    observacoes_finalizacao TEXT
);
-- Indexes
CREATE INDEX idx_banho_protocolo ON public.inspections_banheiro(protocolo);
CREATE INDEX idx_banho_status ON public.inspections_banheiro(status);
CREATE INDEX idx_banho_criado_em ON public.inspections_banheiro(criado_em DESC);


-- ==============================================================================
-- TABLE 3: AR-CONDICIONADO (Log Flow)
-- ==============================================================================
CREATE TABLE public.inspections_ac (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    localizacao TEXT NOT NULL, -- "Sala"
    
    -- Specific fields
    origem TEXT NOT NULL,       -- "imago", "terceirizado", "dreno"
    modelo TEXT,
    numero_serie TEXT,
    atividades JSONB DEFAULT '[]'::jsonb, -- Checklist of what was done
    fotos_urls TEXT[] DEFAULT '{}',
    
    observacoes TEXT,
    
    -- Metadata
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
-- Indexes
CREATE INDEX idx_ac_local ON public.inspections_ac(localizacao);
CREATE INDEX idx_ac_origem ON public.inspections_ac(origem);
CREATE INDEX idx_ac_criado_em ON public.inspections_ac(criado_em DESC);


-- ==============================================================================
-- VIEW: GENERAL DASHBOARD
-- ==============================================================================
CREATE OR REPLACE VIEW public.inspections_overview AS
SELECT 
    id, 
    'dispenser' as tipo, 
    localizacao, 
    status, 
    criado_em, 
    finalizado_em,
    problema as resumo
FROM public.inspections_dispenser
UNION ALL
SELECT 
    id, 
    'banheiro' as tipo, 
    localizacao, 
    status, 
    criado_em, 
    finalizado_em,
    problema as resumo
FROM public.inspections_banheiro
UNION ALL
SELECT 
    id, 
    'ar_condicionado' as tipo, 
    localizacao, 
    'finalizado'::public.inspection_status_chamado as status, -- AC records are instant logs
    criado_em, 
    criado_em as finalizado_em,
    origem || ' - ' || COALESCE(modelo, '') as resumo
FROM public.inspections_ac;


-- ==============================================================================
-- SECURITY (RLS)
-- ==============================================================================

-- 1. Enable RLS
ALTER TABLE public.inspections_dispenser ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections_banheiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections_ac ENABLE ROW LEVEL SECURITY;

-- 2. Policies for PUBLIC INSERT (Anonymous QR Code usage)
CREATE POLICY "Public insert dispenser" ON public.inspections_dispenser FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert banheiro" ON public.inspections_banheiro FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert ac" ON public.inspections_ac FOR INSERT WITH CHECK (true);

-- 3. Policies for AUTHENTICATED SELECT (Admin Dashboard)
CREATE POLICY "Auth view dispenser" ON public.inspections_dispenser FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth view banheiro" ON public.inspections_banheiro FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth view ac" ON public.inspections_ac FOR SELECT TO authenticated USING (true);

-- 4. RPC Functions for PUBLIC CLOSING (Secure)
-- Function to close Dispenser
CREATE OR REPLACE FUNCTION public.close_dispenser_ticket(
    p_protocolo TEXT,
    p_funcionario TEXT,
    p_observacoes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
    v_loc TEXT;
BEGIN
    SELECT id, localizacao INTO v_id, v_loc 
    FROM public.inspections_dispenser 
    WHERE protocolo = p_protocolo AND status = 'aberto';
    
    IF v_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Protocolo não encontrado ou já finalizado');
    END IF;
    
    UPDATE public.inspections_dispenser
    SET status = 'finalizado', finalizado_em = now(), finalizado_por = p_funcionario, observacoes_finalizacao = p_observacoes
    WHERE id = v_id;
    
    RETURN jsonb_build_object('success', true, 'localizacao', v_loc);
END;
$$;

-- Function to close Banheiro
CREATE OR REPLACE FUNCTION public.close_banheiro_ticket(
    p_protocolo TEXT,
    p_funcionario TEXT,
    p_observacoes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
    v_loc TEXT;
BEGIN
    SELECT id, localizacao INTO v_id, v_loc 
    FROM public.inspections_banheiro 
    WHERE protocolo = p_protocolo AND status = 'aberto';
    
    IF v_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Protocolo não encontrado ou já finalizado');
    END IF;
    
    UPDATE public.inspections_banheiro
    SET status = 'finalizado', finalizado_em = now(), finalizado_por = p_funcionario, observacoes_finalizacao = p_observacoes
    WHERE id = v_id;
    
    RETURN jsonb_build_object('success', true, 'localizacao', v_loc);
END;
$$;
