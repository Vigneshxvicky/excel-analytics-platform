// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Only require password if googleId is not provided
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    }
  },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, default: 'user' }
}, { timestamps: true }); // <-- Add this options object

module.exports = mongoose.model("User", userSchema)

