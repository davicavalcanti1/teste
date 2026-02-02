-- ============================================================================
-- SCRIPT DE LIMPEZA DO BANCO DE DADOS - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================================
-- Data: 2026-01-30
-- Propósito: Remover tabelas não utilizadas no projeto
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute (Run)
-- ============================================================================

-- Desabilitar verificações temporariamente para facilitar a exclusão
SET session_replication_role = 'replica';

-- ============================================================================
-- EXCLUINDO TABELAS NÃO UTILIZADAS
-- ============================================================================

-- 1. Drop maintenance_records table if exists
DROP TABLE IF EXISTS public.maintenance_records CASCADE;

-- 2. Drop operacional_chamados table if exists
DROP TABLE IF EXISTS public.operacional_chamados CASCADE;

-- 3. Drop qr_maintenances table if exists
DROP TABLE IF EXISTS public.qr_maintenances CASCADE;

-- 4. Drop qr_tickets table if exists
DROP TABLE IF EXISTS public.qr_tickets CASCADE;

-- 5. Drop protocol_sequences table if exists
DROP TABLE IF EXISTS public.protocol_sequences CASCADE;

-- Reabilitar verificações
SET session_replication_role = 'origin';

-- ============================================================================
-- VERIFICAÇÃO FINAL - Listar todas as tabelas restantes
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ Limpeza concluída com sucesso!';
  RAISE NOTICE 'Tabelas removidas: maintenance_records, operacional_chamados, qr_maintenances, qr_tickets, protocol_sequences';
END $$;
