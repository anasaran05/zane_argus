import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function UserManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const users = useQuery(api.users.getAllUsers);
  const currentUser = useQuery(api.users.getCurrentUser);

  // Check if current user has admin permissions
  const hasAdminAccess = currentUser?.profile?.permissions?.includes("manage_users");

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add User Profile
        </button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-md p-3">
              <div className="w-6 h-6 text-white">👥</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{users?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-md p-3">
              <div className="w-6 h-6 text-white">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users?.filter(u => u.profile?.isActive).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-md p-3">
              <div className="w-6 h-6 text-white">👑</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users?.filter(u => u.profile?.role === "admin").length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-md p-3">
              <div className="w-6 h-6 text-white">🔍</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Safety Officers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users?.filter(u => u.profile?.role === "safety_officer").length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {(user.name || user.email || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "No name"}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.profile?.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.profile?.department || "Not assigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge isActive={user.profile?.isActive} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.profile?.lastLogin 
                      ? new Date(user.profile.lastLogin).toLocaleDateString()
                      : "Never"
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {user.profile?.permissions?.slice(0, 3).map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                        >
                          {permission}
                        </span>
                      ))}
                      {user.profile?.permissions && user.profile.permissions.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          +{user.profile.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Profile Modal */}
      {showCreateForm && (
        <CreateUserProfileModal onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}

function CreateUserProfileModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    role: "viewer",
    department: "",
  });

  const createUserProfile = useMutation(api.users.createUserProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createUserProfile({
        role: formData.role as any,
        department: formData.department,
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating user profile:", error);
      alert("Error creating user profile. You may already have a profile.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Create User Profile</h3>
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
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="viewer">Viewer</option>
              <option value="data_entry">Data Entry</option>
              <option value="reviewer">Reviewer</option>
              <option value="safety_officer">Safety Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g., Pharmacovigilance, Regulatory Affairs"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will create a profile for your current user account.
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
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role?: string }) {
  if (!role) {
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
        No Role
      </span>
    );
  }

  const colors = {
    admin: "bg-purple-100 text-purple-800",
    safety_officer: "bg-orange-100 text-orange-800",
    data_entry: "bg-blue-100 text-blue-800",
    reviewer: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[role as keyof typeof colors] || colors.viewer}`}>
      {role.replace('_', ' ')}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive?: boolean }) {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      isActive 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800"
    }`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
