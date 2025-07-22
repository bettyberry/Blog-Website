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
        const res = await axios.get("http://localhost:3001/getposts", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          withCredentials: true,
        });

        // Filter posts by logged-in user's email (assuming posts have email field)
        const userPosts = res.data.filter((post) => post.email === user.email);
        setPosts(userPosts);
      } catch (err) {
        setError("Failed to fetch your posts");
      } finally {
        setLoading(false);
      }
    }

    fetchMyPosts();
  }, [user]);

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
            <p className="mt-2 text-gray-700">{post.description.slice(0, 100)}...</p>
            <div className="mt-2 flex gap-4">
              <Link
                to={`/editpost/${post._id}`}
                className="text-indigo-600 hover:underline"
              >
                Edit
              </Link>
              {/* You can add delete functionality here if you want */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyPosts;
