import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Icon components
const IconComponent = ({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) => {
  const icons = {
    dashboard: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
        />
      </svg>
    ),
    attendance: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    events: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    students: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
    reports: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    excuses: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    exclusions: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
        />
      </svg>
    ),
    settings: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    logout: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    ),
    menu: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
    search: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    bell: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
    user: (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  };
  return icons[name as keyof typeof icons] || null;
};

const Layout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
      current: location.pathname === "/dashboard",
    },
    {
      name: "Students",
      href: "/students",
      icon: "students",
      current: location.pathname === "/students",
      adminOnly: true,
    },
    {
      name: "Events",
      href: "/events",
      icon: "events",
      current: location.pathname === "/events",
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: "attendance",
      current: location.pathname === "/attendance",
    },
    {
      name: "Reports",
      href: "/reports",
      icon: "reports",
      current: location.pathname === "/reports",
      adminOnly: true,
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || hasRole("admin")
  );

  // Handle clicks outside sidebar when expanded but not pinned
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarExpanded &&
        !isPinned &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarExpanded(false);
      }
    };

    if (isSidebarExpanded && !isPinned) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarExpanded, isPinned]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsSidebarExpanded(true);
    }
  };

  const handleSidebarHover = () => {
    if (!isPinned && !isSidebarExpanded) {
      setIsSidebarExpanded(true);
    }
  };

  const handleSidebarLeave = () => {
    if (!isPinned) {
      setIsSidebarExpanded(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 glass-card-lg transition-all duration-300 ease-out ${
          isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
        onMouseEnter={handleSidebarHover}
        onMouseLeave={handleSidebarLeave}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center h-16 px-4"
          style={{ borderBottom: "1px solid rgba(13, 26, 38, 0.1)" }}
        >
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md transition-colors duration-200"
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(14, 115, 115, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            aria-label="Toggle sidebar"
          >
            <IconComponent name="menu" className="w-5 h-5 text-ink" />
          </button>

          {isSidebarExpanded && (
            <div className="ml-3 flex items-center justify-between flex-1">
              <h1 className="text-lg font-display font-semibold text-ink truncate">
                CCS System
              </h1>
              <button
                onClick={togglePin}
                className={`p-1.5 rounded-md transition-colors duration-200 ${
                  isPinned ? "text-primary" : "text-ink-muted"
                }`}
                style={
                  isPinned ? { background: "rgba(64, 211, 200, 0.2)" } : {}
                }
                onMouseEnter={(e) => {
                  if (!isPinned) {
                    e.currentTarget.style.background =
                      "rgba(14, 115, 115, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPinned) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
                aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isPinned
                        ? "M5 11l7-7 7 7M5 19l7-7 7 7"
                        : "M19 14l-7 7m0 0l-7-7m7 7V3"
                    }
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-item ${item.current ? "active" : ""}`}
                title={!isSidebarExpanded ? item.name : undefined}
              >
                <IconComponent
                  name={item.icon}
                  className="w-5 h-5 flex-shrink-0"
                />
                {isSidebarExpanded && (
                  <span className="ml-3 text-sm font-medium truncate">
                    {item.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{ borderTop: "1px solid rgba(13, 26, 38, 0.1)" }}
        >
          <button
            onClick={logout}
            className="sidebar-item w-full text-red-600"
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(254, 242, 242, 1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            title={!isSidebarExpanded ? "Sign out" : undefined}
          >
            <IconComponent name="logout" className="w-5 h-5 flex-shrink-0" />
            {isSidebarExpanded && (
              <span className="ml-3 text-sm font-medium">Sign out</span>
            )}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ease-out ${
          isSidebarExpanded ? "ml-[280px]" : "ml-[72px]"
        }`}
      >
        {/* Top bar */}
        <header
          className="glass-card sticky top-0 z-40 h-20 px-8 flex items-center justify-between shadow-lg"
          style={{ borderBottom: "2px solid rgba(13, 26, 38, 0.1)" }}
        >
          {/* Page title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-ink capitalize">
              {location.pathname.replace("/", "").replace("-", " ") ||
                "Dashboard"}
            </h1>
          </div>

          {/* Top bar actions */}
          <div className="flex items-center space-x-4">
            {/* Global search */}
            <div className="relative">
              <IconComponent
                name="search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-muted"
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-12 pr-4 py-3 w-72 rounded-lg border border-ink/20 bg-white/80 backdrop-blur-sm 
                          focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                          transition-all duration-200 ease-out text-base"
              />
            </div>

            {/* Notifications */}
            <button
              className="relative p-3 rounded-lg transition-colors duration-200"
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(14, 115, 115, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <IconComponent name="bell" className="w-6 h-6 text-ink" />
              <div className="notification-dot" />
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-base font-medium text-ink">
                  {user?.email}
                </div>
                <div className="text-sm text-ink-muted">{user?.role}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center">
                <IconComponent name="user" className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay when sidebar is expanded */}
      {isSidebarExpanded && !isPinned && (
        <div
          className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}
    </div>
  );
};

export default Layout;
