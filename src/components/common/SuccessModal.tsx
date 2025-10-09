import React, { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
  session: "morning" | "afternoon";
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentId,
  session,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      // Optional: Play a success sound
      if ("Audio" in window) {
        try {
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4E="
          );
          audio.volume = 0.4;
          audio.play().catch(() => {
            // Ignore audio play errors
          });
        } catch (error) {
          // Ignore audio errors
        }
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
          {/* Green Header with Checkmark */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              {/* Blue Checkmark */}
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
            <p className="text-green-50 text-lg">Attendance Marked</p>
          </div>

          {/* Content */}
          <div className="p-6 bg-white">
            <div className="space-y-4">
              {/* Student info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-lg truncate">
                      {studentName}
                    </h4>
                    <p className="text-sm text-gray-600">ID: {studentId}</p>
                  </div>
                </div>
              </div>

              {/* Session Badge */}
              <div className="flex items-center justify-center">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    session === "morning"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {session === "morning"
                    ? "🌅 Morning Session"
                    : "🌄 Afternoon Session"}
                </span>
              </div>

              {/* Success message */}
              <div className="text-center">
                <p className="text-gray-700 font-medium">
                  Successfully signed in!
                </p>
              </div>
            </div>
          </div>

          {/* Footer with auto-dismiss indicator */}
          <div className="px-6 pb-6 bg-white">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Auto-dismissing in 3 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessModal;
