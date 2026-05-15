import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSessions, deleteSession } from "../api";
import type { Session } from "../types";
import { formatDate } from "../utils";
import { Dumbbell, ChevronRight, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data ?? []);
    } catch {
      console.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      console.error("Failed to delete session");
    }
  };

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
          History.
        </h1>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          {sessions.length} {sessions.length === 1 ? "workout" : "workouts"}
        </p>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-400">
            No workouts logged yet. Start one from the dashboard!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Dumbbell size={16} style={{ color: "#E8E1D3" }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      {session.template_name || session.notes || "Workout"}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {formatDate(session.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {confirmDelete === session.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                        style={{ background: "#D08B7E", color: "#0B0810" }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                        style={{
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "rgba(255,255,255,0.6)",
                          background: "transparent",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(session.id)}
                      className="cursor-pointer"
                      style={{ color: "#D08B7E" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <Link to={`/session/${session.id}`}>
                    <ChevronRight
                      size={16}
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
