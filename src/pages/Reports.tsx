import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ReportGenerator from "../components/reports/ReportGenerator";
import OfficerExclusionManagement from "../components/reports/OfficerExclusionManagement";

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"reports" | "exclusions">(
    "reports"
  );
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Generate comprehensive attendance reports and manage officer
                exclusions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Report Generation
              </p>
              <p className="text-lg font-semibold text-gray-900">Available</p>
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Export Formats
              </p>
              <p className="text-lg font-semibold text-gray-900">Excel & PDF</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Analytics</p>
              <p className="text-lg font-semibold text-gray-900">
                Trends & Stats
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Officer Management
              </p>
              <p className="text-lg font-semibold text-gray-900">Exclusions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "reports"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              📊 Attendance Reports
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("exclusions")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "exclusions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                👥 Officer Exclusions
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "reports" && <ReportGenerator />}
      {activeTab === "exclusions" && isAdmin && <OfficerExclusionManagement />}

      {/* Feature Overview for Students */}
      {!isAdmin && (
        <div className="glass-card bg-blue-50/50 p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            📊 Reports Available
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>
              • View attendance reports with comprehensive filtering options
            </p>
            <p>• Search by date range, event, or student information</p>
            <p>• Real-time attendance statistics and trends</p>
            <p>• Export capabilities for personal record keeping</p>
          </div>
        </div>
      )}

      {/* Admin Feature Overview */}
      {isAdmin && (
        <div className="glass-card bg-green-50/50 p-6">
          <h3 className="text-lg font-medium text-green-900 mb-2">
            🛠️ Admin Reporting Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
            <div>
              <h4 className="font-medium mb-2">📈 Advanced Analytics</h4>
              <ul className="space-y-1 text-sm">
                <li>• Attendance trends and patterns</li>
                <li>• Morning vs afternoon session analysis</li>
                <li>• Student performance tracking</li>
                <li>• Event-specific attendance rates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚙️ Management Tools</h4>
              <ul className="space-y-1 text-sm">
                <li>• Officer exclusion management</li>
                <li>• Bulk export capabilities</li>
                <li>• Custom date range filtering</li>
                <li>• Multi-format export (Excel/PDF)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
