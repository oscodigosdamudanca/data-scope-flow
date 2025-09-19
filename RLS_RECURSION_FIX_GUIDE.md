# 🔧 Guia de Correção: Recursão Infinita nas Políticas RLS

## 📋 Resumo do Problema

**Problema Identificado:** Recursão infinita nas políticas RLS da tabela `company_memberships` e tabelas relacionadas.

**Causa Raiz:** As políticas RLS usavam funções `is_company_admin()` e `is_company_member()` que consultavam a própria tabela `company_memberships`, criando um loop infinito.

**Impacto:** 
- Impossibilidade de acessar tabelas principais (`companies`, `company_memberships`)
- Erros de "stack depth limit exceeded"
- Falha nos relacionamentos entre tabelas
- Sistema inacessível para usuários

## 🔍 Análise Técnica

### Funções Problemáticas Identificadas:

```sql
-- ❌ PROBLEMÁTICA: Consulta company_memberships dentro de política RLS da mesma tabela
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid, _company_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_memberships  -- ← RECURSÃO AQUI!
    WHERE user_id = _user_id AND company_id = _company_id AND role = 'admin'
  );
$$;
```

### Políticas Problemáticas:

```sql
-- ❌ RECURSÃO: Política usa função que consulta a própria tabela
CREATE POLICY "Memberships: select member or developer" ON public.company_memberships
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR public.is_company_member(auth.uid(), company_id)  -- ← RECURSÃO!
);
```

## 🛠️ Solução Implementada

### Passo 1: Remover Políticas Problemáticas
**Arquivo:** `fix_rls_recursion.sql`

- Desabilitar RLS temporariamente
- Remover todas as políticas existentes de `company_memberships`
- Criar políticas diretas sem dependência de funções recursivas

### Passo 2: Criar Políticas Seguras
**Arquivo:** `create_safe_rls_policies.sql`

- Políticas diretas usando consultas EXISTS
- Evitar funções que consultam a mesma tabela
- Aplicar correções em `companies`, `leads`, `surveys`

### Passo 3: Teste de Validação
**Arquivo:** `test_rls_fix.js`

- Verificar ausência de recursão infinita
- Testar acesso às tabelas principais
- Validar funcionamento do RLS
- Confirmar relacionamentos

## 📝 Scripts de Correção

### 1. Correção Principal (`fix_rls_recursion.sql`)
```bash
# Execute no Supabase SQL Editor ou via CLI
psql -h [HOST] -U [USER] -d [DATABASE] -f fix_rls_recursion.sql
```

### 2. Políticas Seguras (`create_safe_rls_policies.sql`)
```bash
# Execute após o script principal
psql -h [HOST] -U [USER] -d [DATABASE] -f create_safe_rls_policies.sql
```

### 3. Teste de Validação (`test_rls_fix.js`)
```bash
# Execute para verificar se a correção funcionou
node test_rls_fix.js
```

## ✅ Políticas Seguras Implementadas

### Company Memberships (Sem Recursão)
```sql
-- ✅ SEGURA: Verificação direta sem funções recursivas
CREATE POLICY "company_memberships_select_safe" ON public.company_memberships
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR user_id = auth.uid()  -- ← Verificação direta, sem recursão
);
```

### Companies (Consulta Direta)
```sql
-- ✅ SEGURA: EXISTS direto na tabela de memberships
CREATE POLICY "companies_select_safe" ON public.companies
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = companies.id AND cm.user_id = auth.uid()
  )
);
```

## 🚨 Pontos Críticos de Atenção

### ❌ O que NÃO fazer:
1. **Nunca** criar funções que consultam a mesma tabela onde a política será aplicada
2. **Evitar** referências circulares entre políticas RLS
3. **Não** usar funções `SECURITY DEFINER` que consultam tabelas com RLS ativo

### ✅ Boas Práticas:
1. **Usar** consultas EXISTS diretas nas políticas
2. **Verificar** sempre se há recursão antes de aplicar políticas
3. **Testar** políticas em ambiente de desenvolvimento primeiro
4. **Documentar** todas as mudanças em políticas RLS

## 🔄 Processo de Aplicação

### Ordem de Execução (OBRIGATÓRIA):
1. **Backup** do banco antes de qualquer alteração
2. **Executar** `fix_rls_recursion.sql` (corrige company_memberships)
3. **Executar** `create_safe_rls_policies.sql` (corrige outras tabelas)
4. **Testar** com `test_rls_fix.js`
5. **Verificar** funcionamento da aplicação

### Rollback (Se Necessário):
```sql
-- Em caso de problemas, desabilitar RLS temporariamente
ALTER TABLE public.company_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys DISABLE ROW LEVEL SECURITY;
```

## 📊 Verificação de Sucesso

### Indicadores de Correção:
- ✅ Tabelas acessíveis sem erro de "stack depth limit"
- ✅ Relacionamentos funcionando normalmente
- ✅ RLS ativo e funcionando corretamente
- ✅ Aplicação conectando sem erros

### Comandos de Verificação:
```sql
-- Verificar RLS ativo
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('companies', 'company_memberships', 'leads', 'surveys');

-- Contar políticas
SELECT tablename, COUNT(*) FROM pg_policies 
WHERE tablename IN ('companies', 'company_memberships', 'leads', 'surveys')
GROUP BY tablename;
```

## 🎯 Resultado Esperado

Após aplicar todas as correções:
- **Sistema totalmente funcional** sem recursão infinita
- **RLS ativo e seguro** em todas as tabelas
- **Políticas otimizadas** sem impacto na performance
- **Aplicação conectando** normalmente ao banco

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verificar logs do Supabase
2. Executar script de teste
3. Consultar esta documentação
4. Revisar políticas aplicadas

---
**Data da Correção:** Janeiro 2025  
**Versão:** 1.0  
**Status:** ✅ Implementado e Testado