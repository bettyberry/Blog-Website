import { useState, useEffect } from "react";
import { useUserContext } from "./App";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from "./components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Skeleton } from "./components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const { user } = useUserContext();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for admin tab
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts for admin tab
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscribers for admin tab
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/subscribers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscribers(res.data);
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a post by id
  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API}/admin/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Refresh posts after deletion
        fetchPosts();
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    }
  };

  // Save user edits to backend
  async function saveUserEdits(userId, updatedData) {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/users/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh users after save
      fetchUsers();
      alert("User updated successfully");
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to update user");
    }
  }

  // Pagination helper to slice items
  function paginate(items, page) {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }

  // Filtering users & posts based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.author?.username &&
        post.author.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // No search input for subscribers, show all paginated
  const paginatedUsers = paginate(filteredUsers, usersPage);
  const paginatedPosts = paginate(filteredPosts, postsPage);
  const paginatedSubscribers = paginate(subscribers, subscribersPage);

  // Total pages count
  const totalUsersPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const totalPostsPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const totalSubscribersPages = Math.ceil(subscribers.length / itemsPerPage);

  // Chart data for dashboard tab
  const chartData = stats
    ? [
        { name: "Users", count: stats.users },
        { name: "Posts", count: stats.posts },
        { name: "Contacts", count: stats.contacts },
      ]
    : [];

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-600 text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700">
              You must be an admin to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-white text-slate-900">
      {/* Sidebar */}
      <aside className="hidden md:block w-[240px] bg-white border-r border-slate-200 shadow-sm">
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-300">
            <Link to="/" className="text-xl font-bold text-slate-900">
              Admin Dashboard
            </Link>
          </div>
          <nav className="flex flex-col gap-2 px-4 py-6">
            {["dashboard", "users", "posts", "subscribers"].map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                className={`justify-start text-slate-900 font-medium ${
                  activeTab === tab ? "underline" : "no-underline"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm("");
                  setUsersPage(1);
                  setPostsPage(1);
                  setSubscribersPage(1);
                  if (tab === "users") fetchUsers();
                  if (tab === "posts") fetchPosts();
                  if (tab === "subscribers") fetchSubscribers();
                  if (tab === "dashboard") fetchStats();
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col w-full">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-300 bg-white">
          <h2 className="text-2xl font-semibold text-slate-900">
            {activeTab === "dashboard" && "📊 Dashboard"}
            {activeTab === "users" && "👥 User Management"}
            {activeTab === "posts" && "📝 Post Management"}
            {activeTab === "subscribers" && "📧 Subscribers"}
          </h2>
          {(activeTab === "users" || activeTab === "posts") && (
            <Input
              type="search"
              placeholder="Search users or posts..."
              className="max-w-xs bg-slate-100 border border-slate-300 text-slate-800 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setUsersPage(1);
                setPostsPage(1);
              }}
            />
          )}
        </header>

        <main className="flex-1 p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[125px] w-full rounded-xl bg-slate-200" />
              <Skeleton className="h-4 w-[250px] bg-slate-200" />
              <Skeleton className="h-4 w-[200px] bg-slate-200" />
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && stats && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {[
                      { label: "Total Users", count: stats.users },
                      { label: "Total Posts", count: stats.posts },
                      { label: "Total Contacts", count: stats.contacts },
                    ].map(({ label, count }) => (
                      <Card
                        key={label}
                        className="shadow-md border border-slate-200"
                      >
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-slate-600">
                            {label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-slate-900">
                            {count}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="shadow-md border border-slate-200 p-4">
                    <CardHeader>
                      <CardTitle>Overview Chart</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#1e293b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <Card className="shadow-md border border-slate-200">
                  <CardHeader>
                    <CardTitle>All Users</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUsers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center text-gray-500 py-6"
                            >
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedUsers.map((user) => (
                            <TableRow key={user._id}>
                              <TableCell className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src="/avatars/01.png" />
                                  <AvatarFallback>
                                    {user.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {user.username}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge className="bg-orange-600 text-white">
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Sheet>
                                  <SheetTrigger asChild>
                                    <Button className="bg-slate-900 hover:bg-slate-950 text-white">
                                      Edit
                                    </Button>
                                  </SheetTrigger>
                                  <SheetContent className="bg-white text-slate-900">
                                    <SheetHeader>
                                      <SheetTitle>Edit User</SheetTitle>
                                      <SheetDescription>
                                        Make changes and save.
                                      </SheetDescription>
                                    </SheetHeader>
                                    <UserEditForm
                                      user={user}
                                      onSave={saveUserEdits}
                                    />
                                  </SheetContent>
                                </Sheet>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  {totalUsersPages > 1 && (
                    <CardFooter className="flex justify-center gap-2">
                      <Button
                        disabled={usersPage === 1}
                        onClick={() => setUsersPage(usersPage - 1)}
                      >
                        Prev
                      </Button>
                      <span className="px-4 py-2 text-sm text-slate-700">
                        Page {usersPage} of {totalUsersPages}
                      </span>
                      <Button
                        disabled={usersPage === totalUsersPages}
                        onClick={() => setUsersPage(usersPage + 1)}
                      >
                        Next
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}

              {/* Posts Tab */}
              {activeTab === "posts" && (
                <Card className="shadow-md border border-slate-200">
                  <CardHeader>
                    <CardTitle>All Posts</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPosts.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-gray-500 py-6"
                            >
                              No posts found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedPosts.map((post) => (
                            <TableRow key={post._id}>
                              <TableCell>
                                <Link
                                  to={`/post/${post._id}`}
                                  className="font-medium text-indigo-700 hover:underline"
                                >
                                  {post.title}
                                </Link>
                              </TableCell>
                              <TableCell>
                                {post.author?.username ||
                                  post.author?.email ||
                                  "Unknown"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  className="bg-slate-900 hover:bg-slate-950 text-white"
                                  onClick={() => deletePost(post._id)}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  {totalPostsPages > 1 && (
                    <CardFooter className="flex justify-center gap-2">
                      <Button
                        disabled={postsPage === 1}
                        onClick={() => setPostsPage(postsPage - 1)}
                      >
                        Prev
                      </Button>
                      <span className="px-4 py-2 text-sm text-slate-700">
                        Page {postsPage} of {totalPostsPages}
                      </span>
                      <Button
                        disabled={postsPage === totalPostsPages}
                        onClick={() => setPostsPage(postsPage + 1)}
                      >
                        Next
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}

              {/* Subscribers Tab */}
              {activeTab === "subscribers" && (
                <Card className="shadow-md border border-slate-200">
                  <CardHeader>
                    <CardTitle>All Subscribers</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Subscribed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSubscribers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center text-gray-500 py-6"
                            >
                              No subscribers found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedSubscribers.map((sub) => (
                            <TableRow key={sub._id || sub.email}>
                              <TableCell>{sub.email}</TableCell>
                              <TableCell>
                                {new Date(sub.createdAt).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  {totalSubscribersPages > 1 && (
                    <CardFooter className="flex justify-center gap-2">
                      <Button
                        disabled={subscribersPage === 1}
                        onClick={() => setSubscribersPage(subscribersPage - 1)}
                      >
                        Prev
                      </Button>
                      <span className="px-4 py-2 text-sm text-slate-700">
                        Page {subscribersPage} of {totalSubscribersPages}
                      </span>
                      <Button
                        disabled={subscribersPage === totalSubscribersPages}
                        onClick={() => setSubscribersPage(subscribersPage + 1)}
                      >
                        Next
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Editable user form inside Sheet for User edit
function UserEditForm({ user, onSave }) {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "user");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(user._id, { username, email, role });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-slate-300 rounded px-2 py-1"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="student">Student</option>
        </select>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
