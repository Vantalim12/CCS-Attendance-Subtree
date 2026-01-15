import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface Student {
    studentId: string;
    firstName: string;
    lastName: string;
    yearLevel: string;
    major: string;
    organization?: {
        name: string;
    };
    signInTime?: string;
}

const PublicEventAttendance: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchAttendance = useCallback(async (showLoading = false) => {
        if (!id) return;
        if (showLoading) setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiUrl}/public/events/${id}/attendance`);
            setStudents(response.data);
            setLastUpdated(new Date());
            setError('');
        } catch (err) {
            console.error('Failed to fetch attendance', err);
            if (showLoading) setError('Failed to load attendance data.');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAttendance(true);
    }, [fetchAttendance]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchAttendance(false);
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchAttendance]);

    // Grouping Logic
    const getGroupedStudents = () => {
        const filtered = students.filter(student =>
            // Only search by ID since Name is hidden/private
            student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.major.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const groups: { [key: string]: Student[] } = {};

        filtered.forEach(student => {
            const orgName = student.organization?.name || 'Other';
            if (!groups[orgName]) {
                groups[orgName] = [];
            }
            groups[orgName].push(student);
        });

        return groups;
    };

    const groupedStudents = getGroupedStudents();
    const sortedOrgNames = Object.keys(groupedStudents).sort();

    if (loading && students.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error && students.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-500">
                {error}
                <div className="mt-4">
                    <Link to="/public/events" className="text-blue-500 hover:underline">Back to Events</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link to="/public/events" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                    &larr; Back to Events
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Event <span className="text-cyan-400">Directory</span></h1>
                        <p className="text-gray-400">
                            Live attendance list. Updates automatically every 30s.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <div className="w-full md:w-96">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Student ID..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute right-3 top-3.5 text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {sortedOrgNames.length > 0 ? (
                <div className="space-y-8">
                    {sortedOrgNames.map(orgName => (
                        <div key={orgName} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-cyan-400">{orgName}</h2>
                                <span className="text-sm text-gray-400 bg-black/20 px-3 py-1 rounded-full">
                                    {groupedStudents[orgName].length} Students
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            {/* Name column removed for privacy */}
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student ID</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Program</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Year</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {groupedStudents[orgName].map((student) => (
                                            <tr key={student.studentId} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono font-medium text-white">{student.studentId}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-300">{student.major}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                        {student.yearLevel}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-gray-400 text-lg">
                        {searchTerm ? 'No matches found.' : 'No students found for this event yet.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PublicEventAttendance;
