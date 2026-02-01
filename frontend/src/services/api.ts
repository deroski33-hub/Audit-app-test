import axios from 'axios';
import type { Lead, LeadCreate, LeadUpdate, LeadListResponse, LeadStats, LeadFilters } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const leadService = {
  async getLeads(filters: LeadFilters = {}): Promise<LeadListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.audit_type) params.append('audit_type', filters.audit_type);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get<LeadListResponse>(`/leads/?${params.toString()}`);
    return response.data;
  },

  async getLead(id: number): Promise<Lead> {
    const response = await api.get<Lead>(`/leads/${id}`);
    return response.data;
  },

  async createLead(data: LeadCreate): Promise<Lead> {
    const response = await api.post<Lead>('/leads/', data);
    return response.data;
  },

  async updateLead(id: number, data: LeadUpdate): Promise<Lead> {
    const response = await api.put<Lead>(`/leads/${id}`, data);
    return response.data;
  },

  async deleteLead(id: number): Promise<void> {
    await api.delete(`/leads/${id}`);
  },

  async getStats(): Promise<LeadStats> {
    const response = await api.get<LeadStats>('/leads/stats');
    return response.data;
  },
};

export default api;
