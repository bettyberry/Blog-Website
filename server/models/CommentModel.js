const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Post" },
  author: String, // optional, you can store username or email here
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const CommentModel = mongoose.model("Comment", CommentSchema);

module.exports = CommentModel;
