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
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-ink-muted/80">
              <span className="text-emerald-600 font-medium flex items-center mr-2">
                ↑ 12%
              </span>
              <span>vs last month</span>
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
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg mb-4 transition-transform group-hover:scale-110 duration-300 ${action.color}`}
                >
                  {action.icon}
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

      {/* Recent Activity */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100/50 bg-white/30">
          <h3 className="text-lg font-bold text-ink flex items-center">
            Recent Activity
          </h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-50"></div>
              <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
            </div>
            <div className="pb-6">
              <p className="text-ink font-medium">Event "Weekly Meeting" created</p>
              <p className="text-sm text-ink-muted mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-blue-400 ring-4 ring-blue-50"></div>
              <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
            </div>
            <div className="pb-6">
              <p className="text-ink font-medium">45 students marked attendance</p>
              <p className="text-sm text-ink-muted mt-1">4 hours ago</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-50"></div>
            </div>
            <div>
              <p className="text-ink font-medium">New excuse letter submitted</p>
              <p className="text-sm text-ink-muted mt-1">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
