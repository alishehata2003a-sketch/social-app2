const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');

const serverError = (res, error) =>
  res.status(500).json({ message: 'Server error', error: error.message });

// Create comment on a post
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      content,
      post: postId,
      author: req.user.userId
    });
    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    serverError(res, error);
  }
};

// Get all comments of a post
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: postId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ count: comments.length, comments });
  } catch (error) {
    serverError(res, error);
  }
};

// Get single comment
const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    const comment = await Comment.findById(commentId).populate('author', 'name');
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.status(200).json({ comment });
  } catch (error) {
    serverError(res, error);
  }
};

// Update comment (comment owner only)
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the comment owner can update this comment' });
    }
    comment.content = content;
    await comment.save();
    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    serverError(res, error);
  }
};

// Delete comment (comment owner OR post owner)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const post = await Post.findById(comment.post);
    const userId = req.user.userId;
    const isCommentOwner = comment.author.toString() === userId;
    const isPostOwner = post && post.author.toString() === userId;

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        message: 'Only the comment owner or the post owner can delete this comment'
      });
    }
    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = { createComment, getPostComments, getCommentById, updateComment, deleteComment };
