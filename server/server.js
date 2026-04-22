require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔗 ROUTES
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

// ✅ DB CONNECTION (IMPROVED)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.log("MongoDB Error:", err.message);
    process.exit(1);
  });

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API Running...");
});

// ✅ DEFAULT PORT (SAFE)
const PORT = process.env.PORT || 5000;

// SERVER START
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});