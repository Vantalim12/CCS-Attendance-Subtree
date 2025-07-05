import React, { useState, useEffect } from "react";
import { Event } from "../types";
import { api } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";
import QRScanner from "../components/attendance/QRScanner";
import AttendanceTable from "../components/attendance/AttendanceTable";
import ManualAttendance from "../components/attendance/ManualAttendance";
import ExcuseLetterForm from "../components/excuses/ExcuseLetterForm";
import ExcuseLetterList from "../components/excuses/ExcuseLetterList";
import LoadingSpinner from "../components/common/LoadingSpinner";

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
      await api.post("/attendance", {
        qrCodeData,
        eventId: selectedEvent._id,
        session,
      });

      setSuccess(`Attendance marked successfully for ${session} session!`);
      setIsQRActive(false);
      triggerRefresh();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to mark attendance");
      setIsQRActive(false);
    }
  };

  const handleQRScanError = (error: string) => {
    setError(`QR Scan Error: ${error}`);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
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
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
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
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-900">{selectedEvent.title}</h3>
            <p className="text-blue-700 text-sm">
              Date: {new Date(selectedEvent.eventDate).toLocaleDateString()} |
              Time: {selectedEvent.startTime} - {selectedEvent.endTime}
            </p>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
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
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  QR Code Scanner
                </h3>

                {!selectedEvent ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800">
                      Please select an event to start scanning
                    </p>
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
    </div>
  );
};

export default Attendance;
