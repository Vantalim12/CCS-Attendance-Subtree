import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ChangePasswordModal from "./ChangePasswordModal";

// Icon components (kept same but can be styled further via CSS)
const IconComponent = ({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) => {
  const icons = {
    dashboard: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 5h16M4 12h16M4 19h16" />
      </svg>
    ),
    attendance: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    events: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    students: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    reports: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    logout: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    menu: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    search: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    bell: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    user: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    key: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  };
  return icons[name as keyof typeof icons] || null;
};

const Layout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(true); // Pinned by default for desktop focus
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      name: "My Attendance",
      href: "/my-attendance",
      icon: "attendance",
      current: location.pathname === "/my-attendance",
      studentOnly: true,
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
    (item) =>
      (!item.adminOnly || hasRole("admin")) &&
      (!item.studentOnly || hasRole("student"))
  );

  // Handle clicks outside sidebar
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
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarExpanded, isPinned, isUserMenuOpen]);

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
    <div className="min-h-screen bg-transparent">
      {/* 
         DESIGN CHANGE: Command Rail Sidebar 
         - White background, sharp border
         - No rounded corners
      */}
      {/* 
         DESIGN CHANGE: Command Rail Sidebar 
         - White background, sharp border
         - No rounded corners
      */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          ${isSidebarExpanded || isPinned ? "w-[260px]" : "w-[64px]"}
          ${!isSidebarExpanded && !isPinned ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
        `}
        onMouseEnter={handleSidebarHover}
        onMouseLeave={handleSidebarLeave}
      >
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-sm text-gray-800 hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <IconComponent name="menu" className="w-5 h-5" />
          </button>

          {/* Desktop Toggle (only if collapsed) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-2 rounded-sm text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar desktop"
          >
            <IconComponent name="menu" className="w-5 h-5" />
          </button>

          {(isSidebarExpanded || isPinned) && (
            <div className="ml-3 flex items-center justify-between flex-1 animate-fade-in text-gray-900">
              <h1 className="text-sm font-mono font-bold tracking-tight">CCS_SYS</h1>
              <button
                onClick={togglePin}
                className={`p-1 rounded-sm ${isPinned ? "text-black" : "text-gray-400"}`}
                aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                <div className={`w-2 h-2 rounded-full ${isPinned ? "bg-black" : "border border-gray-300"}`} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-2 space-y-1">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item group ${item.current ? "active" : ""}`}
              title={!isSidebarExpanded && !isPinned ? item.name : undefined}
            >
              <IconComponent
                name={item.icon}
                className={`w-5 h-5 flex-shrink-0 transition-colors ${item.current ? "text-white" : "text-gray-500 group-hover:text-black"}`}
              />
              {(isSidebarExpanded || isPinned) && (
                <span className="ml-3 text-sm font-medium font-mono truncate">
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={logout}
            className="flex items-center w-full p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
            title={!isSidebarExpanded && !isPinned ? "Sign out" : undefined}
          >
            <IconComponent name="logout" className="w-5 h-5 flex-shrink-0" />
            {(isSidebarExpanded || isPinned) && (
              <span className="ml-3 text-xs font-mono font-bold uppercase tracking-wider">Sign out</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ease-in-out 
          ml-0 
          ${isSidebarExpanded || isPinned ? "lg:ml-[260px]" : "lg:ml-[64px]"}
        `}
      >
        {/* Top bar (Status Bar) */}
        {/* Top bar (Status Bar) */}
        <header className="sticky top-0 z-40 h-20 px-4 lg:px-8 flex items-center justify-between bg-white/90 backdrop-blur-sm border-b border-gray-200">

          {/* Breadcrumb / Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-display font-bold text-gray-900 capitalize tracking-tight">
              {location.pathname.replace("/", "").replace("-", " ") || "Terminal"}
            </h1>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-mono text-gray-500">v.2.0.4-stable</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex items-center border border-gray-200 rounded-sm px-4 py-2 bg-gray-50 hover:bg-white hover:border-gray-300 transition-colors cursor-text">
              <IconComponent name="search" className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="SEARCH_DB..."
                className="bg-transparent border-none focus:outline-none text-sm font-mono text-gray-700 w-48 placeholder-gray-400"
              />
            </div>

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-sm hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold font-mono text-gray-900">{user?.email}</div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase">{user?.role}</div>
                </div>
                <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-mono font-bold rounded-sm shadow-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-sm py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-mono text-gray-500">SESSION_ID: {Math.random().toString(36).substr(2, 9)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsChangePasswordOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors font-mono"
                  >
                    <IconComponent name="key" className="w-4 h-4 text-gray-400" />
                    Change Passkey
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-mono"
                  >
                    <IconComponent name="logout" className="w-4 h-4" />
                    Terminate Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarExpanded && !isPinned && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};

export default Layout;
