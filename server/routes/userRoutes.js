const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// 🔐 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ❗ check existing user
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json("User Registered Successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});


// 🔐 LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json("User not found");

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json("Wrong password");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ❗ remove password before sending
    const { password, ...userData } = user._doc;

    res.json({ user: userData, token });

  } catch (err) {
    res.status(500).json(err);
  }
});


// 👥 FOLLOW USER
router.put("/follow/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);

    if (!user || !currentUser) {
      return res.status(404).json("User not found");
    }

    if (!user.followers.map(id => id.toString()).includes(req.body.userId)) {

      user.followers.push(req.body.userId);
      currentUser.following.push(req.params.id);

      await user.save();
      await currentUser.save();

      res.json("Followed successfully");
    } else {
      res.json("Already following");
    }

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// 🔁 UNFOLLOW USER
router.put("/unfollow/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);

    if (user.followers.map(id => id.toString()).includes(req.body.userId)) {

      user.followers.pull(req.body.userId);
      currentUser.following.pull(req.params.id);

      await user.save();
      await currentUser.save();

      res.json("Unfollowed successfully");
    } else {
      res.json("Not following");
    }

  } catch (err) {
    res.status(500).json(err);
  }
});


// 👤 GET USER PROFILE
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    res.json({
      _id: user._id,
      name: user.name,
      followers: user.followers || [],   // ✅ FIX
      following: user.following || []    // ✅ FIX
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

// 🔥 GET ALL USERS (DISCOVER)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("name");
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;