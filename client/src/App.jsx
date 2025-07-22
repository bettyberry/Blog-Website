import Navbar from "./Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import CreatePost from "./CreatePost";
import Contact from "./Contact";
import Post from "./Post";
import EditPost from "./EditPost";
import MyPosts from "./MyPosts";
import AdminDashboard from "./AdminDashboard";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const userContext = createContext();
export const useUserContext = () => useContext(userContext);


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// AdminRoute component to restrict admin dashboard
function AdminRoute({ children }) {
  const { user } = useUserContext();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status and fetch user info including role
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_URL}/check-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assume backend returns { email, username, role }
      setUser({
        email: res.data.email,
        username: res.data.username,
        role: res.data.role || "user", // default role fallback
      });
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.get(`${API_URL}/logout`);
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <userContext.Provider value={{ user, setUser, checkAuth, logout }}>
      <BrowserRouter>
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <Register />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/create"
              element={user ? <CreatePost /> : <Navigate to="/login" replace />}
            />
            <Route path="/post/:id" element={<Post />} />
            <Route
              path="/editpost/:id"
              element={user ? <EditPost /> : <Navigate to="/login" replace />}
            />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            {/* Optional catch-all redirect for unknown routes */}
<Route path="/my-posts" element={<MyPosts />} />
<Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </main>
      </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;
