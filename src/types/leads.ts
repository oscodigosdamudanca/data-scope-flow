export interface Lead {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  interests: string[];
  source: 'manual' | 'qr_code' | 'survey';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  captured_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  interests?: string[];
  source?: 'manual' | 'qr_code' | 'survey';
  notes?: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  interests?: string[];
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  conversionRate: number;
}