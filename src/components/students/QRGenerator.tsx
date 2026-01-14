import React, { useState, useRef } from "react";
import { Student } from "../../types";
import { api } from "../../services/auth.service";
import LoadingSpinner from "../common/LoadingSpinner";

interface QRGeneratorProps {
  students: Student[];
  onGenerateSuccess?: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({
  students,
  onGenerateSuccess,
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  // Safely handle students prop - ensure it's always an array
  const safeStudents = Array.isArray(students) ? students : [];

  const filteredStudents = safeStudents.filter(
    (student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s._id));
    }
  };

  const generateQRCodes = async () => {
    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setQrCodes({});

    try {
      const response = await api.post("/students/generate-qr-codes", {
        studentIds: selectedStudents,
      });

      setQrCodes(response.data.qrCodes);
      setSuccess(
        `Generated QR codes for ${selectedStudents.length} student(s)`
      );
      onGenerateSuccess?.();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to generate QR codes");
    } finally {
      setLoading(false);
    }
  };

  const downloadAllQRCodes = async () => {
    if (Object.keys(qrCodes).length === 0) {
      setError("No QR codes to download. Generate them first.");
      return;
    }

    try {
      const response = await api.post(
        "/students/download-qr-codes",
        {
          studentIds: selectedStudents,
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student-qr-codes.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Failed to download QR codes");
    }
  };

  const printQRCodes = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Student QR Codes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .qr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .qr-item { text-align: center; page-break-inside: avoid; margin-bottom: 20px; }
            .qr-item img { max-width: 150px; height: 150px; }
            .student-info { margin-top: 10px; font-size: 12px; }
            @media print {
              .qr-grid { grid-template-columns: repeat(3, 1fr); }
              .qr-item { margin-bottom: 30px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Generate QR Codes
      </h3>

      <div className="space-y-6">
        {/* Student Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="label">Select Students</label>
            <button onClick={handleSelectAll} className="btn-secondary text-sm">
              {selectedStudents.length === filteredStudents.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field mb-4"
          />

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No students found
              </div>
            ) : (
              filteredStudents.map((student) => (
                <label
                  key={student._id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => handleStudentSelect(student._id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.studentId} - {student.yearLevel} {student.major}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {selectedStudents.length} student(s) selected
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateQRCodes}
          disabled={loading || selectedStudents.length === 0}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" text="" />
              <span className="ml-2">Generating QR Codes...</span>
            </div>
          ) : (
            `🔗 Generate QR Codes (${selectedStudents.length} selected)`
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

        {/* QR Codes Display */}
        {Object.keys(qrCodes).length > 0 && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button onClick={downloadAllQRCodes} className="btn-secondary">
                📄 Download PDF
              </button>
              <button onClick={printQRCodes} className="btn-secondary">
                🖨️ Print QR Codes
              </button>
            </div>

            <div ref={printRef}>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Generated QR Codes
              </h4>
              <div className="qr-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(qrCodes).map(([studentId, qrCodeUrl]) => {
                  const student = safeStudents.find((s) => s._id === studentId);
                  if (!student) return null;

                  return (
                    <div
                      key={studentId}
                      className="qr-item text-center border border-gray-200 rounded-lg p-4"
                    >
                      <img
                        src={qrCodeUrl}
                        alt={`QR Code for ${student.firstName} ${student.lastName}`}
                        className="mx-auto w-32 h-32 border border-gray-300 rounded"
                      />
                      <div className="student-info mt-3">
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.studentId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.yearLevel} - {student.major}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            QR Code Instructions
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Select students from the list above</li>
            <li>• Click "Generate QR Codes" to create unique QR codes</li>
            <li>• QR codes contain encrypted student information</li>
            <li>• Download as PDF or print directly for distribution</li>
            <li>• Students can use these QR codes for attendance marking</li>
            <li>• QR codes are automatically saved to student records</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
