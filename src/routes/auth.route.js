const express = require('express');

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

module.exports = router;