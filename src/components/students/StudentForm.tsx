import React, { useState, useEffect } from "react";
import { Student } from "../../types";
import { api } from "../../services/auth.service";
import LoadingSpinner from "../common/LoadingSpinner";

interface StudentFormProps {
  student?: Student | null;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmitSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    yearLevel: "",
    major: "",
    status: "regular" as
      | "regular"
      | "governor"
      | "vice-governor"
      | "under-secretary",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        yearLevel: student.yearLevel,
        major: student.major,
        status: student.status,
      });
    } else {
      setFormData({
        studentId: "",
        firstName: "",
        lastName: "",
        yearLevel: "",
        major: "",
        status: "regular",
      });
    }
  }, [student]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.studentId.trim() ||
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.yearLevel ||
      !formData.major.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (student) {
        // Update existing student
        await api.put(`/students/${student._id}`, formData);
        setSuccess("Student updated successfully");
      } else {
        // Create new student
        await api.post("/students", formData);
        setSuccess("Student created successfully");
        // Reset form for new entries
        setFormData({
          studentId: "",
          firstName: "",
          lastName: "",
          yearLevel: "",
          major: "",
          status: "regular",
        });
      }

      onSubmitSuccess?.();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        `Failed to ${student ? "update" : "create"} student`
      );
    } finally {
      setLoading(false);
    }
  };

  const yearLevelOptions = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
  ];
  const statusOptions = [
    { value: "regular", label: "Regular" },
    { value: "governor", label: "Governor" },
    { value: "vice-governor", label: "Vice Governor" },
    { value: "under-secretary", label: "Under Secretary" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {student ? "Edit Student" : "Add New Student"}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student ID */}
          <div>
            <label className="label">Student ID *</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 2024-001234"
              required
            />
          </div>

          {/* First Name */}
          <div>
            <label className="label">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Juan"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="label">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Dela Cruz"
              required
            />
          </div>

          {/* Year Level */}
          <div>
            <label className="label">Year Level *</label>
            <select
              name="yearLevel"
              value={formData.yearLevel}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Year Level</option>
              {yearLevelOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Major */}
          <div>
            <label className="label">Major *</label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Computer Science"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="label">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" text="" />
                <span className="ml-2">
                  {student ? "Updating..." : "Creating..."}
                </span>
              </div>
            ) : student ? (
              "Update Student"
            ) : (
              "Create Student"
            )}
          </button>

          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
