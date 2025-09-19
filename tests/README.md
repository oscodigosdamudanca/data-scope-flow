# 🧪 Testes Abrangentes MCP Supabase - DataScope

## 📋 Visão Geral

Este conjunto de testes foi desenvolvido para verificar de forma abrangente todas as funcionalidades do MCP (Model Context Protocol) Supabase no projeto DataScope. Os testes cobrem desde operações básicas até cenários complexos de performance e segurança.

## 🎯 Objetivos dos Testes

- **Verificar conectividade** com o banco de dados Supabase
- **Validar operações CRUD** em todas as tabelas principais
- **Testar autenticação** e gerenciamento de sessões
- **Avaliar segurança** e políticas RLS (Row Level Security)
- **Verificar gerenciamento de arquivos** no Supabase Storage
- **Testar APIs REST e GraphQL** do Supabase
- **Medir performance** e identificar gargalos
- **Documentar resultados** de forma detalhada

## 📁 Estrutura dos Arquivos

```
tests/
├── README.md                           # Esta documentação
├── run-comprehensive-tests.js          # Script principal orquestrador
├── supabase-comprehensive-test.js      # Framework base e utilitários
├── crud-operations-test.js             # Testes de operações CRUD
├── authentication-test.js              # Testes de autenticação
├── security-rls-test.js                # Testes de segurança e RLS
├── storage-test.js                     # Testes de gerenciamento de arquivos
├── api-test.js                         # Testes de API REST e GraphQL
└── performance-test.js                 # Testes de performance e benchmarking
```

## 🚀 Como Executar os Testes

### Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **Dependências instaladas**:
   ```bash
   npm install @supabase/supabase-js
   ```
3. **Configuração do Supabase**:
   - URL do projeto Supabase
   - Chave de API (anon key)
   - Banco de dados configurado com as tabelas necessárias

### Execução Completa

```bash
# Executar todos os testes
node tests/run-comprehensive-tests.js
```

### Execução Individual

```bash
# Apenas testes CRUD
node tests/crud-operations-test.js

# Apenas testes de autenticação
node tests/authentication-test.js

# Apenas testes de performance
node tests/performance-test.js
```

## 📊 Módulos de Teste

### 1. 🔌 Conectividade Básica
- **Arquivo**: `supabase-comprehensive-test.js`
- **Objetivo**: Verificar se a conexão com o Supabase está funcionando
- **Testes**:
  - Conexão com o banco de dados
  - Verificação de tabelas existentes
  - Teste de consulta básica

### 2. 📝 Operações CRUD
- **Arquivo**: `crud-operations-test.js`
- **Objetivo**: Validar operações de Create, Read, Update, Delete
- **Tabelas testadas**:
  - `companies` (empresas)
  - `leads` (leads/contatos)
  - `surveys` (pesquisas)
  - `profiles` (perfis de usuário)
- **Operações testadas**:
  - Inserção de registros
  - Consulta de dados
  - Atualização de registros
  - Exclusão de registros
  - Inserção em lote (batch insert)
  - Consultas complexas com filtros

### 3. 🔐 Autenticação
- **Arquivo**: `authentication-test.js`
- **Objetivo**: Testar sistema de autenticação do Supabase
- **Funcionalidades testadas**:
  - Registro de novos usuários
  - Login com email/senha
  - Logout de usuários
  - Recuperação de senha
  - Verificação de sessão ativa
  - Refresh de tokens
  - Validação de permissões
  - Testes com credenciais inválidas

### 4. 🛡️ Segurança e RLS
- **Arquivo**: `security-rls-test.js`
- **Objetivo**: Verificar políticas de segurança e Row Level Security
- **Testes de segurança**:
  - Verificação de RLS habilitado
  - Teste de políticas de acesso
  - Isolamento de dados entre usuários
  - Controle de acesso baseado em roles
  - Proteção contra SQL injection
  - Rate limiting
  - Validação de tokens JWT

### 5. 📁 Gerenciamento de Storage
- **Arquivo**: `storage-test.js`
- **Objetivo**: Testar funcionalidades de armazenamento de arquivos
- **Operações testadas**:
  - Upload de arquivos
  - Download de arquivos
  - Listagem de arquivos
  - Exclusão de arquivos
  - Políticas de acesso a buckets
  - Validação de tipos de arquivo
  - Limites de tamanho
  - Metadados de arquivos

### 6. 🌐 APIs REST e GraphQL
- **Arquivo**: `api-test.js`
- **Objetivo**: Validar endpoints de API
- **Funcionalidades testadas**:
  - Endpoints REST básicos
  - Consultas GraphQL
  - Filtros e ordenação
  - Paginação de resultados
  - Joins entre tabelas
  - Agregações (count, sum, avg)
  - Funções RPC (Remote Procedure Call)
  - Validação de respostas
  - Headers de autenticação

### 7. ⚡ Performance e Benchmarking
- **Arquivo**: `performance-test.js`
- **Objetivo**: Medir performance e identificar gargalos
- **Métricas avaliadas**:
  - Tempo de conexão inicial
  - Performance de consultas simples
  - Performance de joins complexos
  - Concorrência de requisições
  - Throughput de operações
  - Latência de rede
  - Performance de inserção em lote
  - Benchmarks comparativos

## 📈 Interpretação dos Resultados

### Status dos Testes

- **✅ PASS**: Teste executado com sucesso
- **⚠️ WARN**: Teste passou mas com alertas (performance baixa, etc.)
- **❌ FAIL**: Teste falhou
- **🚫 ERROR**: Erro crítico durante execução
- **⏭️ SKIP**: Teste pulado (dependências não atendidas)

### Métricas de Performance

- **Tempo de Conexão**: < 2s (bom), 2-5s (aceitável), > 5s (ruim)
- **Consultas Simples**: < 500ms (bom), 500ms-2s (aceitável), > 2s (ruim)
- **Joins Complexos**: < 2s (bom), 2-5s (aceitável), > 5s (ruim)
- **Throughput**: > 10 ops/sec (bom), 5-10 ops/sec (aceitável), < 5 ops/sec (ruim)
- **Latência**: < 200ms (bom), 200-500ms (aceitável), > 500ms (ruim)

### Taxa de Sucesso Geral

- **90-100%**: Excelente (EXCELLENT)
- **75-89%**: Bom (GOOD)
- **50-74%**: Regular (FAIR)
- **< 50%**: Ruim (POOR)

## 📄 Relatórios Gerados

### Relatório JSON
- **Arquivo**: `test-report.json`
- **Conteúdo**: Resultados detalhados de todos os testes
- **Uso**: Análise posterior, integração com CI/CD

### Logs Detalhados
- **Formato**: Console com cores e timestamps
- **Níveis**: INFO, WARN, FAIL, ERROR
- **Categorias**: Por módulo de teste

## 🔧 Configuração e Personalização

### Variáveis de Ambiente

```javascript
// Configurar no início dos arquivos de teste
const SUPABASE_URL = 'sua-url-do-supabase';
const SUPABASE_ANON_KEY = 'sua-chave-anonima';
```

### Dados de Teste

Os testes utilizam dados fictícios que são:
- **Criados** no início de cada teste
- **Limpos** ao final de cada teste
- **Únicos** para evitar conflitos

### Personalização de Testes

Para adicionar novos testes:

1. **Criar novo arquivo** seguindo o padrão `nome-test.js`
2. **Importar utilitários** do framework base
3. **Implementar classe** com métodos de teste
4. **Adicionar ao orquestrador** principal

## 🚨 Problemas Comuns e Soluções

### Erro de Conectividade
```
FAIL - Erro de conectividade
```
**Solução**: Verificar URL e chave do Supabase

### RLS Bloqueando Operações
```
FAIL - new row violates row-level security policy
```
**Solução**: Configurar políticas RLS adequadas

### Timeout em Testes
```
FAIL - Request timeout
```
**Solução**: Verificar conexão de rede e performance do banco

### Tabelas Não Encontradas
```
FAIL - relation "table_name" does not exist
```
**Solução**: Executar migrations do banco de dados

## 📚 Referências e Documentação

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## 🤝 Contribuição

Para contribuir com melhorias nos testes:

1. **Fork** do repositório
2. **Criar branch** para sua feature
3. **Implementar testes** seguindo os padrões
4. **Documentar** mudanças no README
5. **Submeter PR** com descrição detalhada

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- ✨ Implementação inicial do framework de testes
- ✅ Testes CRUD para todas as tabelas principais
- 🔐 Testes de autenticação e segurança
- 📁 Testes de gerenciamento de storage
- 🌐 Testes de API REST e GraphQL
- ⚡ Testes de performance e benchmarking
- 📊 Sistema de relatórios detalhados
- 📚 Documentação completa

---

**Desenvolvido para o projeto DataScope** 🎯  
**Arquitetura**: Supabase + Lovable.dev + Trae.ai  
**Objetivo**: Hub de inteligência de mercado para eventos corporativos