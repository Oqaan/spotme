import React, { useState, useEffect } from "react";
import {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend,
} from "../api";
import type { Friendship } from "../types";
import { formatDate } from "../utils";
import { useAuth } from "../context/AuthContext";

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmUnfriend, setConfirmUnfriend] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await getFriends();
      setFriends(res.data ?? []);
    } catch {
      console.error("Failed to fetch friends");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await sendFriendRequest(email);
      setSuccess("Friend request sent!");
      setEmail("");
    } catch {
      setError("User not found or request already sent");
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      setFriends((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "accepted" } : f)),
      );
    } catch {
      console.error("Failed to accept request");
    }
  };

  const handleUnfriend = async (id: string) => {
    try {
      await deleteFriend(id);
      setFriends((prev) => prev.filter((f) => f.id !== id));
    } catch {
      console.error("Failed to unfriend");
    }
  };

  const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  };

  const accepted = friends.filter((f) => f.status === "accepted");
  const pending = friends.filter(
    (f) => f.status === "pending" && f.friend_id === getUserIdFromToken(token),
  );

  return (
    <div
      className="h-full overflow-y-auto text-white"
      style={{
        background: "#0B0810",
        backgroundImage: `
      radial-gradient(140% 80% at 100% 0%, color-mix(in oklab, #E8E1D3 22%, transparent), transparent 55%),
      radial-gradient(80% 50% at -10% 100%, color-mix(in oklab, #E8E1D3 16%, transparent), transparent 60%)
    `,
      }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-1">
          Your circle.
        </h1>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          {accepted.length} {accepted.length === 1 ? "friend" : "friends"}
        </p>

        {/* Add friend card */}
        <div
          className="rounded-2xl p-4 mb-6"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div>
              <p className="font-bold text-sm">Add a gym buddy</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                They'll get an invite by email.
              </p>
            </div>
          </div>
          <form onSubmit={handleSendRequest} className="flex gap-2">
            <input
              type="email"
              placeholder="buddy@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-2xl text-base text-white focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl font-bold text-sm cursor-pointer shrink-0"
              style={{ background: "#E8E1D3", color: "#0B0810" }}
            >
              Send
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          {success && (
            <p className="text-sm mt-2" style={{ color: "#E8E1D3" }}>
              {success}
            </p>
          )}
        </div>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div className="mb-6">
            <p
              className="text-[11px] font-bold tracking-widest uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Requests · {pending.length}
            </p>
            <div className="flex flex-col gap-2">
              {pending.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "#E8E1D3",
                    }}
                  >
                    {f.friend_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{f.friend_name}</p>
                  </div>
                  <button
                    onClick={() => handleUnfriend(f.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => handleAccept(f.id)}
                    className="px-4 py-2 rounded-xl font-bold text-sm cursor-pointer shrink-0"
                    style={{ background: "#E8E1D3", color: "#0B0810" }}
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div>
          <p
            className="text-[11px] font-bold tracking-widest uppercase mb-2"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Your Friends · {accepted.length}
          </p>
          {loading ? (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Loading...
            </p>
          ) : accepted.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              No friends yet. Add your gym buddy above!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {accepted.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "#E8E1D3",
                    }}
                  >
                    {f.friend_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{f.friend_name}</p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {f.last_workout
                        ? `Last lift · ${formatDate(f.last_workout)}`
                        : "No workouts yet"}
                    </p>
                  </div>
                  {confirmUnfriend === f.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUnfriend(f.id)}
                        className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer"
                        style={{ background: "#D08B7E", color: "#0B0810" }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmUnfriend(null)}
                        className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer"
                        style={{
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "rgba(255,255,255,0.6)",
                          background: "transparent",
                        }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmUnfriend(f.id)}
                      className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer shrink-0"
                      style={{
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.5)",
                        background: "transparent",
                      }}
                    >
                      Unfriend
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
