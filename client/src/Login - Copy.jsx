import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "./App";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:3001/login", formData);
      if (res.data.token && res.data.user) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">
          🔐 Welcome Back
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              📧 Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              autoComplete="email"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              🔒 Password
            </label>
            <input
              type="password"
              id="password"
              required
              autoComplete="current-password"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-md font-semibold text-lg tracking-wide transition-all duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "🔄 Signing In..." : "🚀 Sign In"}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-600 mb-4">Don't have an account?</p>
          <Link to="/register">
            <button className="w-full py-3 px-4 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 shadow">
              ✨ Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
