import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTemplates, createTemplate, deleteTemplate } from "../api";
import type { Template } from "../types";
import { Trash2, Plus, X, Dumbbell } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await getTemplates();
      setTemplates(res.data ?? []);
    } catch {
      console.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const res = await createTemplate({
        name,
        day_of_week: dayOfWeek,
        order_index: templates.length,
      });
      navigate(`/templates/${res.data.id}`);
    } catch {
      console.error("Failed to create template");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      console.error("Failed to delete template");
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
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Your split.
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer"
            style={{
              background: showForm ? "rgba(255,255,255,0.1)" : "#E8E1D3",
              color: showForm ? "rgba(255,255,255,0.7)" : "#0B0810",
            }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
          </button>
        </div>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          {templates.length} {templates.length === 1 ? "template" : "templates"}
        </p>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl p-4 mb-6 flex flex-col gap-3"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <input
              type="text"
              placeholder="e.g. Push A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <option value="">No specific day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-sm cursor-pointer"
              style={{ background: "#E8E1D3", color: "#0B0810" }}
            >
              Create
            </button>
          </form>
        )}

        {/* Templates list */}
        {loading ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Loading...
          </p>
        ) : templates.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            No templates yet. Create your first split!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
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
                    <p className="font-bold text-sm">{template.name}</p>
                    {template.day_of_week && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {template.day_of_week}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {confirmDelete !== template.id && (
                    <Link
                      to={`/templates/${template.id}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      Edit
                    </Link>
                  )}
                  {confirmDelete === template.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(template.id)}
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
                      onClick={() => setConfirmDelete(template.id)}
                      className="cursor-pointer"
                      style={{ color: "#D08B7E" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
