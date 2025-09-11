// Enums para o sistema de entrevistas
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type CandidateStatus = 'applied' | 'screening' | 'interview_scheduled' | 'interviewed' | 'approved' | 'rejected' | 'hired';

// Interface para Candidato
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: CandidateStatus;
  notes?: string;
  company_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateInsert {
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status?: CandidateStatus;
  notes?: string;
  company_id: string;
}

export interface CandidateUpdate {
  name?: string;
  email?: string;
  phone?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status?: CandidateStatus;
  notes?: string;
}

// Interface para Entrevista
export interface Interview {
  id: string;
  title: string;
  description?: string;
  candidate_id: string;
  interviewer_id?: string;
  company_id: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  status: InterviewStatus;
  meeting_url?: string;
  notes?: string;
  overall_rating?: number;
  recommendation?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  candidate?: Candidate;
  interviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InterviewInsert {
  title: string;
  description?: string;
  candidate_id: string;
  interviewer_id?: string;
  company_id: string;
  scheduled_at?: string;
  status?: InterviewStatus;
  meeting_url?: string;
  notes?: string;
}

export interface InterviewUpdate {
  title?: string;
  description?: string;
  interviewer_id?: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  status?: InterviewStatus;
  meeting_url?: string;
  notes?: string;
  overall_rating?: number;
  recommendation?: string;
}

// Interface para Pergunta da Entrevista
export interface InterviewQuestion {
  id: string;
  interview_id: string;
  question_id: string;
  order_index: number;
  is_required: boolean;
  time_limit_minutes?: number;
  created_at: string;
  // Relacionamentos
  question?: {
    id: string;
    title: string;
    content: string;
    category: string;
    difficulty: string;
  };
}

export interface InterviewQuestionInsert {
  interview_id: string;
  question_id: string;
  order_index: number;
  is_required?: boolean;
  time_limit_minutes?: number;
}

// Interface para Resposta da Entrevista
export interface InterviewResponse {
  id: string;
  interview_id: string;
  question_id: string;
  candidate_id: string;
  response_text?: string;
  response_file_url?: string;
  rating?: number;
  feedback?: string;
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  question?: {
    id: string;
    title: string;
    content: string;
  };
}

export interface InterviewResponseInsert {
  interview_id: string;
  question_id: string;
  candidate_id: string;
  response_text?: string;
  response_file_url?: string;
  rating?: number;
  feedback?: string;
  time_spent_seconds?: number;
}

export interface InterviewResponseUpdate {
  response_text?: string;
  response_file_url?: string;
  rating?: number;
  feedback?: string;
  time_spent_seconds?: number;
}

// Interface para Estatísticas
export interface InterviewStats {
  total_candidates: number;
  total_interviews: number;
  scheduled_interviews: number;
  completed_interviews: number;
  average_rating?: number;
}

// Constantes para labels e cores
export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  applied: 'Candidatou-se',
  screening: 'Triagem',
  interview_scheduled: 'Entrevista Agendada',
  interviewed: 'Entrevistado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  hired: 'Contratado'
};

export const CANDIDATE_STATUS_COLORS: Record<CandidateStatus, string> = {
  applied: 'bg-blue-100 text-blue-800',
  screening: 'bg-yellow-100 text-yellow-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  interviewed: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-emerald-100 text-emerald-800'
};

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  scheduled: 'Agendada',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  no_show: 'Não Compareceu'
};

export const INTERVIEW_STATUS_COLORS: Record<InterviewStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  no_show: 'bg-red-100 text-red-800'
};

// Filtros para listas
export interface CandidateFilters {
  status?: CandidateStatus;
  search?: string;
}

export interface InterviewFilters {
  status?: InterviewStatus;
  interviewer_id?: string;
  candidate_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Tipos para formulários
export interface CandidateFormData extends CandidateInsert {}
export interface InterviewFormData extends InterviewInsert {}

// Tipos para seleção de perguntas
export interface QuestionSelection {
  question_id: string;
  is_required: boolean;
  time_limit_minutes?: number;
}

export interface InterviewTemplate {
  title: string;
  description?: string;
  questions: QuestionSelection[];
}