import React, { useState, useEffect } from "react";
import { Student, Event } from "../../types";
import { api } from "../../services/auth.service";
import LoadingSpinner from "../common/LoadingSpinner";

interface ManualIdInputProps {
  selectedEvent: Event | null;
  session: "morning" | "afternoon";
  onAttendanceMarked: (studentData: {
    studentId: string;
    studentName: string;
  }) => void;
  onError: (error: string) => void;
}

const ManualIdInput: React.FC<ManualIdInputProps> = ({
  selectedEvent,
  session,
  onAttendanceMarked,
  onError,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      await searchStudents(searchQuery.trim());
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const searchStudents = async (query: string) => {
    if (!query || query.length < 2) return;

    setIsSearching(true);
    try {
      const response = await api.get(
        `/students?search=${encodeURIComponent(query)}`
      );
      const students = Array.isArray(response.data) ? response.data : [];

      // Limit to top 5 results for better UX
      setSearchResults(students.slice(0, 5));
    } catch (error: any) {
      console.error("Error searching students:", error);
      onError("Failed to search students");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery(
      `${student.studentId} - ${student.firstName} ${student.lastName}`
    );
    setSearchResults([]);
  };

  const markAttendance = async () => {
    if (!selectedStudent || !selectedEvent) {
      onError("Please select a student and event");
      return;
    }

    setIsMarkingAttendance(true);
    try {
      await api.post("/attendance/manual-signin", {
        studentId: selectedStudent._id,
        eventId: selectedEvent._id,
        session,
      });

      onAttendanceMarked({
        studentId: selectedStudent.studentId,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      });

      // Clear selection after successful marking
      setSelectedStudent(null);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error: any) {
      onError(error.response?.data?.message || "Failed to mark attendance");
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedStudent(null);
  };

  return (
    <div className="bg-gray-50 border-t border-gray-200 p-6 mt-6">
      <div className="max-w-md mx-auto">
        <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">
          Manual ID Input
        </h4>

        {!selectedEvent ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-yellow-800 text-sm text-center">
              Please select an event to mark attendance
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Student ID or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Loading indicator */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" text="" />
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((student) => (
                    <button
                      key={student._id}
                      onClick={() => handleStudentSelect(student)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
                    >
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {student.studentId} • {student.yearLevel}{" "}
                        {student.major}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results message */}
              {searchQuery.length >= 2 &&
                !isSearching &&
                searchResults.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <p className="text-gray-500 text-center text-sm">
                      No students found matching "{searchQuery}"
                    </p>
                  </div>
                )}
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">
                  Selected Student:
                </h5>
                <div className="text-blue-800">
                  <p className="font-medium">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                  <p className="text-sm">ID: {selectedStudent.studentId}</p>
                  <p className="text-sm">
                    {selectedStudent.yearLevel} - {selectedStudent.major}
                  </p>
                </div>
              </div>
            )}

            {/* Mark Attendance Button */}
            <button
              onClick={markAttendance}
              disabled={!selectedStudent || isMarkingAttendance}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isMarkingAttendance ? (
                <>
                  <LoadingSpinner size="sm" text="" />
                  <span>Marking Attendance...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>
                    Mark {session.charAt(0).toUpperCase() + session.slice(1)}{" "}
                    Attendance
                  </span>
                </>
              )}
            </button>

            {/* Instructions */}
            <div className="text-xs text-gray-500 text-center">
              <p>Type at least 2 characters to search for students</p>
              <p>You can search by Student ID or Name</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualIdInput;
