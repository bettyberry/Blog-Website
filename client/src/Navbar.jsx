import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userContext } from "./App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Menu, X, Loader2 } from "lucide-react";

function Navbar() {
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.get("http://localhost:3001/logout", { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      navigate("/");
    }
  };

  const isAdmin = user?.role === "admin";
  const desktopAuthBtnClasses = "bg-amber-600 hover:bg-amber-700 text-white";
  const mobileAuthBtnClasses = "bg-slate-800 hover:bg-slate-900 text-white";

  return (
    <nav className="fixed w-full bg-white shadow-md z-50" aria-label="Primary navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-amber-600 font-serif"
            aria-label="The Bloom Edit Home"
            onClick={() => setMenuOpen(false)}
          >
            The Bloom Edit
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost">Home</Button>
            </Link>

            {user?.username && (
              <Link to="/create" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost">Create</Button>
              </Link>
            )}

            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost">Contact</Button>
            </Link>

            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost">Admin</Button>
              </Link>
            )}

            {!isAdmin && user?.username && (
              <Link to="/my-posts" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost">My Posts</Button>
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user?.username ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">{user.username}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  disabled={loading}
                  className={desktopAuthBtnClasses}
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" className="text-black hover:text-amber-600">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <Button className={desktopAuthBtnClasses}>Register</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="fixed top-0 left-0 right-0 bg-white shadow-xl z-50 transition-transform duration-300"
            role="dialog"
            aria-modal="true"
          >
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
                  className="p-2 text-gray-800 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col">
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

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-amber-100 rounded-md transition"
                  >
                    Admin
                  </Link>
                )}

                {!isAdmin && user?.username && (
                  <Link
                    to="/my-posts"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-amber-100 rounded-md transition"
                  >
                    My Posts
                  </Link>
                )}
              </nav>

              <div className="pt-4 border-t border-gray-200 mt-4">
                {user?.username ? (
                  <>
                    <div className="flex items-center gap-2 px-3 mb-3">
                      <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600 font-semibold">{user.username}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full py-2 px-4 rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                      ) : (
                        "Sign Out"
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center py-2 px-4 font-semibold text-black hover:text-amber-600"
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
