import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/logo.svg?react";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`block px-4 py-2 rounded transition-colors ${
        location.pathname === to
          ? "text-orange-400 font-bold"
          : "text-gray-300 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="relative bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between relative">
        <div className="md:static absolute left-1/2 -translate-x-1/2 md:translate-x-0">
          <Link to="/dashboard" className="text-orange-400">
            <Logo className="h-8 w-8" />
          </Link>
        </div>
        {isLoggedIn && (
          <>
            {/* Desktop */}
            <div className="hidden md:flex gap-6 items-center ml-auto">
              {navLink("/dashboard", "Dashboard")}
              {navLink("/templates", "Templates")}
              {navLink("/history", "History")}
              {navLink("/progress", "Progress")}
              {navLink("/friends", "Friends")}
              {navLink("/settings", "Settings")}
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 text-sm cursor-pointer"
              >
                Logout
              </button>
            </div>

            {/* Mobile burger */}
            <div className="w-8 md:hidden" />
            <div className="flex justify-end md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-300 hover:text-white cursor-pointer text-2xl"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {isLoggedIn && menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 border-b border-gray-700 flex flex-col gap-1 px-6 py-2 z-40">
            {navLink("/dashboard", "Dashboard")}
            {navLink("/templates", "Templates")}
            {navLink("/history", "History")}
            {navLink("/progress", "Progress")}
            {navLink("/friends", "Friends")}
            {navLink("/settings", "Settings")}
            <button
              onClick={handleLogout}
              className="text-left px-4 py-2 text-gray-400 hover:text-red-400 text-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
