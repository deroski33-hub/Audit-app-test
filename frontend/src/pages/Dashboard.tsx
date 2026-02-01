import { Link } from 'react-router-dom';
import { Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useLeadStats, useLeads } from '../hooks/useLeads';
import StatsCard from '../components/StatsCard';
import LeadCard from '../components/LeadCard';

export default function Dashboard() {
  const { stats, loading: statsLoading } = useLeadStats();
  const { leads, loading: leadsLoading } = useLeads({ per_page: 5 });

  const totalLeads = stats?.total || 0;
  const wonLeads = stats?.by_status?.won || 0;
  const activeLeads = totalLeads - (stats?.by_status?.won || 0) - (stats?.by_status?.lost || 0);
  const urgentLeads = stats?.by_priority?.urgent || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome to your Audit Lead Generator</p>
        </div>
        <Link to="/leads/new" className="btn btn-primary">
          Add New Lead
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Leads"
          value={statsLoading ? '-' : totalLeads}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Active Leads"
          value={statsLoading ? '-' : activeLeads}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <StatsCard
          title="Won Deals"
          value={statsLoading ? '-' : wonLeads}
          icon={<CheckCircle className="h-6 w-6" />}
          color="purple"
        />
        <StatsCard
          title="Urgent"
          value={statsLoading ? '-' : urgentLeads}
          icon={<Clock className="h-6 w-6" />}
          color="red"
        />
      </div>

      {/* Recent Leads */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Leads</h2>
          <Link to="/leads" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>

        {leadsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No leads yet.{' '}
            <Link to="/leads/new" className="text-blue-600 hover:underline">
              Create your first lead
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>

      {/* Status Distribution */}
      {stats && Object.keys(stats.by_status).length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Lead Pipeline</h2>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(stats.by_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`badge badge-${status}`}>
                  {status.replace('_', ' ')}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
