import { useForm } from 'react-hook-form';
import type { LeadCreate, Lead } from '../types';

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: LeadCreate) => Promise<void>;
  isLoading?: boolean;
}

export default function LeadForm({ initialData, onSubmit, isLoading }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadCreate>({
    defaultValues: initialData || {
      status: 'new',
      priority: 'medium',
      audit_type: 'financial',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Company Information */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name *</label>
            <input
              {...register('company_name', { required: 'Company name is required' })}
              className="input"
              placeholder="Acme Corporation"
            />
            {errors.company_name && (
              <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Industry</label>
            <input
              {...register('industry')}
              className="input"
              placeholder="Technology"
            />
          </div>
          <div>
            <label className="label">Company Size</label>
            <select {...register('company_size')} className="input">
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
          <div>
            <label className="label">Annual Revenue</label>
            <input
              {...register('annual_revenue')}
              className="input"
              placeholder="$1M - $5M"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Website</label>
            <input
              {...register('website')}
              className="input"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Contact Name *</label>
            <input
              {...register('contact_name', { required: 'Contact name is required' })}
              className="input"
              placeholder="John Smith"
            />
            {errors.contact_name && (
              <p className="text-red-500 text-sm mt-1">{errors.contact_name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Title</label>
            <input
              {...register('contact_title')}
              className="input"
              placeholder="CFO"
            />
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              {...register('contact_email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              className="input"
              placeholder="john@example.com"
            />
            {errors.contact_email && (
              <p className="text-red-500 text-sm mt-1">{errors.contact_email.message}</p>
            )}
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              {...register('contact_phone')}
              className="input"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Lead Details */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Audit Type</label>
            <select {...register('audit_type')} className="input">
              <option value="financial">Financial</option>
              <option value="compliance">Compliance</option>
              <option value="operational">Operational</option>
              <option value="it_security">IT Security</option>
              <option value="tax">Tax</option>
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiating">Negotiating</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select {...register('priority')} className="input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="label">Source</label>
            <input
              {...register('source')}
              className="input"
              placeholder="Referral, Website, Cold Call..."
            />
          </div>
          <div>
            <label className="label">Estimated Value</label>
            <input
              {...register('estimated_value')}
              className="input"
              placeholder="$50,000"
            />
          </div>
          <div>
            <label className="label">Next Follow-up</label>
            <input
              {...register('next_follow_up')}
              type="datetime-local"
              className="input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notes</label>
            <textarea
              {...register('notes')}
              className="input"
              rows={4}
              placeholder="Additional notes about this lead..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
