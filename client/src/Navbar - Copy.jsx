import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userContext } from "./App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

function Navbar() {
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get("https://blog-website-7v8d.onrender.com/logout", {
        withCredentials: true,
      });
      localStorage.removeItem("token");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem("token");
      setUser(null);
      navigate("/");
    }
  };

  return (
    <nav className="fixed w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-amber-600 font-serif">
            The Bloom Edit
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-4 items-center">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            {user?.username && (
              <Link to="/create">
                <Button variant="ghost">Create</Button>
              </Link>
            )}
            <Link to="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user?.username ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold">{user.username}</span>
                </span>
                <Button
                  onClick={handleLogout}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="border-amber-600 text-amber-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-amber-600 focus:outline-none"
              aria-label="Main menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X size={28} className="h-6 w-6" />
              ) : (
                <Menu size={28} className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ease-in-out ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Overlay */}
        {menuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
        
        {/* Menu Content */}
        <div className={`relative bg-white shadow-xl z-50 transform transition-all duration-300 ease-in-out ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="px-5 pt-2 pb-6 space-y-1">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <Link 
                to="/" 
                className="text-2xl font-bold text-amber-600 font-serif"
                onClick={() => setMenuOpen(false)}
              >
                The Bloom Edit
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-md p-2 text-gray-800 hover:text-amber-600 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="pt-4 space-y-2">
              <Link 
                to="/" 
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-amber-600"
              >
                Home
              </Link>
              
              {user?.username && (
                <Link 
                  to="/create" 
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-amber-600"
                >
                  Create
                </Link>
              )}
              
              <Link 
                to="/contact" 
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-amber-600"
              >
                Contact
              </Link>
              
              {user?.role === "admin" && (
                <Link 
                  to="/admin" 
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-amber-600"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="pt-4 border-t border-gray-100">
              {user?.username ? (
                <div className="space-y-3">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Welcome, <span className="font-semibold">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link 
                    to="/login" 
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-amber-600 rounded-md shadow-sm text-base font-medium text-amber-700 bg-white hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;