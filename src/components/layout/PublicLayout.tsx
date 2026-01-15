import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-cyan-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
            </div>

            <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="font-bold text-white text-lg">A</span>
                        </div>
                        <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            CCS Attendance
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-grow">
                <Outlet />
            </main>

            <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} CCS Attendance System
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
