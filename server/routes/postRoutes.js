const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");


// 🔹 CREATE POST (🔥 FIXED)
router.post("/create", async (req, res) => {
  try {
    if (!req.body.userId || !req.body.content) {
      return res.status(400).json("Missing fields");
    }

    const post = new Post({
      userId: req.body.userId,   // ✅ force correct structure
      content: req.body.content
    });

    await post.save();
    res.json(post);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// 🔹 GET FEED (FOLLOWING + OWN POSTS)
router.get("/feed/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);

    if (!currentUser) {
      return res.status(404).json("User not found");
    }

    const posts = await Post.find({
      userId: { $in: [...currentUser.following, req.params.userId] }
    })
    .populate("userId", "name") // ✅ CRITICAL
    .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// 🔥 GET POSTS OF SPECIFIC USER (PROFILE)
router.get("/user/:id", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// 🔹 LIKE / UNLIKE POST
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json("Post not found");

    if (post.likes.includes(req.body.userId)) {
      post.likes.pull(req.body.userId);
    } else {
      post.likes.push(req.body.userId);
    }

    await post.save();
    res.json(post);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


module.exports = router;