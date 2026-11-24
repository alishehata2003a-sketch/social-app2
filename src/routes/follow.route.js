const express = require('express');

const {
  followUser,
  unfollowUser,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest
} = require('../controllers/follow.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Follow User
router.post('/:userId', authMiddleware, followUser);

// Unfollow User
router.delete('/:userId', authMiddleware, unfollowUser);

// Get Follow Requests
router.get('/requests', authMiddleware, getFollowRequests);

// Accept Follow Request
router.patch('/requests/:requestId/accept', authMiddleware, acceptFollowRequest);

// Reject Follow Request
router.patch('/requests/:requestId/reject', authMiddleware, rejectFollowRequest);

module.exports = router;