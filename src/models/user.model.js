const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Email Verification
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },

  // Password Reset Fields
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },

  // Refresh Token
  refreshToken: { type: String },

  // Account Settings
  isPrivate: { type: Boolean, default: false },
  allowMessages: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);