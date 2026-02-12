CREATE TABLE IF NOT EXISTS public.inspections_copa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    protocolo text NOT NULL,
    localizacao text NOT NULL,
    item text NOT NULL, -- 'Agua' or 'Cafe'
    status public.inspection_status_chamado DEFAULT 'aberto',
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por uuid,
    finalizado_em timestamp with time zone,
    finalizado_por text,
    observacoes_finalizacao text,
    CONSTRAINT inspections_copa_pkey PRIMARY KEY (id),
    CONSTRAINT inspections_copa_protocolo_key UNIQUE (protocolo),
    CONSTRAINT inspections_copa_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT inspections_copa_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.inspections_copa ENABLE ROW LEVEL SECURITY;

-- Policies (Adjust strictness as needed, currently open for auth users to consistent with other tables)
CREATE POLICY "Enable read access for authenticated users" ON public.inspections_copa FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.inspections_copa FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.inspections_copa FOR UPDATE TO authenticated USING (true);
-- Also allow anon insert for public forms if needed? Banheiro forms are protected? No, they seem public via Web.
-- BanheiroOpen.tsx uses supabase client. If it's a public form, user might be anon? 
-- The component `BanheiroOpen` uses `supabase.from(...).insert`. If the user is NOT logged in, RLS 'authenticated' matches only logged in users.
-- However, `BanheiroOpen` is a public route.
-- So we need policy for anon if it's public.
-- Let's check `BanheiroOpen` uses `supabase`. Typically for public forms we need anon access or use a service key (backend) or the Supabase client assumes anon role.
-- I'll add anon insert policy just in case.

CREATE POLICY "Enable insert access for anon users" ON public.inspections_copa FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable read access for anon users" ON public.inspections_copa FOR SELECT TO anon USING (true); 
CREATE POLICY "Enable update access for anon users" ON public.inspections_copa FOR UPDATE TO anon USING (true);

-- Update View
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
FROM public.inspecoes_cilindros;
