import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAccount, updateName, updatePassword, deleteAccount } from "../api";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { logout, updateDisplayName } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    getAccount().then((res) => {
      setEmail(res.data.email);
      setNewName(res.data.name);
    });
  }, []);

  const handleUpdateName = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess("");
    try {
      await updateName(newName);
      updateDisplayName(newName);
      setNameSuccess("Name updated!");
    } catch {
      setNameError("Failed to update name");
    }
  };

  const handleUpdatePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSuccess("Password updated!");
    } catch {
      setPasswordError("Current password is incorrect");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      logout();
      navigate("/login");
    } catch {
      console.error("Failed to delete account");
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
        <h1 className="text-2xl font-extrabold tracking-tight mb-6 text-center">
          Settings
        </h1>

        {/* Profile header card */}
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-4"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-xl font-extrabold"
            style={{ background: "#E8E1D3", color: "#0B0810" }}
          >
            {newName ? newName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-extrabold text-lg leading-none">
              {newName || "—"}
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {email}
            </p>
          </div>
        </div>

        {/* Account */}
        <p
          className="text-[11px] font-bold tracking-widest uppercase mb-2"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Account
        </p>
        <div
          className="rounded-2xl mb-6 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-sm font-bold">Email</span>
            <span
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {email}
            </span>
          </div>
        </div>

        {/* Display Name */}
        <p
          className="text-[11px] font-bold tracking-widest uppercase mb-2"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Display Name
        </p>
        <div
          className="rounded-2xl p-4 mb-6"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <form onSubmit={handleUpdateName} className="flex flex-col gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
            {nameSuccess && (
              <p className="text-sm" style={{ color: "#E8E1D3" }}>
                {nameSuccess}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-sm cursor-pointer"
              style={{ background: "#E8E1D3", color: "#0B0810" }}
            >
              Update name
            </button>
          </form>
        </div>

        {/* Change Password */}
        <p
          className="text-[11px] font-bold tracking-widest uppercase mb-2"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Change Password
        </p>
        <div
          className="rounded-2xl p-4 mb-6"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] font-bold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] font-bold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-4 rounded-2xl text-base text-white focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm" style={{ color: "#E8E1D3" }}>
                {passwordSuccess}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-sm cursor-pointer"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Update password
            </button>
          </form>
        </div>

        {/* About */}
        <p
          className="text-[11px] font-bold tracking-widest uppercase mb-2"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          About
        </p>
        <div
          className="rounded-2xl mb-6 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-sm font-bold">Version</span>
            <span
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              SpotMe v1.0
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-sm font-bold">Source</span>
            <a
              href="https://github.com/itsYuuuka/spotme"
              target="_blank"
              rel="noreferrer"
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              github.com/itsYuuuka/spotme →
            </a>
          </div>
        </div>

        {/* Danger Zone */}
        <p
          className="text-[11px] font-bold tracking-widest uppercase mb-2"
          style={{ color: "#D08B7E" }}
        >
          Danger Zone
        </p>
        <div
          className="rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(208,139,126,0.25)",
          }}
        >
          <p className="text-sm mb-1 font-bold" style={{ color: "#D08B7E" }}>
            Delete account
          </p>
          <p
            className="text-sm mb-4"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Permanently erases your workouts, templates and history. This can't
            be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold cursor-pointer"
              style={{
                border: "1px solid rgba(208,139,126,0.4)",
                color: "#D08B7E",
                background: "transparent",
              }}
            >
              <Trash2 size={16} />
              Delete account
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-bold" style={{ color: "#D08B7E" }}>
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold cursor-pointer"
                  style={{ background: "#D08B7E", color: "#0B0810" }}
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold cursor-pointer"
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
          )}
        </div>
      </div>
    </div>
  );
}
