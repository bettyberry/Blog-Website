import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "./App";

function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    async function fetchPostAndComments() {
      try {
        const [postRes, commentsRes] = await Promise.all([
          axios.get(`${API_URL}/getpostbyid/${id}`),
          axios.get(`${API_URL}/comments/${id}`),
        ]);
        setPost(postRes.data);
        setLikes(postRes.data.likes || 0);
        setComments(commentsRes.data);
      } catch {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    fetchPostAndComments();
  }, [id, API_URL]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/deletepost/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });
      alert("Post deleted successfully");
      navigate("/");
    } catch (err) {
      alert("Failed to delete post: " + (err.response?.data?.error || err.message));
    }
  };

  const handleLike = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const res = await axios.post(
      `${API_URL}/like/${post._id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setLikes(res.data.likes);
  } catch (err) {
    alert("Failed to like post: " + (err.response?.data?.error || err.message));
  }
};


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/comments`,
        { postId: id, text: commentText },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );
      setCommentText("");
      const res = await axios.get(`${API_URL}/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      alert("Failed to post comment: " + err.message);
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
          src={`${API_URL}/images/${post.file}`}
          alt={post.title}
          className="mb-6 max-w-full rounded"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}

      <div className="flex items-center mb-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-indigo-600 font-semibold "
        >
          ❤️ Like
        </button>
        <span className="ml-2 text-slate-700">
          {likes} {likes === 1 ? "like" : "likes"}
        </span>
      </div>

      {isAuthor && (
        <div className="flex gap-4 mb-6">
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

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded mb-2"
              rows="3"
              placeholder="Write your comment..."
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <p className="text-slate-600">
            Please{" "}
            <Link to="/login" className="text-indigo-600 underline">
              log in
            </Link>{" "}
            to comment.
          </p>
        )}

        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment._id} className="bg-slate-100 p-3 rounded">
                <div className="text-sm text-slate-600">{comment.author}</div>
                <div className="text-base">{comment.text}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
}

export default Post;
