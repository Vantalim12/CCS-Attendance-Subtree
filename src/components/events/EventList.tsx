import React, { useState, useEffect, useCallback } from "react";
import { Event } from "../../types";
import { api } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

interface EventListProps {
  refreshTrigger?: number;
  onEventSelect?: (event: Event | null) => void;
  onEditEvent?: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({
  refreshTrigger,
  onEventSelect,
  onEditEvent,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<
    "all" | "upcoming" | "past" | "today"
  >("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [error, setError] = useState("");
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const applyFilters = useCallback(() => {
    let filtered = events;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Time filter
    if (timeFilter !== "all") {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);

        switch (timeFilter) {
          case "upcoming":
            return eventDate >= today;
          case "past":
            return eventDate < today;
          case "today":
            return eventDate.getTime() === today.getTime();
          default:
            return true;
        }
      });
    }

    // Sort events by date (upcoming first, then past in reverse)
    filtered.sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);

      if (timeFilter === "past") {
        return dateB.getTime() - dateA.getTime(); // Most recent past events first
      }
      return dateA.getTime() - dateB.getTime(); // Upcoming events first
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, timeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/events");
      // Handle both old and new response formats
      const eventsData = response.data.events || response.data;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  const handleEditClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    onEditEvent?.(event);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This will also delete all associated attendance records."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      await fetchEvents();
      if (selectedEvent?._id === eventId) {
        setSelectedEvent(null);
        onEventSelect?.(null);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete event");
    }
  };

  const handleExportAbsents = async (e: React.MouseEvent, eventId: string, eventTitle: string) => {
    e.stopPropagation();
    try {
      const response = await api.get(`/export/events/${eventId}/absents`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Absents_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to export absent students");
    }
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return {
        status: "today",
        label: "Today",
        color: "bg-green-100 text-green-800",
      };
    } else if (eventDate > today) {
      return {
        status: "upcoming",
        label: "Upcoming",
        color: "bg-blue-100 text-blue-800",
      };
    } else {
      return {
        status: "past",
        label: "Past",
        color: "bg-gray-100 text-gray-800",
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDaysUntilEvent = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0) return `${diffDays} days`;
    if (diffDays === -1) return "Yesterday";
    return `${Math.abs(diffDays)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="label">Search Events</label>
            <input
              type="text"
              placeholder="Search by event title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Time Filter */}
          <div>
            <label className="label">Filter by Time</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Events</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Events</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setTimeFilter("all");
            }}
            className="btn-secondary text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Event List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events found matching your criteria
          </div>
        ) : (
          filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event);
            return (
              <div
                key={event._id}
                onClick={() => handleEventClick(event)}
                className={`bg-white rounded-lg shadow border-2 transition-all cursor-pointer hover:shadow-md ${selectedEvent?._id === event._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${eventStatus.color}`}
                        >
                          {eventStatus.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{formatDate(event.eventDate)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">
                            {getDaysUntilEvent(event.eventDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => handleExportAbsents(e, event._id, event.title)}
                          className="btn-secondary text-sm font-mono"
                          title="Export absent students as CSV"
                        >
                          EXPORT_ABSENTS
                        </button>
                        <button
                          onClick={(e) => handleEditClick(e, event)}
                          className="btn-secondary text-sm"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event._id);
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          DELETE
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Event Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Event Title</label>
              <p className="text-gray-900 text-lg font-medium">
                {selectedEvent.title}
              </p>
            </div>
            <div>
              <label className="label">Status</label>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getEventStatus(selectedEvent).color
                  }`}
              >
                {getEventStatus(selectedEvent).label}
              </span>
            </div>
            <div>
              <label className="label">Date</label>
              <p className="text-gray-900">
                {formatDate(selectedEvent.eventDate)}
              </p>
            </div>
            <div>
              <label className="label">Time</label>
              <p className="text-gray-900">
                {formatTime(selectedEvent.startTime)} -{" "}
                {formatTime(selectedEvent.endTime)}
              </p>
            </div>
            <div>
              <label className="label">Days Until Event</label>
              <p className="text-gray-900">
                {getDaysUntilEvent(selectedEvent.eventDate)}
              </p>
            </div>
            <div>
              <label className="label">Created</label>
              <p className="text-gray-900">
                {new Date(selectedEvent.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Attendance Time Window Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Attendance Time Window
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-sm text-blue-800">
                <p>
                  <strong>Scan Window Opens:</strong> {selectedEvent.scanWindowMinutes || 15} minutes before event start
                </p>
                <p>
                  <strong>Scan Window Closes:</strong> {selectedEvent.gracePeriodMinutes || 60} minutes after event end
                </p>
                <p>
                  <strong>Morning Session:</strong> Available during event time
                </p>
                <p>
                  <strong>Afternoon Session:</strong> Available during event
                  time
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
