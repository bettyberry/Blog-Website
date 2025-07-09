import { useState, useEffect } from "react";
import { useUserContext } from "./App";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Card, CardHeader, CardFooter, CardTitle, CardAction,
  CardDescription, CardContent,
} from "./components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./components/ui/table";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Skeleton } from "./components/ui/skeleton";
import {
  Sheet, SheetContent, SheetDescription,
  SheetHeader, SheetTitle, SheetTrigger,
} from "./components/ui/sheet";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const { user } = useUserContext();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

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

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API}/admin/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchPosts();
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.email?.username && post.email.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const chartData = stats ? [
    { name: "Users", count: stats.users },
    { name: "Posts", count: stats.posts },
    { name: "Contacts", count: stats.contacts },
  ] : [];

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
            {["dashboard", "users", "posts"].map(tab => (
              <Button
                key={tab}
                variant="ghost"
                className={`justify-start text-slate-900 font-medium ${
                  activeTab === tab ? "underline" : "no-underline"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "users") fetchUsers();
                  if (tab === "posts") fetchPosts();
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
          </h2>
          {(activeTab === "users" || activeTab === "posts") && (
            <Input
              type="search"
              placeholder="Search..."
              className="max-w-xs bg-slate-100 border border-slate-300 text-slate-800 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {activeTab === "dashboard" && stats && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {[
                      { label: "Total Users", count: stats.users },
                      { label: "Total Posts", count: stats.posts },
                      { label: "Total Contacts", count: stats.contacts },
                    ].map(({ label, count }) => (
                      <Card key={label} className="shadow-md border border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-slate-900">{count}</div>
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
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                        {filteredUsers.map(user => (
                          <TableRow key={user._id}>
                            <TableCell className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src="/avatars/01.png" />
                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {user.username}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge className="bg-orange-600 text-white">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button className="bg-slate-900 hover:bg-slate-950 text-white">Edit</Button>
                                </SheetTrigger>
                                <SheetContent className="bg-white text-slate-900">
                                  <SheetHeader>
                                    <SheetTitle>Edit User</SheetTitle>
                                    <SheetDescription>Make changes and save.</SheetDescription>
                                  </SheetHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label className="text-right">Username</Label>
                                      <Input defaultValue={user.username} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label className="text-right">Email</Label>
                                      <Input defaultValue={user.email} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label className="text-right">Role</Label>
                                      <Input defaultValue={user.role} className="col-span-3" />
                                    </div>
                                  </div>
                                </SheetContent>
                              </Sheet>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

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
                        {filteredPosts.map(post => (
                          <TableRow key={post._id}>
                            <TableCell>
                              <Link to={`/post/${post._id}`} className="font-medium text-indigo-700 hover:underline">
                                {post.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {post.email?.username || post.email || "Unknown"}
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
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
