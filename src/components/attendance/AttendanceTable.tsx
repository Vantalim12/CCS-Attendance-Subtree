import React, { useState, useEffect, useCallback } from "react";
import { Attendance, Event } from "../../types";
import { api } from "../../services/auth.service";
import LoadingSpinner from "../common/LoadingSpinner";

interface AttendanceTableProps {
  selectedEvent?: Event | null;
  refreshTrigger?: number;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  selectedEvent,
  refreshTrigger,
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "all" | "present" | "absent" | "excused"
  >("all");
  const [sessionFilter, setSessionFilter] = useState<
    "all" | "morning" | "afternoon"
  >("all");
  const [error, setError] = useState("");

  const fetchAttendanceRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let url = "/attendance";
      if (selectedEvent) {
        url = `/events/${selectedEvent._id}/attendance`;
      }

      const response = await api.get(url);
      setAttendanceRecords(response.data);
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to fetch attendance records"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords, refreshTrigger]);

  const filteredRecords = attendanceRecords.filter((record) => {
    const studentName = `${record.student?.firstName || ""} ${
      record.student?.lastName || ""
    }`.trim();

    // Search filter
    const matchesSearch =
      !searchTerm ||
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student?.studentId
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Status and session filters
    if (filter === "all" && sessionFilter === "all") return true;

    if (sessionFilter === "morning") {
      return filter === "all" || record.morningStatus === filter;
    } else if (sessionFilter === "afternoon") {
      return filter === "all" || record.afternoonStatus === filter;
    } else {
      // sessionFilter === "all"
      if (filter === "all") return true;
      return (
        record.morningStatus === filter || record.afternoonStatus === filter
      );
    }
  });

  const getStatusStats = () => {
    const stats = {
      total: attendanceRecords.length,
      presentMorning: attendanceRecords.filter(
        (r) => r.morningStatus === "present"
      ).length,
      presentAfternoon: attendanceRecords.filter(
        (r) => r.afternoonStatus === "present"
      ).length,
      absentMorning: attendanceRecords.filter(
        (r) => r.morningStatus === "absent"
      ).length,
      absentAfternoon: attendanceRecords.filter(
        (r) => r.afternoonStatus === "absent"
      ).length,
      excusedMorning: attendanceRecords.filter(
        (r) => r.morningStatus === "excused"
      ).length,
      excusedAfternoon: attendanceRecords.filter(
        (r) => r.afternoonStatus === "excused"
      ).length,
    };

    return stats;
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

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    return new Date(timeString).toLocaleTimeString("en-US", {
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

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {selectedEvent
            ? `Attendance for ${selectedEvent.title}`
            : "All Attendance Records"}
        </h2>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-600">
              Morning Present
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.presentMorning}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-600">
              Afternoon Present
            </div>
            <div className="text-2xl font-bold text-green-900">
              {stats.presentAfternoon}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-red-600">Total Absent</div>
            <div className="text-2xl font-bold text-red-900">
              {stats.absentMorning + stats.absentAfternoon}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-yellow-600">
              Total Excused
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {stats.excusedMorning + stats.excusedAfternoon}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
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
              <option value="morning">Morning Only</option>
              <option value="afternoon">Afternoon Only</option>
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

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Attendance Records ({filteredRecords.length} of{" "}
            {attendanceRecords.length})
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const studentName = record.student
                  ? `${record.student.firstName} ${record.student.lastName}`
                  : "Unknown Student";

                return (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.student?.studentId || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(record.morningStatus)}>
                        {record.morningStatus.charAt(0).toUpperCase() +
                          record.morningStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(record.afternoonStatus)}>
                        {record.afternoonStatus.charAt(0).toUpperCase() +
                          record.afternoonStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {record.morningCheckIn && (
                          <div>🌅 {formatTime(record.morningCheckIn)}</div>
                        )}
                        {record.afternoonCheckIn && (
                          <div>🌇 {formatTime(record.afternoonCheckIn)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {attendanceRecords.length === 0
              ? "No attendance records found"
              : "No records match your search criteria"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
