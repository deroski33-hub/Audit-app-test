export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiating'
  | 'won'
  | 'lost';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AuditType =
  | 'financial'
  | 'compliance'
  | 'operational'
  | 'it_security'
  | 'tax'
  | 'internal'
  | 'external';

export interface Lead {
  id: number;
  company_name: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: string;
  website?: string;
  contact_name: string;
  contact_title?: string;
  contact_email: string;
  contact_phone?: string;
  audit_type: AuditType;
  status: LeadStatus;
  priority: LeadPriority;
  source?: string;
  estimated_value?: string;
  notes?: string;
  next_follow_up?: string;
  created_at: string;
  updated_at?: string;
}

export interface LeadCreate {
  company_name: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: string;
  website?: string;
  contact_name: string;
  contact_title?: string;
  contact_email: string;
  contact_phone?: string;
  audit_type: AuditType;
  status: LeadStatus;
  priority: LeadPriority;
  source?: string;
  estimated_value?: string;
  notes?: string;
  next_follow_up?: string;
}

export interface LeadUpdate extends Partial<LeadCreate> {}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface LeadStats {
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_audit_type: Record<string, number>;
}

export interface LeadFilters {
  page?: number;
  per_page?: number;
  status?: LeadStatus;
  priority?: LeadPriority;
  audit_type?: AuditType;
  search?: string;
}
