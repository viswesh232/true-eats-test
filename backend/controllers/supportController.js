const SupportTicket = require('../models/SupportTicket');

const getImagePaths = (files = []) => files.map((file) => `/uploads/${file.filename}`);

// ── Customer: create ticket or send first message ─────────────────────────────
// POST /api/support
exports.createTicket = async (req, res) => {
    try {
        const { subject, message, topic, relatedOrderId } = req.body;
        const images = getImagePaths(req.files);
        if (!subject || (!message?.trim() && images.length === 0)) {
            return res.status(400).json({ message: 'Subject and message or image required' });
        }

        const ticket = await SupportTicket.create({
            user:      req.user._id,
            userName:  `${req.user.firstName} ${req.user.lastName}`,
            userEmail: req.user.email,
            subject,
            topic: topic || 'general',
            relatedOrderId: relatedOrderId || '',
            messages: [{ sender: 'user', text: message?.trim() || '', images }],
            lastMessageAt: new Date(),
        });
        res.status(201).json(ticket);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Customer: get their own tickets ──────────────────────────────────────────
// GET /api/support/mine
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user._id }).sort({ lastMessageAt: -1 });
        res.json(tickets);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Customer: add a reply to their ticket ─────────────────────────────────────
// POST /api/support/:id/reply
exports.replyToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        const images = getImagePaths(req.files);
        if (!message?.trim() && images.length === 0) {
            return res.status(400).json({ message: 'Message or image required' });
        }

        const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (ticket.status === 'closed') return res.status(400).json({ message: 'This ticket is closed' });

        ticket.messages.push({ sender: 'user', text: message?.trim() || '', images });
        ticket.status = 'open';
        ticket.lastMessageAt = new Date();
        await ticket.save();
        res.json(ticket);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Admin: get all tickets ────────────────────────────────────────────────────
// GET /api/support/admin/all
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({})
            .populate('user', 'firstName lastName email')
            .sort({ lastMessageAt: -1 });
        res.json(tickets);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Admin: reply to a ticket ──────────────────────────────────────────────────
// POST /api/support/admin/:id/reply
exports.adminReply = async (req, res) => {
    try {
        const { message } = req.body;
        const images = getImagePaths(req.files);
        if (!message?.trim() && images.length === 0) {
            return res.status(400).json({ message: 'Message or image required' });
        }

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.messages.push({ sender: 'admin', text: message?.trim() || '', images });
        ticket.status = 'answered';
        ticket.lastMessageAt = new Date();
        await ticket.save();
        res.json(ticket);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Admin: close a ticket ─────────────────────────────────────────────────────
// PUT /api/support/admin/:id/close
exports.closeTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        ticket.status = 'closed';
        await ticket.save();
        res.json(ticket);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
