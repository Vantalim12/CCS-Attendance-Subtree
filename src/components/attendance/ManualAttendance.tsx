import React, { useState, useEffect } from "react";
import { Student, Event } from "../../types";
import { api } from "../../services/auth.service";
import LoadingSpinner from "../common/LoadingSpinner";

interface ManualAttendanceProps {
  selectedEvent?: Event;
  onAttendanceMarked?: () => void;
}

const ManualAttendance: React.FC<ManualAttendanceProps> = ({
  selectedEvent,
  onAttendanceMarked,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [session, setSession] = useState<"morning" | "afternoon">("morning");
  const [action, setAction] = useState<"sign-in" | "sign-out">("sign-in");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".student-search-container")) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      // Handle paginated response format
      const studentsData = response.data.students || response.data;
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Please select a student from the search results");
      return;
    }
    if (!selectedEvent) {
      setError("Please select an event");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint =
        action === "sign-in"
          ? "/attendance/manual-sign-in"
          : "/attendance/manual-sign-out";

      await api.post(endpoint, {
        studentId: selectedStudent,
        eventId: selectedEvent._id,
        session,
      });

      setSuccess(`Successfully marked ${action} for ${session} session`);
      setSelectedStudent("");
      setSearchTerm("");
      onAttendanceMarked?.();
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to mark ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower)
    );
  });

  // Get selected student details
  const selectedStudentData = students.find((s) => s._id === selectedStudent);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student._id);
    setSearchTerm(
      `${student.firstName} ${student.lastName} (${student.studentId})`
    );
    setShowDropdown(false);
    clearMessages();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedStudent("");
    setShowDropdown(true);
    clearMessages();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Manual Attendance Marking
      </h3>

      {!selectedEvent && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800">
            Please select an event to mark attendance
          </p>
        </div>
      )}

      <form onSubmit={handleManualAttendance} className="space-y-4">
        {/* Student Selection with Search */}
        <div className="relative student-search-container">
          <label className="label">Student *</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name or student ID..."
              className="input-field w-full"
              autoComplete="off"
              required={!selectedStudent}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>

          {/* Dropdown with filtered results */}
          {showDropdown && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.slice(0, 10).map((student) => (
                  <div
                    key={student._id}
                    onClick={() => handleStudentSelect(student)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {student.studentId} • {student.yearLevel} •{" "}
                      {student.major}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  No students found matching "{searchTerm}"
                </div>
              )}
              {filteredStudents.length > 10 && (
                <div className="px-4 py-2 text-gray-500 text-sm border-t">
                  Showing first 10 results. Continue typing to narrow down...
                </div>
              )}
            </div>
          )}

          {/* Show selected student info */}
          {selectedStudentData && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm font-medium text-blue-900">
                Selected: {selectedStudentData.firstName}{" "}
                {selectedStudentData.lastName}
              </div>
              <div className="text-xs text-blue-700">
                ID: {selectedStudentData.studentId} •{" "}
                {selectedStudentData.yearLevel} • {selectedStudentData.major}
              </div>
            </div>
          )}
        </div>

        {/* Session Selection */}
        <div>
          <label className="label">Session</label>
          <div className="flex gap-4">
            {(["morning", "afternoon"] as const).map((sessionType) => (
              <label key={sessionType} className="flex items-center">
                <input
                  type="radio"
                  name="session"
                  value={sessionType}
                  checked={session === sessionType}
                  onChange={(e) =>
                    setSession(e.target.value as "morning" | "afternoon")
                  }
                  className="mr-2"
                />
                <span className="capitalize">{sessionType}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Selection */}
        <div>
          <label className="label">Action</label>
          <div className="flex gap-4">
            {(["sign-in", "sign-out"] as const).map((actionType) => (
              <label key={actionType} className="flex items-center">
                <input
                  type="radio"
                  name="action"
                  value={actionType}
                  checked={action === actionType}
                  onChange={(e) =>
                    setAction(e.target.value as "sign-in" | "sign-out")
                  }
                  className="mr-2"
                />
                <span className="capitalize">
                  {actionType.replace("-", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedEvent}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" text="" />
              <span className="ml-2">Marking Attendance...</span>
            </div>
          ) : (
            `Mark ${action.replace("-", " ")} for ${session}`
          )}
        </button>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </form>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setAction("sign-in");
              setSession("morning");
              clearMessages();
            }}
            className="btn-secondary text-sm"
          >
            Morning Sign-in
          </button>
          <button
            onClick={() => {
              setAction("sign-out");
              setSession("morning");
              clearMessages();
            }}
            className="btn-secondary text-sm"
          >
            Morning Sign-out
          </button>
          <button
            onClick={() => {
              setAction("sign-in");
              setSession("afternoon");
              clearMessages();
            }}
            className="btn-secondary text-sm"
          >
            Afternoon Sign-in
          </button>
          <button
            onClick={() => {
              setAction("sign-out");
              setSession("afternoon");
              clearMessages();
            }}
            className="btn-secondary text-sm"
          >
            Afternoon Sign-out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendance;
