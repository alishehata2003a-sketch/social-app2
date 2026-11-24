const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');

const serverError = (res, error) =>
  res.status(500).json({ message: 'Server error', error: error.message });

// Create Post
const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    const post = await Post.create({ content, author: req.user.userId });
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    serverError(res, error);
  }
};

// Get all posts of the logged-in user
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ count: posts.length, posts });
  } catch (error) {
    serverError(res, error);
  }
};

// Get single post
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }
    const post = await Post.findById(postId).populate('author', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ post });
  } catch (error) {
    serverError(res, error);
  }
};

// Update post (owner only)
const updatePost = async (req, res) => {
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
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the post owner can update this post' });
    }
    post.content = content;
    await post.save();
    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    serverError(res, error);
  }
};

// Delete post (owner only) + its comments
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the post owner can delete this post' });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = { createPost, getMyPosts, getPostById, updatePost, deletePost };
