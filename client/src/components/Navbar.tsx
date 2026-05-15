import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFriends } from "../api";
import Logo from "../assets/logo.svg?react";
import {
  Home,
  Dumbbell,
  History,
  TrendingUp,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const { isLoggedIn, logout, name, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const isLiveSession = location.pathname.startsWith("/session");

  useEffect(() => {
    if (!isLoggedIn) return;
    getFriends()
      .then((res) => {
        const currentUserId = getUserIdFromToken(token);
        const pending = (res.data ?? []).filter(
          (f) => f.status === "pending" && f.friend_id === currentUserId,
        );
        setPendingCount(pending.length);
      })
      .catch(() => {});
  }, [isLoggedIn, location.pathname]);

  const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const tabs = [
    {
      to: "/dashboard",
      label: "Home",
      icon: <Home size={22} />,
    },
    {
      to: "/templates",
      label: "Split",
      icon: <Dumbbell size={22} />,
    },
    {
      to: "/history",
      label: "History",
      icon: <History size={22} />,
    },
    {
      to: "/progress",
      label: "Progress",
      icon: <TrendingUp size={22} />,
    },
    {
      to: "/friends",
      label: "Friends",
      icon: (
        <div className="relative">
          <Users size={22} />
          {pendingCount > 0 && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "#E8E1D3", color: "#0B0810" }}
            >
              {pendingCount}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (!isLoggedIn || isLiveSession) return null;

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {menuOpen && (
        <div
          className="fixed right-4 top-14 rounded-xl overflow-hidden py-1"
          style={{
            width: 160,
            background: "rgba(20,18,16,0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            zIndex: 60,
          }}
        >
          <Link
            to="/settings"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <Settings size={16} />
            Settings
          </Link>
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.06)",
              margin: "0 12px",
            }}
          />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer"
            style={{ color: "#ff6b6b" }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}

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
                <span className="text-xs font-bold tracking-wide">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
