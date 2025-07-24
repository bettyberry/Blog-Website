import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "./App";

function EditPost() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState({ fetch: true, submit: false });
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    async function fetchPost() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${baseURL}/getpostbyid/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.email !== user?.email) {
          alert("You are not authorized to edit this post.");
          navigate("/");
          return;
        }

        setFormData({
          title: res.data.title,
          description: res.data.description,
          image: null,
        });

        if (res.data.image) {
          setPreview(`${baseURL}/uploads/${res.data.image}`);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load post");
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    }

    fetchPost();
  }, [id, user, navigate, baseURL]);

  const updatePost = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submit: true }));
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.image) {
        data.append("image", formData.image);
      }

      await axios.put(`${baseURL}/editpost/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update post");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  if (loading.fetch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error && !loading.fetch) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Post</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex px-6 py-3 text-base font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">✏️ Edit Post</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={updatePost} className="space-y-6" encType="multipart/form-data">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Image</label>
            {preview && (
              <img
                src={preview}
                alt="Post Preview"
                className="mb-3 h-40 w-full object-cover rounded-md border"
              />
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              disabled={loading.submit}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.submit}
              className="flex-1 py-2 px-4 rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              {loading.submit ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost;
