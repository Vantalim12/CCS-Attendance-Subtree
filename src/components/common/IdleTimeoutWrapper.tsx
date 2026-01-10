import React, { useState, useCallback } from 'react';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';

interface IdleTimeoutWrapperProps {
    children: React.ReactNode;
}

/**
 * Wrapper component that monitors user activity and logs out after 15 minutes of inactivity.
 * Shows a warning modal 1 minute before automatic logout.
 */
const IdleTimeoutWrapper: React.FC<IdleTimeoutWrapperProps> = ({ children }) => {
    const [showWarning, setShowWarning] = useState(false);

    const handleWarning = useCallback(() => {
        setShowWarning(true);
    }, []);

    const handleLogout = useCallback(() => {
        setShowWarning(false);
        // Logout is handled by the hook
    }, []);

    const { resetTimer } = useIdleTimeout({
        timeout: 15 * 60 * 1000, // 15 minutes
        warningTime: 60 * 1000, // Show warning 1 minute before logout
        onWarning: handleWarning,
        onLogout: handleLogout,
    });

    const handleStayLoggedIn = () => {
        setShowWarning(false);
        resetTimer();
    };

    return (
        <>
            {children}

            {/* Idle Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card-lg p-8 max-w-md mx-4 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-ink mb-2">
                            Session Timeout Warning
                        </h3>
                        <p className="text-ink-muted mb-6">
                            You will be logged out in less than 1 minute due to inactivity.
                            Click below to stay logged in.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleStayLoggedIn}
                                className="btn-primary px-6"
                            >
                                Stay Logged In
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default IdleTimeoutWrapper;
