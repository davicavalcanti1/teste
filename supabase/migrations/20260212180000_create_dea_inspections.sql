
-- Create DEA Inspections Table
CREATE TABLE public.inspections_dea (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    protocolo text,
    data_referencia date NOT NULL DEFAULT CURRENT_DATE,
    funcionario text NOT NULL,
    localizacao text NOT NULL,
    bateria_porcentagem integer NOT NULL,
    observacoes text,
    fotos_urls text[] DEFAULT '{}',
    status text DEFAULT 'finalizado',
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inspections_dea_pkey PRIMARY KEY (id),
    CONSTRAINT inspections_dea_protocolo_key UNIQUE (protocolo),
    CONSTRAINT inspections_dea_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.inspections_dea ENABLE ROW LEVEL SECURITY;

-- Policies for DEA (allow public/anon access for form submission)
CREATE POLICY "Public insert dea" ON public.inspections_dea
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Public read dea" ON public.inspections_dea
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public update dea" ON public.inspections_dea
    FOR UPDATE TO anon, authenticated
    USING (true);

-- Storage Bucket for DEA (inspecoes-dea)
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspecoes-dea', 'inspecoes-dea', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Allow public uploads dea" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'inspecoes-dea');

CREATE POLICY "Allow public read dea" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'inspecoes-dea');

-- Trigger to Generate Protocol for DEA
CREATE OR REPLACE FUNCTION public.generate_dea_protocol() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    date_part TEXT;
    sequence_part INT;
BEGIN
    date_part := to_char(NEW.data_referencia, 'YYYYMMDD');

    SELECT COUNT(*) + 1 INTO sequence_part
    FROM public.inspections_dea
    WHERE data_referencia = NEW.data_referencia;

    NEW.protocolo := 'DEA-' || date_part || '-' || LPAD(sequence_part::TEXT, 2, '0');

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_dea_protocol ON public.inspections_dea;
CREATE TRIGGER set_dea_protocol
    BEFORE INSERT ON public.inspections_dea
    FOR EACH ROW EXECUTE FUNCTION public.generate_dea_protocol();


-- Update Overview View (Drop and Recreate to include DEA)
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
    'finalizado'::public.inspection_status_chamado as status,
    criado_em,
    criado_em as finalizado_em,
    origem || ' - ' || COALESCE(modelo, '') as resumo
FROM public.inspections_ac
UNION ALL
SELECT
    id,
    'cafe_agua' as tipo,
    localizacao,
    status,
    criado_em,
    finalizado_em,
    item as resumo
FROM public.inspections_copa
UNION ALL
SELECT
    id,
    'cilindros' as tipo,
    'Cilindros' as localizacao,
    'finalizado'::public.inspection_status_chamado as status,
    criado_em,
    criado_em as finalizado_em,
    'Inspeção Diária' as resumo
FROM public.inspecoes_cilindros
UNION ALL
SELECT
    id,
    'dea' as tipo,
    localizacao,
    'finalizado'::public.inspection_status_chamado as status,
    criado_em,
    criado_em as finalizado_em,
    'Bateria: ' || bateria_porcentagem || '%' as resumo
FROM public.inspections_dea;
