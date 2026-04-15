import { useState, useEffect } from "react";
import { AuthCard } from "./AuthCard";

export function Register({ onRegister, onSwitchToLogin }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const storeUserRegisterData = async () => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      const result = await storeUserRegisterData();
      if (!result) {
        setErrorMessage("This username is already in use!");
        return;
      }
      onRegister();
    }
    setErrorMessage("Passwords must match");
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div>
            <input
              type="name"
              placeholder="Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Create account
        </button>
        <div className="flex justify-center relative">
          <span className="text-red-400 text-center absolute">
            {errorMessage}
          </span>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
