import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
      setError(err.message || "Access denied. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left Panel: Brand / Static Info (Hidden on Mobile) */}
      <div className="hidden lg:flex bg-gray-100 p-8 lg:p-12 flex-col justify-between relative overflow-hidden border-r border-gray-200 h-full">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}>
        </div>

        {/* Top: Branding */}
        <div className="relative z-10 flex-none">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-black"></div>
            <span className="font-mono font-bold tracking-tight">CCS_SYSTEM_V.2.0</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight mb-4">
            DIGITAL<br />ATTENDANCE<br />ARCHIVE
          </h1>
          <p className="text-lg text-gray-600 font-serif max-w-md border-l-2 border-black pl-6 py-2">
            Secure tabulation and attendance monitoring.
          </p>
        </div>

        {/* Middle: Giant Logo (Takes available space) */}
        <div className="relative z-10 flex-1 flex items-center justify-center min-h-0 perspective-container py-4">
          <img
            src="/wolf-logo.png"
            alt="CCS Wolf Logo"
            className="h-full w-auto max-w-full object-contain float-3d drop-shadow-2xl"
            style={{ maxHeight: '50vh' }}
          />
        </div>

        {/* Bottom: Status */}
        <div className="relative z-10 font-mono text-xs text-gray-500 space-y-1 flex-none">
          <p>SYS.STATUS: ONLINE</p>
          <p>LOC: MSU-IIT</p>
          <p>DATE: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Right Panel: Login Terminal */}
      <div className="bg-white p-6 lg:p-12 flex flex-col justify-center h-full overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto pt-6 pb-6">

          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-24 h-24 perspective-container mb-4">
              <img
                src="/wolf-logo.png"
                alt="CCS Wolf Logo"
                className="w-full h-full object-contain float-3d"
              />
            </div>
            <h1 className="text-2xl font-display font-bold text-center leading-tight">
              CCS DIGITAL<br />ARCHIVE
            </h1>
          </div>

          <div className="mb-8 lg:mb-12">
            <div className="inline-block bg-black text-white px-2 py-1 text-xs font-mono mb-4">
              AUTHENTICATION_REQUIRED
            </div>
            <h2 className="text-3xl font-display font-semibold mb-2">Access Terminal</h2>
            <p className="text-gray-500 font-mono text-sm">Please identify yourself to proceed.</p>
          </div>

          <form className="space-y-6 lg:space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 flex items-start space-x-3">
                <span className="text-red-600 font-mono font-bold">ERR:</span>
                <span className="text-red-700 text-sm font-mono">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2 font-mono text-gray-500">
                  User_ID (Email)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm font-mono text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  placeholder="user@msumain.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-2 font-mono text-gray-500">
                  Passkey
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm font-mono text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white px-6 py-4 font-mono text-sm uppercase tracking-wider border border-black hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center group"
            >
              {isLoading ? (
                <span className="animate-pulse">VERIFYING...</span>
              ) : (
                <>
                  <span>Initialize Session</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </>
              )}
            </button>

            <div className="border-t border-gray-100 pt-8 mt-8">
              <p className="text-center text-xs font-mono text-gray-400 mb-6">- OR ACCESS DIRECTORY -</p>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/public/events?org=CCS"
                  className="border border-gray-200 p-4 text-center hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <span className="block font-bold font-display text-gray-900 group-hover:text-black">CCS</span>
                  <span className="text-xs text-gray-500 font-mono">DIR_ACCESS</span>
                </Link>
                <Link
                  to="/public/events?org=CED"
                  className="border border-gray-200 p-4 text-center hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <span className="block font-bold font-display text-gray-900 group-hover:text-black">CED</span>
                  <span className="text-xs text-gray-500 font-mono">DIR_ACCESS</span>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
