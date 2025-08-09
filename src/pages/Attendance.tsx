import React, { useState, useEffect } from "react";
import { Event } from "../types";
import { api } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";
import QRScanner from "../components/attendance/QRScanner";
import AttendanceTable from "../components/attendance/AttendanceTable";
import ManualAttendance from "../components/attendance/ManualAttendance";
import ManualIdInput from "../components/attendance/ManualIdInput";
import ExcuseLetterForm from "../components/excuses/ExcuseLetterForm";
import ExcuseLetterList from "../components/excuses/ExcuseLetterList";
import LoadingSpinner from "../components/common/LoadingSpinner";
import NotificationToast, {
  NotificationData,
} from "../components/common/NotificationToast";
import AlreadySignedInModal from "../components/common/AlreadySignedInModal";

const Attendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "scan" | "records" | "manual" | "excuses"
  >("scan");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [session, setSession] = useState<"morning" | "afternoon">("morning");
  const [isQRActive, setIsQRActive] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState<NotificationData | null>(
    null
  );
  const [alreadySignedInModal, setAlreadySignedInModal] = useState<{
    isOpen: boolean;
    studentName: string;
    studentId: string;
    signInTime: string;
    session: "morning" | "afternoon";
  }>({
    isOpen: false,
    studentName: "",
    studentId: "",
    signInTime: "",
    session: "morning",
  });
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole("admin");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      // Handle both old and new response formats
      const eventsList = response.data.events || response.data;

      // Ensure eventsList is always an array
      const eventsArray = Array.isArray(eventsList) ? eventsList : [];
      setEvents(eventsArray);

      // Auto-select today's event if available
      const today = new Date().toISOString().split("T")[0];
      const todayEvent = eventsArray.find(
        (event: Event) =>
          new Date(event.eventDate).toISOString().split("T")[0] === today
      );
      if (todayEvent) {
        setSelectedEvent(todayEvent);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]); // Set empty array on error
    }
  };

  const handleQRScanSuccess = async (qrCodeData: string) => {
    if (!selectedEvent) {
      setError("Please select an event first");
      return;
    }

    try {
      setError("");
      const response = await api.post("/attendance", {
        qrCodeData,
        eventId: selectedEvent._id,
        session,
      });

      // Show success notification with student information
      const studentInfo = response.data.student;
      if (studentInfo) {
        setNotification({
          type: "success",
          title: "Attendance Marked Successfully!",
          message: `${studentInfo.studentName} (ID: ${
            studentInfo.studentId
          }) - ${session.charAt(0).toUpperCase() + session.slice(1)} Session`,
          duration: 4000,
        });
      } else {
        setSuccess(`Attendance marked successfully for ${session} session!`);
      }

      // Keep scanner active for continuous scanning
      triggerRefresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to mark attendance";

      // Check if this is a duplicate scan error
      if (
        errorMessage.includes("already signed in") ||
        errorMessage.includes("duplicate")
      ) {
        // Extract student information from the error response
        const studentInfo = error.response?.data?.student;
        if (studentInfo) {
          setAlreadySignedInModal({
            isOpen: true,
            studentName:
              studentInfo.studentName || studentInfo.name || "Unknown Student",
            studentId: studentInfo.studentId || "Unknown ID",
            signInTime: studentInfo.signInTime || new Date().toISOString(),
            session: session,
          });
        } else {
          // Fallback if no student info in error response
          setAlreadySignedInModal({
            isOpen: true,
            studentName: "Student",
            studentId: "Unknown",
            signInTime: new Date().toISOString(),
            session: session,
          });
        }
      } else {
        setError(errorMessage);
      }
      // Keep scanner active even on error for retry
    }
  };

  const handleQRScanError = (error: string) => {
    setError(`QR Scan Error: ${error}`);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleManualAttendanceMarked = (studentData: {
    studentId: string;
    studentName: string;
  }) => {
    setNotification({
      type: "success",
      title: "Attendance Marked Successfully!",
      message: `${studentData.studentName} (ID: ${studentData.studentId}) - ${
        session.charAt(0).toUpperCase() + session.slice(1)
      } Session`,
      duration: 4000,
    });
    triggerRefresh();
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const tabs = [
    { id: "scan" as const, label: "QR Scanner", icon: "📱", show: true },
    {
      id: "records" as const,
      label: "Attendance Records",
      icon: "📊",
      show: true,
    },
    {
      id: "manual" as const,
      label: "Manual Marking",
      icon: "✏️",
      show: isAdmin,
    },
    { id: "excuses" as const, label: "Excuse Letters", icon: "📝", show: true },
  ].filter((tab) => tab.show);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-lg p-6">
        <h1 className="text-2xl font-display font-bold text-ink mb-4">
          Attendance Management
        </h1>

        {/* Event Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Select Event</label>
            <select
              value={selectedEvent?._id || ""}
              onChange={(e) => {
                const event = Array.isArray(events)
                  ? events.find((ev) => ev._id === e.target.value)
                  : null;
                setSelectedEvent(event || null);
                clearMessages();
              }}
              className="input-field"
            >
              <option value="">Select an event</option>
              {Array.isArray(events) &&
                events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title} -{" "}
                    {new Date(event.eventDate).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="label">Session</label>
            <div className="flex gap-4 mt-2">
              {(["morning", "afternoon"] as const).map((sessionType) => (
                <label key={sessionType} className="flex items-center">
                  <input
                    type="radio"
                    name="session"
                    value={sessionType}
                    checked={session === sessionType}
                    onChange={(e) => {
                      setSession(e.target.value as "morning" | "afternoon");
                      clearMessages();
                    }}
                    className="mr-2"
                  />
                  <span className="capitalize">{sessionType}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Event Info */}
        {selectedEvent && (
          <div className="glass-card bg-primary/5 border-primary/20 p-4">
            <h3 className="font-medium text-primary">{selectedEvent.title}</h3>
            <p className="text-primary-600 text-sm">
              Date: {new Date(selectedEvent.eventDate).toLocaleDateString()} |
              Time: {selectedEvent.startTime} - {selectedEvent.endTime}
            </p>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="glass-card bg-green-50 border-green-200 p-4 animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card bg-red-50 border-red-200 p-4 animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="glass-card-lg">
        <div className="border-b border-ink/10">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearMessages();
                  if (tab.id !== "scan") setIsQRActive(false);
                }}
                className={`${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-ink/30"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* QR Scanner Tab */}
          {activeTab === "scan" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-display font-semibold text-ink mb-4">
                  QR Code Scanner
                </h3>

                {!selectedEvent ? (
                  <div className="glass-card bg-amber-50 border-amber-200 p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <p className="text-amber-800">
                        Please select an event to start scanning
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          setIsQRActive(true);
                          clearMessages();
                        }}
                        disabled={isQRActive}
                        className="btn-primary disabled:opacity-50"
                      >
                        {isQRActive ? "Scanner Active" : "Start QR Scanner"}
                      </button>

                      {isQRActive && (
                        <button
                          onClick={() => setIsQRActive(false)}
                          className="btn-secondary"
                        >
                          Stop Scanner
                        </button>
                      )}
                    </div>

                    <QRScanner
                      isActive={isQRActive}
                      onScanSuccess={handleQRScanSuccess}
                      onScanError={handleQRScanError}
                    />

                    {/* Manual ID Input Component */}
                    <ManualIdInput
                      selectedEvent={selectedEvent}
                      session={session}
                      onAttendanceMarked={handleManualAttendanceMarked}
                      onError={setError}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance Records Tab */}
          {activeTab === "records" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Attendance Records
              </h3>
              <AttendanceTable
                selectedEvent={selectedEvent || undefined}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}

          {/* Manual Attendance Tab (Admin Only) */}
          {activeTab === "manual" && isAdmin && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manual Attendance Marking
              </h3>
              <ManualAttendance
                selectedEvent={selectedEvent || undefined}
                onAttendanceMarked={triggerRefresh}
              />
            </div>
          )}

          {/* Excuse Letters Tab */}
          {activeTab === "excuses" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Excuse Letters
              </h3>

              {!isAdmin && (
                <ExcuseLetterForm onSubmitSuccess={triggerRefresh} />
              )}

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  {isAdmin ? "Manage Excuse Letters" : "My Excuse Letters"}
                </h4>
                <ExcuseLetterList refreshTrigger={refreshTrigger} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Real-time updates active
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <NotificationToast
        notification={notification}
        onClose={clearNotification}
      />

      {/* Already Signed In Modal */}
      <AlreadySignedInModal
        isOpen={alreadySignedInModal.isOpen}
        onClose={() =>
          setAlreadySignedInModal((prev) => ({ ...prev, isOpen: false }))
        }
        studentName={alreadySignedInModal.studentName}
        studentId={alreadySignedInModal.studentId}
        signInTime={alreadySignedInModal.signInTime}
        session={alreadySignedInModal.session}
      />
    </div>
  );
};

export default Attendance;
