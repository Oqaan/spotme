import { useState, useEffect } from "react";
import { getAllProgress, getExerciseProgress } from "../api";
import type { ExerciseProgress } from "../types";
import { formatDate } from "../utils";

export default function ProgressPage() {
  const [exercises, setExercises] = useState<ExerciseProgress[]>([]);
  const [selected, setSelected] = useState<ExerciseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await getAllProgress();
      setExercises(res.data ?? []);
    } catch {
      console.error("Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (exerciseId: string) => {
    if (selected?.exercise_id === exerciseId) {
      setSelected(null);
      return;
    }
    try {
      const res = await getExerciseProgress(exerciseId);
      setSelected(res.data);
    } catch {
      console.error("Failed to fetch exercise progress");
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
          Progress.
        </h1>

        {loading ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Loading...
          </p>
        ) : exercises.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            No progress data yet. Log some workouts first!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p
              className="text-[11px] font-bold tracking-widest uppercase mb-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Recent PRs · {exercises.length}
            </p>
            {exercises.map((ex) => {
              const history = ex.history ?? [];
              const latest = history[history.length - 1];
              const first = history[0];
              const diff =
                latest && first ? latest.max_weight - first.max_weight : 0;
              const isSelected = selected?.exercise_id === ex.exercise_id;

              return (
                <div key={ex.exercise_id}>
                  <div
                    onClick={() => handleSelect(ex.exercise_id)}
                    className="rounded-2xl p-4 flex items-center justify-between cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: isSelected ? "16px 16px 0 0" : 16,
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
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="9"
                            width="2.5"
                            height="6"
                            rx="1"
                            fill="currentColor"
                          />
                          <rect
                            x="5"
                            y="7"
                            width="2.5"
                            height="10"
                            rx="1"
                            fill="currentColor"
                          />
                          <rect
                            x="16.5"
                            y="7"
                            width="2.5"
                            height="10"
                            rx="1"
                            fill="currentColor"
                          />
                          <rect
                            x="19.5"
                            y="9"
                            width="2.5"
                            height="6"
                            rx="1"
                            fill="currentColor"
                          />
                          <rect
                            x="7.5"
                            y="11"
                            width="9"
                            height="2"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{ex.exercise_name}</p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {latest ? formatDate(latest.date) : "No data"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sm">
                        {latest?.max_weight ?? "—"}
                        <span
                          className="text-xs font-normal ml-0.5"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          kg
                        </span>
                      </p>
                      {diff > 0 && (
                        <p
                          className="text-xs font-bold"
                          style={{ color: "#E8E1D3" }}
                        >
                          +{diff.toFixed(1)}kg
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="rounded-b-2xl overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderTop: "none",
                      }}
                    >
                      {(selected.history ?? []).length === 0 ? (
                        <p
                          className="text-sm px-4 py-3"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          No data yet.
                        </p>
                      ) : (
                        [...(selected.history ?? [])]
                          .reverse()
                          .map((dp, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between px-4 py-3"
                              style={{
                                borderBottom:
                                  index < (selected.history ?? []).length - 1
                                    ? "1px solid rgba(255,255,255,0.04)"
                                    : "none",
                              }}
                            >
                              <span
                                className="text-xs"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                              >
                                {formatDate(dp.date)}
                              </span>
                              <div className="flex gap-4 text-xs">
                                <span
                                  className="font-bold"
                                  style={{ color: "#E8E1D3" }}
                                >
                                  {dp.max_weight}kg
                                </span>
                                <span
                                  style={{ color: "rgba(255,255,255,0.5)" }}
                                >
                                  {dp.total_reps} reps
                                </span>
                                <span
                                  style={{ color: "rgba(255,255,255,0.4)" }}
                                >
                                  {dp.sets} sets
                                </span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
