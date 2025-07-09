import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userContext } from "./App";
import axios from "axios";
import { Button } from "@/components/ui/button"; // Import shadcn Button

function Navbar() {
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    await axios.get("http://localhost:3001/logout", {
      withCredentials: true
    });
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  } catch (err) {
    console.error("Logout error:", err);
    // Fallback: clear client-side state even if server logout fails
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  }
};

  return (
    <nav className="fixed w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side navigation */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-amber-600 font-serif">
              The Bloom Edit
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              <Link to="/">
                <Button variant="ghost" className="text-gray-900 hover:text-amber-600">
                  Home
                </Button>
              </Link>
              {user?.username && (
                <Link to="/create">
                  <Button variant="ghost" className="text-gray-900 hover:text-amber-600">
                    Create
                  </Button>
                </Link>
              )}
              <Link to="/contact">
                <Button variant="ghost" className="text-gray-900 hover:text-amber-600">
                  Contact
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-gray-900 hover:text-amber-600">
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right side auth buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user?.username ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold">{user.username}</span>
                </span>
                <Button 
                  onClick={handleLogout}
                  variant="default"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="text-amber-700 border-amber-700 hover:bg-amber-100">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;