-- Migration to clean up unused tables from database
-- Created: 2026-01-30
-- Purpose: Remove tables that are not being used in the application

-- Drop unused tables (these are not referenced anywhere in the codebase)

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

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'Database cleanup completed. Removed unused tables: maintenance_records, operacional_chamados, qr_maintenances, qr_tickets, protocol_sequences';
END $$;
