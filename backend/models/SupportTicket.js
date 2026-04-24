const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender:    { type: String, enum: ['user', 'admin'], required: true },
    text:      { type: String, default: '' },
    images:    [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName:  { type: String, default: '' },
    userEmail: { type: String, default: '' },
    subject:   { type: String, required: true },
    topic:     { type: String, default: 'general' },
    relatedOrderId: { type: String, default: '' },
    status:    { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
    messages:  [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', ticketSchema);
