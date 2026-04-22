const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// ADD COMMENT
router.post("/add", async (req, res) => {
  const comment = new Comment(req.body);
  await comment.save();
  res.json(comment);
});

// GET COMMENTS FOR A POST
router.get("/:postId", async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId });
  res.json(comments);
});

module.exports = router;