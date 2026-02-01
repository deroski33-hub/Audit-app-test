import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building2, Mail, Phone, Globe, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { leadService } from '../services/api';
import type { Lead } from '../types';

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

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLead() {
      try {
        const data = await leadService.getLead(Number(id));
        setLead(data);
      } catch {
        toast.error('Failed to load lead');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadService.deleteLead(Number(id));
      toast.success('Lead deleted successfully');
      navigate('/leads');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!lead) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/leads"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lead.company_name}</h1>
          <p className="text-gray-500">{lead.industry || 'No industry specified'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/leads/${id}/edit`} className="btn btn-secondary flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="font-medium">{lead.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Industry</p>
                <p className="font-medium">{lead.industry || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Company Size</p>
                <p className="font-medium">{lead.company_size || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Annual Revenue</p>
                <p className="font-medium">{lead.annual_revenue || '-'}</p>
              </div>
              {lead.website && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Website</p>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-4 w-4" />
                    {lead.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{lead.contact_name}</p>
                  {lead.contact_title && (
                    <p className="text-sm text-gray-500">{lead.contact_title}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href={`mailto:${lead.contact_email}`} className="text-blue-600 hover:underline">
                  {lead.contact_email}
                </a>
              </div>
              {lead.contact_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span>{lead.contact_phone}</span>
                </div>
              )}
            </div>
          </div>

          {lead.notes && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <p className="whitespace-pre-wrap text-gray-700">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Lead Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`badge badge-${lead.status}`}>
                  {statusLabels[lead.status]}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Priority</p>
                <span className={`badge badge-${lead.priority}`}>
                  {priorityLabels[lead.priority]}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Audit Type</p>
                <span className="font-medium">{auditTypeLabels[lead.audit_type]}</span>
              </div>
              {lead.source && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Source</p>
                  <span className="font-medium">{lead.source}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Financial</h2>
            <div className="space-y-4">
              {lead.estimated_value && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Value</p>
                    <p className="font-medium">{lead.estimated_value}</p>
                  </div>
                </div>
              )}
              {lead.next_follow_up && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Next Follow-up</p>
                    <p className="font-medium">
                      {format(new Date(lead.next_follow_up), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">
                  {format(new Date(lead.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              {lead.updated_at && (
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(lead.updated_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
