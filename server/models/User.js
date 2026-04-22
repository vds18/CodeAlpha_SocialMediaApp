const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  followers: {
    type: [String],
    default: []   // ✅ FIX
  },

  following: {
    type: [String],
    default: []   // ✅ FIX
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);