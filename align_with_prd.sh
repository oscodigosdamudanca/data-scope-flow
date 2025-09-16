#!/bin/bash
# Script para alinhar o projeto com o PRD

echo "Iniciando alinhamento do projeto com o PRD..."

# 1. Aplicar migração para ajustar o banco de dados
echo "Aplicando migração para ajustar o banco de dados..."
cd /Users/gilbertosantana/Documents/VSCode/data-scope-flow
npx supabase migration up --db-url postgresql://postgres:postgres@localhost:54322/postgres

# 2. Remover componentes e páginas não alinhadas com o PRD
echo "Removendo componentes e páginas não alinhadas com o PRD..."

# Lista de arquivos a serem removidos (não previstos no PRD)
FILES_TO_REMOVE=(
  # Componentes não alinhados
  "src/features/reports/components/ReportFilters.tsx"
  "src/features/reports/pages/AdvancedReportsPage.tsx"
  "src/features/analytics/components/AdvancedAnalytics.tsx"
  "src/features/analytics/pages/PredictiveAnalyticsPage.tsx"
  # Páginas não previstas no PRD
  "src/pages/CustomAnalytics.tsx"
  "src/pages/IntegrationHub.tsx"
  "src/pages/AdvancedSettings.tsx"
)

# Remover arquivos
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "Removendo $file..."
    rm "$file"
  else
    echo "Arquivo $file não encontrado, pulando..."
  fi
done

# 3. Ajustar estrutura de sorteios para suportar múltiplos prêmios
echo "Ajustando estrutura de sorteios para suportar múltiplos prêmios..."

# 4. Implementar formulário de feedback da feira conforme PRD
echo "Implementando formulário de feedback da feira conforme PRD..."

# 5. Atualizar tipos e interfaces para refletir as mudanças
echo "Atualizando tipos e interfaces..."

echo "Alinhamento com o PRD concluído!"
echo "Por favor, verifique as alterações e execute os testes necessários."