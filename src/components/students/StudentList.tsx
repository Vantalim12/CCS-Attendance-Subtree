import React, { useState, useEffect } from "react";
import { Student } from "../../types";
import { api } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

interface StudentListProps {
  refreshTrigger?: number;
  onStudentSelect?: (student: Student | null) => void;
  onEditStudent?: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  refreshTrigger,
  onStudentSelect,
  onEditStudent,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [majorFilter, setMajorFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, statusFilter, yearFilter, majorFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.departmentProgram
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter((student) => student.yearLevel === yearFilter);
    }

    // Major filter
    if (majorFilter !== "all") {
      filtered = filtered.filter((student) => student.major === majorFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    onStudentSelect?.(student);
  };

  const handleEditClick = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    onEditStudent?.(student);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await api.delete(`/students/${studentId}`);
      await fetchStudents();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete student");
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "regular":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "governor":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "vice-governor":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "under-secretary":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get unique values for filters
  const uniqueYears = Array.from(
    new Set(students.map((s) => s.yearLevel))
  ).sort();
  const uniqueMajors = Array.from(new Set(students.map((s) => s.major))).sort();
  const statusOptions = [
    "regular",
    "governor",
    "vice-governor",
    "under-secretary",
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="label">Search Students</label>
            <input
              type="text"
              placeholder="Search by name, ID, major, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status
                    .replace("-", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="label">Year Level</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Major Filter */}
          <div>
            <label className="label">Major</label>
            <select
              value={majorFilter}
              onChange={(e) => setMajorFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Majors</option>
              {uniqueMajors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredStudents.length} of {students.length} students
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setYearFilter("all");
              setMajorFilter("all");
            }}
            className="btn-secondary text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No students found matching your criteria
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student._id}
              onClick={() => handleStudentClick(student)}
              className={`bg-white rounded-lg shadow border-2 transition-all cursor-pointer hover:shadow-md ${
                selectedStudent?._id === student._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{student.studentId}</p>
                  </div>
                  <span className={getStatusBadge(student.status)}>
                    {student.status.replace("-", " ")}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Year:</span>
                    <span className="font-medium">{student.yearLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Major:</span>
                    <span className="font-medium">{student.major}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Program:</span>
                    <span className="font-medium text-xs">
                      {student.departmentProgram}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={(e) => handleEditClick(e, student)}
                      className="flex-1 btn-secondary text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudent(student._id);
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Student Details */}
      {selectedStudent && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Student Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Student ID</label>
              <p className="text-gray-900">{selectedStudent.studentId}</p>
            </div>
            <div>
              <label className="label">Full Name</label>
              <p className="text-gray-900">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </p>
            </div>
            <div>
              <label className="label">Year Level</label>
              <p className="text-gray-900">{selectedStudent.yearLevel}</p>
            </div>
            <div>
              <label className="label">Major</label>
              <p className="text-gray-900">{selectedStudent.major}</p>
            </div>
            <div className="md:col-span-2">
              <label className="label">Department/Program</label>
              <p className="text-gray-900">
                {selectedStudent.departmentProgram}
              </p>
            </div>
            <div>
              <label className="label">Status</label>
              <span className={getStatusBadge(selectedStudent.status)}>
                {selectedStudent.status.replace("-", " ")}
              </span>
            </div>
            <div>
              <label className="label">QR Code Data</label>
              <p className="text-gray-900 text-sm font-mono break-all">
                {selectedStudent.qrCodeData}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
