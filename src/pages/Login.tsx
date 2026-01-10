import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CCSLogo from "../CCS_FINAL_LOGO.png";

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
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            {/* Logo */}
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <div className="flex items-center">
                <img
                  src={CCSLogo}
                  alt="CCS Logo"
                  className="w-10 h-10 rounded-lg floating-glow"
                />
                <span className="ml-3 text-xl font-display font-bold text-ink">
                  CCS TABCOM Attendance System
                </span>
              </div>
            </div>

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
              <img
                src={CCSLogo}
                alt="CCS Logo"
                className="w-20 h-20 rounded-lg floating-glow"
              />
            </div>

            {/* Hero headline */}
            <h1 className="text-4xl md:text-6xl font-display font-bold text-ink mb-6 tracking-tight">
              <span className="text-gradient">CCS Attendance System</span>
            </h1>
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

      {/* Footer */}
      <footer className="py-12 border-t border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <img
                src={CCSLogo}
                alt="CCS Logo"
                className="w-10 h-10 rounded-lg floating-glow"
              />
              <span className="ml-2 font-display font-bold text-ink">
                CCS TABCOM Attendance System
              </span>
            </div>
            <p className="text-sm text-ink-muted">
              Modern attendance management for students in MSU-IIT.
            </p>
            <div className="mt-8 pt-8 border-t border-ink/10">
              <p className="text-sm text-ink-muted">
                © 2025 CCS Tabulation Committee Attendance System. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
