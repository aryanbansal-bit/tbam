'use client';

import { useState } from 'react';

export default function Page() {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowLogin(false);
        window.location.reload();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Top bar */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setShowLogin(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Login
        </button>
      </div>

      {/* Page content */}
      <div className="flex justify-center items-center mt-20 text-xl">
        This is welcome page
      </div>

      {/* 🔹 UPDATED: Invisible/Clear background overlay */}
      {/* Changed bg-black/50 to bg-transparent and added backdrop-blur-sm for a nice glass effect */}
      {showLogin && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] z-40" />
      )}

      {/* 🔹 Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {/* pointer-events-auto needed on the modal itself so you can click inputs */}
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl p-6 relative pointer-events-auto border border-gray-100">
            
            {/* Close button (disabled while loading) */}
            {!isLoading && (
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}

            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Sign in
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />

              <input
                type="password"
                placeholder="Password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔄 UPDATED: Loader is now clear, not black */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-60 cursor-wait">
          {/* Changed border-white to border-indigo-600 so it is visible on light bg */}
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}