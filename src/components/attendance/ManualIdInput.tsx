import React, { useState, useEffect, useCallback } from "react";
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
  onAlreadySignedIn?: (data: {
    studentName: string;
    studentId: string;
    signInTime: string;
    session: "morning" | "afternoon";
  }) => void;
}

const ManualIdInput: React.FC<ManualIdInputProps> = ({
  selectedEvent,
  session,
  onAttendanceMarked,
  onError,
  onAlreadySignedIn,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const searchStudents = useCallback(async (query: string) => {
    if (!query || query.length < 2) return;

    setIsSearching(true);
    setNetworkError(false);
    try {
      console.log("Searching for students with query:", query);
      console.log("Encoded query:", encodeURIComponent(query));

      // Check authentication status
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      console.log("Token exists:", !!token);
      console.log("User exists:", !!user);
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          console.log("User role:", parsedUser.role);
        } catch (e) {
          console.log("Error parsing user:", e);
        }
      }

      const response = await api.get(
        `/students?search=${encodeURIComponent(query)}`
      );

      console.log("Search response status:", response.status);
      console.log("Search response data:", response.data);
      console.log("Response data type:", typeof response.data);
      console.log("Is response data an array?", Array.isArray(response.data));

      // Handle different response formats
      let students = [];
      if (Array.isArray(response.data)) {
        students = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        students = response.data.data;
      } else if (response.data && response.data.students) {
        students = response.data.students;
      } else {
        console.warn("Unexpected response format:", response.data);
        students = [];
      }

      console.log("Processed students array:", students);
      console.log("Number of students found:", students.length);

      // Filter out invalid records if any
      students = students.filter((student: Student) => {
        return student.studentId && (student.firstName || (student as any).studentName);
      });

      // Limit to top 5 results for better UX
      setSearchResults(students.slice(0, 5));
      setShowDropdown(students.length > 0);
    } catch (error: any) {
      console.error("Error searching students:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error message:", error.message);

      let errorMessage = "Failed to search students";
      let isNetworkIssue = false;

      // Check if it's a network error
      if (
        !error.response &&
        (error.message === "Network Error" || error.code === "ERR_NETWORK")
      ) {
        errorMessage =
          "Network error: Please check your internet connection and try again.";
        isNetworkIssue = true;
        setNetworkError(true);
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "Insufficient permissions to search students.";
      } else if (error.response?.status === 404) {
        errorMessage =
          "Students endpoint not found. Please check the API configuration.";
      } else if (error.response?.status === 500) {
        errorMessage =
          "Server error while searching students. Please try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log("Final error message:", errorMessage);
      console.log("Is network issue:", isNetworkIssue);

      onError(errorMessage);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, [onError]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Don't search if a student is already selected
    if (selectedStudent) {
      setShowDropdown(false);
      return;
    }

    console.log("Starting search for:", searchQuery); // Debug log
    const searchTimeout = setTimeout(async () => {
      await searchStudents(searchQuery.trim());
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, selectedStudent, searchStudents]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);

    // Handle different name formats from the backend
    let studentName = "";
    if (student.firstName && student.lastName) {
      studentName = `${student.firstName} ${student.lastName}`;
    } else if ((student as any).studentName) {
      studentName = (student as any).studentName;
    } else {
      studentName = "Unknown Name";
    }

    setSearchQuery(`${student.studentId} - ${studentName}`);
    setSearchResults([]);
    setShowDropdown(false); // Close dropdown when student is selected
  };

  const markAttendance = async () => {
    if (!selectedStudent || !selectedEvent) {
      onError("Please select a student and event");
      return;
    }

    setIsMarkingAttendance(true);
    setNetworkError(false);

    try {
      const response = await api.post("/attendance/manual-sign-in", {
        studentId: selectedStudent._id,
        eventId: selectedEvent._id,
        session,
      });

      console.log("Attendance marked successfully:", response.data);

      // Handle different name formats
      let studentName = "";
      if (selectedStudent.firstName && selectedStudent.lastName) {
        studentName = `${selectedStudent.firstName} ${selectedStudent.lastName}`;
      } else if ((selectedStudent as any).studentName) {
        studentName = (selectedStudent as any).studentName;
      } else {
        studentName = "Unknown Name";
      }

      onAttendanceMarked({
        studentId: selectedStudent.studentId,
        studentName: studentName,
      });

      // Clear selection after successful marking
      setSelectedStudent(null);
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
    } catch (error: any) {
      console.error("Error marking attendance:", error);

      // Check if this is a network error
      if (
        !error.response &&
        (error.message === "Network Error" || error.code === "ERR_NETWORK")
      ) {
        setNetworkError(true);
        onError(
          "Network error: Unable to mark attendance. Please check your internet connection and try again."
        );
        return;
      }

      // Check if this is an "already signed in" error
      const errorMessage = error.response?.data?.message || "";
      const errorData = error.response?.data;

      if (
        errorMessage.includes("already signed in") &&
        errorData?.student &&
        onAlreadySignedIn
      ) {
        // Trigger the "Already Signed In" modal
        onAlreadySignedIn({
          studentName: errorData.student.studentName,
          studentId: errorData.student.studentId,
          signInTime: errorData.student.signInTime,
          session: session,
        });
      } else {
        // Show regular error with better context
        const displayError =
          errorMessage || "Failed to mark attendance. Please try again.";
        onError(displayError);
      }
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedStudent(null);
    setShowDropdown(false);
    setNetworkError(false);
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
            {/* Network Error Warning */}
            {networkError && (
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h5 className="font-semibold text-red-900 mb-1">
                      Network Connection Issue
                    </h5>
                    <p className="text-sm text-red-800">
                      Unable to connect to the server. Please check your
                      internet connection and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Student ID or Name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setNetworkError(false);
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0 && !selectedStudent) {
                      setShowDropdown(true);
                    }
                  }}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isMarkingAttendance}
                />
                {searchQuery && !isSearching && (
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
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner size="sm" text="" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && !selectedStudent && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                  {searchResults.map((student) => (
                    <button
                      key={student._id}
                      onClick={() => handleStudentSelect(student)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-200 last:border-b-0 focus:outline-none focus:bg-blue-100 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">
                        {student.firstName && student.lastName
                          ? `${student.firstName} ${student.lastName}`
                          : (student as any).studentName || "Unknown Name"}
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
                searchResults.length === 0 &&
                !selectedStudent &&
                !networkError && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
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
                    {selectedStudent.firstName && selectedStudent.lastName
                      ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                      : (selectedStudent as any).studentName || "Unknown Name"}
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
              disabled={!selectedStudent || isMarkingAttendance || networkError}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
            >
              {isMarkingAttendance ? (
                <>
                  <LoadingSpinner size="sm" text="" />
                  <span>Marking Attendance...</span>
                </>
              ) : networkError ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span>Network Error - Please Retry</span>
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
