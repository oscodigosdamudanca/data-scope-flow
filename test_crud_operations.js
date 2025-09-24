/**
 * =====================================================
 * TESTE DE OPERAÇÕES CRUD
 * =====================================================
 * 
 * Script para testar operações básicas de Create, Read, 
 * Update e Delete nas tabelas principais do sistema.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tabelas para testar operações CRUD
const TEST_TABLES = [
  {
    name: 'companies',
    testData: {
      name: 'Empresa Teste CRUD',
      cnpj: '12345678000199',
      email: 'teste@empresa.com'
    },
    updateData: {
      name: 'Empresa Teste CRUD Atualizada'
    }
  },
  {
    name: 'leads',
    testData: {
      name: 'Lead Teste',
      email: 'lead@teste.com',
      phone: '11999999999'
    },
    updateData: {
      name: 'Lead Teste Atualizado'
    }
  },
  {
    name: 'surveys',
    testData: {
      title: 'Survey Teste CRUD',
      description: 'Descrição do survey de teste'
    },
    updateData: {
      title: 'Survey Teste CRUD Atualizado'
    }
  }
];

class CRUDTester {
  constructor() {
    this.results = [];
  }

  async testCreate(table) {
    console.log(`\n📝 Testando CREATE em ${table.name}...`);
    
    try {
      const { data, error } = await supabase
        .from(table.name)
        .insert(table.testData)
        .select()
        .single();

      if (error) {
        console.log(`❌ CREATE falhou: ${error.message}`);
        return { operation: 'CREATE', table: table.name, success: false, error: error.message };
      }

      console.log(`✅ CREATE bem-sucedido - ID: ${data.id}`);
      return { operation: 'CREATE', table: table.name, success: true, data, id: data.id };
    } catch (err) {
      console.log(`💥 CREATE erro: ${err.message}`);
      return { operation: 'CREATE', table: table.name, success: false, error: err.message };
    }
  }

  async testRead(table, id = null) {
    console.log(`\n👀 Testando READ em ${table.name}...`);
    
    try {
      let query = supabase.from(table.name).select('*');
      
      if (id) {
        query = query.eq('id', id).single();
      } else {
        query = query.limit(5);
      }

      const { data, error } = await query;

      if (error) {
        console.log(`❌ READ falhou: ${error.message}`);
        return { operation: 'READ', table: table.name, success: false, error: error.message };
      }

      const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
      console.log(`✅ READ bem-sucedido - ${count} registro(s) encontrado(s)`);
      return { operation: 'READ', table: table.name, success: true, count };
    } catch (err) {
      console.log(`💥 READ erro: ${err.message}`);
      return { operation: 'READ', table: table.name, success: false, error: err.message };
    }
  }

  async testUpdate(table, id) {
    console.log(`\n✏️ Testando UPDATE em ${table.name}...`);
    
    try {
      const { data, error } = await supabase
        .from(table.name)
        .update(table.updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.log(`❌ UPDATE falhou: ${error.message}`);
        return { operation: 'UPDATE', table: table.name, success: false, error: error.message };
      }

      console.log(`✅ UPDATE bem-sucedido`);
      return { operation: 'UPDATE', table: table.name, success: true, data };
    } catch (err) {
      console.log(`💥 UPDATE erro: ${err.message}`);
      return { operation: 'UPDATE', table: table.name, success: false, error: err.message };
    }
  }

  async testDelete(table, id) {
    console.log(`\n🗑️ Testando DELETE em ${table.name}...`);
    
    try {
      const { error } = await supabase
        .from(table.name)
        .delete()
        .eq('id', id);

      if (error) {
        console.log(`❌ DELETE falhou: ${error.message}`);
        return { operation: 'DELETE', table: table.name, success: false, error: error.message };
      }

      console.log(`✅ DELETE bem-sucedido`);
      return { operation: 'DELETE', table: table.name, success: true };
    } catch (err) {
      console.log(`💥 DELETE erro: ${err.message}`);
      return { operation: 'DELETE', table: table.name, success: false, error: err.message };
    }
  }

  async testTableCRUD(table) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 TESTANDO CRUD COMPLETO: ${table.name.toUpperCase()}`);
    console.log(`${'='.repeat(50)}`);

    const tableResults = [];
    let createdId = null;

    // 1. Testar CREATE
    const createResult = await this.testCreate(table);
    tableResults.push(createResult);
    
    if (createResult.success) {
      createdId = createResult.id;
    }

    // 2. Testar READ (geral)
    const readResult = await this.testRead(table);
    tableResults.push(readResult);

    // 3. Testar READ (específico) - se temos um ID
    if (createdId) {
      const readSpecificResult = await this.testRead(table, createdId);
      tableResults.push(readSpecificResult);
    }

    // 4. Testar UPDATE - se temos um ID
    if (createdId) {
      const updateResult = await this.testUpdate(table, createdId);
      tableResults.push(updateResult);
    }

    // 5. Testar DELETE - se temos um ID
    if (createdId) {
      const deleteResult = await this.testDelete(table, createdId);
      tableResults.push(deleteResult);
    }

    return tableResults;
  }

  async runAllCRUDTests() {
    console.log('🚀 Iniciando testes CRUD completos...\n');
    
    for (const table of TEST_TABLES) {
      const tableResults = await this.testTableCRUD(table);
      this.results.push(...tableResults);
      
      // Pausa entre tabelas
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS TESTES CRUD');
    console.log('='.repeat(60));

    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`✅ Operações bem-sucedidas: ${successful.length}`);
    console.log(`❌ Operações falharam: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\n⚠️  OPERAÇÕES QUE FALHARAM:');
      failed.forEach(result => {
        console.log(`   - ${result.operation} em ${result.table}: ${result.error}`);
      });
    }

    // Resumo por tabela
    console.log('\n📋 RESUMO POR TABELA:');
    TEST_TABLES.forEach(table => {
      const tableResults = this.results.filter(r => r.table === table.name);
      const tableSuccess = tableResults.filter(r => r.success).length;
      const tableTotal = tableResults.length;
      
      console.log(`   ${table.name}: ${tableSuccess}/${tableTotal} operações bem-sucedidas`);
    });

    console.log('\n' + '='.repeat(60));
  }
}

// Executar os testes
const tester = new CRUDTester();
tester.runAllCRUDTests().catch(console.error);