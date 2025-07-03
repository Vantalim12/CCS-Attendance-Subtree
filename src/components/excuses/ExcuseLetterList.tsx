import React, { useState, useEffect } from "react";
import { ExcuseLetter, Student, Event } from "../../types";
import { api } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

interface ExcuseLetterListProps {
  refreshTrigger?: number;
}

interface ExcuseLetterRecord extends ExcuseLetter {
  student?: Student;
  event?: Event;
}

const ExcuseLetterList: React.FC<ExcuseLetterListProps> = ({
  refreshTrigger,
}) => {
  const [excuseLetters, setExcuseLetters] = useState<ExcuseLetterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  useEffect(() => {
    fetchExcuseLetters();
  }, [refreshTrigger]);

  const fetchExcuseLetters = async () => {
    try {
      setLoading(true);
      const response = await api.get("/excuse-letters");
      setExcuseLetters(response.data);
    } catch (error) {
      console.error("Error fetching excuse letters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (
    letterId: string,
    action: "approved" | "rejected"
  ) => {
    setActionLoading(letterId);
    try {
      await api.put(`/excuse-letters/${letterId}`, { status: action });
      await fetchExcuseLetters(); // Refresh the list
    } catch (error: any) {
      console.error(`Error ${action} excuse letter:`, error);
      alert(
        error.response?.data?.message || `Failed to ${action} excuse letter`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const downloadFile = async (letterId: string, fileName: string) => {
    try {
      const response = await api.get(`/excuse-letters/${letterId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredLetters = excuseLetters.filter(
    (letter) => filter === "all" || letter.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === "pending" && (
              <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                {excuseLetters.filter((l) => l.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Excuse Letters List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredLetters.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No excuse letters found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLetters.map((letter) => (
              <div key={letter._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {letter.student
                          ? `${letter.student.firstName} ${letter.student.lastName}`
                          : "Unknown Student"}
                      </h4>
                      <span className={getStatusBadge(letter.status)}>
                        {letter.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Student ID:</strong> {letter.student?.studentId}
                      </p>
                      <p>
                        <strong>Event:</strong> {letter.event?.title}
                      </p>
                      <p>
                        <strong>Event Date:</strong>{" "}
                        {letter.event && formatDate(letter.event.eventDate)}
                      </p>
                      <p>
                        <strong>Reason:</strong> {letter.reason}
                      </p>
                      <p>
                        <strong>Submitted:</strong>{" "}
                        {formatDate(letter.submittedAt)}
                      </p>
                      {letter.approvedAt && (
                        <p>
                          <strong>Approved:</strong>{" "}
                          {formatDate(letter.approvedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Download Button */}
                    <button
                      onClick={() =>
                        downloadFile(
                          letter._id,
                          `excuse-${letter.student?.studentId}`
                        )
                      }
                      className="btn-secondary text-sm"
                    >
                      📎 Download
                    </button>

                    {/* Admin Actions */}
                    {isAdmin && letter.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval(letter._id, "approved")}
                          disabled={actionLoading === letter._id}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === letter._id ? (
                            <LoadingSpinner size="sm" text="" />
                          ) : (
                            "✓ Approve"
                          )}
                        </button>
                        <button
                          onClick={() => handleApproval(letter._id, "rejected")}
                          disabled={actionLoading === letter._id}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === letter._id ? (
                            <LoadingSpinner size="sm" text="" />
                          ) : (
                            "✗ Reject"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcuseLetterList;
