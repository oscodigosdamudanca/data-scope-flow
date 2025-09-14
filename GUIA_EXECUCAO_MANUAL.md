# 🚀 Guia de Execução Manual - Configuração do Banco de Dados

## 📋 Visão Geral

Este guia fornece instruções detalhadas para configurar manualmente as tabelas do banco de dados no painel do Supabase, contornando problemas com o MCP e migrações automáticas.

## 📁 Scripts Disponíveis

### 1. `manual_database_setup.sql` - **SCRIPT COMPLETO**
- **Uso**: Configuração completa do sistema
- **Inclui**: Companies, Company Memberships, Leads, Surveys, Questions, Responses
- **Recomendado para**: Projetos novos ou recriação completa

### 2. `leads_surveys_only_setup.sql` - **SCRIPT SIMPLIFICADO**
- **Uso**: Apenas tabelas de Leads e Surveys
- **Inclui**: Leads, Surveys, Questions, Responses (sem dependências de companies)
- **Recomendado para**: Foco específico em leads e pesquisas

### 3. `verify_manual_setup.sql` - **SCRIPT DE VERIFICAÇÃO**
- **Uso**: Validar se a configuração foi bem-sucedida
- **Inclui**: Testes de integridade, contagem de registros, verificação de políticas

## 🎯 Passo a Passo - Execução

### Etapa 1: Acessar o Painel do Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: **bhjreswsrfvnzyvmxtwj**
4. No menu lateral, clique em **"SQL Editor"**

### Etapa 2: Escolher o Script Apropriado

#### Opção A: Configuração Completa (Recomendada)
```sql
-- Copie todo o conteúdo do arquivo: manual_database_setup.sql
```

#### Opção B: Apenas Leads e Surveys
```sql
-- Copie todo o conteúdo do arquivo: leads_surveys_only_setup.sql
```

### Etapa 3: Executar o Script

1. **Cole o script** no editor SQL do Supabase
2. **Revise o conteúdo** (opcional: descomente as linhas DROP se precisar recriar)
3. Clique em **"Run"** ou pressione **Ctrl+Enter**
4. **Aguarde a execução** (pode levar alguns segundos)
5. **Verifique os logs** na parte inferior para mensagens de sucesso

### Etapa 4: Verificar a Instalação

1. **Cole e execute** o conteúdo de `verify_manual_setup.sql`
2. **Revise todos os resultados**:
   - ✅ Tabelas criadas
   - ✅ Políticas RLS ativas
   - ✅ Índices configurados
   - ✅ Triggers funcionando
   - ✅ Testes de inserção/seleção passaram

## 🔧 Resolução de Problemas

### Problema: "Tabela já existe"
**Solução**: Descomente as linhas `DROP TABLE` no início do script

### Problema: "Permissão negada"
**Solução**: Verifique se você tem permissões de administrador no projeto

### Problema: "Foreign key constraint"
**Solução**: Execute o script completo (`manual_database_setup.sql`) para criar todas as dependências

### Problema: "RLS policy error"
**Solução**: 
1. Verifique se você está autenticado
2. Use o script simplificado se não precisar de controle granular de acesso

## 📊 Estrutura das Tabelas Criadas

### Tabelas Principais
- **`companies`** - Empresas do sistema
- **`company_memberships`** - Membros das empresas
- **`leads`** - Leads/prospects
- **`surveys`** - Pesquisas
- **`survey_questions`** - Perguntas das pesquisas
- **`survey_responses`** - Respostas das pesquisas

### Recursos Configurados
- ✅ **Row Level Security (RLS)** habilitado
- ✅ **Políticas de segurança** configuradas
- ✅ **Índices otimizados** para performance
- ✅ **Triggers** para updated_at automático
- ✅ **Foreign keys** para integridade referencial
- ✅ **Dados de exemplo** para testes

## 🧪 Dados de Teste Incluídos

### Leads de Exemplo
- João Silva (joao.silva@exemplo.com)
- Maria Santos (maria.santos@exemplo.com)
- Pedro Oliveira (pedro.oliveira@exemplo.com)
- Ana Costa (ana.costa@exemplo.com)
- Carlos Ferreira (carlos.ferreira@exemplo.com)

### Surveys de Exemplo
- Pesquisa de Satisfação do Cliente
- NPS - Net Promoter Score
- Qualificação de Leads
- Feedback do Produto

## 🔄 Próximos Passos

Após a execução bem-sucedida:

1. **Gerar tipos TypeScript atualizados**:
   ```bash
   npx supabase gen types typescript --linked > database.types.ts
   ```

2. **Testar a conectividade** da aplicação

3. **Verificar as funcionalidades** de leads e surveys

4. **Configurar políticas RLS específicas** se necessário

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do SQL Editor
2. **Execute o script de verificação** para diagnóstico
3. **Revise as permissões** do usuário no projeto
4. **Consulte a documentação** do Supabase para RLS

---

**✨ Dica**: Mantenha uma cópia dos scripts para futuras referências ou para aplicar em outros projetos!