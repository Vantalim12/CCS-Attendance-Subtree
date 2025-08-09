import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            {/* Logo */}
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center floating-glow">
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
                <span className="ml-3 text-xl font-display font-bold text-ink">
                  CCS System
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-ink-muted hover:text-primary transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-ink-muted hover:text-primary transition-colors duration-200"
              >
                Pricing
              </a>
              <a
                href="#changelog"
                className="text-ink-muted hover:text-primary transition-colors duration-200"
              >
                Changelog
              </a>
              <a
                href="#contact"
                className="text-ink-muted hover:text-primary transition-colors duration-200"
              >
                Contact
              </a>
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <Link to="/register" className="btn-secondary mr-4">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Product mark with glow */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center floating-glow">
                <svg
                  className="w-10 h-10 text-white"
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
              </div>
            </div>

            {/* Hero headline */}
            <h1 className="text-4xl md:text-6xl font-display font-bold text-ink mb-6 tracking-tight">
              <span className="text-gradient">CCS Attendance System</span>
            </h1>

            {/* Subcopy */}
            <p className="text-xl text-ink-muted mb-12 max-w-2xl mx-auto leading-relaxed">
              Your journey to effortless attendance management starts here.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() =>
                  document
                    .getElementById("login-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-primary text-lg px-8 py-4"
              >
                Get Started
              </button>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </a>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                label: "Total Users",
                value: "50,789",
                change: "+8.5%",
                trend: "up",
              },
              {
                label: "Total Events",
                value: "20,393",
                change: "+1.3%",
                trend: "up",
              },
              {
                label: "Today's Sign-ins",
                value: "5,040",
                change: "+3.8%",
                trend: "up",
              },
              {
                label: "Pending Excuses",
                value: "24",
                change: "-4.3%",
                trend: "down",
              },
            ].map((kpi, index) => (
              <div
                key={index}
                className="kpi-card animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl font-display font-bold text-ink mb-2">
                  {kpi.value}
                </div>
                <div className="text-sm text-ink-muted mb-3">{kpi.label}</div>
                <div
                  className={`flex items-center justify-center text-xs font-medium ${
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <svg
                    className={`w-3 h-3 mr-1 ${
                      kpi.trend === "up" ? "" : "rotate-180"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                  {kpi.change} from yesterday
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div id="login-form" className="relative py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card-lg p-8 animate-slide-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-ink mb-2">
                Welcome Back
              </h2>
              <p className="text-ink-muted">
                Sign in to your account to continue
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="glass-card p-4 bg-red-50 border-red-200 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" text="" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-ink-muted">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:text-primary-600 transition-colors duration-200"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Features Preview Section */}
      <div id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-4">
              Everything you need for attendance management
            </h2>
            <p className="text-xl text-ink-muted max-w-3xl mx-auto">
              Streamline your organization's attendance tracking with powerful
              features designed for modern workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "📱",
                title: "QR Code Scanning",
                description:
                  "Fast, contactless attendance marking with smart duplicate detection.",
              },
              {
                icon: "📅",
                title: "Event Management",
                description:
                  "Create and manage events with custom attendance windows and grace periods.",
              },
              {
                icon: "📋",
                title: "Excuse Handling",
                description:
                  "Digital excuse letter submission and approval workflow.",
              },
              {
                icon: "📊",
                title: "Advanced Reports",
                description:
                  "Comprehensive analytics and exportable attendance reports.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 text-center animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-display font-semibold text-ink mb-3">
                  {feature.title}
                </h3>
                <p className="text-ink-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-gradient-brand flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
                </div>
                <span className="ml-2 font-display font-bold text-ink">
                  CCS System
                </span>
              </div>
              <p className="text-sm text-ink-muted">
                Modern attendance management for educational institutions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#changelog"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#about"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#support"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#privacy"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="text-ink-muted hover:text-primary transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-ink/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-ink-muted">
              © 2024 CCS Attendance System. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-ink-muted hover:text-primary transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-ink-muted hover:text-primary transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
