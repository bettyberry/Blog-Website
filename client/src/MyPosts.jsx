import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { userContext } from "./App";
import { Link } from "react-router-dom";

function MyPosts() {
  const { user } = useContext(userContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchMyPosts() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/getposts`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          withCredentials: true,
        });

        const userPosts = res.data.filter((post) => post.email === user.email);
        setPosts(userPosts);
      } catch (err) {
        setError("Failed to fetch your posts");
      } finally {
        setLoading(false);
      }
    }

    fetchMyPosts();
  }, [user, API_URL]);

  const handleDelete = async (postId) => {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/deletepost/${postId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true,
      });

      // Remove deleted post from UI
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  if (loading) return <p>Loading your posts...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (posts.length === 0) return <p>You haven't created any posts yet.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Posts</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post._id}
            className="border rounded p-4 shadow hover:shadow-lg transition"
          >
            <Link to={`/post/${post._id}`}>
              <h2 className="text-xl font-semibold">{post.title}</h2>
            </Link>
            <p className="mt-2 text-gray-700">
              {post.description.slice(0, 100)}...
            </p>
            <div className="mt-2 flex gap-4">
              <Link
                to={`/editpost/${post._id}`}
                className="text-indigo-600 hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyPosts;
