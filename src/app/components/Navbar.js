"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const handleEmailChange = (e) => {
    const selected = e.target.value;
    setSelectedValue(""); // Reset to allow re-selection
    if (selected === "rotary3012") {
      router.push("/dashboard/services/emailsend/rotary3012");
    } else if (selected === "tbam") {
      router.push("/dashboard/services/emailsend/tbam");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        setUsername(data.username || "");
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setUserMenuOpen(false);
      setUsername("");
      window.location.href = "/"; // full reload
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <nav className="bg-blue-600 text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">Rotary Management</div>
          <div className="animate-pulse">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand */}
        <div className="text-xl font-bold">Rotary Management</div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden p-2 rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop menu */}
        <div className="hidden sm:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <ul className="flex gap-6">
                <li>
                  <Link href="/dashboard/user/home" className="hover:text-gray-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/user/newUser"
                    className="hover:text-gray-200"
                  >
                    Add a user
                  </Link>
                </li>
                <li>
                  <select
                    value={selectedValue}
                    onChange={handleEmailChange}
                    className="bg-blue-600 text-white border border-white rounded px-2 py-1 cursor-pointer hover:bg-blue-700 focus:outline-none"
                  >
                    <option value="" disabled>
                      Select Email Group
                    </option>
                    <option value="rotary3012">Rotary3012</option>
                    <option value="tbam">TBAM</option>
                  </select>
                </li>
                <li>
                  <Link href="/dashboard/services/personalemails" className="hover:text-gray-200">
                    Personal Emails
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/services/whatsapp" className="hover:text-gray-200">
                    Whatsapp
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/user/member"
                    className="hover:text-gray-200"
                  >
                    Member
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/user/spouse"
                    className="hover:text-gray-200"
                  >
                    Spouse
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/user/anniversary"
                    className="hover:text-gray-200"
                  >
                    Anniversary
                  </Link>
                </li>
              </ul>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-blue-700 px-3 py-2 rounded-md hover:bg-blue-800"
                >
                  <span>{username || "User"}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-3 space-y-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard/user/home" className="hover:text-gray-200">
                Home
              </Link>
              <Link
                href="/dashboard/user/newUser"
                className="block px-3 py-2 hover:bg-blue-700 rounded"
              >
                Add a user
              </Link>
              <Link
                href="/dashboard/user/member"
                className="block px-3 py-2 hover:bg-blue-700 rounded"
              >
                Member
              </Link>
              <Link
                href="/dashboard/user/spouse"
                className="block px-3 py-2 hover:bg-blue-700 rounded"
              >
                Spouse
              </Link>
              <Link
                href="/dashboard/user/anniversary"
                className="block px-3 py-2 hover:bg-blue-700 rounded"
              >
                Anniversary
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block px-3 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
