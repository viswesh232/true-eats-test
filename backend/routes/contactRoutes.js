const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createContact,
    getAllContacts,
    getContactById,
    sendReply,
    updateContactStatus,
    deleteContact
} = require('../controllers/contactController');

// Public route: submit contact form
router.post('/', createContact);

// Admin routes
router.get('/admin/all', protect, admin, getAllContacts);
router.get('/admin/:id', protect, admin, getContactById);
router.put('/admin/:id/reply', protect, admin, sendReply);
router.put('/admin/:id/status', protect, admin, updateContactStatus);
router.delete('/admin/:id', protect, admin, deleteContact);

module.exports = router;
