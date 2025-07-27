import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./App";

function CreatePost() {
  const [formData, setFormData] = useState({ title: "", description: "", file: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUserContext();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.file) data.append("file", formData.file);

      await axios.post(`${API_BASE_URL}/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">✍️ Create New Post</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              📝 Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              minLength={3}
              maxLength={100}
              required
              placeholder="Enter the post title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              📄 Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              minLength={10}
              maxLength={2000}
              required
              placeholder="Write your post content here..."
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600 resize-none"
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-slate-700">
              🖼️ Upload Image (optional)
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
            />
          </div>

          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Image Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg border border-gray-300 object-contain max-h-64 shadow-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-md font-semibold text-lg tracking-wide transition-all duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "🔄 Creating..." : "🚀 Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;