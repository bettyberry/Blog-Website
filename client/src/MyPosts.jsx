import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { userContext } from "./App";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Edit2, Trash2, FileText } from "lucide-react";

function MyPosts() {
  const { user } = useContext(userContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (!user) {
      setError("Authentication required. Please log in to view your posts.");
      setLoading(false);
      navigate("/login", { state: { from: "/my-posts" } });
      return;
    }

    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/getposts`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          withCredentials: true,
        });

        const userPosts = res.data.filter(
          (post) =>
            post.email &&
            user.email &&
            post.email.toLowerCase() === user.email.toLowerCase()
        );

        setPosts(userPosts);
      } catch (err) {
        console.error("Fetch posts error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch your posts. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [user, API_URL, navigate]);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeletingId(postId);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/deletepost/${postId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true,
      });

      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Delete post error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete post. Please try again later."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="text-lg text-gray-600">Loading your posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="bg-red-100 p-4 rounded-lg max-w-md text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            className="text-amber-600 mt-2 font-medium hover:underline"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileText className="h-12 w-12 text-gray-400" />
        <h2 className="text-xl font-medium text-gray-600">
          You haven't created any posts yet
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Posts</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post._id}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="p-5">
              <Link to={`/post/${post._id}`}>
                <h2 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-amber-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.description}
                </p>
              </Link>
              <div className="text-sm text-gray-500 mb-4">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="border-t border-gray-200 px-5 py-3 flex justify-between gap-3">
              <Link
                to={`/editpost/${post._id}`}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors px-3 py-2 rounded hover:bg-amber-50"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post._id)}
                disabled={deletingId === post._id}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors px-3 py-2 rounded hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId === post._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyPosts;