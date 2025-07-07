import React, { useState, useEffect } from "react";
import { api } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import { Event, Student, Attendance } from "../../types";

interface ReportFilters {
  startDate: string;
  endDate: string;
  eventId: string;
  studentId: string;
  yearLevel: string;
  major: string;
  status: "all" | "present" | "absent" | "excused";
  session: "all" | "morning" | "afternoon";
}

interface AttendanceStats {
  totalStudents: number;
  totalEvents: number;
  overallAttendanceRate: number;
  morningAttendanceRate: number;
  afternoonAttendanceRate: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  trendData: Array<{
    date: string;
    attendanceRate: number;
    presentCount: number;
    totalCount: number;
  }>;
}

const ReportGenerator: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    eventId: "",
    studentId: "",
    yearLevel: "",
    major: "",
    status: "all",
    session: "all",
  });

  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState<
    "summary" | "detailed" | "trends"
  >("summary");

  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (events.length > 0 && students.length > 0) {
      generateReport();
    }
  }, [filters, events, students]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [eventsRes, studentsRes] = await Promise.all([
        api.get("/events"),
        api.get("/students"),
      ]);

      // Handle both old and new response formats
      const eventsData = eventsRes.data.events || eventsRes.data;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setStudents(studentsRes.data);
    } catch (error: any) {
      setError("Failed to fetch initial data");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError("");

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.eventId) params.append("eventId", filters.eventId);
      if (filters.studentId) params.append("studentId", filters.studentId);
      if (filters.yearLevel) params.append("yearLevel", filters.yearLevel);
      if (filters.major) params.append("major", filters.major);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.session !== "all") params.append("session", filters.session);

      const response = await api.get(`/attendance/report?${params.toString()}`);
      setAttendanceData(response.data.attendanceRecords || []);
      calculateStatistics(response.data.attendanceRecords || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: Attendance[]) => {
    if (data.length === 0) {
      setStats({
        totalStudents: 0,
        totalEvents: 0,
        overallAttendanceRate: 0,
        morningAttendanceRate: 0,
        afternoonAttendanceRate: 0,
        presentCount: 0,
        absentCount: 0,
        excusedCount: 0,
        trendData: [],
      });
      return;
    }

    const uniqueStudents = new Set(data.map((record) => record.student._id))
      .size;
    const uniqueEvents = new Set(data.map((record) => record.event)).size;

    const morningPresent = data.filter(
      (r) => r.morningStatus === "present"
    ).length;
    const afternoonPresent = data.filter(
      (r) => r.afternoonStatus === "present"
    ).length;
    const morningAbsent = data.filter(
      (r) => r.morningStatus === "absent"
    ).length;
    const afternoonAbsent = data.filter(
      (r) => r.afternoonStatus === "absent"
    ).length;
    const morningExcused = data.filter(
      (r) => r.morningStatus === "excused"
    ).length;
    const afternoonExcused = data.filter(
      (r) => r.afternoonStatus === "excused"
    ).length;

    const totalSessions = data.length * 2; // morning + afternoon
    const totalPresent = morningPresent + afternoonPresent;
    const totalAbsent = morningAbsent + afternoonAbsent;
    const totalExcused = morningExcused + afternoonExcused;

    const overallRate =
      totalSessions > 0 ? (totalPresent / totalSessions) * 100 : 0;
    const morningRate =
      data.length > 0 ? (morningPresent / data.length) * 100 : 0;
    const afternoonRate =
      data.length > 0 ? (afternoonPresent / data.length) * 100 : 0;

    // Calculate trend data (group by date)
    const dateGroups = data.reduce((groups: any, record) => {
      const date = new Date(record.createdAt).toISOString().split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
      return groups;
    }, {});

    const trendData = Object.entries(dateGroups)
      .map(([date, records]: [string, any]) => {
        const dayPresent = records.reduce((count: number, r: Attendance) => {
          return (
            count +
            (r.morningStatus === "present" ? 1 : 0) +
            (r.afternoonStatus === "present" ? 1 : 0)
          );
        }, 0);
        const dayTotal = records.length * 2;
        return {
          date,
          attendanceRate: dayTotal > 0 ? (dayPresent / dayTotal) * 100 : 0,
          presentCount: dayPresent,
          totalCount: dayTotal,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    setStats({
      totalStudents: uniqueStudents,
      totalEvents: uniqueEvents,
      overallAttendanceRate: overallRate,
      morningAttendanceRate: morningRate,
      afternoonAttendanceRate: afternoonRate,
      presentCount: totalPresent,
      absentCount: totalAbsent,
      excusedCount: totalExcused,
      trendData,
    });
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.append(key, value);
        }
      });

      const response = await api.get(
        `/attendance/export?${params.toString()}`,
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
      link.download = `attendance-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError("Failed to export to Excel");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.append(key, value);
        }
      });

      const response = await api.get(
        `/attendance/export/pdf?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError("Failed to export to PDF");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!searchTerm) return attendanceData;

    return attendanceData.filter((record) => {
      const studentName =
        `${record.student.firstName} ${record.student.lastName}`.toLowerCase();
      const studentId = record.student.studentId.toLowerCase();
      // Use eventTitle from the record if available, otherwise find by event ID
      const eventTitle =
        (record as any).eventTitle?.toLowerCase() ||
        events.find((e) => e._id === record.event)?.title?.toLowerCase() ||
        "";

      return (
        studentName.includes(searchTerm.toLowerCase()) ||
        studentId.includes(searchTerm.toLowerCase()) ||
        eventTitle.includes(searchTerm.toLowerCase())
      );
    });
  };

  const resetFilters = () => {
    setFilters({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      eventId: "",
      studentId: "",
      yearLevel: "",
      major: "",
      status: "all",
      session: "all",
    });
    setSearchTerm("");
  };

  const uniqueYearLevels = Array.from(
    new Set(students.map((s) => s.yearLevel))
  ).filter(Boolean);
  const uniqueMajors = Array.from(new Set(students.map((s) => s.major))).filter(
    Boolean
  );
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Attendance Reports
            </h2>
            <p className="text-gray-600 mt-1">
              Generate comprehensive attendance reports and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              📊 Export Excel
            </button>
            <button
              onClick={exportToPDF}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="label">Report Type</label>
          <div className="flex gap-2">
            {(["summary", "detailed", "trends"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  reportType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Event</label>
            <select
              value={filters.eventId}
              onChange={(e) => handleFilterChange("eventId", e.target.value)}
              className="input-field"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Student</label>
            <select
              value={filters.studentId}
              onChange={(e) => handleFilterChange("studentId", e.target.value)}
              className="input-field"
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} ({student.studentId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Year Level</label>
            <select
              value={filters.yearLevel}
              onChange={(e) => handleFilterChange("yearLevel", e.target.value)}
              className="input-field"
            >
              <option value="">All Years</option>
              {uniqueYearLevels.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Major</label>
            <select
              value={filters.major}
              onChange={(e) => handleFilterChange("major", e.target.value)}
              className="input-field"
            >
              <option value="">All Majors</option>
              {uniqueMajors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="input-field"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused</option>
            </select>
          </div>
          <div>
            <label className="label">Session</label>
            <select
              value={filters.session}
              onChange={(e) => handleFilterChange("session", e.target.value)}
              className="input-field"
            >
              <option value="all">All Sessions</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="label">Search</label>
            <input
              type="text"
              placeholder="Search by student name, ID, or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <button onClick={resetFilters} className="btn-secondary">
            Reset Filters
          </button>
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading && <LoadingSpinner />}
            Generate Report
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Statistics Dashboard */}
      {stats && reportType === "summary" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">
                Overall Attendance
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.overallAttendanceRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">
                Total Present
              </div>
              <div className="text-2xl font-bold text-green-900">
                {stats.presentCount}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-red-600">
                Total Absent
              </div>
              <div className="text-2xl font-bold text-red-900">
                {stats.absentCount}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-600">
                Total Excused
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {stats.excusedCount}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">
                Students Tracked
              </div>
              <div className="text-xl font-bold text-gray-900">
                {stats.totalStudents}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">
                Events Covered
              </div>
              <div className="text-xl font-bold text-gray-900">
                {stats.totalEvents}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">
                Total Records
              </div>
              <div className="text-xl font-bold text-gray-900">
                {attendanceData.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Analysis */}
      {stats && reportType === "trends" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">
                Morning Attendance Rate
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.morningAttendanceRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-600">
                Afternoon Attendance Rate
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {stats.afternoonAttendanceRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {stats.trendData.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Daily Attendance Trend
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Attendance Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Present
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.trendData.map((trend, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(trend.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trend.attendanceRate >= 80
                                ? "bg-green-100 text-green-800"
                                : trend.attendanceRate >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {trend.attendanceRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trend.presentCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trend.totalCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Report */}
      {reportType === "detailed" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Detailed Attendance Records ({filteredData.length} records)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Morning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Afternoon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((record) => {
                  const event = events.find((e) => e._id === record.event);
                  return (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.student.firstName} {record.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.student.studentId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event?.title || "Unknown Event"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.morningStatus === "present"
                              ? "bg-green-100 text-green-800"
                              : record.morningStatus === "absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.morningStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.afternoonStatus === "present"
                              ? "bg-green-100 text-green-800"
                              : record.afternoonStatus === "absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.afternoonStatus}
                        </span>
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

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found matching your criteria
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
