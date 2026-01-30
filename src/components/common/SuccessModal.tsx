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
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4EJHfH8N2QQAoUXrTp66hVFApGn+PxtWQdBjiS2O7PfC4E="
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal - Digital Archive Style */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-sm w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4 duration-300">

          {/* Header - "Ticket" Style */}
          <div className="bg-black p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-mono font-bold tracking-wider text-sm">ACCESS_GRANTED</h3>
            </div>
            <span className="font-mono text-xs text-gray-400">LOG_ID_#{Math.floor(Math.random() * 9999)}</span>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-black mb-1">
                ATTENDANCE LOGGED
              </h2>
              <p className="font-mono text-xs text-gray-500 uppercase tracking-wide">
                Successfully recorded in database
              </p>
            </div>

            {/* Student Details Card */}
            <div className="border border-gray-200 bg-gray-50 p-4 mb-6">
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">STUDENT</span>
                  <span className="font-bold text-black text-right truncate max-w-[180px]">{studentName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">ID_NO</span>
                  <span className="font-bold text-black">{studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SESSION</span>
                  <span className="font-bold text-black uppercase">{session}</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-gray-400">
              <span>AUTO_DISMISS</span>
              <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-black animate-[width_3s_linear_forwards]" style={{ width: '0%' }}></div>
                {/* Note: Tailwind arbitrary value animate-[width_3s...] might not work without config, 
                     fallback to simple loader or just text if needed, but visually a bar is nice. 
                     Using a simple CSS animation might be safer or just rely on the text. 
                     Let's use a standard loading bar if possible or just the text.
                 */}
              </div>
            </div>
          </div>

          {/* Footer Decor */}
          <div className="h-2 bg-gray-100 border-t-2 border-black flex">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-gray-300"></div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default SuccessModal;
