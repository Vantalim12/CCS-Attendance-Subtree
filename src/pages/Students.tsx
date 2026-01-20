import React, { useState, useEffect } from "react";
import { Student } from "../types";
import { api } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";
import StudentList from "../components/students/StudentList";
import StudentForm from "../components/students/StudentForm";
import ExcelImport from "../components/students/ExcelImport";
import QRGenerator from "../components/students/QRGenerator";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Students: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"list" | "add" | "import" | "qr">(
    "list"
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/students");
      // Handle both old format (array) and new format (object with pagination)
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents(response.data.students || []);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setActiveTab("add");
  };

  const handleFormSuccess = () => {
    triggerRefresh();
    if (editingStudent) {
      setEditingStudent(null);
      setActiveTab("list");
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setActiveTab("list");
  };

  const tabs = [
    { id: "list" as const, label: "Student List", icon: "👥", show: true },
    {
      id: "add" as const,
      label: editingStudent ? "Edit Student" : "Add Student",
      icon: editingStudent ? "✏️" : "➕",
      show: isAdmin,
    },
    { id: "import" as const, label: "Import Excel", icon: "📊", show: isAdmin },
    { id: "qr" as const, label: "Generate QR", icon: "🔗", show: isAdmin },
  ].filter((tab) => tab.show);

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Student Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage student information, import data, and generate QR codes
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {students.length}
              </div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {students.filter((s) => s.status !== "regular").length}
              </div>
              <div className="text-sm text-gray-500">Officers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="glass-card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "add") {
                    setEditingStudent(null);
                  }
                }}
                className={`${activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === "list" && students.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                    {students.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Student List Tab */}
          {activeTab === "list" && (
            <StudentList
              refreshTrigger={refreshTrigger}
              onEditStudent={handleEditStudent}
            />
          )}

          {/* Add/Edit Student Tab */}
          {activeTab === "add" && isAdmin && (
            <StudentForm
              student={editingStudent}
              onSubmitSuccess={handleFormSuccess}
              onCancel={editingStudent ? handleCancelEdit : undefined}
            />
          )}

          {/* Excel Import Tab */}
          {activeTab === "import" && isAdmin && (
            <ExcelImport onImportSuccess={triggerRefresh} />
          )}

          {/* QR Generator Tab */}
          {activeTab === "qr" && isAdmin && (
            <QRGenerator
              students={students}
              onGenerateSuccess={triggerRefresh}
            />
          )}
        </div>
      </div>

      {/* Quick Actions (Admin Only) */}
      {isAdmin && activeTab === "list" && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab("add")}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <span>➕</span>
              Add New Student
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <span>📊</span>
              Import from Excel
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <span>🔗</span>
              Generate QR Codes
            </button>
          </div>
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["regular", "governor", "vice-governor", "under-secretary"].map(
          (status) => {
            const count = students.filter((s) => s.status === status).length;
            const percentage =
              students.length > 0
                ? ((count / students.length) * 100).toFixed(1)
                : "0";

            return (
              <div
                key={status}
                className="glass-card p-4 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-sm font-medium text-gray-500 capitalize mb-1">
                  {status.replace("-", " ")}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">{percentage}%</div>
              </div>
            );
          }
        )}
      </div>

      {/* Recent Activity */}
      {students.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Students
          </h3>
          <div className="space-y-3">
            {students
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 5)
              .map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-md border border-white/20"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.studentId} • {student.yearLevel} {student.major}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(student.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
