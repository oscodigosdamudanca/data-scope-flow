import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
  console.log('🔧 Aplicando correção das políticas RLS para tabela companies...\n');

  try {
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('./fix_companies_rls.sql', 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && !cmd.startsWith('/*'));

    console.log(`📋 Executando ${commands.length} comandos SQL...\n`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (!command) continue;

      console.log(`${i + 1}. Executando: ${command.substring(0, 50)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: command 
      });

      if (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error.message);
        // Continuar com os próximos comandos mesmo se houver erro
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      }
    }

    console.log('\n🎯 Testando a correção...');
    
    // Testar autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-fix-${Date.now()}@example.com`,
      password: 'test123456'
    });

    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      return;
    }

    // Fazer login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: authData.user?.email,
      password: 'test123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Usuário autenticado');

    // Tentar criar empresa
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Empresa Teste Pós-Correção',
        cnpj: '98765432000188',
        email: 'teste-pos-correcao@empresa.com',
        phone: '11888888888'
      })
      .select();

    if (companyError) {
      console.error('❌ AINDA HÁ ERRO AO CRIAR EMPRESA:', companyError.message);
      console.log('💡 Pode ser necessário aplicar as correções manualmente no painel do Supabase');
    } else {
      console.log('🎉 SUCESSO! EMPRESA CRIADA APÓS CORREÇÃO:', companyData);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.log('\n📋 INSTRUÇÕES MANUAIS:');
    console.log('1. Acesse o painel do Supabase');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o conteúdo do arquivo fix_companies_rls.sql');
    console.log('4. Teste novamente a criação de empresa');
  }
}

applyRLSFix();
