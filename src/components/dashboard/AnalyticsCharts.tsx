import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/auth.service';

interface TrendData {
    date: string;
    dayName: string;
    count: number;
    rate: number;
}

interface SessionData {
    morning: { count: number; rate: number };
    afternoon: { count: number; rate: number };
    totalStudents: number;
}

/**
 * Analytics charts component for the dashboard
 * Shows 7-day attendance trends and morning vs afternoon comparison
 */
const AnalyticsCharts: React.FC = () => {
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [sessions, setSessions] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [trendsRes, sessionsRes] = await Promise.all([
                api.get('/analytics/attendance-trends'),
                api.get('/analytics/session-comparison'),
            ]);

            setTrends(trendsRes.data.trends || []);
            setSessions(sessionsRes.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const maxRate = Math.max(...trends.map(t => t.rate), 100);

    if (loading) {
        return (
            <div className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-40 bg-gray-100 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-6">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={fetchAnalytics}
                    className="mt-2 text-primary hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-Day Attendance Trends */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-ink mb-4 flex items-center">
                    <span className="w-1 h-5 bg-primary rounded-full mr-3"></span>
                    7-Day Attendance Trend
                </h3>

                <div className="flex items-end justify-between h-40 gap-2">
                    {trends.map((day) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center">
                            <div className="w-full relative flex flex-col items-center">
                                <span className="text-xs text-ink-muted mb-1">
                                    {day.rate}%
                                </span>
                                <div
                                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-md transition-all duration-500"
                                    style={{
                                        height: `${Math.max((day.rate / maxRate) * 100, 4)}px`,
                                        minHeight: '4px',
                                    }}
                                />
                            </div>
                            <span className="text-xs text-ink-muted mt-2 font-medium">
                                {day.dayName}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-sm text-ink-muted text-center">
                    Daily attendance rate over the past week
                </div>
            </div>

            {/* Morning vs Afternoon Comparison */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-ink mb-4 flex items-center">
                    <span className="w-1 h-5 bg-accent rounded-full mr-3"></span>
                    Today's Sessions
                </h3>

                {sessions && (
                    <div className="space-y-6">
                        {/* Morning */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-ink">Morning</span>
                                <span className="text-sm text-ink-muted">
                                    {sessions.morning.count} / {sessions.totalStudents} students
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                                    style={{ width: `${sessions.morning.rate}%` }}
                                />
                            </div>
                            <div className="text-right text-sm text-ink-muted mt-1">
                                {sessions.morning.rate}%
                            </div>
                        </div>

                        {/* Afternoon */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-ink">Afternoon</span>
                                <span className="text-sm text-ink-muted">
                                    {sessions.afternoon.count} / {sessions.totalStudents} students
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${sessions.afternoon.rate}%` }}
                                />
                            </div>
                            <div className="text-right text-sm text-ink-muted mt-1">
                                {sessions.afternoon.rate}%
                            </div>
                        </div>

                        <div className="text-sm text-ink-muted text-center pt-2">
                            Morning vs afternoon attendance comparison
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsCharts;
