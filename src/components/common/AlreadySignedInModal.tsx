import React, { useEffect } from "react";

interface AlreadySignedInModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
  signInTime: string;
  session: "morning" | "afternoon";
}

const AlreadySignedInModal: React.FC<AlreadySignedInModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentId,
  signInTime,
  session,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      // Optional: Play a soft beep sound
      if ("Audio" in window) {
        try {
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4E="
          );
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio play errors (user interaction required in some browsers)
          });
        } catch (error) {
          // Ignore audio errors
        }
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card-lg max-w-md w-full animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-ink/10">
            <div className="flex items-center space-x-3">
              {/* Info icon */}
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-ink">
                Already Signed In
              </h3>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-ink/10 transition-colors duration-200"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 text-ink-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Student info */}
              <div className="glass-card p-4 bg-accent/5">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h4 className="font-medium text-ink">{studentName}</h4>
                    <p className="text-sm text-ink-muted">ID: {studentId}</p>
                  </div>
                </div>
              </div>

              {/* Sign-in details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-muted">
                    Session:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session === "morning"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {session === "morning" ? "🌅 Morning" : "🌄 Afternoon"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-muted">
                    Signed in at:
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {formatTime(signInTime)}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 rounded-md bg-accent/10 border border-accent/20">
                <p className="text-sm text-ink text-center">
                  This student has already signed in for the {session} session.
                  <br />
                  <span className="text-ink-muted">
                    No duplicate record will be created.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer with auto-dismiss indicator */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center space-x-2 text-xs text-ink-muted">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Auto-dismissing in 3 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlreadySignedInModal;
