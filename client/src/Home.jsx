import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sort, setSort] = useState("");

  // Subscribe states
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState(null); // "success" or "error"
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribed, setSubscribed] = useState(false); // track if subscribed

  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Debounce searchTerm: update debouncedSearchTerm 500ms after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch posts when debouncedSearchTerm or sort changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    if (sort) params.append("sort", sort);

    axios
      .get(`${baseURL}/getposts?${params.toString()}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else if (res.data && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
        } else {
          setPosts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, [baseURL, debouncedSearchTerm, sort]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeStatus(null);
    setSubscribeMessage("");

    if (!email) {
      setSubscribeStatus("error");
      setSubscribeMessage("Please enter an email address.");
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/subscribe`, { email });
      if (response.status === 201) {
        setSubscribeStatus("success");
        setSubscribeMessage("Subscribed successfully! Thank you.");
        setSubscribed(true);
        setEmail("");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setSubscribeStatus("error");
        setSubscribeMessage("You are already subscribed.");
        setSubscribed(true);
      } else {
        setSubscribeStatus("error");
        setSubscribeMessage(
          error.response?.data?.error || "Subscription failed. Please try again."
        );
      }
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section
        className="relative h-[30rem] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/cd/eb/18/cdeb185c8efd66f4dc12f712ac740457.jpg')",
        }}
      >
        <div className="absolute bg-opacity-10 z-0"></div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-serif tracking-wider">
            AROUND THE WORLD
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-white mb-6">
            Explore global food, fashion, and adventures. Share your recipes and
            stories with us!
          </p>

          <form
  onSubmit={(e) => {
    e.preventDefault();
    handleSearch(); // Call your search logic here
  }}
  className="relative w-full max-w-md"
>
  <input
    type="text"
    placeholder="Search posts..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-10 py-2 rounded-full bg-transparent border border-white text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white transition"
  />
  <button
    type="submit"
    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-indigo-400 transition"
  >
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
      />
    </svg>
  </button>
</form>

        </div>
      </section>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="text-3xl max-w-2xl mx-auto text-black mb-6 pt-16">
          Where cultures collide: in food, fashion, and stories.
          <div>
            <div>
              <a
                href="#latest-culinary-stories"
                className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-full  font-semibold shadow-md text-sm"
              >
                Learn More
                <span className="text-lg">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          to="/create"
          className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-96"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 opacity-70"></div>
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            alt="Healthy Food"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="text-sm font-semibold tracking-wider text-slate-300">
              HEALTHY FOOD
            </span>
            <h2 className="text-2xl font-bold mt-1 group-hover:translate-y-1 transition-transform duration-300">
              Start Living Properly
            </h2>
          </div>
        </Link>
        <Link
          to="#"
          className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-96"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 opacity-70"></div>
          <img
            src="https://i.pinimg.com/736x/68/76/6f/68766f2c581a74811b34153c44340e27.jpg"
            alt="Fashion"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="text-sm font-semibold tracking-wider text-slate-300">
              FASHION
            </span>
            <h2 className="text-2xl font-bold mt-1 group-hover:translate-y-1 transition-transform duration-300">
              Curated Looks to Inspire🌟
            </h2>
          </div>
        </Link>
        <Link
          to="#"
          className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-96"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 opacity-70"></div>
          <img
            src="https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            alt="Desserts"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="text-sm font-semibold tracking-wider text-slate-300">
              SWEETS
            </span>
            <h2 className="text-2xl font-bold mt-1 group-hover:translate-y-1 transition-transform duration-300">
              The Best Dessert Ideas
            </h2>
          </div>
        </Link>
      </div>

      {/* Latest Articles */}
      <div
        id="latest-culinary-stories"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 font-serif">
            Latest Culinary Stories
          </h2>
          <div className="mt-4 h-1 w-20 bg-slate-600 mx-auto"></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-700"></div>
            <span className="ml-4 text-slate-700">Loading posts...</span>
          </div>
        ) : !Array.isArray(posts) || posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-slate-800">No recipes found</h3>
            <p className="mt-2 text-slate-600">
              Try a different search or create a new recipe!
            </p>
            <div className="mt-6">
              <Link
                to="/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800"
              >
                Share Your Recipe
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article
                key={post._id}
                className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${
                  index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <Link to={`/post/${post._id}`} className="block">
                  <div className={`${index === 0 ? "h-96" : "h-72"} relative`}>
                    {post.file && (
                      <img
                        src={`${baseURL}/images/${post.file}`}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-t-xl"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {post.email ? post.email.split("@")[0] : "Anonymous"}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-slate-500 mb-2">
                      <span>
                        {new Date(post.createdAt || new Date()).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{Math.ceil(post.description.length / 200)} min read</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600">
                      {post.description.length > 150
                        ? post.description.substring(0, 150) + "..."
                        : post.description}
                    </p>
                    <div className="mt-4 flex items-center text-slate-700 hover:text-slate-900">
                      <span className="font-medium">Read Story</span>
                      <svg
                        className="ml-1 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className="bg-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white font-serif mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-slate-200 mb-8">
            Get the latest recipes and culinary stories delivered to your inbox
          </p>
          <form
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 text-lg rounded-lg bg-white text-slate-900 shadow-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-slate-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribed}
              required
            />
            <button
              type="submit"
              className={`px-6 py-4 text-white text-lg font-semibold rounded-lg shadow-md transition-colors ${
                subscribed
                  ? "bg-green-600 cursor-default"
                  : "bg-slate-600 hover:bg-slate-700"
              }`}
              disabled={subscribed}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </form>

          {/* Subscribe message */}
          {subscribeStatus === "success" && (
            <p className="mt-4 text-green-400 font-medium">{subscribeMessage}</p>
          )}
          {subscribeStatus === "error" && (
            <p className="mt-4 text-red-400 font-medium">{subscribeMessage}</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
