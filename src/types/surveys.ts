export interface Survey {
  id: string;
  title: string;
  description?: string;
  company_id: string;
  is_active: boolean;
  status?: 'draft' | 'active' | 'closed'; // Campo adicional para compatibilidade
  created_by: string;
  created_at: string;
  updated_at: string;
  survey_questions?: SurveyQuestion[];
  survey_responses?: SurveyResponse[];
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  options?: string[];
  is_required: boolean;
  order_index: number;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_name?: string;
  respondent_email?: string;
  respondent_phone?: string;
  responses: Record<string, string | number | boolean | null>;
  submitted_at: string;
  submitted_by: string;
  ip_address?: string;
}

export interface CreateSurveyData {
  title: string;
  description?: string;
  is_active?: boolean;
  questions?: CreateSurveyQuestionData[];
}

export interface CreateSurveyQuestionData {
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  options?: string[];
  is_required: boolean;
  order_index: number;
}

export interface UpdateSurveyData {
  title?: string;
  description?: string;
  is_active?: boolean;
}

export interface SurveyFilters {
  is_active?: boolean;
  status?: 'draft' | 'active' | 'closed';
  search?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
}

export interface SurveyStats {
  total: number;
  active: number;
  inactive: number;
  total_responses: number;
  avg_responses_per_survey: number;
}

export interface SubmitSurveyResponseData {
  survey_id: string;
  respondent_name?: string;
  respondent_email?: string;
  respondent_phone?: string;
  respondent_company?: string;
  responses: Record<string, string | number | boolean | null>;
}

export interface CreateSurveyResponseData {
  respondent_name?: string;
  respondent_email?: string;
  respondent_phone?: string;
  responses: Record<string, string | number | boolean | null>;
}