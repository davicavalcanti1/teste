-- Migration to add new columns to inspections_dea
ALTER TABLE public.inspections_dea 
ADD COLUMN IF NOT EXISTS bateria_nivel text,
ADD COLUMN IF NOT EXISTS colocou_carregar boolean DEFAULT false;

-- Update the view to reflect these changes if needed (optional but good practice)
-- The view currently uses bateria_porcentagem, which we keep.
-- We can update the resumo to be more descriptive.

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
    'Bateria: ' || COALESCE(UPPER(bateria_nivel), bateria_porcentagem || '%') || ' - Carga: ' || CASE WHEN colocou_carregar THEN 'Sim' ELSE 'Não' END as resumo
FROM public.inspections_dea;
