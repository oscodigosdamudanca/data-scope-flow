
# 🔧 INSTRUÇÕES PARA CORREÇÃO DOS PROBLEMAS CRÍTICOS

## Problemas Identificados:
1. ❌ Coluna 'email' faltando na tabela 'profiles'
2. ❌ Tabela 'module_permissions' com acesso restrito
3. ❌ View 'user_module_permissions' não encontrada
4. ❌ RLS desabilitado nas tabelas críticas
5. ❌ Políticas RLS inadequadas ou conflitantes
6. ❌ Dados de permissões padrão não populados

## Como Executar as Correções:

### Opção 1: Via Supabase Dashboard (RECOMENDADO)
1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Vá para o projeto: bhjreswsrfvnzyvmxtwj
3. Navegue até "SQL Editor"
4. Cole o conteúdo do arquivo 'critical_fixes_complete.sql'
5. Execute o script clicando em "Run"

### Opção 2: Via MCP Supabase (se disponível)
1. Use a função mcp_supabase__mcp_execute_sql
2. Execute cada seção do script separadamente
3. Verifique os resultados após cada execução

## Verificações Pós-Execução:
- ✅ Coluna 'email' deve aparecer na tabela 'profiles'
- ✅ Tabela 'module_permissions' deve ser acessível
- ✅ View 'user_module_permissions' deve existir
- ✅ RLS deve estar habilitado nas tabelas críticas
- ✅ Políticas RLS devem permitir acesso adequado
- ✅ Permissões padrão devem estar populadas

## Próximos Passos:
1. Execute o script SQL completo
2. Teste a conectividade com o banco
3. Verifique se as operações CRUD funcionam
4. Teste o sistema de permissões
5. Execute novamente os testes de validação

## Arquivos Gerados:
- critical_fixes_complete.sql: Script SQL completo
- critical_fixes_instructions.md: Este arquivo de instruções
