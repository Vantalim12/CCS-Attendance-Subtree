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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel: Brand / Static Info */}
      <div className="bg-gray-100 p-12 flex flex-col justify-between relative overflow-hidden border-r border-gray-200">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-black"></div>
            <span className="font-mono font-bold tracking-tight">CCS_SYSTEM_V.2.0</span>
          </div>

          <h1 className="text-6xl font-display font-bold text-gray-900 leading-tight mb-6">
            DIGITAL<br />ATTENDANCE<br />ARCHIVE
          </h1>
          <p className="text-xl text-gray-600 font-serif max-w-md border-l-2 border-black pl-6 py-2">
            Secure tabulation and attendance monitoring for the College of Computer Studies.
          </p>

          {/* 3D Floating Logo */}
          <div className="mt-12 perspective-container">
            <img
              src="/wolf-logo.png"
              alt="CCS Wolf Logo"
              className="w-48 h-auto float-3d"
            />
          </div>
        </div>

        <div className="relative z-10 font-mono text-xs text-gray-500 space-y-2">
          <p>SYS.STATUS: ONLINE</p>
          <p>LOC: MSU-IIT</p>
          <p>DATE: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Right Panel: Login Terminal */}
      <div className="bg-white p-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <div className="inline-block bg-black text-white px-2 py-1 text-xs font-mono mb-4">
              AUTHENTICATION_REQUIRED
            </div>
            <h2 className="text-3xl font-display font-semibold mb-2">Access Terminal</h2>
            <p className="text-gray-500 font-mono text-sm">Please identify yourself to proceed.</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
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
