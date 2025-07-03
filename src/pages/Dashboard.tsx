import React from "react";
import { useAuth } from "../hooks/useAuth";

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  const statsData = [
    {
      name: "Total Students",
      value: "256",
      icon: "👥",
      description: "Registered students",
      adminOnly: true,
    },
    {
      name: "Active Events",
      value: "12",
      icon: "📅",
      description: "Ongoing events",
      adminOnly: false,
    },
    {
      name: "Today's Attendance",
      value: "89%",
      icon: "✅",
      description: "Attendance rate",
      adminOnly: false,
    },
    {
      name: "Pending Excuses",
      value: "7",
      icon: "📝",
      description: "Letters to review",
      adminOnly: true,
    },
  ];

  const filteredStats = statsData.filter(
    (stat) => !stat.adminOnly || hasRole("admin")
  );

  const quickActions = hasRole("admin")
    ? [
        {
          title: "Manage Students",
          description: "Add, edit, or import student data",
          href: "/students",
          icon: "👥",
          color: "bg-blue-500",
        },
        {
          title: "Create Event",
          description: "Set up new attendance events",
          href: "/events",
          icon: "📅",
          color: "bg-green-500",
        },
        {
          title: "View Reports",
          description: "Generate attendance reports",
          href: "/reports",
          icon: "📊",
          color: "bg-purple-500",
        },
        {
          title: "Manage Attendance",
          description: "Monitor real-time attendance",
          href: "/attendance",
          icon: "✅",
          color: "bg-orange-500",
        },
      ]
    : [
        {
          title: "Scan QR Code",
          description: "Mark your attendance",
          href: "/attendance",
          icon: "📱",
          color: "bg-blue-500",
        },
        {
          title: "View Events",
          description: "See upcoming events",
          href: "/events",
          icon: "📅",
          color: "bg-green-500",
        },
        {
          title: "Submit Excuse",
          description: "Upload excuse letters",
          href: "/attendance",
          icon: "📝",
          color: "bg-orange-500",
        },
      ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to QR Attendance System
          </h1>
          <p className="text-gray-600">
            Hello {user?.email}! You are logged in as{" "}
            <span className="font-medium text-blue-600">{user?.role}</span>.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filteredStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                    <dd className="text-xs text-gray-500">
                      {stat.description}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.href}
                className="relative group bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                <div>
                  <span
                    className={`rounded-lg inline-flex p-3 text-white text-xl ${action.color}`}
                  >
                    {action.icon}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <span className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-gray-900">
                Event "Weekly Meeting" created
              </span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></span>
              <span className="text-gray-900">
                45 students marked attendance
              </span>
              <span className="text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span className="text-gray-900">New excuse letter submitted</span>
              <span className="text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
