const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  createPost, getMyPosts, getPostById, updatePost, deletePost
} = require('../controllers/post.controller');
const {
  createComment, getPostComments
} = require('../controllers/comment.controller');

const router = express.Router();

router.post('/', authMiddleware, createPost);
router.get('/', authMiddleware, getMyPosts);
router.get('/:postId', authMiddleware, getPostById);
router.patch('/:postId', authMiddleware, updatePost);
router.delete('/:postId', authMiddleware, deletePost);

// Comments under a post
router.post('/:postId/comments', authMiddleware, createComment);
router.get('/:postId/comments', authMiddleware, getPostComments);

module.exports = router;
