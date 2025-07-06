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
        const res = await axios.get(`https://blogwebsite-oyse.onrender.com/getpostbyid/${id}`);
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
      await axios.delete(`https://blogwebsite-oyse.onrender.com/deletepost/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Post deleted successfully");
      navigate("/");
    } catch (err) {
      alert("Failed to delete post: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>No post found</div>;

  const isAuthor = user && post.email && user.email === post.email;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="mb-6 whitespace-pre-line">{post.description}</p>
      {post.file && (
        <img
          src={`https://blogwebsite-oyse.onrender.com/images/${post.file}`}
          alt={post.title}
          className="mb-6 max-w-full rounded"
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
