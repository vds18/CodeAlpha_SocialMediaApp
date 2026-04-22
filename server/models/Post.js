const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"   // 🔥 MUST
  },
  content: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);