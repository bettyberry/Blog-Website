import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "./App";

function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await axios.get(`http://localhost:3001/getpostbyid/${id}`);
        setPost(res.data);
      } catch {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/deletepost/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });
      alert("Post deleted successfully");
      navigate("/");
    } catch (err) {
      alert("Failed to delete post: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-700"></div>
        <span className="ml-4 text-slate-700">Loading post...</span>
      </div>
    );
  if (error) return <div className="text-red-600 text-center">{error}</div>;
  if (!post) return <div className="text-center">No post found</div>;

  const isAuthor = user && post.email && user.email === post.email;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="mb-6 whitespace-pre-line">{post.description}</p>
      {post.file && (
        <img
          src={`http://localhost:3001/images/${post.file}`}
          alt={post.title}
          className="mb-6 max-w-full rounded"
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}

      {isAuthor && (
        <div className="flex gap-4">
          <Link
            to={`/editpost/${post._id}`}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Post;