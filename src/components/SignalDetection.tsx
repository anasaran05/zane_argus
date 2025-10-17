import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function SignalDetection() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    strength: "",
    product: ""
  });

  const signals = useQuery(api.signals.getSignals, {
    status: filters.status || undefined,
    strength: filters.strength || undefined,
    productName: filters.product || undefined,
  });

  const signalStats = useQuery(api.signals.getSignalStats);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Signal Detection</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Signal
        </button>
      </div>

      {/* Signal Statistics */}
      {signalStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Signal Status</h3>
            <div className="space-y-2">
              {Object.entries(signalStats.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="capitalize text-gray-600">{status.replace('_', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Signal Strength</h3>
            <div className="space-y-2">
              {Object.entries(signalStats.byStrength).map(([strength, count]) => (
                <div key={strength} className="flex justify-between">
                  <span className="capitalize text-gray-600">{strength}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Total Signals</h3>
            <div className="text-3xl font-bold text-blue-600">{signalStats.total}</div>
            <div className="text-sm text-gray-500 mt-2">
              {signalStats.byStatus.confirmed} confirmed signals
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="under_evaluation">Under Evaluation</option>
              <option value="confirmed">Confirmed</option>
              <option value="refuted">Refuted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strength
            </label>
            <select
              value={filters.strength}
              onChange={(e) => setFilters({ ...filters, strength: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Strengths</option>
              <option value="weak">Weak</option>
              <option value="moderate">Moderate</option>
              <option value="strong">Strong</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <input
              type="text"
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              placeholder="Filter by product..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: "", strength: "", product: "" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Signals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signal Name
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
                  Strength
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detection Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {signals?.map((signal) => (
                <tr key={signal._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {signal.signalName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {signal.productName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {signal.adverseEvent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SignalStatusBadge status={signal.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StrengthBadge strength={signal.strength} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {signal.detectionMethod.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(signal._creationTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <SignalActions signal={signal} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Signal Modal */}
      {showCreateForm && (
        <CreateSignalModal onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}

function CreateSignalModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    signalName: "",
    description: "",
    productName: "",
    adverseEvent: "",
    detectionMethod: "statistical",
    strength: "moderate",
  });

  const createSignal = useMutation(api.signals.createSignal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createSignal({
        ...formData,
        detectionMethod: formData.detectionMethod as any,
        strength: formData.strength as any,
        relatedCases: [], // Would be populated based on analysis
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating signal:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Create New Signal</h3>
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
              Signal Name *
            </label>
            <input
              type="text"
              required
              value={formData.signalName}
              onChange={(e) => setFormData({ ...formData, signalName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adverse Event *
              </label>
              <input
                type="text"
                required
                value={formData.adverseEvent}
                onChange={(e) => setFormData({ ...formData, adverseEvent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detection Method *
              </label>
              <select
                required
                value={formData.detectionMethod}
                onChange={(e) => setFormData({ ...formData, detectionMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="statistical">Statistical</option>
                <option value="clinical_review">Clinical Review</option>
                <option value="literature">Literature</option>
                <option value="regulatory">Regulatory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signal Strength *
              </label>
              <select
                required
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weak">Weak</option>
                <option value="moderate">Moderate</option>
                <option value="strong">Strong</option>
              </select>
            </div>
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
              Create Signal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SignalActions({ signal }: { signal: any }) {
  const updateStatus = useMutation(api.signals.updateSignalStatus);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({
        signalId: signal._id,
        status: newStatus as any,
      });
    } catch (error) {
      console.error("Error updating signal status:", error);
    }
  };

  return (
    <select
      value={signal.status}
      onChange={(e) => handleStatusChange(e.target.value)}
      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="detected">Detected</option>
      <option value="under_evaluation">Under Evaluation</option>
      <option value="confirmed">Confirmed</option>
      <option value="refuted">Refuted</option>
      <option value="closed">Closed</option>
    </select>
  );
}

function SignalStatusBadge({ status }: { status: string }) {
  const colors = {
    detected: "bg-yellow-100 text-yellow-800",
    under_evaluation: "bg-blue-100 text-blue-800",
    confirmed: "bg-red-100 text-red-800",
    refuted: "bg-gray-100 text-gray-800",
    closed: "bg-green-100 text-green-800"
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function StrengthBadge({ strength }: { strength: string }) {
  const colors = {
    weak: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    strong: "bg-red-100 text-red-800"
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[strength as keyof typeof colors]}`}>
      {strength}
    </span>
  );
}
