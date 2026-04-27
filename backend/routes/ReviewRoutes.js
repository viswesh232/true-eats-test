const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/Upload');
const {
    getProductReviews,
    addReview,
    deleteReview,
    getAllReviews,
} = require('../controllers/ReviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin
router.get('/admin/all', protect, admin, getAllReviews);

// Public
router.get('/:productId',          getProductReviews);

// Customer — must be logged in
router.post('/:productId',         protect, upload.array('images', 5), addReview);

// Admin delete
router.delete('/:reviewId',        protect, admin, deleteReview);

module.exports = router;
