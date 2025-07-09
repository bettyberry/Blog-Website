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

  const desktopAuthBtnClasses = "bg-amber-600 hover:bg-amber-700 text-white";
  const mobileAuthBtnClasses = "bg-slate-800 hover:bg-slate-900 text-white";

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
                  className={desktopAuthBtnClasses}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button className={desktopAuthBtnClasses}>Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className={desktopAuthBtnClasses}>Register</Button>
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
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 right-0 bg-white shadow-xl z-50 transition transform duration-300">
            <div className="px-5 pt-4 pb-6 space-y-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="text-2xl font-bold text-amber-600 font-serif"
                >
                  The Bloom Edit
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-gray-800 hover:text-amber-600"
                >
                  <X size={24} />
                </button>
              </div>

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-amber-100 rounded-md transition"
              >
                Home
              </Link>
              {user?.username && (
                <Link
                  to="/create"
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-amber-100 rounded-md transition"
                >
                  Create
                </Link>
              )}
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-amber-100 rounded-md transition"
              >
                Contact
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-amber-100 rounded-md transition"
                >
                  Admin
                </Link>
              )}

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                {user?.username ? (
                  <>
                    <p className="text-sm text-gray-600 mb-3 px-3">
                      Welcome, <span className="font-semibold">{user.username}</span>
                    </p>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full py-2 px-4 rounded-md text-white bg-amber-600 hover:bg-amber-700"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className={`block w-full text-center py-2 px-4 rounded-md ${mobileAuthBtnClasses}`}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className={`block w-full text-center py-2 px-4 rounded-md ${mobileAuthBtnClasses}`}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
