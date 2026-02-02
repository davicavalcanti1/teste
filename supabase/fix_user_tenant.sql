-- SCRIPT DE CORREÇÃO DE TENANT PARA NOVO USUÁRIO
-- Este script move o usuário 'davicavalcantiaraujo1@gmail.com' para o mesmo Tenant (Empresa) do primeiro administrador encontrado.
-- Execute isso no Editor SQL do Supabase.

DO $$
DECLARE
  target_email TEXT := 'davicavalcantiaraujo1@gmail.com';
  target_user_id UUID;
  admin_tenant_id UUID;
  current_tenant_id UUID;
BEGIN
  -- 1. Buscar o ID do usuário alvo
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Usuário % não encontrado na tabela auth.users.', target_email;
    RETURN;
  END IF;

  -- 2. Buscar o Tenant do primeiro Administrador (assumindo que é o Tenant correto)
  -- Buscamos na tabela user_roles alguém com role 'admin'
  SELECT tenant_id INTO admin_tenant_id 
  FROM public.user_roles 
  WHERE role = 'admin' 
  LIMIT 1;

  IF admin_tenant_id IS NULL THEN
     -- Fallback: Tentar pegar da tabela tenants se houver apenas um
     SELECT id INTO admin_tenant_id FROM public.tenants LIMIT 1;
  END IF;

  IF admin_tenant_id IS NULL THEN
    RAISE NOTICE 'Não foi possível determinar o Tenant principal (Admin não encontrado).';
    RETURN;
  END IF;

  -- 3. Atualizar (ou Criar) Profile
  -- Verifica se o profile já existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    -- Atualiza tenant_id
    UPDATE public.profiles 
    SET tenant_id = admin_tenant_id 
    WHERE id = target_user_id;
    RAISE NOTICE 'Profile do usuário atualizado para Tenant %', admin_tenant_id;
  ELSE
    -- Cria profile se não existir (caso o trigger tenha falhado totalmente)
    INSERT INTO public.profiles (id, tenant_id, full_name, email)
    VALUES (
      target_user_id, 
      admin_tenant_id, 
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = target_user_id),
      target_email
    );
    RAISE NOTICE 'Profile criado manualmente para Tenant %', admin_tenant_id;
  END IF;

  -- 4. Atualizar (ou Criar) User Role
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id) THEN
    UPDATE public.user_roles 
    SET tenant_id = admin_tenant_id 
    WHERE user_id = target_user_id;
  ELSE
    INSERT INTO public.user_roles (user_id, tenant_id, role)
    VALUES (target_user_id, admin_tenant_id, 'user');
  END IF;

  RAISE NOTICE 'Sucesso! O usuário % agora deve aparecer na lista de usuários.', target_email;

END $$;
