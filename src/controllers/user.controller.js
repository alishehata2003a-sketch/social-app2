const User = require('../models/user.model');
const Follow = require('../models/follow.model');

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -refreshToken -otp -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Name is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -otp -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Search Users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const users = await User.find({
      _id: { $ne: req.user.userId },
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } }
      ]
    })
      .select('-password -refreshToken -otp -passwordResetToken')
      .limit(20);

    res.status(200).json({
      message: 'Users found successfully',
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get User Suggestions
const getUserSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const followingUsers = await Follow.find({
      follower: currentUserId
    }).distinct('following');

    const excludedUsers = [
      currentUserId,
      ...followingUsers
    ];

    const users = await User.find({
      _id: { $nin: excludedUsers }
    })
      .select('-password -refreshToken -otp -passwordResetToken')
      .limit(10);

    res.status(200).json({
      message: 'User suggestions retrieved successfully',
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Account Settings
const updateAccountSettings = async (req, res) => {
  try {
    const { isPrivate, allowMessages } = req.body;

    const updates = {};

    if (typeof isPrivate === 'boolean') {
      updates.isPrivate = isPrivate;
    }

    if (typeof allowMessages === 'boolean') {
      updates.allowMessages = allowMessages;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'Please provide valid account settings'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -otp -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'Account settings updated successfully',
      user
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  getUserSuggestions,
  updateAccountSettings
};