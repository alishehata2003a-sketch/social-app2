
    const User = require('../models/user.model');
const Follow = require('../models/follow.model');
const FollowRequest = require('../models/followRequest.model');

// Follow User
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    if (followerId === userId) {
      return res.status(400).json({
        message: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(userId);

    if (!userToFollow) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    });

    if (existingFollow) {
      return res.status(400).json({
        message: 'You are already following this user'
      });
    }

    // Private Account
    if (userToFollow.isPrivate) {
      const existingRequest = await FollowRequest.findOne({
        sender: followerId,
        receiver: userId
      });

      if (existingRequest && existingRequest.status === 'pending') {
        return res.status(400).json({
          message: 'Follow request already sent'
        });
      }

      if (existingRequest) {
        existingRequest.status = 'pending';
        await existingRequest.save();
      } else {
        await FollowRequest.create({
          sender: followerId,
          receiver: userId
        });
      }

      return res.status(200).json({
        message: 'Follow request sent successfully'
      });
    }

    // Public Account
    await Follow.create({
      follower: followerId,
      following: userId
    });

    res.status(200).json({
      message: 'User followed successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Unfollow User
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });

    if (!follow) {
      return res.status(404).json({
        message: 'You are not following this user'
      });
    }

    res.status(200).json({
      message: 'User unfollowed successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Follow Requests
const getFollowRequests = async (req, res) => {
  try {
    const requests = await FollowRequest.find({
      receiver: req.user.userId,
      status: 'pending'
    }).populate('sender', 'name email');

    res.status(200).json({
      requests
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Accept Follow Request
const acceptFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await FollowRequest.findOne({
      _id: requestId,
      receiver: req.user.userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({
        message: 'Follow request not found'
      });
    }

    await Follow.create({
      follower: request.sender,
      following: request.receiver
    });

    request.status = 'accepted';
    await request.save();

    res.status(200).json({
      message: 'Follow request accepted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Reject Follow Request
const rejectFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await FollowRequest.findOne({
      _id: requestId,
      receiver: req.user.userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({
        message: 'Follow request not found'
      });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      message: 'Follow request rejected successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest
};