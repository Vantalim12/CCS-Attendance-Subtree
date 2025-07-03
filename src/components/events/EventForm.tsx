import React, { useState, useEffect } from "react";
import { Event } from "../../types";
import { api } from "../../services/auth.service";
import LoadingSpinner from "../common/LoadingSpinner";

interface EventFormProps {
  event?: Event | null;
  onSave: () => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    description: "",
    location: "",
    attendanceRequiredMorning: true,
    attendanceRequiredAfternoon: true,
    scanWindowMinutes: 15,
    gracePeriodMinutes: 60,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        eventDate: new Date(event.eventDate).toISOString().split("T")[0],
        startTime: event.startTime,
        endTime: event.endTime,
        description: event.description || "",
        location: event.location || "",
        attendanceRequiredMorning: event.attendanceRequiredMorning ?? true,
        attendanceRequiredAfternoon: event.attendanceRequiredAfternoon ?? true,
        scanWindowMinutes: event.scanWindowMinutes || 15,
        gracePeriodMinutes: event.gracePeriodMinutes || 60,
      });
    }
  }, [event]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    // Date validation
    if (!formData.eventDate) {
      newErrors.eventDate = "Event date is required";
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today && !event) {
        newErrors.eventDate = "Event date cannot be in the past";
      }
    }

    // Time validation
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startTime && formData.endTime) {
      const startMinutes = timeToMinutes(formData.startTime);
      const endMinutes = timeToMinutes(formData.endTime);

      if (endMinutes <= startMinutes) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    // Numeric validations
    if (formData.scanWindowMinutes < 0 || formData.scanWindowMinutes > 120) {
      newErrors.scanWindowMinutes =
        "Scan window must be between 0 and 120 minutes";
    }

    if (formData.gracePeriodMinutes < 0 || formData.gracePeriodMinutes > 480) {
      newErrors.gracePeriodMinutes =
        "Grace period must be between 0 and 480 minutes";
    }

    // At least one session must be required
    if (
      !formData.attendanceRequiredMorning &&
      !formData.attendanceRequiredAfternoon
    ) {
      newErrors.sessions = "At least one attendance session must be required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const eventData = {
        ...formData,
        eventDate: new Date(formData.eventDate).toISOString(),
      };

      if (event) {
        await api.put(`/events/${event._id}`, eventData);
      } else {
        await api.post("/events", eventData);
      }

      onSave();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || "Failed to save event",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {event ? "Edit Event" : "Create New Event"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Event Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="label">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`input-field ${errors.title ? "border-red-500" : ""}`}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="label">Event Date *</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              className={`input-field ${
                errors.eventDate ? "border-red-500" : ""
              }`}
            />
            {errors.eventDate && (
              <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
            )}
          </div>

          <div>
            <label className="label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Event location"
            />
          </div>

          <div>
            <label className="label">Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className={`input-field ${
                errors.startTime ? "border-red-500" : ""
              }`}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="label">End Time *</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className={`input-field ${
                errors.endTime ? "border-red-500" : ""
              }`}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Event description (optional)"
            />
          </div>
        </div>

        {/* Attendance Configuration */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Configuration
          </h3>

          {/* Session Requirements */}
          <div className="space-y-4">
            <div>
              <label className="label">Required Sessions *</label>
              {errors.sessions && (
                <p className="text-red-500 text-sm">{errors.sessions}</p>
              )}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="attendanceRequiredMorning"
                    checked={formData.attendanceRequiredMorning}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Morning Session Required
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="attendanceRequiredAfternoon"
                    checked={formData.attendanceRequiredAfternoon}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Afternoon Session Required
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Scan Window (minutes)</label>
                <input
                  type="number"
                  name="scanWindowMinutes"
                  value={formData.scanWindowMinutes}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  className={`input-field ${
                    errors.scanWindowMinutes ? "border-red-500" : ""
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time before event start when QR scanning becomes available
                </p>
                {errors.scanWindowMinutes && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.scanWindowMinutes}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Grace Period (minutes)</label>
                <input
                  type="number"
                  name="gracePeriodMinutes"
                  value={formData.gracePeriodMinutes}
                  onChange={handleInputChange}
                  min="0"
                  max="480"
                  className={`input-field ${
                    errors.gracePeriodMinutes ? "border-red-500" : ""
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time after event start when late attendance is still accepted
                </p>
                {errors.gracePeriodMinutes && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gracePeriodMinutes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Time Window Preview */}
        {formData.eventDate && formData.startTime && formData.endTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Attendance Time Window Preview
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>QR Scanning Available:</strong>{" "}
                {new Date(
                  `${formData.eventDate}T${formData.startTime}`
                ).getTime() -
                  formData.scanWindowMinutes * 60 * 1000 >
                0
                  ? new Date(
                      new Date(
                        `${formData.eventDate}T${formData.startTime}`
                      ).getTime() -
                        formData.scanWindowMinutes * 60 * 1000
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Invalid time"}{" "}
                -{" "}
                {new Date(
                  new Date(
                    `${formData.eventDate}T${formData.startTime}`
                  ).getTime() +
                    formData.gracePeriodMinutes * 60 * 1000
                ).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p>
                <strong>Event Duration:</strong> {formData.startTime} -{" "}
                {formData.endTime}
              </p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            {loading && <LoadingSpinner />}
            {event ? "Update Event" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
