import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/auth.service";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";

interface Activity {
  id: string;
  type: "attendance" | "event" | "excuse";
  message: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const { hasRole } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeEvents: 0,
    todayAttendance: "0%",
    pendingExcuses: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    if (hasRole("admin")) {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    }
  }, [hasRole]);

  const fetchActivities = useCallback(async () => {
    if (hasRole("admin")) {
      try {
        const response = await api.get("/dashboard/activities");
        setActivities(response.data.activities || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    }
  }, [hasRole]);

  useEffect(() => {
    fetchStats();
    fetchActivities();

    // Auto-refresh activities every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats, fetchActivities]);

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "attendance":
        return "bg-blue-400 ring-blue-50";
      case "event":
        return "bg-emerald-400 ring-emerald-50";
      case "excuse":
        return "bg-amber-400 ring-amber-50";
      default:
        return "bg-gray-400 ring-gray-50";
    }
  };

  const statsData = [
    {
      name: "Total Students",
      value: stats.totalStudents,
      description: "Registered students",
      adminOnly: true,
    },
    {
      name: "Active Events",
      value: stats.activeEvents,
      description: "Ongoing events",
      adminOnly: false,
    },
    {
      name: "Today's Attendance",
      value: stats.todayAttendance,
      description: "Attendance rate",
      adminOnly: false,
    },
    {
      name: "Pending Excuses",
      value: stats.pendingExcuses,
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
        color: "bg-blue-500",
      },
      {
        title: "Create Event",
        description: "Set up new attendance events",
        href: "/events",
        color: "bg-green-500",
      },
      {
        title: "View Reports",
        description: "Generate attendance reports",
        href: "/reports",
        color: "bg-purple-500",
      },
      {
        title: "Manage Attendance",
        description: "Monitor real-time attendance",
        href: "/attendance",
        color: "bg-orange-500",
      },
    ]
    : [
      {
        title: "Scan QR Code",
        description: "Mark your attendance",
        href: "/attendance",
        color: "bg-blue-500",
      },
      {
        title: "View Events",
        description: "See upcoming events",
        href: "/events",
        color: "bg-green-500",
      },
      {
        title: "Submit Excuse",
        description: "Upload excuse letters",
        href: "/attendance",
        color: "bg-orange-500",
      },
    ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="glass-card-lg relative overflow-hidden p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-ink mb-2">
              Welcome back, administrator!
            </h1>
            <p className="text-ink-muted text-lg">
              Here is what's happening today,{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              System Online
            </span>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredStats.map((stat, index) => (
          <div
            key={stat.name}
            className="glass-card p-6 flex flex-col justify-between"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-ink-muted uppercase tracking-wider">
                  {stat.name}
                </p>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold text-ink">
                    {stat.value}
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-2xl ${index === 0
                  ? "bg-blue-50 text-blue-600"
                  : index === 1
                    ? "bg-purple-50 text-purple-600"
                    : index === 2
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {index === 0 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                  {index === 1 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  )}
                  {index === 2 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                  {index === 3 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm text-ink-muted/80">
              <span>{stat.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-display font-bold text-ink mb-6 flex items-center">
          <span className="w-1 h-6 bg-accent rounded-full mr-3"></span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <a
              key={action.title}
              href={action.href}
              className="glass-card group p-1 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="bg-white/50 p-6 rounded-xl h-full transition-colors group-hover:bg-white/80">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 transition-transform group-hover:scale-110 duration-300 ${action.color}`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {action.title === "Manage Students" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                    {(action.title === "Create Event" || action.title === "View Events") && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    )}
                    {action.title === "View Reports" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    )}
                    {(action.title === "Manage Attendance" || action.title === "Scan QR Code") && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {action.title === "Submit Excuse" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    )}
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-ink mb-1 group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {action.description}
                </p>

                {/* Arrow icon that appears on hover */}
                <div className="absolute top-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-ink-muted">
                  →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Analytics Charts - Admin Only */}
      {hasRole("admin") && (
        <div>
          <h3 className="text-xl font-display font-bold text-ink mb-6 flex items-center">
            <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
            Analytics
          </h3>
          <AnalyticsCharts />
        </div>
      )}

      {/* Recent Activity - Real-time */}
      {hasRole("admin") && (
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100/50 bg-white/30 flex justify-between items-center">
            <h3 className="text-lg font-bold text-ink flex items-center">
              Recent Activity
            </h3>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="p-8 space-y-6">
            {activities.length === 0 ? (
              <div className="text-center py-4 text-ink-muted">
                No recent activities
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ring-4 ${getActivityColor(activity.type)}`}></div>
                    {index < activities.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
                    )}
                  </div>
                  <div className={index < activities.length - 1 ? "pb-6" : ""}>
                    <p className="text-ink font-medium">{activity.message}</p>
                    <p className="text-sm text-ink-muted mt-1">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

