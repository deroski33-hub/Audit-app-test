import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeads } from '../hooks/useLeads';
import { leadService } from '../services/api';
import LeadCard from '../components/LeadCard';
import Pagination from '../components/Pagination';
import type { LeadStatus, LeadPriority, AuditType } from '../types';

export default function LeadList() {
  const { leads, loading, filters, pagination, updateFilters, setPage, refetch } = useLeads({
    per_page: 12,
  });
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadService.deleteLead(id);
      toast.success('Lead deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-500">Manage your audit leads</p>
        </div>
        <Link to="/leads/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[250px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search leads..."
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filters.status || ''}
              onChange={(e) =>
                updateFilters({ status: (e.target.value as LeadStatus) || undefined })
              }
              className="input w-40"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiating">Negotiating</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            <select
              value={filters.priority || ''}
              onChange={(e) =>
                updateFilters({ priority: (e.target.value as LeadPriority) || undefined })
              }
              className="input w-40"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={filters.audit_type || ''}
              onChange={(e) =>
                updateFilters({ audit_type: (e.target.value as AuditType) || undefined })
              }
              className="input w-40"
            >
              <option value="">All Types</option>
              <option value="financial">Financial</option>
              <option value="compliance">Compliance</option>
              <option value="operational">Operational</option>
              <option value="it_security">IT Security</option>
              <option value="tax">Tax</option>
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="card p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.status || filters.priority || filters.audit_type
              ? 'Try adjusting your filters'
              : 'Get started by creating your first lead'}
          </p>
          <Link to="/leads/new" className="btn btn-primary">
            Add Lead
          </Link>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Showing {leads.length} of {pagination.total} leads
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onDelete={handleDelete} />
            ))}
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
