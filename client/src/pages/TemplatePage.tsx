import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getTemplate,
  addExercise,
  deleteExercise,
  updateExercise,
  updateTemplate,
} from "../api";
import type { Exercise, Template } from "../types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SquarePen, Trash2, Plus, X, GripVertical } from "lucide-react";

function SortableExercise({
  exercise,
  index,
  onDelete,
  onEdit,
}: {
  exercise: Exercise;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    data: {
      name: string;
      target_sets: number;
      target_reps: number;
      notes: string;
      is_timed: boolean;
    },
  ) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: exercise.id });

  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [exName, setExName] = useState(exercise.name);
  const [targetSets, setTargetSets] = useState(exercise.target_sets);
  const [targetReps, setTargetReps] = useState(exercise.target_reps);
  const [notes, setNotes] = useState(exercise.notes);
  const [isTimed, setIsTimed] = useState(exercise.is_timed);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
      }}
    >
      {editing ? (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={exName}
            onChange={(e) => setExName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-base text-white focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <label
                className="text-[11px] font-bold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Sets
              </label>
              <input
                type="number"
                value={targetSets}
                onChange={(e) => setTargetSets(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-3 rounded-2xl text-base text-white focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label
                className="text-[11px] font-bold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Reps
              </label>
              <input
                type="number"
                value={targetReps}
                onChange={(e) => setTargetReps(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-3 rounded-2xl text-base text-white focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-base text-white focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
          <label
            className="flex items-center gap-2 text-sm cursor-pointer"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <input
              type="checkbox"
              checked={isTimed}
              onChange={(e) => setIsTimed(e.target.checked)}
            />
            Timed exercise
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onEdit(exercise.id, {
                  name: exName,
                  target_sets: targetSets,
                  target_reps: targetReps,
                  notes,
                  is_timed: isTimed,
                });
                setEditing(false);
              }}
              className="flex-1 py-3 rounded-2xl font-bold text-sm cursor-pointer"
              style={{ background: "#E8E1D3", color: "#0B0810" }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-3 rounded-2xl font-bold text-sm cursor-pointer"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
                background: "transparent",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none shrink-0"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            <GripVertical size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">
              {index + 1}. {exercise.name}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {exercise.target_sets} ×{" "}
              {exercise.is_timed
                ? `${exercise.target_reps}s`
                : `${exercise.target_reps} reps`}
              {exercise.notes && ` · ${exercise.notes}`}
            </p>
          </div>
          {!confirm && (
            <button
              onClick={() => setEditing(true)}
              className="cursor-pointer shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Edit
            </button>
          )}
          {confirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete(exercise.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                style={{ background: "#D08B7E", color: "#0B0810" }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirm(false)}
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
              onClick={() => setConfirm(true)}
              className="cursor-pointer shrink-0"
              style={{ color: "#D08B7E" }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function TemplatePage() {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [exName, setExName] = useState("");
  const [targetSets, setTargetSets] = useState(2);
  const [targetReps, setTargetReps] = useState(8);
  const [notes, setNotes] = useState("");
  const [isTimed, setIsTimed] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleEditExercise = async (
    exerciseId: string,
    data: {
      name: string;
      target_sets: number;
      target_reps: number;
      notes: string;
      is_timed: boolean;
    },
  ) => {
    if (!id) return;
    try {
      const res = await updateExercise(id, exerciseId, {
        ...data,
        order_index:
          template?.exercises?.findIndex((e) => e.id === exerciseId) ?? 0,
      });
      setTemplate((prev) =>
        prev
          ? {
              ...prev,
              exercises: prev.exercises?.map((e) =>
                e.id === exerciseId ? res.data : e,
              ),
            }
          : prev,
      );
    } catch {
      console.error("Failed to update exercise");
    }
  };

  const handleUpdateName = async () => {
    if (!id) return;
    try {
      await updateTemplate(id, {
        name: newTemplateName,
        day_of_week: template?.day_of_week ?? "",
        order_index: template?.order_index ?? 0,
      });
      setTemplate((prev) => (prev ? { ...prev, name: newTemplateName } : prev));
      setEditingName(false);
    } catch {
      console.error("Failed to update template name");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !template || !id) return;

    const exercises = template.exercises ?? [];
    const oldIndex = exercises.findIndex((e) => e.id === active.id);
    const newIndex = exercises.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(exercises, oldIndex, newIndex);

    setTemplate((prev) => (prev ? { ...prev, exercises: reordered } : prev));

    try {
      await Promise.all(
        reordered.map((exercise, index) =>
          updateExercise(id, exercise.id, {
            name: exercise.name,
            target_sets: exercise.target_sets,
            target_reps: exercise.target_reps,
            notes: exercise.notes,
            is_timed: exercise.is_timed,
            order_index: index,
          }),
        ),
      );
    } catch {
      console.error("Failed to save exercise order");
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    if (!id) return;
    try {
      const res = await getTemplate(id);
      setTemplate(res.data);
    } catch {
      console.error("Failed to fetch template");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!id || !template) return;
    try {
      const res = await addExercise(id, {
        name: exName,
        target_sets: targetSets,
        target_reps: targetReps,
        notes,
        is_timed: isTimed,
        order_index: template.exercises?.length ?? 0,
      });
      setTemplate((prev) =>
        prev
          ? { ...prev, exercises: [...(prev.exercises ?? []), res.data] }
          : prev,
      );
      setExName("");
      setTargetSets(2);
      setTargetReps(8);
      setNotes("");
      setIsTimed(false);
      setShowForm(false);
    } catch {
      console.error("Failed to add exercise");
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!id) return;
    try {
      await deleteExercise(id, exerciseId);
      setTemplate((prev) =>
        prev
          ? {
              ...prev,
              exercises: prev.exercises?.filter((e) => e.id !== exerciseId),
            }
          : prev,
      );
    } catch {
      console.error("Failed to delete exercise");
    }
  };

  if (loading)
    return (
      <div className="h-full text-white p-6" style={{ background: "#0B0810" }}>
        Loading...
      </div>
    );
  if (!template)
    return (
      <div className="h-full text-white p-6" style={{ background: "#0B0810" }}>
        Template not found.
      </div>
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
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/templates"
            className="flex items-center justify-center cursor-pointer shrink-0 text-xs font-bold px-3"
            style={{
              height: 36,
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Back
          </Link>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                onBlur={handleUpdateName}
                autoFocus
                maxLength={20}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateName();
                }}
                className="bg-transparent text-white font-extrabold text-2xl outline-none w-full"
              />
            ) : (
              <button
                onClick={() => {
                  setNewTemplateName(template.name);
                  setEditingName(true);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {template.name}
                </h1>
                <SquarePen
                  size={14}
                  style={{ color: "rgba(255,255,255,0.3)" }}
                />
              </button>
            )}
            {template.day_of_week && (
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {template.day_of_week}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer shrink-0"
            style={{
              background: showForm ? "rgba(255,255,255,0.1)" : "#E8E1D3",
              color: showForm ? "rgba(255,255,255,0.7)" : "#0B0810",
            }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
          </button>
        </div>

        {/* Add exercise form */}
        {showForm && (
          <form
            onSubmit={handleAddExercise}
            className="rounded-2xl p-4 mb-6 flex flex-col gap-3"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <input
              type="text"
              placeholder="Exercise name"
              value={exName}
              onChange={(e) => setExName(e.target.value)}
              required
              className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <label
                  className="text-[11px] font-bold tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Sets
                </label>
                <input
                  type="number"
                  value={targetSets}
                  onChange={(e) => setTargetSets(Number(e.target.value))}
                  min={1}
                  className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label
                  className="text-[11px] font-bold tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Reps
                </label>
                <input
                  type="number"
                  value={targetReps}
                  onChange={(e) => setTargetReps(Number(e.target.value))}
                  min={1}
                  className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <label
              className="flex items-center gap-2 text-sm cursor-pointer"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <input
                type="checkbox"
                checked={isTimed}
                onChange={(e) => setIsTimed(e.target.checked)}
              />
              Timed exercise
            </label>
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-sm cursor-pointer"
              style={{ background: "#E8E1D3", color: "#0B0810" }}
            >
              Add exercise
            </button>
          </form>
        )}

        {/* Exercises list */}
        {!template.exercises || template.exercises.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            No exercises yet. Add your first one!
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={template.exercises.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {template.exercises.map((exercise, index) => (
                  <SortableExercise
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onDelete={handleDeleteExercise}
                    onEdit={handleEditExercise}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
