# 🔧 GUIA DE EXECUÇÃO MANUAL DAS CORREÇÕES CRÍTICAS

## ⚠️ IMPORTANTE: EXECUÇÃO OBRIGATÓRIA NO SUPABASE DASHBOARD

As correções foram preparadas e validadas, mas **DEVEM SER EXECUTADAS MANUALMENTE** no Supabase Dashboard para serem aplicadas ao banco de dados real.

---

## 📋 PASSO A PASSO PARA EXECUÇÃO:

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/bhjreswsrfvnzyvmxtwj/sql
- Faça login com suas credenciais
- Navegue até o projeto: **bhjreswsrfvnzyvmxtwj**

### 2. Abra o SQL Editor
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"** para criar uma nova consulta

### 3. Execute o Script de Correções
- Abra o arquivo: `critical_fixes_complete.sql`
- **COPIE TODO O CONTEÚDO** do arquivo
- **COLE NO SQL EDITOR** do Supabase
- Clique em **"Run"** para executar

### 4. Verifique a Execução
Após executar, você deve ver mensagens de sucesso para:
- ✅ Coluna `email` adicionada à tabela `profiles`
- ✅ Tabela `module_permissions` criada
- ✅ View `user_module_permissions` criada
- ✅ RLS habilitado nas tabelas críticas
- ✅ Políticas RLS implementadas
- ✅ Dados de permissões populados

---

## 🔍 VERIFICAÇÕES PÓS-EXECUÇÃO:

Execute estas consultas no SQL Editor para verificar se tudo foi aplicado:

```sql
-- 1. Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'companies', 'leads', 'surveys', 'module_permissions')
AND schemaname = 'public';

-- 3. Verificar permissões populadas
SELECT COUNT(*) as total_permissions FROM module_permissions;

-- 4. Verificar view criada
SELECT viewname FROM pg_views 
WHERE viewname = 'user_module_permissions' AND schemaname = 'public';
```

---

## 📊 RESULTADOS ESPERADOS:

### Tabela profiles:
- Deve conter a coluna `email` (VARCHAR 255)
- RLS deve estar habilitado (`rowsecurity = true`)

### Tabela module_permissions:
- Deve existir e ser acessível
- Deve conter 18 registros de permissões
- RLS deve estar habilitado

### View user_module_permissions:
- Deve existir no schema public
- Deve combinar usuários com permissões baseadas no role

### Políticas RLS:
- Devem permitir acesso adequado baseado no role do usuário
- Devem isolar dados por empresa

---

## 🚨 EM CASO DE ERRO:

Se alguma parte falhar:

1. **Anote o erro específico**
2. **Execute as correções em partes menores**
3. **Verifique se há conflitos de políticas existentes**
4. **Consulte os logs do Supabase para detalhes**

---

## 📝 PRÓXIMOS PASSOS APÓS EXECUÇÃO:

1. ✅ Execute o script completo no Dashboard
2. ✅ Verifique todas as consultas de validação
3. ✅ Execute novamente os testes de validação: `node test_permissions_validation.js`
4. ✅ Confirme que a taxa de sucesso melhorou significativamente

---

## 📁 ARQUIVOS RELACIONADOS:

- `critical_fixes_complete.sql` - Script SQL completo
- `critical_fixes_instructions.md` - Instruções detalhadas
- `corrections_execution_report.json` - Relatório de preparação
- `test_permissions_validation.js` - Script de validação

---

## ⏰ TEMPO ESTIMADO: 5-10 minutos

**IMPORTANTE**: Não prossiga com outros testes até que este script seja executado com sucesso no Supabase Dashboard!