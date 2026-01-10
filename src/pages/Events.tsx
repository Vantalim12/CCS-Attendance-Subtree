import React, { useState, useEffect } from "react";
import { Event } from "../types";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/auth.service";
import EventList from "../components/events/EventList";
import EventForm from "../components/events/EventForm";
import EventAttendance from "../components/events/EventAttendance";

const Events: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"list" | "form" | "attendance">(
    "list"
  );
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    todayEvents: 0,
    pastEvents: 0,
  });
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  useEffect(() => {
    if (activeTab === "list") {
      fetchEventStats();
    }
  }, [activeTab, refreshTrigger]);

  const fetchEventStats = async () => {
    try {
      const response = await api.get("/events/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch event stats:", error);
    }
  };

  const handleEventSelect = (event: Event | null) => {
    setSelectedEvent(event);
    if (event) {
      setActiveTab("attendance");
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setActiveTab("form");
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setActiveTab("form");
  };

  const handleFormSave = () => {
    setActiveTab("list");
    setEditingEvent(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setActiveTab("list");
    setEditingEvent(null);
  };

  const handleBackToList = () => {
    setActiveTab("list");
    setSelectedEvent(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "form":
        return (
          <EventForm
            event={editingEvent}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        );
      case "attendance":
        return selectedEvent ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToList}
                className="btn-secondary flex items-center gap-2"
              >
                ← Back to Events
              </button>
            </div>
            <EventAttendance event={selectedEvent} />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No event selected for attendance tracking
          </div>
        );
      default:
        return (
          <EventList
            refreshTrigger={refreshTrigger}
            onEventSelect={handleEventSelect}
            onEditEvent={handleEditEvent}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Event Management
              </h1>
              <p className="text-gray-600 mt-1">
                Create, manage, and track attendance for events
              </p>
            </div>
            {isAdmin && activeTab === "list" && (
              <button
                onClick={handleCreateNew}
                className="btn-primary flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats - Only show on list view */}
      {activeTab === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Events
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Upcoming Events
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.upcomingEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Today's Events
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.todayEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pastEvents}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Only show when relevant */}
      {(activeTab !== "list" || selectedEvent) && (
        <div className="glass-card">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("list")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                📋 Event List
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("form")}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "form"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  ✏️ {editingEvent ? "Edit Event" : "Create Event"}
                </button>
              )}
              {selectedEvent && (
                <button
                  onClick={() => setActiveTab("attendance")}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "attendance"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  📊 Attendance Tracking
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {renderTabContent()}

      {/* Help Section - Only show on list view for students */}
      {activeTab === "list" && !isAdmin && (
        <div className="glass-card bg-blue-50/50 p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            📚 How to Use Events
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>• Click on any event to view detailed attendance information</p>
            <p>• Check upcoming events to prepare for attendance</p>
            <p>• View your attendance history for past events</p>
            <p>
              • Make sure to scan QR codes during the specified time windows
            </p>
          </div>
        </div>
      )}

      {/* Admin Help Section - Only show on list view for admins */}
      {activeTab === "list" && isAdmin && (
        <div className="glass-card bg-green-50/50 p-6">
          <h3 className="text-lg font-medium text-green-900 mb-2">
            🛠️ Admin Tools
          </h3>
          <div className="text-green-800 space-y-2">
            <p>• Create new events with custom attendance requirements</p>
            <p>• Configure attendance time windows and grace periods</p>
            <p>• Track real-time attendance for ongoing events</p>
            <p>• Export attendance data for reporting</p>
            <p>• Manually mark attendance when needed</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
