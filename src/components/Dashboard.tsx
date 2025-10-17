import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const caseStats = useQuery(api.cases.getCaseStats);
  const signalStats = useQuery(api.signals.getSignalStats);
  const recentCases = useQuery(api.cases.getCases, { limit: 5 });

  if (!caseStats || !signalStats || !recentCases) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Cases"
          value={caseStats.total}
          change={`+${caseStats.thisMonth} this month`}
          color="blue"
        />
        <MetricCard
          title="Serious Events"
          value={caseStats.serious}
          change={`${((caseStats.serious / caseStats.total) * 100).toFixed(1)}% of total`}
          color="red"
        />
        <MetricCard
          title="Active Signals"
          value={signalStats.byStatus.detected + signalStats.byStatus.under_evaluation}
          change={`${signalStats.byStrength.strong} strong signals`}
          color="yellow"
        />
        <MetricCard
          title="Pending Review"
          value={caseStats.byStatus.under_review}
          change={`${caseStats.byStatus.submitted} submitted`}
          color="green"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Case Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(caseStats.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize text-gray-600">{status.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / caseStats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(caseStats.byPriority).map(([priority, count]) => {
              const colors = {
                urgent: "bg-red-500",
                high: "bg-orange-500",
                medium: "bg-yellow-500",
                low: "bg-green-500"
              };
              return (
                <div key={priority} className="flex justify-between items-center">
                  <span className="capitalize text-gray-600">{priority}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`${colors[priority as keyof typeof colors]} h-2 rounded-full`}
                        style={{ width: `${(count / caseStats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Recent Cases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adverse Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCases.map((case_) => (
                <tr key={case_._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {case_.caseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {case_.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {case_.adverseEvent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={case_.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={case_.priority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, color }: {
  title: string;
  value: number;
  change: string;
  color: string;
}) {
  const colors = {
    blue: "bg-blue-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500"
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colors[color as keyof typeof colors]} rounded-md p-3`}>
          <div className="w-6 h-6 text-white">📊</div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">{change}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    closed: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[priority as keyof typeof colors]}`}>
      {priority}
    </span>
  );
}
