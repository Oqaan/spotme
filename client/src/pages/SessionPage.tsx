import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  getSession,
  getTemplate,
  addSet,
  deleteSet,
  deleteSession,
} from "../api";
import type { Session, SessionSet, Exercise } from "../types";
import { Check, X, Plus, Minus } from "lucide-react";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [templateExercises, setTemplateExercises] = useState<Exercise[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLive = searchParams.get("mode") === "live";
  const from = searchParams.get("from");

  // Per exercise input state
  const [inputs, setInputs] = useState<
    Record<string, { reps: string; weight: string }>
  >({});

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    if (!id) return;
    try {
      const res = await getSession(id);
      setSession(res.data);
      if (res.data.template_id) {
        const templateRes = await getTemplate(res.data.template_id);
        setTemplateExercises(templateRes.data.exercises ?? []);
      }
    } catch {
      console.error("Failed to fetch session");
    } finally {
      setLoading(false);
    }
  };

  const getExerciseSets = (exerciseId: string): SessionSet[] => {
    return session?.sets?.filter((s) => s.exercise_id === exerciseId) ?? [];
  };

  const handleLogSet = async (exerciseId: string) => {
    if (!id || !session) return;
    const input = inputs[exerciseId] ?? { reps: "8", weight: "0" };
    const existingSets = getExerciseSets(exerciseId);
    try {
      const res = await addSet(id, {
        exercise_id: exerciseId,
        set_number: existingSets.length + 1,
        reps: parseInt(input.reps.replace(",", ".")) || 0,
        weight: parseFloat(input.weight.replace(",", ".")) || 0,
        duration_seconds: 0,
      });
      setSession((prev) =>
        prev ? { ...prev, sets: [...(prev.sets ?? []), res.data] } : prev,
      );
    } catch {
      console.error("Failed to log set");
    }
  };

  const handleDeleteSet = async (setId: string) => {
    if (!id) return;
    try {
      await deleteSet(id, setId);
      setSession((prev) =>
        prev
          ? { ...prev, sets: prev.sets?.filter((s) => s.id !== setId) }
          : prev,
      );
    } catch {
      console.error("Failed to delete set");
    }
  };

  const handleGoBack = async () => {
    if (!id) return;
    try {
      await deleteSession(id);
      localStorage.removeItem("liveSessionId");
    } catch {
      console.error("Failed to delete session");
    }
    navigate("/dashboard");
  };

  const updateInput = (
    exerciseId: string,
    field: "reps" | "weight",
    value: string,
  ) => {
    setInputs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] ?? { reps: "8", weight: "0" }),
        [field]: value,
      },
    }));
  };

  if (loading)
    return (
      <div className="h-full text-white p-6" style={{ background: "#0B0810" }}>
        Loading...
      </div>
    );
  if (!session)
    return (
      <div className="h-full text-white p-6" style={{ background: "#0B0810" }}>
        Session not found
      </div>
    );

  const exerciseMap = new Map<string, { id: string; name: string }>();
  session.sets?.forEach((s) => {
    if (!exerciseMap.has(s.exercise_id)) {
      exerciseMap.set(s.exercise_id, {
        id: s.exercise_id,
        name: s.exercise_name,
      });
    }
  });

  const exercises =
    templateExercises.length > 0
      ? templateExercises.map((e) => ({ id: e.id, name: e.name }))
      : Array.from(exerciseMap.values());

  return (
    <div
      className="h-full overflow-y-auto text-white"
      style={{
        background: "#0B0810",
        backgroundImage: `
        radial-gradient(140% 80% at 100% 0%, color-mix(in oklab, #E8E1D3 22%, transparent), transparent 55%),
        radial-gradient(80% 50% at -10% 100%, color-mix(in oklab, oklch(0.6 0.2 280) 16%, transparent), transparent 60%)
      `,
      }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={
              isLive
                ? handleGoBack
                : () =>
                    navigate(from === "dashboard" ? "/dashboard" : "/history")
            }
            className="flex items-center justify-center cursor-pointer shrink-0 text-xs font-bold px-3"
            style={{
              height: 36,
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {isLive ? "Cancel" : "Back"}
          </button>
          <div className="flex-1">
            {isLive && (
              <p
                className="text-xs font-bold tracking-widest uppercase flex items-center gap-1.5"
                style={{ color: "#E8E1D3" }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: "#E8E1D3",
                    display: "inline-block",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                Live workout
              </p>
            )}
            <h1 className="text-lg font-extrabold tracking-tight mt-0.5">
              {session.template_id
                ? templateExercises[0]?.name
                  ? "Today's Workout"
                  : "Today's Workout"
                : "Workout"}
            </h1>
          </div>
          {isLive && (
            <div
              className="font-mono text-sm font-bold px-3 py-1.5 rounded-xl"
              style={{
                background: "color-mix(in oklab, #E8E1D3 14%, transparent)",
                border:
                  "1px solid color-mix(in oklab, #E8E1D3 30%, transparent)",
                color: "#E8E1D3",
              }}
            >
              {formatElapsed(elapsed)}
            </div>
          )}
        </div>
        {/* Exercises */}
        <div className="flex flex-col gap-3">
          {exercises.map((exercise, idx) => {
            const sets = getExerciseSets(exercise.id);
            const input = inputs[exercise.id] ?? { reps: "8", weight: "0" };
            const templateEx = templateExercises.find(
              (e) => e.id === exercise.id,
            );
            const complete = templateEx
              ? sets.length >= templateEx.target_sets
              : false;

            return (
              <div
                key={exercise.id}
                className="rounded-2xl p-4 overflow-hidden"
                style={{
                  background: complete
                    ? "linear-gradient(180deg, color-mix(in oklab, #E8E1D3 12%, rgba(20,16,28,0.6)), rgba(20,16,28,0.6))"
                    : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
                  border: complete
                    ? "1px solid color-mix(in oklab, #E8E1D3 35%, transparent)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Exercise header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex items-center justify-center font-extrabold text-xs shrink-0"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      background: complete
                        ? "#E8E1D3"
                        : "rgba(255,255,255,0.06)",
                      color: complete ? "#0B0810" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {complete ? <Check size={12} strokeWidth={2.4} /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold tracking-tight">
                      {exercise.name}
                    </p>
                    {templateEx && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        Target {templateEx.target_sets} ×{" "}
                        {templateEx.target_reps} reps
                      </p>
                    )}
                  </div>
                </div>

                {/* Logged set pills */}
                {sets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sets.map((set, i) => (
                      <div
                        key={set.id}
                        className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg"
                        style={{
                          background: `linear-gradient(180deg, color-mix(in oklab, #E8E1D3 22%, transparent), color-mix(in oklab, #E8E1D3 8%, transparent))`,
                          border:
                            "1px solid color-mix(in oklab, #E8E1D3 40%, transparent)",
                        }}
                      >
                        <span style={{ opacity: 0.5, fontSize: 9 }}>
                          S{i + 1}
                        </span>
                        <span>{set.weight}</span>
                        <span style={{ opacity: 0.4, fontSize: 9 }}>×</span>
                        <span>{set.reps}</span>
                        {isLive && (
                          <button
                            onClick={() => handleDeleteSet(set.id)}
                            className="cursor-pointer ml-0.5"
                            style={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Steppers + log button */}
                {isLive && (
                  <div className="flex gap-2">
                    {(["weight", "reps"] as const).map((field) => (
                      <div
                        key={field}
                        className="flex-1 flex items-center rounded-xl px-2 py-1.5"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <button
                          onClick={() => {
                            const current =
                              parseFloat(
                                String(input[field]).replace(",", "."),
                              ) || 0;
                            const next =
                              field === "weight"
                                ? Math.max(
                                    0,
                                    Math.round((current - 2.5) * 2) / 2,
                                  )
                                : Math.max(1, current - 1);
                            updateInput(exercise.id, field, String(next));
                          }}
                          className="cursor-pointer font-bold text-lg w-7 h-7 flex items-center justify-center rounded-lg shrink-0"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "white",
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <div className="flex-1 min-w-0 text-center">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={input[field]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                updateInput(exercise.id, field, val);
                                return;
                              }
                              if (/^0\d/.test(val)) return;
                              const num = parseFloat(val);
                              if (isNaN(num)) return;
                              const max = field === "weight" ? 500 : 100;
                              if (num > max) {
                                updateInput(exercise.id, field, String(max));
                                return;
                              }
                              updateInput(exercise.id, field, val);
                            }}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!e.target.value || isNaN(val)) {
                                updateInput(
                                  exercise.id,
                                  field,
                                  field === "weight" ? "0" : "1",
                                );
                              } else if (field === "weight" && val > 500) {
                                updateInput(exercise.id, field, "500");
                              } else if (field === "reps" && val > 100) {
                                updateInput(exercise.id, field, "100");
                              } else {
                                updateInput(exercise.id, field, String(val));
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            max={field === "weight" ? 500 : 100}
                            className="w-12 text-center font-extrabold text-base tracking-tight bg-transparent focus:outline-none text-white"
                          />
                          <p
                            className="text-xs font-bold uppercase tracking-widest"
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: 8,
                            }}
                          >
                            {field === "weight" ? "kg" : "reps"}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const current =
                              parseFloat(
                                String(input[field]).replace(",", "."),
                              ) || 0;
                            const next =
                              field === "weight"
                                ? Math.round((current + 2.5) * 2) / 2
                                : current + 1;
                            updateInput(exercise.id, field, String(next));
                          }}
                          className="cursor-pointer font-bold text-lg w-7 h-7 flex items-center justify-center rounded-lg shrink-0"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "white",
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleLogSet(exercise.id)}
                      className="flex items-center justify-center rounded-xl cursor-pointer shrink-0"
                      style={{
                        width: 50,
                        background: "#E8E1D3",
                        color: "#0B0810",
                      }}
                    >
                      <Plus size={22} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {exercises.length === 0 && (
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.4)" }}>No exercises yet.</p>
          </div>
        )}
      </div>
      {isLive && (
        <div
          className="fixed left-0 right-0 bottom-0 px-4 py-4"
          style={{
            background: "rgba(11,8,16,0.85)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-extrabold text-sm">
                {session.sets?.length ?? 0} sets ·{" "}
                {session.sets
                  ?.reduce((a, s) => a + s.weight * s.reps, 0)
                  .toLocaleString() ?? 0}
                <span
                  className="text-xs ml-0.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  kg
                </span>
              </p>
              <p
                className="text-xs font-bold uppercase tracking-widest mt-0.5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                session total
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("liveSessionId");
                navigate("/dashboard");
              }}
              className="py-3 px-5 rounded-xl font-extrabold cursor-pointer tracking-tight"
              style={{
                background: "#E8E1D3",
                color: "#0B0810",
              }}
            >
              Finish Workout ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
