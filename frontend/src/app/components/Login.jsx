// import { Link } from "react-router-dom";
import { useState } from "react";
import { AuthCard } from "./AuthCard";

export function Login({ onLogin, onSwitchToRegister }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchUserInputData = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
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
    const result = await fetchUserInputData();
    if (result.error) {
      setErrorMessage("Username or password incorrect");
      return false;
    }
    localStorage.setItem("token", result.token);
    onLogin(result.token);
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <input
              type="name"
              placeholder="Username"
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
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign in
        </button>

        <div className="flex justify-center relative">
          <span className="text-red-400 text-center absolute">
            {errorMessage}
          </span>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Don't have an account? Register
          </button>
        </div>
        <div className="text-center space-x-4 mt-4">
          <a
            href="/termsofservice.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
          >
            Terms of Service
          </a>
          <a
            href="/privacypolicy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
          >
            Privacy Policy
          </a>
        </div>
      </form>
    </AuthCard>
  );
}
