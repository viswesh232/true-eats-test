const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');


const { getAllUsers, updateUserRole,deleteUser } = require('../controllers/adminController');


// All these routes are protected by our "Security Guards"
router.get('/users', protect, admin, getAllUsers);
router.put('/user/:id', protect, admin, updateUserRole);
router.delete('/user/:id', protect, admin, deleteUser);

module.exports = router;
