import React, { useState, useEffect, useCallback } from "react";
import { Event, Attendance, Student } from "../../types";
import { api } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

interface EventAttendanceProps {
  event: Event;
}

const EventAttendance: React.FC<EventAttendanceProps> = ({ event }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentMorning: 0,
    presentAfternoon: 0,
    absentMorning: 0,
    absentAfternoon: 0,
    excusedMorning: 0,
    excusedAfternoon: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "present" | "absent" | "excused"
  >("all");
  const [sessionFilter, setSessionFilter] = useState<
    "all" | "morning" | "afternoon"
  >("all");
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const fetchEventAttendance = useCallback(async () => {
    try {
      const response = await api.get(`/events/${event._id}/attendance`);
      console.log("Fetched attendance records:", response.data); // Debug log
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error("Failed to fetch event attendance:", error);
    }
  }, [event._id]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = useCallback(() => {
    // Only count students who have attendance records for this event
    const totalStudents = attendanceRecords.length;
    let presentMorning = 0,
      presentAfternoon = 0;
    let absentMorning = 0,
      absentAfternoon = 0;
    let excusedMorning = 0,
      excusedAfternoon = 0;

    attendanceRecords.forEach((attendance) => {
      // Count morning session stats
      if (attendance.morningStatus === "present") presentMorning++;
      else if (attendance.morningStatus === "absent") absentMorning++;
      else if (attendance.morningStatus === "excused") excusedMorning++;

      // Count afternoon session stats
      if (attendance.afternoonStatus === "present") presentAfternoon++;
      else if (attendance.afternoonStatus === "absent") absentAfternoon++;
      else if (attendance.afternoonStatus === "excused") excusedAfternoon++;
    });

    setStats({
      totalStudents,
      presentMorning,
      presentAfternoon,
      absentMorning,
      absentAfternoon,
      excusedMorning,
      excusedAfternoon,
    });
  }, [attendanceRecords]);

  useEffect(() => {
    fetchEventAttendance();
    fetchStudents();
  }, [event._id, fetchEventAttendance]);

  useEffect(() => {
    calculateStats();
  }, [attendanceRecords, students, calculateStats]);

  // Refresh attendance data periodically during the event
  useEffect(() => {
    const isEventActive = () => {
      const now = new Date();
      const eventDate = new Date(event.eventDate);
      const [startHour, startMinute] = event.startTime.split(":").map(Number);
      const [endHour, endMinute] = event.endTime.split(":").map(Number);

      const eventStart = new Date(eventDate);
      eventStart.setHours(startHour, startMinute, 0, 0);

      const eventEnd = new Date(eventDate);
      eventEnd.setHours(endHour, endMinute, 0, 0);

      // Check if event is active (within 1 hour before start to 2 hours after end)
      const beforeEventWindow = new Date(eventStart.getTime() - 60 * 60 * 1000);
      const afterEventWindow = new Date(
        eventEnd.getTime() + 2 * 60 * 60 * 1000
      );

      return now >= beforeEventWindow && now <= afterEventWindow;
    };

    let refreshInterval: NodeJS.Timeout | null = null;

    if (isEventActive()) {
      // Refresh every 30 seconds during active events
      refreshInterval = setInterval(() => {
        console.log("Auto-refreshing attendance data for active event");
        fetchEventAttendance();
      }, 30000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [event._id, event.eventDate, event.startTime, event.endTime, fetchEventAttendance]);

  const getFilteredStudents = () => {
    // Only show students who have attendance records
    return attendanceRecords.filter((attendance) => {
      const student = attendance.student;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !student.firstName.toLowerCase().includes(searchLower) &&
          !student.lastName.toLowerCase().includes(searchLower) &&
          !student.studentId.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status and session filters
      if (statusFilter !== "all" || sessionFilter !== "all") {
        const morningStatus = attendance.morningStatus;
        const afternoonStatus = attendance.afternoonStatus;

        if (statusFilter !== "all") {
          if (sessionFilter === "morning" && morningStatus !== statusFilter)
            return false;
          if (sessionFilter === "afternoon" && afternoonStatus !== statusFilter)
            return false;
          if (
            sessionFilter === "all" &&
            morningStatus !== statusFilter &&
            afternoonStatus !== statusFilter
          )
            return false;
        }

        if (sessionFilter !== "all" && statusFilter === "all") {
          // Show all statuses but only for specific session
          return true;
        }
      }

      return true;
    });
  };

  const handleManualMarkAttendance = async (
    studentId: string,
    session: "morning" | "afternoon",
    status: "present" | "absent" | "excused"
  ) => {
    if (!isAdmin) return;

    try {
      await api.post(`/attendance/manual-sign-in`, {
        studentId,
        eventId: event._id,
        session,
      });
      // Refresh attendance data and recalculate stats
      await fetchEventAttendance();
      // Small delay to ensure backend has processed the update
      setTimeout(() => {
        fetchEventAttendance();
      }, 500);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const exportAttendance = async () => {
    try {
      const response = await api.get(
        `/attendance/export?eventId=${event._id}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.title}-attendance-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to export attendance");
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "present":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "absent":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "excused":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredAttendance = getFilteredStudents();

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-gray-600 mt-1">
              {new Date(event.eventDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              • {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </p>
            {event.location && (
              <p className="text-gray-500 text-sm mt-1">📍 {event.location}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log("Manual refresh triggered");
                  fetchEventAttendance();
                }}
                className="btn-secondary flex items-center gap-2"
                title="Refresh attendance data"
              >
                🔄 Refresh
              </button>
              <button
                onClick={exportAttendance}
                className="btn-primary flex items-center gap-2"
              >
                📊 Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Morning Present
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.presentMorning}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Afternoon Present
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.presentAfternoon}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Absent</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.absentMorning + stats.absentAfternoon}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Excused</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.excusedMorning + stats.excusedAfternoon}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Search Students</label>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused</option>
            </select>
          </div>
          <div>
            <label className="label">Filter by Session</label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Sessions</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Attendance Records ({filteredAttendance.length} of{" "}
            {stats.totalStudents} students)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Morning Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Afternoon Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Times
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((attendance) => {
                const student = attendance.student;
                const morningStatus = attendance.morningStatus;
                const afternoonStatus = attendance.afternoonStatus;

                return (
                  <tr key={attendance._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.studentId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(morningStatus)}>
                        {morningStatus.charAt(0).toUpperCase() +
                          morningStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(afternoonStatus)}>
                        {afternoonStatus.charAt(0).toUpperCase() +
                          afternoonStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {attendance.morningCheckIn && (
                          <div>
                            🌅{" "}
                            {new Date(
                              attendance.morningCheckIn
                            ).toLocaleTimeString()}
                          </div>
                        )}
                        {attendance.afternoonCheckIn && (
                          <div>
                            🌇{" "}
                            {new Date(
                              attendance.afternoonCheckIn
                            ).toLocaleTimeString()}
                          </div>
                        )}
                        {!attendance.morningCheckIn &&
                          !attendance.afternoonCheckIn && (
                            <div className="text-gray-400">
                              No check-ins yet
                            </div>
                          )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const [session, status] =
                                  e.target.value.split("-");
                                handleManualMarkAttendance(
                                  student._id,
                                  session as any,
                                  status as any
                                );
                                e.target.value = "";
                              }
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Mark...</option>
                            <option value="morning-present">
                              Morning Present
                            </option>
                            <option value="morning-absent">
                              Morning Absent
                            </option>
                            <option value="morning-excused">
                              Morning Excused
                            </option>
                            <option value="afternoon-present">
                              Afternoon Present
                            </option>
                            <option value="afternoon-absent">
                              Afternoon Absent
                            </option>
                            <option value="afternoon-excused">
                              Afternoon Excused
                            </option>
                          </select>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAttendance.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {attendanceRecords.length === 0
              ? "No attendance records yet. Students will appear here after scanning QR codes or manual marking."
              : "No students found matching your criteria"}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAttendance;
