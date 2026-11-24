const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Logic
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      userId: newUser._id
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login Logic
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
      { expiresIn: '7d' }
    );

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { refreshToken: refreshToken } },
      { new: true, runValidators: true }
    );

    if (!updatedUser || !updatedUser.refreshToken) {
      return res.status(500).json({
        message: 'Failed to save refresh token'
      });
    }

    res.status(200).json({
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Refresh Token Logic
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key'
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: 'Refresh token does not match saved token'
      });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
      { expiresIn: '7d' }
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Refresh Token Error:', error.message);

    res.status(401).json({
      message: 'Invalid or expired refresh token'
    });
  }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found with this email.'
      });
    }

    const resetOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.passwordResetToken = resetOtp;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    res.status(200).json({
      message: 'Password reset OTP generated successfully.',
      resetOtp
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      passwordResetToken: otp,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired OTP'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;

    await user.save();

    res.status(200).json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Logout Logic
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key'
    );

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: 'Invalid refresh token'
      });
    }

    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(401).json({
      message: 'Invalid or expired refresh token'
    });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logout
};