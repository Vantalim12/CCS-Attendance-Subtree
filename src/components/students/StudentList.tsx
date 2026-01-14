import React, { useState, useEffect, useCallback } from "react";
import { Student } from "../../types";
import { api } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

interface StudentListProps {
  refreshTrigger?: number;
  onStudentSelect?: (student: Student | null) => void;
  onEditStudent?: (student: Student) => void;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // For filter dropdowns, we need all unique values - fetch these separately or use stats
  const [allYears, setAllYears] = useState<string[]>([]);
  const [allMajors, setAllMajors] = useState<string[]>([]);

  const applyFilters = useCallback(() => {
    // With server-side pagination, we don't filter on the client anymore
    // The students array is already filtered by the server
    setFilteredStudents(students);
  }, [students]);

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger, currentPage, itemsPerPage]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchStudents();
    }
  }, [searchTerm, statusFilter, yearFilter, majorFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (yearFilter !== "all") params.append("yearLevel", yearFilter);
      if (majorFilter !== "all") params.append("major", majorFilter);

      const response = await api.get(`/students?${params.toString()}`);

      // Handle both old (array) and new (paginated object) response formats
      let studentsData: Student[] = [];
      let totalCount = 0;
      let pages = 1;

      if (Array.isArray(response.data)) {
        // Old format: response.data is directly an array
        studentsData = response.data;
        totalCount = response.data.length;
        pages = 1;
      } else if (response.data && Array.isArray(response.data.data)) {
        // New format: { data: [], meta: {}, stats: {} }
        studentsData = response.data.data;
        const meta = response.data.meta || {};
        totalCount = meta.total || studentsData.length;
        pages = meta.totalPages || 1;
      }

      setStudents(studentsData);
      setTotalItems(totalCount);
      setTotalPages(pages);

      // Update unique filter values from the fetched data
      const years = Array.from(new Set(studentsData.map((s: Student) => s.yearLevel))).sort() as string[];
      const majors = Array.from(new Set(studentsData.map((s: Student) => s.major))).sort() as string[];
      if (years.length > allYears.length) setAllYears(years);
      if (majors.length > allMajors.length) setAllMajors(majors);

    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
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

  const handleExportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Student ID",
      "First Name",
      "Last Name",
      "Year Level",
      "Major",
      "Status",
      "QR Code Data",
      "Created At"
    ];

    // Convert student data to CSV rows
    const rows = filteredStudents.map((student) => [
      student.studentId,
      student.firstName,
      student.lastName,
      student.yearLevel,
      student.major,
      student.status,
      student.qrCodeData,
      new Date(student.createdAt).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => {
          // Escape cells containing commas, quotes, or newlines
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(",")
      )
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAllStudents = async () => {
    if (students.length === 0) {
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ALL ${students.length} students? This action cannot be undone.`
      )
    ) {
      return;
    }

    // Double confirmation for safety
    if (
      !window.confirm(
        `This will permanently delete ${students.length} student records. Type confirm to proceed.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await api.delete("/students/all");
      await fetchStudents();
      setSelectedStudent(null);
      onStudentSelect?.(null);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete all students");
    } finally {
      setLoading(false);
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
              placeholder="Search by name, ID, or major..."
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
            Showing {filteredStudents.length} of {totalItems} students (Page {currentPage} of {totalPages})
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportToCSV}
              disabled={filteredStudents.length === 0}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export filtered students to CSV"
            >
              📥 Export to CSV
            </button>
            {isAdmin && (
              <button
                onClick={handleDeleteAllStudents}
                disabled={students.length === 0}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete all students"
              >
                🗑️ Delete All
              </button>
            )}
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
              className={`bg-white rounded-lg shadow border-2 transition-all cursor-pointer hover:shadow-md ${selectedStudent?._id === student._id
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="input-field w-20"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded ${currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

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
