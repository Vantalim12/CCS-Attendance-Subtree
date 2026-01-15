import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface Event {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    venue: string;
}

const PublicEventList: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const org = searchParams.get('org');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Use REACT_APP_API_URL if available, otherwise default relative path or hardcoded
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${apiUrl}/public/events`, {
                    params: { org }
                });
                setEvents(response.data);
            } catch (err) {
                console.error('Failed to fetch events', err);
                setError('Failed to load events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [org]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    Today's <span className="text-cyan-400">{org ? `${org} ` : ''}Events</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Select an event to view the live attendance directory.
                </p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-gray-400 text-lg">No active events found for today.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            to={`/public/events/${event.id}`}
                            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-300"></div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                {event.title}
                            </h3>
                            {event.description && (
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {event.description}
                                </p>
                            )}

                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{event.startTime} - {event.endTime}</span>
                                </div>
                                {event.venue && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{event.venue}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-end text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                View Directory &rarr;
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicEventList;
