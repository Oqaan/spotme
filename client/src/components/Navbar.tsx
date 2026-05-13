import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/logo.svg?react";

export default function Navbar() {
  const { isLoggedIn, logout, name } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const tabs = [
    {
      to: "/dashboard",
      label: "Home",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      to: "/templates",
      label: "Split",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="9" width="2.5" height="6" rx="1" fill="currentColor"/>
          <rect x="5" y="7" width="2.5" height="10" rx="1" fill="currentColor"/>
          <rect x="16.5" y="7" width="2.5" height="10" rx="1" fill="currentColor"/>
          <rect x="19.5" y="9" width="2.5" height="6" rx="1" fill="currentColor"/>
          <rect x="7.5" y="11" width="9" height="2" fill="currentColor"/>
        </svg>
      ),
    },
    {
      to: "/history",
      label: "History",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      to: "/progress",
      label: "Progress",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 17l4-4 4 4 4-6 4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      to: "/friends",
      label: "Friends",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M16 11c1.657 0 3 1.343 3 3M19 20c0-2.209-1.343-4-3-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-40 px-4 flex items-center justify-between"
        style={{
          height: 56,
          background: "rgba(11,8,16,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link to="/dashboard">
          <Logo className="h-7 w-7" style={{ color: "#E8E1D3" }} />
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #E8E1D3, #C9C2B4)",
              color: "#0B0810",
            }}
          >
            {name?.charAt(0).toUpperCase()}
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute right-0 top-10 z-50 rounded-xl overflow-hidden py-1"
                style={{
                  width: 160,
                  background: "rgba(20,18,16,0.98)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                  Settings
                </Link>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer"
                  style={{ color: "#ff6b6b" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "rgba(11,8,16,0.85)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const active = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center gap-1 flex-1 py-1"
                style={{ color: active ? "#E8E1D3" : "rgba(255,255,255,0.35)" }}
              >
                {tab.icon}
                <span className="text-xs font-bold tracking-wide">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}