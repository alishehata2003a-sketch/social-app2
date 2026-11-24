const express = require('express');

const {
  getProfile,
  updateProfile,
  searchUsers,
  getUserSuggestions,
  updateAccountSettings
} = require('../controllers/user.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get User Profile
router.get('/profile', authMiddleware, getProfile);

// Update User Profile
router.put('/profile', authMiddleware, updateProfile);

// Search Users
router.get('/search', authMiddleware, searchUsers);

// Get User Suggestions
router.get('/suggestions', authMiddleware, getUserSuggestions);

// Update Account Settings
router.put('/settings', authMiddleware, updateAccountSettings);

module.exports = router;