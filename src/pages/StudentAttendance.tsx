import React, { useState, useEffect } from "react";
import { api } from "../services/auth.service";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { format } from "date-fns";

interface AttendanceRecord {
    _id: string;
    event: string; // Event ID or Object
    eventTitle: string;
    morningStatus: "present" | "absent" | "excused";
    afternoonStatus: "present" | "absent" | "excused";
    morningCheckIn?: string;
    afternoonCheckIn?: string;
    createdAt: string;
}

const StudentAttendance: React.FC = () => {
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await api.get("/attendance");
            // Backend refactor ensures this returns filtered list for the logged-in student
            setAttendances(response.data);
        } catch (err) {
            console.error("Failed to fetch attendance:", err);
            setError("Failed to load attendance history.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-gradient">My Attendance History</h1>
                <div className="text-sm text-ink-muted bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                    Showing {attendances.length} records
                </div>
            </div>

            {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            )}

            {!loading && !error && attendances.length === 0 && (
                <div className="glass-card text-center py-16">
                    <svg
                        className="mx-auto h-16 w-16 text-primary/40 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <h3 className="text-lg font-semibold text-ink">No attendance records</h3>
                    <p className="mt-2 text-ink-muted">You haven't attended any events yet.</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {attendances.map((record) => (
                    <div
                        key={record._id}
                        className="glass-card hover:translate-y-[-4px] transition-transform duration-300"
                    >
                        <div className="">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-ink line-clamp-1" title={record.eventTitle}>
                                        {record.eventTitle}
                                    </h3>
                                    <span className="text-xs font-medium text-ink-muted flex items-center gap-1 mt-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {format(new Date(record.createdAt), "MMMM d, yyyy")}
                                    </span>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${record.morningStatus === 'present' && record.afternoonStatus === 'present'
                                        ? 'bg-green-100/50 text-green-700 border border-green-200'
                                        : 'bg-yellow-100/50 text-yellow-700 border border-yellow-200'
                                    }`}>
                                    {record.morningStatus === 'present' && record.afternoonStatus === 'present'
                                        ? 'Complete'
                                        : 'Partial'}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-gray-100/20">
                                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/40 transition-colors">
                                    <span className="text-sm font-medium text-ink-muted">Morning</span>
                                    {record.morningStatus === "present" ? (
                                        <div className="flex flex-col items-end">
                                            <span className="status-present">Present</span>
                                            {record.morningCheckIn && (
                                                <span className="text-[10px] text-ink-muted mt-1 font-medium">
                                                    {format(new Date(record.morningCheckIn), "h:mm a")}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="status-absent">Absent</span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/40 transition-colors">
                                    <span className="text-sm font-medium text-ink-muted">Afternoon</span>
                                    {record.afternoonStatus === "present" ? (
                                        <div className="flex flex-col items-end">
                                            <span className="status-present">Present</span>
                                            {record.afternoonCheckIn && (
                                                <span className="text-[10px] text-ink-muted mt-1 font-medium">
                                                    {format(new Date(record.afternoonCheckIn), "h:mm a")}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="status-absent">Absent</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentAttendance;
