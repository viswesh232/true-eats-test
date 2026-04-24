const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const { registerUser, verifyEmail, loginUser } = require('../controllers/authController');
const { getUserProfile, updateUserProfile, forgotPassword,resetPassword } = require('../controllers/authController');


// This defines the URL: /api/auth/signup
router.post('/signup', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
module.exports = router;
