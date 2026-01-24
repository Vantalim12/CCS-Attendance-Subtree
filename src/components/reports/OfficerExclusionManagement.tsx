import React, { useState, useEffect } from "react";
import { api } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import { Student } from "../../types";

interface OfficerExclusion {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    status: string;
  };
  startDate: string;
  endDate: string;
  reason: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const OfficerExclusionManagement: React.FC = () => {
  const [exclusions, setExclusions] = useState<OfficerExclusion[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExclusion, setEditingExclusion] =
    useState<OfficerExclusion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired"
  >("all");

  const [formData, setFormData] = useState({
    studentId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  useEffect(() => {
    fetchExclusions();
    fetchStudents();
  }, []);

  const fetchExclusions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/officer-exclusions");
      setExclusions(response.data);
    } catch (error: any) {
      console.error(error);
      setError("Failed to fetch officer exclusions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      // Handle both possible structures (paginated vs array)
      const data = response.data.students || response.data;
      setStudents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);
      setError("Failed to fetch students");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.studentId ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError("End date must be after start date");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingExclusion) {
        await api.put(`/officer-exclusions/${editingExclusion._id}`, formData);
      } else {
        await api.post("/officer-exclusions", formData);
      }

      await fetchExclusions();
      resetForm();
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to save officer exclusion"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exclusion: OfficerExclusion) => {
    setEditingExclusion(exclusion);
    setFormData({
      studentId: exclusion.student._id,
      startDate: new Date(exclusion.startDate).toISOString().split("T")[0],
      endDate: new Date(exclusion.endDate).toISOString().split("T")[0],
      reason: exclusion.reason,
    });
    setShowForm(true);
  };

  const handleDelete = async (exclusionId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this officer exclusion?")
    ) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/officer-exclusions/${exclusionId}`);
      await fetchExclusions();
    } catch (error: any) {
      setError("Failed to delete officer exclusion");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
    setEditingExclusion(null);
    setShowForm(false);
    setError("");
  };

  const isExclusionActive = (exclusion: OfficerExclusion) => {
    const now = new Date();
    const start = new Date(exclusion.startDate);
    const end = new Date(exclusion.endDate);
    return now >= start && now <= end;
  };

  const getFilteredExclusions = () => {
    let filtered = exclusions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((exclusion) => {
        const studentName =
          `${exclusion.student.firstName} ${exclusion.student.lastName}`.toLowerCase();
        const studentId = exclusion.student.studentId.toLowerCase();
        const reason = exclusion.reason.toLowerCase();

        return (
          studentName.includes(searchTerm.toLowerCase()) ||
          studentId.includes(searchTerm.toLowerCase()) ||
          reason.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((exclusion) => {
        const isActive = isExclusionActive(exclusion);
        return statusFilter === "active" ? isActive : !isActive;
      });
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getOfficerStudents = () => {
    return students.filter(
      (student) =>
        student.status === "governor" ||
        student.status === "vice-governor" ||
        student.status === "under-secretary"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (exclusion: OfficerExclusion) => {
    const isActive = isExclusionActive(exclusion);
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const filteredExclusions = getFilteredExclusions();
  const officerStudents = getOfficerStudents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Officer Exclusion Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage attendance exclusions for student officers
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Exclusion
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              placeholder="Search by student name, ID, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Exclusions</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingExclusion
                  ? "Edit Officer Exclusion"
                  : "Add Officer Exclusion"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="label">Student Officer *</label>
                <select
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      studentId: e.target.value,
                    }))
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select Student Officer</option>
                  {officerStudents.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} (
                      {student.studentId}) - {student.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Enter reason for exclusion..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading && <LoadingSpinner />}
                  {editingExclusion ? "Update" : "Create"} Exclusion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Exclusions
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {exclusions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Exclusions
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {exclusions.filter((e) => isExclusionActive(e)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Expired Exclusions
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {exclusions.filter((e) => !isExclusionActive(e)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Officer Students
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {officerStudents.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Officer Exclusions ({filteredExclusions.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Officer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExclusions.map((exclusion) => (
                <tr key={exclusion._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {exclusion.student.firstName}{" "}
                        {exclusion.student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {exclusion.student.studentId} •{" "}
                        {exclusion.student.status.replace("-", " ")}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(exclusion.startDate)} -{" "}
                      {formatDate(exclusion.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {exclusion.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        exclusion
                      )}`}
                    >
                      {isExclusionActive(exclusion) ? "Active" : "Expired"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(exclusion.createdAt)}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(exclusion)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exclusion._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExclusions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {exclusions.length === 0
              ? "No officer exclusions found"
              : "No exclusions match your search criteria"}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default OfficerExclusionManagement;
