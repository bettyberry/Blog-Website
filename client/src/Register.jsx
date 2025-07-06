"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Use baseURL from environment variable with fallback
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${baseURL}/register`, formData);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">
            ✨ Join Our Community
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700"
              >
                👤 Username
              </label>
              <input
                type="text"
                id="username"
                autoComplete="username"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-600 focus:border-slate-600"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                📧 Email Address
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-600 focus:border-slate-600"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                🔒 Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-600 focus:border-slate-600"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-md font-semibold text-lg tracking-wide transition-all duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "🔄 Creating Account..." : "🚀 Create Account"}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-600 mb-4">
            Already have an account?
          </p>
          <Link to="/login">
            <button className="w-full py-3 px-4 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 shadow">
              🔐 Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
