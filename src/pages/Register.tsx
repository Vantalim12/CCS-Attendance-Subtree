import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"admin" | "student">("student");
  const [organizationId, setOrganizationId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!organizationId.trim()) {
      setError("Organization ID is required");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email,
        password,
        role,
        organizationId: organizationId.trim(),
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass-card-lg p-8 animate-slide-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-ink mb-2">
            Create Account
          </h2>
          <p className="text-ink-muted">
            Join the CCS Attendance System
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="glass-card p-4 bg-red-50/50 border-red-200 animate-fade-in text-red-700 text-sm flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">
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
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="role" className="label">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "student")}
                disabled={isLoading}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="organizationId" className="label">
                Organization ID
              </label>
              <input
                id="organizationId"
                name="organizationId"
                type="text"
                required
                className="input-field"
                placeholder="Enter your organization ID"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-ink-muted">
                Contact your admin for the organization ID
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-ink-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-600 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
