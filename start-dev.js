// Script para iniciar o ambiente de desenvolvimento sem Docker
import { execSync } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Verifica se as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PROJECT_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Erro: As seguintes variáveis de ambiente não estão definidas:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('Por favor, verifique seu arquivo .env');
  process.exit(1);
}

console.log('🔍 Verificando conexão com Supabase...');
try {
  // Executa o script de teste de conexão
  execSync('node test_supabase.js', { stdio: 'inherit' });
  console.log('✅ Conexão com Supabase estabelecida com sucesso!');
} catch (error) {
  console.error('❌ Erro ao conectar com Supabase:', error.message);
  process.exit(1);
}

console.log('🔄 Sincronizando tipos TypeScript com o banco de dados...');
try {
  // Executa o script de sincronização de tipos
  execSync('node sync_types.js', { stdio: 'inherit' });
  console.log('✅ Tipos sincronizados com sucesso!');
} catch (error) {
  console.error('⚠️ Aviso: Não foi possível sincronizar os tipos:', error.message);
  console.log('Continuando mesmo assim...');
}

console.log('🚀 Iniciando servidor de desenvolvimento...');
try {
  // Inicia o servidor de desenvolvimento
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro ao iniciar o servidor de desenvolvimento:', error.message);
  process.exit(1);
}