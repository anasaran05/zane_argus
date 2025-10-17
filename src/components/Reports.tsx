import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Reports() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    dateRange: "last_30_days"
  });

  // For now, we'll show a placeholder since we don't have the reports functions yet
  const reports = useQuery(api.cases.getCaseStats); // Using case stats as placeholder data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Generate Report
        </button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Periodic Safety Update"
          description="Generate PSUR reports for regulatory submission"
          icon="📊"
          count={12}
        />
        <ReportCard
          title="Signal Detection"
          description="Statistical analysis for signal identification"
          icon="🔍"
          count={8}
        />
        <ReportCard
          title="Regulatory Submission"
          description="Reports for FDA, EMA, and other authorities"
          icon="📋"
          count={24}
        />
        <ReportCard
          title="Custom Analytics"
          description="Ad-hoc reports and data analysis"
          icon="📈"
          count={15}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="periodic_safety_update">Periodic Safety Update</option>
              <option value="signal_detection">Signal Detection</option>
              <option value="regulatory_submission">Regulatory Submission</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="last_year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ type: "", dateRange: "last_30_days" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Quick Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Case Trends</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Cases</span>
              <span className="text-2xl font-bold text-blue-600">{reports?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Serious Events</span>
              <span className="text-xl font-semibold text-red-600">{reports?.serious || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="text-xl font-semibold text-green-600">{reports?.thisMonth || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {reports?.byStatus && Object.entries(reports.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize text-gray-600">{status.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / (reports?.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-6">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Recent Reports</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p>No reports generated yet.</p>
            <p className="text-sm mt-2">Click "Generate Report" to create your first report.</p>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showCreateForm && (
        <GenerateReportModal onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}

function ReportCard({ title, description, icon, count }: {
  title: string;
  description: string;
  icon: string;
  count: number;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <span className="text-2xl font-bold text-gray-900">{count}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function GenerateReportModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "periodic_safety_update",
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    products: "",
    regions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, just show an alert since we don't have the report generation function
    alert("Report generation functionality will be implemented with the reports backend functions.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Generate Report</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Q4 2024 Safety Report"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="periodic_safety_update">Periodic Safety Update</option>
              <option value="signal_detection">Signal Detection</option>
              <option value="regulatory_submission">Regulatory Submission</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.dateRange.start}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dateRange: { ...formData.dateRange, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.dateRange.end}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dateRange: { ...formData.dateRange, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Products (optional)
            </label>
            <input
              type="text"
              value={formData.products}
              onChange={(e) => setFormData({ ...formData, products: e.target.value })}
              placeholder="e.g., Product A, Product B (leave empty for all)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regions (optional)
            </label>
            <input
              type="text"
              value={formData.regions}
              onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
              placeholder="e.g., US, EU, APAC (leave empty for all)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Report generation may take several minutes depending on the data volume.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
