import React, { useState, useEffect } from "react";
import { Event } from "../../types";
import { api } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

interface ExcuseLetterFormProps {
  onSubmitSuccess?: () => void;
}

const ExcuseLetterForm: React.FC<ExcuseLetterFormProps> = ({
  onSubmitSuccess,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only JPEG, PNG, and PDF files are allowed");
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !reason.trim() || !file) {
      setError("Please fill in all fields and select a file");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("eventId", selectedEvent);
      formData.append("reason", reason.trim());
      formData.append("file", file);

      await api.post("/excuse-letters", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Excuse letter submitted successfully");
      setSelectedEvent("");
      setReason("");
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      onSubmitSuccess?.();
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to submit excuse letter"
      );
    } finally {
      setLoading(false);
    }
  };

  const reasonOptions = [
    "Health/Medical",
    "Family Emergency",
    "Personal Emergency",
    "Academic Conflict",
    "Transportation Issues",
    "Other",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Submit Excuse Letter
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Selection */}
        <div>
          <label className="label">Event *</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title} - {new Date(event.eventDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="label">Reason Category *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select a reason</option>
            {reasonOptions.map((reasonOption) => (
              <option key={reasonOption} value={reasonOption}>
                {reasonOption}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Reason (if Other is selected) */}
        {reason === "Other" && (
          <div>
            <label className="label">Please specify *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Please provide details about your reason for absence"
              required
            />
          </div>
        )}

        {/* File Upload */}
        <div>
          <label className="label">
            Supporting Document *
            <span className="text-sm text-gray-500 font-normal">
              (JPEG, PNG, or PDF - Max 5MB)
            </span>
          </label>
          <input
            id="file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="input-field"
            required
          />
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" text="" />
              <span className="ml-2">Submitting...</span>
            </div>
          ) : (
            "Submit Excuse Letter"
          )}
        </button>

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
      </form>

      {/* Guidelines */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Submit excuse letters as soon as possible after absence</li>
          <li>
            • Include relevant supporting documents (medical certificates, etc.)
          </li>
          <li>• Ensure the document is clear and readable</li>
          <li>
            • Admin approval is required for excuse letters to be accepted
          </li>
          <li>• You will be notified of the approval status</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcuseLetterForm;
