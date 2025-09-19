-- ========================================
-- CRIAÇÃO DO PRIMEIRO USUÁRIO ADMINISTRADOR
-- Sistema DataScope - Setup Inicial
-- ========================================

-- SITUAÇÃO ATUAL IDENTIFICADA:
-- ✓ Sistema completamente vazio (0 usuários, 0 roles, 0 empresas)
-- ✓ Estrutura de tabelas criada e funcionando
-- ✓ Políticas RLS ativas e configuradas
-- ✓ Sistema de permissões implementado

-- ========================================
-- PASSO 1: REGISTRO VIA INTERFACE WEB
-- ========================================

/*
IMPORTANTE: O primeiro passo DEVE ser feito via interface da aplicação DataScope

1. Acesse a aplicação DataScope no navegador
2. Clique em "Registrar" ou "Sign Up"
3. Use o email: santananegociosdigitais@gmail.com
4. Defina uma senha segura
5. Complete o processo de verificação de email
6. Faça login na aplicação

APÓS O REGISTRO, execute os scripts SQL abaixo no SQL Editor do Supabase.
*/

-- ========================================
-- PASSO 2: VERIFICAR USUÁRIO CRIADO
-- ========================================

-- Execute este comando primeiro para encontrar o ID do usuário recém-criado
SELECT 
    'USUÁRIO RECÉM-CRIADO' as status,
    p.id as user_id,
    p.display_name,
    p.phone,
    p.created_at,
    'Aguardando atribuição de role' as proximo_passo
FROM public.profiles p 
ORDER BY p.created_at DESC 
LIMIT 3;

-- ========================================
-- PASSO 3: ATRIBUIR ROLE DE DEVELOPER
-- ========================================

-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo ID encontrado no passo anterior
-- Exemplo: INSERT INTO public.user_roles (user_id, role) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'developer');

/*
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'developer');
*/

-- ========================================
-- PASSO 4: CRIAR EMPRESA PRINCIPAL
-- ========================================

-- Criar a empresa "Santana Negócios Digitais"
INSERT INTO public.companies (
    name, 
    description,
    created_at
) VALUES (
    'Santana Negócios Digitais',
    'Empresa principal do sistema DataScope',
    NOW()
);

-- ========================================
-- PASSO 5: VINCULAR USUÁRIO À EMPRESA
-- ========================================

-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo mesmo ID usado no passo 3
/*
INSERT INTO public.company_memberships (user_id, company_id, role, added_by)
VALUES (
    'SEU_USER_ID_AQUI',
    (SELECT id FROM public.companies WHERE name = 'Santana Negócios Digitais'),
    'admin',
    'SEU_USER_ID_AQUI'
);
*/

-- ========================================
-- PASSO 6: VERIFICAÇÃO FINAL
-- ========================================

-- Execute este comando para confirmar que tudo foi criado corretamente
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    p.display_name as usuario,
    ur.role as role_sistema,
    c.name as empresa,
    cm.role as papel_na_empresa,
    'Setup completo!' as resultado
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
JOIN public.company_memberships cm ON cm.user_id = p.id
JOIN public.companies c ON c.id = cm.company_id
WHERE ur.role = 'developer'
ORDER BY p.created_at DESC;

-- ========================================
-- COMANDOS PRONTOS PARA COPIAR E COLAR
-- ========================================

/*
APÓS ENCONTRAR O USER_ID, copie e cole estes comandos (substituindo o ID):

-- Atribuir role de developer
INSERT INTO public.user_roles (user_id, role)
VALUES ('COLE_SEU_USER_ID_AQUI', 'developer');

-- Vincular à empresa
INSERT INTO public.company_memberships (user_id, company_id, role, added_by)
VALUES (
    'COLE_SEU_USER_ID_AQUI',
    (SELECT id FROM public.companies WHERE name = 'Santana Negócios Digitais'),
    'admin',
    'COLE_SEU_USER_ID_AQUI'
);
*/

-- ========================================
-- TESTE DE PERMISSÕES
-- ========================================

-- Após completar o setup, execute este teste para verificar as permissões
SELECT 
    'TESTE DE PERMISSÕES' as categoria,
    mp.module_name,
    mp.role_name,
    mp.permissions,
    mp.is_active,
    'Permissões ativas para developer' as status
FROM public.module_permissions mp
WHERE mp.role_name = 'developer'
AND mp.is_active = true
ORDER BY mp.module_name;

-- ========================================
-- PRÓXIMOS PASSOS APÓS SETUP
-- ========================================

/*
APÓS COMPLETAR O SETUP DO PRIMEIRO USUÁRIO:

1. ✅ Faça login na aplicação com o email: santananegociosdigitais@gmail.com
2. ✅ Verifique se tem acesso à área de desenvolvedor
3. ✅ Teste a criação de outros usuários via interface
4. ✅ Verifique os painéis de Business Intelligence
5. ✅ Teste as funcionalidades de cada módulo

ESTRUTURA DE PERMISSÕES CRIADA:
- Developer: Acesso total a todos os módulos
- Admin: Gestão de empresa e usuários
- Organizer: Gestão de processos e entrevistas  
- Interviewer: Apenas coleta de dados

MÓDULOS DISPONÍVEIS:
- leads: Captação de leads e pesquisas
- surveys: Pesquisas e questionários
- raffles: Sistema de sorteios
- business_intelligence: Painéis e relatórios
- feedback: Feedback da feira (organizer only)
- custom_surveys: Pesquisas personalizadas (fair_organizer only)
*/