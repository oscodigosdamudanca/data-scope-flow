-- Script para desabilitar temporariamente RLS e criar o usuário Gilberto Santana
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Desabilitar RLS temporariamente nas tabelas necessárias
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships DISABLE ROW LEVEL SECURITY;

-- 2. Inserir o usuário Gilberto Santana
DO $$
DECLARE
    gilberto_id UUID := 'c38ddc95-4fd9-46d0-9353-d42a7be80bba';
    company_id UUID := gen_random_uuid();
BEGIN
    -- Inserir o profile
    INSERT INTO public.profiles (id, display_name, phone, created_at, updated_at)
    VALUES (
        gilberto_id,
        'Gilberto Santana',
        '(85) 99999-9999',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();

    -- Inserir o role de desenvolvedor
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (
        gilberto_id,
        'developer',
        NOW()
    )
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Criar empresa exemplo
    INSERT INTO public.companies (
        id, name, cnpj, email, phone, address, city, state, zip_code, website, created_at, updated_at
    )
    VALUES (
        company_id,
        'DataScope Analytics',
        '00.000.000/0001-00',
        'contato@datascopeanalytics.com',
        '(85) 99999-9999',
        'Rua Exemplo, 123',
        'Fortaleza',
        'CE',
        '60000-000',
        'https://datascopeanalytics.com',
        NOW(),
        NOW()
    );

    -- Criar membership
    INSERT INTO public.company_memberships (user_id, company_id, role, created_at)
    VALUES (
        gilberto_id,
        company_id,
        'admin',
        NOW()
    );

    RAISE NOTICE 'Usuário Gilberto Santana criado com sucesso!';
    RAISE NOTICE 'ID do usuário: %', gilberto_id;
    RAISE NOTICE 'ID da empresa: %', company_id;

END $$;

-- 3. Reabilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se o usuário foi criado corretamente
SELECT 
    'Profile' as tipo,
    p.id::text as id,
    p.display_name,
    p.phone,
    p.created_at
FROM public.profiles p 
WHERE p.display_name = 'Gilberto Santana'

UNION ALL

SELECT 
    'Role' as tipo,
    ur.user_id::text as id,
    ur.role::text as display_name,
    '' as phone,
    ur.created_at
FROM public.user_roles ur
JOIN public.profiles p ON p.id = ur.user_id
WHERE p.display_name = 'Gilberto Santana'

UNION ALL

SELECT 
    'Company' as tipo,
    c.id::text as id,
    c.name as display_name,
    c.phone,
    c.created_at
FROM public.companies c
WHERE c.name = 'DataScope Analytics'

UNION ALL

SELECT 
    'Membership' as tipo,
    cm.user_id::text as id,
    cm.role::text as display_name,
    '' as phone,
    cm.created_at
FROM public.company_memberships cm
JOIN public.profiles p ON p.id = cm.user_id
WHERE p.display_name = 'Gilberto Santana';