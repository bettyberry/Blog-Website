import Navbar from "./Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import CreatePost from "./CreatePost";
import Contact from "./Contact";
import Post from "./Post";
import EditPost from "./EditPost";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";

export const userContext = createContext();
export const useUserContext = () => useContext(userContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await axios.get("http://localhost:3001/check-auth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ email: res.data.email, username: res.data.username });
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.get("http://localhost:3001/logout");
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
              element={user ? <Navigate to="/" /> : <Register />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/create"
              element={user ? <CreatePost /> : <Navigate to="/login" />}
            />
            <Route path="/post/:id" element={<Post />} />
            <Route
              path="/editpost/:id"
              element={user ? <EditPost /> : <Navigate to="/login" />}
            />
<Route path="/contact" element={<Contact />} />          
<Route path="/admin" element={<AdminDashboard />} />

</Routes>

        </main>
      </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;
