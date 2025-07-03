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

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedEvent) {
      setError("Please select a student and event");
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
        {/* Student Selection */}
        <div>
          <label className="label">Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => {
              setSelectedStudent(e.target.value);
              clearMessages();
            }}
            className="input-field"
            required
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} ({student.studentId})
              </option>
            ))}
          </select>
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
