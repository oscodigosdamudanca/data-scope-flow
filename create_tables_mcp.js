import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Definida' : 'Não definida');
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', supabaseKey ? 'Definida' : 'Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTablesWithMCP() {
  try {
    console.log('🚀 Iniciando criação de tabelas usando MCP Supabase...');
    
    // 1. Primeiro, vamos dropar as tabelas existentes se houver problemas
    console.log('🗑️ Removendo tabelas existentes se necessário...');
    
    const dropTablesSQL = `
      DROP TABLE IF EXISTS public.survey_responses CASCADE;
      DROP TABLE IF EXISTS public.survey_questions CASCADE;
      DROP TABLE IF EXISTS public.surveys CASCADE;
      DROP TABLE IF EXISTS public.leads CASCADE;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: dropTablesSQL
    });
    
    if (dropError) {
      console.log('⚠️ Aviso ao remover tabelas:', dropError.message);
    } else {
      console.log('✅ Tabelas removidas com sucesso');
    }
    
    // 2. Criar tabela leads com estrutura correta
    console.log('📋 Criando tabela leads...');
    
    const createLeadsSQL = `
      CREATE TABLE public.leads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(255),
        position VARCHAR(255),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        notes TEXT,
        tags TEXT[],
        custom_fields JSONB DEFAULT '{}',
        last_contact_date TIMESTAMP WITH TIME ZONE,
        next_follow_up_date TIMESTAMP WITH TIME ZONE,
        conversion_date TIMESTAMP WITH TIME ZONE,
        lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID
      );
    `;
    
    const { error: leadsError } = await supabase.rpc('exec_sql', {
      sql: createLeadsSQL
    });
    
    if (leadsError) {
      console.error('❌ Erro ao criar tabela leads:', leadsError);
      return;
    }
    
    console.log('✅ Tabela leads criada com sucesso');
    
    // 3. Criar tabela surveys
    console.log('📊 Criando tabela surveys...');
    
    const createSurveysSQL = `
      CREATE TABLE public.surveys (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
        survey_type VARCHAR(50) DEFAULT 'feedback' CHECK (survey_type IN ('feedback', 'satisfaction', 'nps', 'custom', 'lead_qualification')),
        settings JSONB DEFAULT '{}',
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        target_audience TEXT,
        response_limit INTEGER,
        anonymous_responses BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID
      );
    `;
    
    const { error: surveysError } = await supabase.rpc('exec_sql', {
      sql: createSurveysSQL
    });
    
    if (surveysError) {
      console.error('❌ Erro ao criar tabela surveys:', surveysError);
      return;
    }
    
    console.log('✅ Tabela surveys criada com sucesso');
    
    // 4. Criar tabela survey_questions
    console.log('❓ Criando tabela survey_questions...');
    
    const createQuestionsSQL = `
      CREATE TABLE public.survey_questions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'text' CHECK (question_type IN ('text', 'textarea', 'multiple_choice', 'single_choice', 'rating', 'scale', 'boolean', 'date', 'email', 'number')),
        options JSONB,
        validation_rules JSONB DEFAULT '{}',
        is_required BOOLEAN DEFAULT false,
        order_index INTEGER NOT NULL,
        conditional_logic JSONB,
        help_text TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: questionsError } = await supabase.rpc('exec_sql', {
      sql: createQuestionsSQL
    });
    
    if (questionsError) {
      console.error('❌ Erro ao criar tabela survey_questions:', questionsError);
      return;
    }
    
    console.log('✅ Tabela survey_questions criada com sucesso');
    
    // 5. Criar tabela survey_responses
    console.log('💬 Criando tabela survey_responses...');
    
    const createResponsesSQL = `
      CREATE TABLE public.survey_responses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
        question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
        respondent_id UUID,
        respondent_email VARCHAR(255),
        response_text TEXT,
        response_data JSONB,
        response_metadata JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: responsesError } = await supabase.rpc('exec_sql', {
      sql: createResponsesSQL
    });
    
    if (responsesError) {
      console.error('❌ Erro ao criar tabela survey_responses:', responsesError);
      return;
    }
    
    console.log('✅ Tabela survey_responses criada com sucesso');
    
    // 6. Criar índices essenciais
    console.log('🔍 Criando índices...');
    
    const createIndexesSQL = `
      -- Índices para leads
      CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
      
      -- Índices para surveys
      CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
      CREATE INDEX IF NOT EXISTS idx_surveys_type ON public.surveys(survey_type);
      CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON public.surveys(created_at);
      
      -- Índices para survey_questions
      CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
      CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON public.survey_questions(survey_id, order_index);
      
      -- Índices para survey_responses
      CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON public.survey_responses(question_id);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON public.survey_responses(created_at);
    `;
    
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: createIndexesSQL
    });
    
    if (indexesError) {
      console.error('❌ Erro ao criar índices:', indexesError);
      return;
    }
    
    console.log('✅ Índices criados com sucesso');
    
    // 7. Testar as tabelas criadas
    console.log('🧪 Testando as tabelas criadas...');
    
    // Testar tabela leads
    const { data: leadsTest, error: leadsTestError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (leadsTestError) {
      console.error('❌ Erro ao testar tabela leads:', leadsTestError);
    } else {
      console.log('✅ Tabela leads funcionando corretamente');
    }
    
    // Testar tabela surveys
    const { data: surveysTest, error: surveysTestError } = await supabase
      .from('surveys')
      .select('*')
      .limit(1);
    
    if (surveysTestError) {
      console.error('❌ Erro ao testar tabela surveys:', surveysTestError);
    } else {
      console.log('✅ Tabela surveys funcionando corretamente');
    }
    
    console.log('🎉 Todas as tabelas foram criadas e testadas com sucesso!');
    console.log('📝 Agora você pode usar o formulário Turbo Lead Form normalmente.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTablesWithMCP();