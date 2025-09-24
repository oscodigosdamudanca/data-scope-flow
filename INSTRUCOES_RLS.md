# 🔒 Instruções para Correção de Políticas RLS - DataScope Flow

## ⚠️ SITUAÇÃO ATUAL
O teste de segurança identificou que **TODAS as 8 tabelas principais** estão com RLS **INATIVO**, permitindo acesso sem autenticação. Isso representa um **risco crítico de segurança**.

### Tabelas Afetadas:
- ❌ `profiles` - RLS INATIVO
- ❌ `companies` - RLS INATIVO  
- ❌ `company_memberships` - RLS INATIVO
- ❌ `leads` - RLS INATIVO
- ❌ `surveys` - RLS INATIVO
- ❌ `survey_questions` - RLS INATIVO
- ❌ `survey_responses` - RLS INATIVO
- ❌ `user_roles` - RLS INATIVO

---

## 🚀 SOLUÇÃO: Aplicação Manual via Supabase Dashboard

### Passo 1: Acessar o SQL Editor
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto DataScope Flow
3. No menu lateral, clique em **"SQL Editor"**

### Passo 2: Executar o Script de Correção
1. Abra o arquivo `rls_fix_manual.sql` (localizado na raiz do projeto)
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **"Run"** para executar

### Passo 3: Verificar a Aplicação
Após executar o script, execute o teste de verificação:
```bash
node test_rls_status.js
```

**Resultado esperado:** Todas as tabelas devem mostrar `✅ RLS ATIVO`

---

## 📋 O que o Script Faz

### 1. Habilita RLS em Todas as Tabelas
```sql
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
-- ... (todas as 8 tabelas)
```

### 2. Remove Políticas Conflitantes
- Remove políticas duplicadas ou mal configuradas
- Limpa conflitos que impedem o RLS de funcionar

### 3. Cria Políticas Seguras
- **Profiles**: Usuários só veem seus próprios dados
- **Companies**: Acesso apenas para membros da empresa
- **Leads**: Isolamento por empresa
- **Surveys**: Controle baseado em propriedade
- **E muito mais...**

---

## 🔍 Validação Pós-Aplicação

### Teste Rápido
```bash
# Execute este comando para verificar o status
node test_rls_status.js
```

### Resultado Esperado
```
✅ Tabelas seguras (RLS ativo): 8
❌ Tabelas inseguras (RLS inativo): 0

🎉 Todas as tabelas estão seguras!
```

---

## 🆘 Troubleshooting

### Se o RLS ainda estiver inativo:
1. **Verifique se executou TODO o script** (280 linhas)
2. **Confirme se não houve erros** durante a execução
3. **Execute novamente** o script completo
4. **Aguarde alguns segundos** e teste novamente

### Se houver erros de permissão:
- Certifique-se de estar usando uma conta com **privilégios de administrador**
- Verifique se está no **projeto correto**

---

## 📞 Próximos Passos

Após aplicar as correções RLS:

1. ✅ **Validar segurança** - Execute `node test_rls_status.js`
2. 🧪 **Testar operações CRUD** - Execute `node tests/crud-operations-test.js`
3. ⚡ **Otimizar queries** - Adicionar índices necessários
4. 🚀 **Deploy em produção** - Aplicar as mesmas correções no ambiente de produção

---

## ⚡ Importância Crítica

**Esta correção é URGENTE** pois:
- 🔓 Dados estão expostos publicamente
- 🚨 Violação de privacidade e LGPD
- 💼 Risco para dados empresariais
- 🎯 Comprometimento da segurança do sistema

**Execute IMEDIATAMENTE as correções!**