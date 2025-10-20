import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function CaseManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Id<"cases"> | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: ""
  });
  const [pendingCase, setPendingCase] = useState<any | null>(null);

  const cases = useQuery(api.cases.getCases, {
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    limit: 50
  });

  const searchResults = useQuery(
    api.cases.searchCases,
    filters.search ? { searchTerm: filters.search } : "skip"
  );

  const displayCases = filters.search ? searchResults : cases;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Case Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Case
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Cases
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by adverse event..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: "", priority: "", search: "" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
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
              {displayCases?.map((case_) => (
                <tr key={case_._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <button
                      onClick={() => setSelectedCase(case_._id)}
                      className="hover:underline"
                    >
                      {case_.caseNumber}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {case_.productName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {case_.adverseEvent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={case_.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={case_.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(case_ as any).assignee || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(case_._creationTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedCase(case_._id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Case Modal */}
      {showCreateForm && (
        <CreateCaseModal 
          onClose={() => setShowCreateForm(false)} 
          onSubmit={setPendingCase}
        />
      )}

      {/* Case Confirmation Modal */}
      {pendingCase && (
        <CaseConfirmationModal 
          caseData={pendingCase}
          onConfirm={() => {
            setPendingCase(null);
            setShowCreateForm(false);
          }}
          onCancel={() => setPendingCase(null)}
        />
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseId={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}

function CreateCaseModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    productName: "",
    adverseEvent: "",
    eventDescription: "",
    eventDate: "",
    reportDate: new Date().toISOString().split('T')[0],
    seriousness: false,
    patientAge: "",
    patientGender: "",
    reporterType: "healthcare_professional",
    reporterCountry: "",
    priority: "medium"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Create New Case</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.eventDescription}
                onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Date *
              </label>
              <input
                type="date"
                required
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Age
              </label>
              <input
                type="number"
                value={formData.patientAge}
                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Gender
              </label>
              <select
                value={formData.patientGender}
                onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reporter Type *
              </label>
              <select
                required
                value={formData.reporterType}
                onChange={(e) => setFormData({ ...formData, reporterType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="healthcare_professional">Healthcare Professional</option>
                <option value="consumer">Consumer</option>
                <option value="regulatory_authority">Regulatory Authority</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reporter Country *
              </label>
              <input
                type="text"
                required
                value={formData.reporterCountry}
                onChange={(e) => setFormData({ ...formData, reporterCountry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.seriousness}
                  onChange={(e) => setFormData({ ...formData, seriousness: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Serious Event</span>
              </label>
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
              Create Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CaseConfirmationModal({ caseData, onConfirm, onCancel }: { 
  caseData: any; 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  const createCase = useMutation(api.cases.createCase);

  const handleCopy = () => {
    const caseText = `
Case Details:
Product Name: ${caseData.productName}
Adverse Event: ${caseData.adverseEvent}
Event Description: ${caseData.eventDescription}
Event Date: ${caseData.eventDate}
Report Date: ${caseData.reportDate}
Priority: ${caseData.priority}
Seriousness: ${caseData.seriousness ? 'Yes' : 'No'}
Patient Age: ${caseData.patientAge || 'Not specified'}
Patient Gender: ${caseData.patientGender || 'Not specified'}
Reporter Type: ${caseData.reporterType}
Reporter Country: ${caseData.reporterCountry}
    `.trim();

    navigator.clipboard.writeText(caseText);
    alert('Case details copied to clipboard!');
  };

  const handleConfirm = async () => {
    try {
      await createCase({
        productName: caseData.productName,
        adverseEvent: caseData.adverseEvent,
        eventDescription: caseData.eventDescription,
        eventDate: new Date(caseData.eventDate).getTime(),
        reportDate: new Date(caseData.reportDate).getTime(),
        seriousness: caseData.seriousness,
        patientAge: caseData.patientAge ? parseInt(caseData.patientAge) : undefined,
        patientGender: caseData.patientGender as any,
        reporterType: caseData.reporterType as any,
        reporterCountry: caseData.reporterCountry,
        priority: caseData.priority as any,
      });
      onConfirm();
    } catch (error) {
      console.error("Error creating case:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Confirm Case Creation</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <h4 className="font-semibold">Case Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Product Name:</span> {caseData.productName}
            </div>
            <div>
              <span className="font-medium">Priority:</span> <PriorityBadge priority={caseData.priority} />
            </div>
            <div className="col-span-2">
              <span className="font-medium">Adverse Event:</span> {caseData.adverseEvent}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Event Description:</span>
              <p className="mt-1">{caseData.eventDescription}</p>
            </div>
            <div>
              <span className="font-medium">Event Date:</span> {caseData.eventDate}
            </div>
            <div>
              <span className="font-medium">Report Date:</span> {caseData.reportDate}
            </div>
            <div>
              <span className="font-medium">Patient Age:</span> {caseData.patientAge || "Not specified"}
            </div>
            <div>
              <span className="font-medium">Patient Gender:</span> {caseData.patientGender || "Not specified"}
            </div>
            <div>
              <span className="font-medium">Reporter Type:</span> {caseData.reporterType}
            </div>
            <div>
              <span className="font-medium">Reporter Country:</span> {caseData.reporterCountry}
            </div>
            <div>
              <span className="font-medium">Seriousness:</span> {caseData.seriousness ? "Yes" : "No"}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleCopy}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Copy Case
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Confirm Creation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseDetailModal({ caseId, onClose }: { caseId: Id<"cases">; onClose: () => void }) {
  const caseData = useQuery(api.cases.getCase, { caseId });
  const updateStatus = useMutation(api.cases.updateCaseStatus);

  if (!caseData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({
        caseId,
        status: newStatus as any,
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Case Details - {caseData.caseNumber}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Case Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Product:</span> {caseData.productName}
                </div>
                <div>
                  <span className="font-medium">Priority:</span> <PriorityBadge priority={caseData.priority} />
                </div>
                <div>
                  <span className="font-medium">Status:</span> <StatusBadge status={caseData.status} />
                </div>
                <div>
                  <span className="font-medium">Serious:</span> {caseData.seriousness ? "Yes" : "No"}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Event Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Adverse Event:</span> {caseData.adverseEvent}
                </div>
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1">{caseData.eventDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Event Date:</span> {new Date(caseData.eventDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Report Date:</span> {new Date(caseData.reportDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Age:</span> {caseData.patientAge || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {caseData.patientGender || "Not specified"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Actions</h4>
              <div className="space-y-2">
                <select
                  value={caseData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Workflow History</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {caseData.workflow?.map((w, index) => (
                  <div key={index} className="text-sm border-l-2 border-blue-200 pl-3">
                    <div className="font-medium">{w.action}</div>
                    <div className="text-gray-600">
                      by {w.performedByName} • {new Date(w.timestamp).toLocaleString()}
                    </div>
                    {w.comments && (
                      <div className="text-gray-700 mt-1">{w.comments}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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