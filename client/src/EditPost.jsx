import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "./App";

function EditPost() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState({ fetch: true, submit: false, delete: false });
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

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
          file: null,
        });

        if (res.data.file) {
          setPreview(res.data.file);
          setCurrentImageUrl(res.data.file);
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
    setUpdateSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);

      if (formData.file) {
        data.append("file", formData.file);
      }

      await axios.put(`${baseURL}/editpost/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUpdateSuccess("✅ Post updated successfully!");

      setTimeout(() => {
        navigate(`/post/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update post");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    setDeleteError(null);
    setDeleteSuccess(null);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseURL}/deletepost/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeleteSuccess("🗑️ Post deleted successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setDeleteError(err.response?.data?.error || "Failed to delete post");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
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
    setFormData((prev) => ({ ...prev, file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    setPreview("");
    setCurrentImageUrl("");
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

        {(error || deleteError) && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 text-center">
            {error || deleteError}
          </div>
        )}

        {(updateSuccess || deleteSuccess) && (
          <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4 text-center">
            {updateSuccess || deleteSuccess}
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
            {(preview || currentImageUrl) && (
              <div className="relative mb-3">
                <img
                  src={preview || currentImageUrl}
                  alt="Post Preview"
                  className="h-40 w-full object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              disabled={loading.submit || loading.delete}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading.submit || loading.delete}
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
