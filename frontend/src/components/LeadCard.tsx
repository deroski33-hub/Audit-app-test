import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import type { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onDelete?: (id: number) => void;
}

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
};

const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const auditTypeLabels: Record<string, string> = {
  financial: 'Financial',
  compliance: 'Compliance',
  operational: 'Operational',
  it_security: 'IT Security',
  tax: 'Tax',
  internal: 'Internal',
  external: 'External',
};

export default function LeadCard({ lead, onDelete }: LeadCardProps) {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link
            to={`/leads/${lead.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {lead.company_name}
          </Link>
          <p className="text-sm text-gray-500">{lead.industry || 'No industry specified'}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge badge-${lead.status}`}>
            {statusLabels[lead.status]}
          </span>
          <span className={`badge badge-${lead.priority}`}>
            {priorityLabels[lead.priority]}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>{lead.contact_name}</span>
          {lead.contact_title && (
            <span className="text-gray-400">- {lead.contact_title}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${lead.contact_email}`} className="hover:text-blue-600">
            {lead.contact_email}
          </a>
        </div>
        {lead.contact_phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{lead.contact_phone}</span>
          </div>
        )}
        {lead.estimated_value && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{lead.estimated_value}</span>
          </div>
        )}
        {lead.next_follow_up && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Follow up: {format(new Date(lead.next_follow_up), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {auditTypeLabels[lead.audit_type]} Audit
        </span>
        <div className="flex gap-2">
          <Link
            to={`/leads/${lead.id}/edit`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(lead.id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
