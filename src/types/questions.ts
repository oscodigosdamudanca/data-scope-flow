// Enums
export type QuestionCategory = 'technical' | 'behavioral' | 'cultural' | 'situational' | 'general';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

// Database types (temporary until migration is applied)
export interface QuestionType {
  id: string;
  title: string;
  description?: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  tags?: string[];
  is_active: boolean;
  created_by: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionTypeInsert {
  title: string;
  description?: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  tags?: string[];
  is_active?: boolean;
  created_by: string;
  company_id?: string;
}

export interface QuestionTypeUpdate {
  title?: string;
  description?: string;
  category?: QuestionCategory;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  is_active?: boolean;
}

export interface Question {
  id: string;
  question_type_id: string;
  question_text: string;
  expected_answer?: string;
  evaluation_criteria?: string;
  time_limit_minutes?: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionInsert {
  question_type_id: string;
  question_text: string;
  expected_answer?: string;
  evaluation_criteria?: string;
  time_limit_minutes?: number;
  is_active?: boolean;
  created_by: string;
}

export interface QuestionUpdate {
  question_text?: string;
  expected_answer?: string;
  evaluation_criteria?: string;
  time_limit_minutes?: number;
  is_active?: boolean;
}

// Extended types with relations
export interface QuestionTypeWithQuestions extends QuestionType {
  questions?: Question[];
  questions_count?: number;
}

export interface QuestionWithType extends Question {
  question_type?: QuestionType;
}

// Form types
export interface CreateQuestionTypeData {
  title: string;
  description?: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  tags?: string[];
  company_id?: string;
}

export interface UpdateQuestionTypeData extends Partial<CreateQuestionTypeData> {
  is_active?: boolean;
}

export interface CreateQuestionData {
  question_type_id: string;
  question_text: string;
  expected_answer?: string;
  evaluation_criteria?: string;
  time_limit_minutes?: number;
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {
  is_active?: boolean;
}

// Constants
export const QUESTION_CATEGORIES: Record<QuestionCategory, string> = {
  technical: 'Técnica',
  behavioral: 'Comportamental',
  cultural: 'Cultural',
  situational: 'Situacional',
  general: 'Geral'
};

export const QUESTION_DIFFICULTIES: Record<QuestionDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil'
};

export const DIFFICULTY_COLORS: Record<QuestionDifficulty, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50'
};

export const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  technical: 'text-blue-600 bg-blue-50',
  behavioral: 'text-purple-600 bg-purple-50',
  cultural: 'text-pink-600 bg-pink-50',
  situational: 'text-orange-600 bg-orange-50',
  general: 'text-gray-600 bg-gray-50'
};