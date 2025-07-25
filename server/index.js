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
const CommentModel = require("./models/CommentModel");
const SubscriberModel = require("./models/SubscriberModel");


const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json());

const allowedOrigins = [
  "",
  "http://localhost:5173"
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(cookieParser());
app.use(express.static("public")); 

mongoose
  .connect(process.env.MONGODB_URI)  
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

const savedPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
}, { timestamps: true });
savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });
const SavedPost = mongoose.model("SavedPost", savedPostSchema);

const verifyUser = (req, res, next) => {
  const token =
    req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.email = decoded.email;
    req.username = decoded.username;
    req.role = decoded.role;
    req.userId = decoded._id || decoded.id; // assuming your JWT includes user id; if not, you may need to add it on login
    next();
  });
};

// Storage config for multer (updated to be more robust)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/images';
    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Updated Create Post Route
app.post("/create", verifyUser, upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const email = req.email;
    const file = req.file?.filename || null;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const newPost = await PostModel.create({ 
      title, 
      description, 
      email, 
      file 
    });
    
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create post error:", err);
    if (req.file) {
      fs.unlink(path.join(__dirname, 'public', 'images', req.file.filename), () => {});
    }
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Updated Edit Post Route
app.put("/editpost/:id", verifyUser, upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const email = req.email;

    // Verify post exists and belongs to user
    const existingPost = await PostModel.findById(id);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (existingPost.email !== email) {
      return res.status(403).json({ error: "Not authorized to edit this post" });
    }

    const updateData = { title, description };
    
    if (req.file) {
      if (existingPost.file) {
        const oldFilePath = path.join(__dirname, 'public', 'images', existingPost.file);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }
      updateData.file = req.file.filename;
    }

    const updatedPost = await PostModel.findByIdAndUpdate(id, updateData, { 
      new: true 
    });

    res.json(updatedPost);
  } catch (err) {
    console.error("Edit post error:", err);
    // Delete newly uploaded file if error occurred
    if (req.file) {
      fs.unlink(path.join(__dirname, 'public', 'images', req.file.filename), () => {});
    }
    res.status(500).json({ error: "Failed to update post" });
  }
});


const verifyAdmin = (req, res, next) => {
  verifyUser(req, res, async () => {
    try {
      if (req.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// Routes

app.get("/", (req, res) => {
  res.send("Hello from backend!");
});

// Admin routes
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

app.get("/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/posts", verifyAdmin, async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// Auth routes
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const isAdmin = email === process.env.ADMIN_EMAIL;

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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: "User does not exist" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Password is incorrect" });

    // Include user._id in JWT payload for saved posts
    const token = jwt.sign(
      { email: user.email, username: user.username, role: user.role, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    res.json({
      status: "Success",
      token,
      user: { username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.get("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

// Posts routes
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

// Get all posts with optional search and sorting
app.get("/getposts", async (req, res) => {
  try {
    const { search, sort } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let query = PostModel.find(filter);

    if (sort === "latest") {
      query = query.sort({ createdAt: -1 }); // Newest first
    }

    const posts = await query.exec();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/getpostbyid/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/editpost/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const existingPost = await PostModel.findById(id);
    if (!existingPost) return res.status(404).json({ error: "Post not found" });

    let imagePath = existingPost.image; // default to old image

    if (req.file) {
      // Delete old image if it exists
      if (existingPost.image && fs.existsSync(existingPost.image)) {
        fs.unlinkSync(existingPost.image);
      }

      imagePath = req.file.path;
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      id,
      { title, description, image: imagePath },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


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

// Comments routes
app.get("/comments/:postId", async (req, res) => {
  try {
    const comments = await CommentModel.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/comments", verifyUser, async (req, res) => {
  try {
    const { postId, text } = req.body;
    const author = req.username || "Anonymous";
    const comment = await CommentModel.create({ postId, author, text });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like post (authenticated)
app.post("/like/:postId", verifyUser, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likes = (post.likes || 0) + 1;
    await post.save();

    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact form
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

app.get("/contacts", async (req, res) => {
  try {
    const contacts = await ContactModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch contacts", error: error.message });
  }
});

app.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Valid email is required." });
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const existing = await SubscriberModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already subscribed." });
    }

    const subscriber = await SubscriberModel.create({ email });

    res.status(201).json({ message: "Subscribed successfully!", subscriber });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ error: "Server error, try again later." });
  }
});

app.post("/savedposts/:postId", verifyUser, async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;

    const exists = await SavedPost.findOne({ userId, postId });
    if (exists) return res.status(400).json({ error: "Post already saved" });

    const savedPost = new SavedPost({ userId, postId });
    await savedPost.save();

    res.json({ message: "Post saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save post" });
  }
});

// Unsave a post
app.delete("/savedposts/:postId", verifyUser, async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;

    const deleted = await SavedPost.findOneAndDelete({ userId, postId });
    if (!deleted) return res.status(404).json({ error: "Saved post not found" });

    res.json({ message: "Post removed from saved posts" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove saved post" });
  }
});
app.get("/admin/subscribers", verifyAdmin, async (req, res) => {
  try {
    const subscribers = await SubscriberModel.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if saved
app.get("/savedposts/check/:postId", verifyUser, async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;

    const saved = await SavedPost.exists({ userId, postId });
    res.json({ saved: !!saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check saved post" });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
