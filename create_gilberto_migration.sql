-- Migration para criar o usuário Gilberto Santana como desenvolvedor
-- Este script deve ser executado diretamente no SQL Editor do Supabase

-- Gerar um UUID específico para Gilberto Santana
-- Usando um UUID fixo para facilitar referências futuras
DO $$
DECLARE
    gilberto_id UUID := 'c38ddc95-4fd9-46d0-9353-d42a7be80bba';
    empresa_id UUID := gen_random_uuid();
BEGIN
    -- 1. Inserir o usuário Gilberto na tabela profiles
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

    RAISE NOTICE 'Profile criado/atualizado para Gilberto Santana com ID: %', gilberto_id;

    -- 2. Inserir o role de desenvolvedor na tabela user_roles
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (
        gilberto_id,
        'developer',
        NOW()
    )
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Role de desenvolvedor atribuído ao usuário: %', gilberto_id;

    -- 3. Criar uma empresa exemplo para o desenvolvedor
    INSERT INTO public.companies (
        id, name, cnpj, email, phone, address, city, state, zip_code, website, created_by, created_at, updated_at
    )
    VALUES (
        empresa_id,
        'DataScope Analytics',
        '00.000.000/0001-00',
        'contato@datascopeanalytics.com',
        '(85) 99999-9999',
        'Rua Exemplo, 123',
        'Fortaleza',
        'CE',
        '60000-000',
        'https://datascopeanalytics.com',
        gilberto_id,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Empresa criada com ID: %', empresa_id;

    -- 4. Criar membership do desenvolvedor com a empresa
    INSERT INTO public.company_memberships (user_id, company_id, role, created_at)
    VALUES (
        gilberto_id,
        empresa_id,
        'admin',
        NOW()
    )
    ON CONFLICT (company_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        created_at = EXCLUDED.created_at;

    RAISE NOTICE 'Membership criado entre usuário % e empresa %', gilberto_id, empresa_id;

    -- 5. Verificar se tudo foi criado corretamente
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Verificar profile
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = gilberto_id) THEN
        RAISE NOTICE '✅ Profile encontrado na tabela profiles';
    ELSE
        RAISE NOTICE '❌ Profile NÃO encontrado na tabela profiles';
    END IF;

    -- Verificar role
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = gilberto_id AND role = 'developer') THEN
        RAISE NOTICE '✅ Role de desenvolvedor encontrado';
    ELSE
        RAISE NOTICE '❌ Role de desenvolvedor NÃO encontrado';
    END IF;

    -- Verificar empresa
    IF EXISTS (SELECT 1 FROM public.companies WHERE id = empresa_id) THEN
        RAISE NOTICE '✅ Empresa encontrada';
    ELSE
        RAISE NOTICE '❌ Empresa NÃO encontrada';
    END IF;

    -- Verificar membership
    IF EXISTS (SELECT 1 FROM public.company_memberships WHERE user_id = gilberto_id AND company_id = empresa_id) THEN
        RAISE NOTICE '✅ Membership encontrado';
    ELSE
        RAISE NOTICE '❌ Membership NÃO encontrado';
    END IF;

END $$;

-- Consulta final para verificar os dados criados
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