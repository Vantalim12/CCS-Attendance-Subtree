import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

interface UseIdleTimeoutOptions {
    timeout?: number; // in milliseconds
    warningTime?: number; // time before logout to show warning (in ms)
    onWarning?: () => void;
    onLogout?: () => void;
}

/**
 * Hook to automatically logout users after a period of inactivity
 * Default timeout: 15 minutes
 */
export const useIdleTimeout = (options: UseIdleTimeoutOptions = {}) => {
    const {
        timeout = 15 * 60 * 1000, // 15 minutes default
        warningTime = 60 * 1000, // 1 minute warning before logout
        onWarning,
        onLogout,
    } = options;

    const { isAuthenticated, logout } = useAuth();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const clearTimers = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (warningRef.current) {
            clearTimeout(warningRef.current);
            warningRef.current = null;
        }
    }, []);

    const handleLogout = useCallback(() => {
        clearTimers();
        if (onLogout) {
            onLogout();
        } else {
            logout();
        }
    }, [clearTimers, logout, onLogout]);

    const startTimers = useCallback(() => {
        clearTimers();

        // Warning timer (fires before logout)
        if (onWarning && warningTime > 0) {
            warningRef.current = setTimeout(() => {
                onWarning();
            }, timeout - warningTime);
        }

        // Logout timer
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, timeout);
    }, [clearTimers, timeout, warningTime, onWarning, handleLogout]);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (isAuthenticated) {
            startTimers();
        }
    }, [isAuthenticated, startTimers]);

    useEffect(() => {
        if (!isAuthenticated) {
            clearTimers();
            return;
        }

        // Events that indicate user activity
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'focus',
        ];

        // Throttle the reset to prevent excessive timer resets
        let lastReset = 0;
        const throttledReset = () => {
            const now = Date.now();
            if (now - lastReset > 1000) { // Throttle to once per second
                lastReset = now;
                resetTimer();
            }
        };

        // Add event listeners
        events.forEach((event) => {
            document.addEventListener(event, throttledReset, { passive: true });
        });

        // Start the initial timer
        startTimers();

        // Cleanup
        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, throttledReset);
            });
            clearTimers();
        };
    }, [isAuthenticated, resetTimer, startTimers, clearTimers]);

    return {
        resetTimer,
        lastActivity: lastActivityRef.current,
    };
};

export default useIdleTimeout;
