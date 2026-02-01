import { useLeadStats } from '../hooks/useLeads';

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

export default function Analytics() {
  const { stats, loading } = useLeadStats();

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading analytics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">No data available</div>;
  }

  const maxStatusCount = Math.max(...Object.values(stats.by_status), 1);
  const maxPriorityCount = Math.max(...Object.values(stats.by_priority), 1);
  const maxAuditTypeCount = Math.max(...Object.values(stats.by_audit_type), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500">Lead statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Leads */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Total Leads</h2>
          <p className="text-5xl font-bold text-blue-600">{stats.total}</p>
        </div>

        {/* By Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">By Status</h2>
          <div className="space-y-3">
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = stats.by_status[key] || 0;
              const percentage = (count / maxStatusCount) * 100;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-blue-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Priority */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">By Priority</h2>
          <div className="space-y-3">
            {Object.entries(priorityLabels).map(([key, label]) => {
              const count = stats.by_priority[key] || 0;
              const percentage = (count / maxPriorityCount) * 100;
              const colors: Record<string, string> = {
                low: 'bg-gray-400',
                medium: 'bg-blue-500',
                high: 'bg-orange-500',
                urgent: 'bg-red-500',
              };
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[key]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Audit Type */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">By Audit Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(auditTypeLabels).map(([key, label]) => {
              const count = stats.by_audit_type[key] || 0;
              return (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
