const express = require('express');
const router  = express.Router();
const {
    createTicket, getMyTickets, replyToTicket,
    getAllTickets, adminReply, closeTicket,
} = require('../controllers/supportController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/Upload');

// Customer
router.post('/',             protect, upload.array('images', 4), createTicket);
router.get('/mine',          protect, getMyTickets);
router.post('/:id/reply',    protect, upload.array('images', 4), replyToTicket);

// Admin
router.get('/admin/all',          protect, admin, getAllTickets);
router.post('/admin/:id/reply',   protect, admin, upload.array('images', 4), adminReply);
router.put('/admin/:id/close',    protect, admin, closeTicket);

module.exports = router;
