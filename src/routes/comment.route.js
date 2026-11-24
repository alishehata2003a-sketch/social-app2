const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  getCommentById, updateComment, deleteComment
} = require('../controllers/comment.controller');

const router = express.Router();

router.get('/:commentId', authMiddleware, getCommentById);
router.patch('/:commentId', authMiddleware, updateComment);
router.delete('/:commentId', authMiddleware, deleteComment);

module.exports = router;
