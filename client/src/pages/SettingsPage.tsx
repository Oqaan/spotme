import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAccount, updateName, updatePassword, deleteAccount } from "../api";

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
      setNewName("");
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
    <div className="h-full overflow-y-auto bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Account Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-1">Account</h2>
          <p className="text-gray-400 text-sm">Email: {email}</p>
        </div>

        {/* Update Name */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-3">Display Name</h2>
          <form onSubmit={handleUpdateName} className="flex flex-col gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
              required
            />
            {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
            {nameSuccess && (
              <p className="text-green-400 text-sm">{nameSuccess}</p>
            )}
            <button
              type="submit"
              className="py-2 bg-orange-500 hover:bg-orange-600 rounded font-bold cursor-pointer"
            >
              Update Name
            </button>
          </form>
        </div>

        {/* Update Password */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-3">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
              required
            />
            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-400 text-sm">{passwordSuccess}</p>
            )}
            <button
              type="submit"
              className="py-2 bg-orange-500 hover:bg-orange-600 rounded font-bold cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* About */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-2">About</h2>
          <p className="text-sm text-gray-400">SpotMe v1.0</p>
          <a
            href="https://github.com/Oqaan/spotme"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-orange-400 hover:underline"
          >
            github.com/Oqaan/spotme
          </a>
        </div>

        {/* Delete Account */}
        <div className="bg-gray-800 rounded-lg p-4 border border-red-800">
          <h2 className="font-bold mb-2 text-red-400">Danger Zone</h2>
          <p className="text-sm text-gray-400 mb-3">
            Deleting your account is permanent and cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold cursor-pointer"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-red-400 font-bold">
                Are you sure you want to delete your account?
              </p>
              <div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold cursor-pointer"
                >
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold cursor-pointer"
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
