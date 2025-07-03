import React, { useState } from "react";
import { api } from "../../services/auth.service";
import LoadingSpinner from "../common/LoadingSpinner";

interface ExcelImportProps {
  onImportSuccess?: () => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (
        !allowedTypes.includes(selectedFile.type) &&
        !selectedFile.name.endsWith(".csv")
      ) {
        setError("Only Excel files (.xls, .xlsx) and CSV files are allowed");
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      setError("");
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults(response.data);
      onImportSuccess?.();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to import students");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get("/students/import-template", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student-import-template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Failed to download template");
    }
  };

  const clearFile = () => {
    setFile(null);
    setResults(null);
    setError("");

    // Reset file input
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Import Students from Excel
      </h3>

      <div className="space-y-6">
        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-blue-800">
                Download Template First
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Use the provided template to ensure your data is formatted
                correctly.
              </p>
              <button
                onClick={downloadTemplate}
                className="mt-2 btn-secondary text-sm"
              >
                📄 Download Template
              </button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="label">Select Excel File</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-input"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                Excel files (.xlsx, .xls) or CSV up to 10MB
              </p>
            </div>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={clearFile}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" text="" />
              <span className="ml-2">Importing Students...</span>
            </div>
          ) : (
            "📊 Import Students"
          )}
        </button>

        {/* Success Results */}
        {results && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Import Completed Successfully!
            </h4>
            <div className="text-sm text-green-700">
              <p>✅ {results.successful} students imported successfully</p>
              {results.failed > 0 && (
                <p>❌ {results.failed} students failed to import</p>
              )}
              {results.skipped > 0 && (
                <p>⏭️ {results.skipped} students skipped (duplicates)</p>
              )}
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-red-800">Errors:</h5>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {results.errors
                    .slice(0, 5)
                    .map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  {results.errors.length > 5 && (
                    <li>... and {results.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Import Instructions
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>1. Download the Excel template using the button above</li>
            <li>2. Fill in the student data following the column headers</li>
            <li>
              3. Required fields: Student ID, Name, Year Level, Major,
              Department/Program
            </li>
            <li>
              4. Status field accepts: regular, governor, vice-governor,
              under-secretary
            </li>
            <li>5. Save the file and upload it using the file picker</li>
            <li>6. Duplicate student IDs will be skipped automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;
