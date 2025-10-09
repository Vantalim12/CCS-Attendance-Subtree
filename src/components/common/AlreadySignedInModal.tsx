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
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl animate-slide-in overflow-hidden">
          {/* Gray Header */}
          <div className="bg-gray-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Info icon */}
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                <h3 className="text-xl font-bold text-white">
                  Already Signed In
                </h3>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5 text-white"
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
          </div>

          {/* Content */}
          <div className="p-6 bg-white">
            <div className="space-y-4">
              {/* Student info */}
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
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
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {studentName}
                    </h4>
                    <p className="text-sm text-gray-700 font-medium">
                      ID: {studentId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign-in details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Session:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      session === "morning"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {session === "morning" ? "🌅 Morning" : "🌄 Afternoon"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Signed in at:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatTime(signInTime)}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 text-center">
                  This student has already signed in for the {session} session.
                  <br />
                  <span className="text-gray-700">
                    No duplicate record will be created.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer with auto-dismiss indicator */}
          <div className="px-6 pb-6 bg-white">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
              <span>Auto-dismissing in 3 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlreadySignedInModal;
