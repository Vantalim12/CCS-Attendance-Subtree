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
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
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
            // Only show error text if completely failed on first load
            if (showLoading) setError('Failed to load attendance data.');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [id]);

    // Initial load
    useEffect(() => {
        fetchAttendance(true);
    }, [fetchAttendance]);

    // Polling every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAttendance(false);
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchAttendance]);

    // Filter logic
    useEffect(() => {
        const filtered = students.filter(student =>
            student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [searchTerm, students]);

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
                                placeholder="Search student..."
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

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Year</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.studentId} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">
                                                {student.lastName}, {student.firstName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-400 font-mono">{student.studentId}</div>
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        {searchTerm ? 'No matches found.' : 'No students found for this event yet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 text-gray-400 text-sm flex justify-between items-center">
                    <span>Total Present: <span className="text-white font-bold">{filteredStudents.length}</span></span>
                </div>
            </div>
        </div>
    );
};

export default PublicEventAttendance;
