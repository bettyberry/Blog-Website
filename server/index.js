require("dotenv").config(); // Load .env variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UserModel = require("./models/UserModel");
const PostModel = require("./models/PostModel");
const ContactModel = require("./models/ContactModel");

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://blog-website-iwxd.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.static("public")); // Serve static files like images

// Connect to MongoDB Atlas using URI from .env
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// JWT verification middleware
const verifyUser = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.email = decoded.email;
    req.username = decoded.username;
    next();
  });
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) =>
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Admin verification middleware
const verifyAdmin = (req, res, next) => {
  verifyUser(req, res, async () => {
    try {
      const user = await UserModel.findOne({ email: req.email });
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// Admin dashboard stats route
app.get("/admin/stats", verifyAdmin, async (req, res) => {
  try {
    const [users, posts, contacts] = await Promise.all([
      UserModel.countDocuments(),
      PostModel.countDocuments(),
      ContactModel.countDocuments(),
    ]);

    res.json({ users, posts, contacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello");
});

// Get all users (admin only)
app.get("/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts (admin only)
app.get("/admin/posts", verifyAdmin, async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post (admin only)
app.delete("/admin/posts/:id", verifyAdmin, async (req, res) => {
  try {
    const post = await PostModel.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.file) {
      const imagePath = path.join(__dirname, "public", "images", post.file);
      fs.unlink(imagePath, (err) => {
        if (err) console.log("Failed to delete image:", err.message);
      });
    }

    res.json("Post deleted successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register route
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const isAdmin = email === process.env.ADMIN_EMAIL; // Admin email from .env

    const user = await UserModel.create({
      username,
      email,
      password: hash,
      role: isAdmin ? "admin" : "user",
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: "User does not exist" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Password is incorrect" });

    const token = jwt.sign(
      { email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    return res.json({
      status: "Success",
      token,
      user: { username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check auth route
app.get("/check-auth", verifyUser, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      email: user.email,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post route
app.post("/create", verifyUser, upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const email = req.email;
    const file = req.file?.filename || null;

    await PostModel.create({ title, description, email, file });
    res.json("Success");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
app.get("/getposts", async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout route
app.get("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

// Get post by ID
app.get("/getpostbyid/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit post route
app.put("/editpost/:id", verifyUser, upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const post = await PostModel.findOne({ _id: req.params.id, email: req.email });

    if (!post) return res.status(403).json({ error: "Not authorized or post not found" });

    if (req.file) {
      if (post.file) {
        const oldPath = path.join(__dirname, "public", "images", post.file);
        fs.unlink(oldPath, (err) => {
          if (err) console.log("Failed to delete old image:", err.message);
        });
      }
      post.file = req.file.filename;
    }

    post.title = title;
    post.description = description;

    await post.save();
    res.json("Post updated successfully!");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post route
app.delete("/deletepost/:id", verifyUser, async (req, res) => {
  try {
    const post = await PostModel.findOneAndDelete({
      _id: req.params.id,
      email: req.email,
    });

    if (!post) return res.status(403).json({ error: "Not authorized or post not found" });

    if (post.file) {
      const imagePath = path.join(__dirname, "public", "images", post.file);
      fs.unlink(imagePath, (err) => {
        if (err) console.log("Failed to delete image:", err.message);
      });
    }

    res.json("Success");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact form submission
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = await ContactModel.create({ name, email, message });

    res.status(201).json({
      success: true,
      message: "Thank you for your message! We will get back to you soon.",
      data: newContact,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Get all contacts
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await ContactModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch contacts", error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
