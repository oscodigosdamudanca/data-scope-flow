// Utilitários de validação robusta para formulários

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string | number | boolean | null) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Sanitiza uma string removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove caracteres HTML perigosos
    .replace(/\s+/g, ' ') // Normaliza espaços
    .substring(0, 1000); // Limita tamanho
}

/**
 * Sanitiza um email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '') // Remove caracteres não permitidos
    .substring(0, 254); // Limite RFC para emails
}

/**
 * Sanitiza um telefone
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  return phone
    .replace(/[^0-9+()-\s]/g, '') // Mantém apenas números e caracteres de formatação
    .trim()
    .substring(0, 20); // Limite razoável para telefones
}

/**
 * Valida um campo baseado nas regras fornecidas
 */
export function validateField(value: string | number | boolean | null, rules: ValidationRule): string | null {
  // Converte para string se necessário
  const stringValue = typeof value === 'string' ? value : String(value || '');
  const trimmedValue = stringValue.trim();

  // Verifica se é obrigatório
  if (rules.required && !trimmedValue) {
    return 'Este campo é obrigatório';
  }

  // Se não é obrigatório e está vazio, passa na validação
  if (!rules.required && !trimmedValue) {
    return null;
  }

  // Verifica tamanho mínimo
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return `Deve ter pelo menos ${rules.minLength} caracteres`;
  }

  // Verifica tamanho máximo
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return `Deve ter no máximo ${rules.maxLength} caracteres`;
  }

  // Verifica padrão regex
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return 'Formato inválido';
  }

  // Validação customizada
  if (rules.custom) {
    const customError = rules.custom(trimmedValue);
    if (customError) {
      return customError;
    }
  }

  return null;
}

/**
 * Valida múltiplos campos de uma vez
 */
export function validateFields(data: Record<string, string | number | boolean | null>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const fieldValue = data[fieldName];
    const error = validateField(fieldValue, fieldRules);
    
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
}

/**
 * Regras de validação específicas para diferentes tipos de campo
 */
export const ValidationRulePresets = {
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxLength: 254,
    custom: (value: string) => {
      // Validações adicionais para email
      if (value.includes('..')) return 'Email não pode conter pontos consecutivos';
      if (value.startsWith('.') || value.endsWith('.')) return 'Email não pode começar ou terminar com ponto';
      return null;
    }
  },
  
  phone: {
    required: true,
    pattern: /^[+]?[1-9][\d\s\-()]{8,20}$/,
    custom: (value: string) => {
      const digitsOnly = value.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 8) return 'Telefone deve ter pelo menos 8 dígitos';
      if (digitsOnly.length > 15) return 'Telefone deve ter no máximo 15 dígitos';
      return null;
    }
  },
  
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
    custom: (value: string) => {
      if (value.trim().split(' ').length < 2) return 'Digite nome e sobrenome';
      return null;
    }
  },
  
  company: {
    required: true,
    minLength: 2,
    maxLength: 200,
    pattern: /^[a-zA-ZÀ-ÿ0-9\s\-.&]+$/
  },
  
  message: {
    required: false,
    maxLength: 1000,
    custom: (value: string) => {
      // Verifica se não é spam (muitas repetições)
      const words = value.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
        return 'Mensagem parece ser spam';
      }
      return null;
    }
  }
};

/**
 * Detecta possíveis tentativas de injeção ou ataques
 */
export function detectMaliciousContent(input: string): boolean {
  const maliciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /\beval\s*\(/gi,
    /\balert\s*\(/gi,
    /\bdocument\./gi,
    /\bwindow\./gi,
    /\bconsole\./gi
  ];

  return maliciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitiza e valida dados do formulário Turbo
 */
export function validateTurboFormData(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  message?: string;
  lgpd_consent: boolean;
}) {
  // Sanitização
  const sanitizedData = {
    name: sanitizeString(data.name),
    email: sanitizeEmail(data.email),
    phone: sanitizePhone(data.phone),
    company: sanitizeString(data.company),
    message: data.message ? sanitizeString(data.message) : '',
    lgpd_consent: Boolean(data.lgpd_consent)
  };

  // Detecção de conteúdo malicioso
  const allTextFields = [sanitizedData.name, sanitizedData.email, sanitizedData.company, sanitizedData.message].join(' ');
  if (detectMaliciousContent(allTextFields)) {
    throw new Error('Conteúdo suspeito detectado');
  }

  // Validação
  const rules: ValidationRules = {
    name: ValidationRulePresets.name,
    email: ValidationRulePresets.email,
    phone: ValidationRulePresets.phone,
    company: ValidationRulePresets.company,
    message: ValidationRulePresets.message,
    lgpd_consent: {
      required: true,
      custom: (value: boolean) => {
        return value ? null : 'Você deve aceitar os termos de privacidade';
      }
    }
  };

  const errors = validateFields(sanitizedData, rules);

  return {
    data: sanitizedData,
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

/**
 * Rate limiting simples baseado em localStorage
 */
export class RateLimiter {
  private key: string;
  private maxAttempts: number;
  private windowMs: number;

  constructor(key: string, maxAttempts: number = 5, windowMs: number = 60000) {
    this.key = `rate_limit_${key}`;
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    const stored = localStorage.getItem(this.key);
    
    if (!stored) {
      localStorage.setItem(this.key, JSON.stringify({ count: 1, firstAttempt: now }));
      return true;
    }

    const { count, firstAttempt } = JSON.parse(stored);
    
    // Reset se a janela de tempo passou
    if (now - firstAttempt > this.windowMs) {
      localStorage.setItem(this.key, JSON.stringify({ count: 1, firstAttempt: now }));
      return true;
    }

    // Verifica se excedeu o limite
    if (count >= this.maxAttempts) {
      return false;
    }

    // Incrementa contador
    localStorage.setItem(this.key, JSON.stringify({ count: count + 1, firstAttempt }));
    return true;
  }

  getRemainingTime(): number {
    const stored = localStorage.getItem(this.key);
    if (!stored) return 0;

    const { firstAttempt } = JSON.parse(stored);
    const elapsed = Date.now() - firstAttempt;
    return Math.max(0, this.windowMs - elapsed);
  }
}

/**
 * Utilitário para logging seguro de erros
 */
export function logSecurely(message: string, data?: Record<string, unknown>) {
  // Em produção, enviaria para serviço de logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[VALIDATION] ${message}`, data);
  }
  
  // Aqui poderia integrar com Sentry, LogRocket, etc.
}