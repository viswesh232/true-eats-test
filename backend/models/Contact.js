const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        subject: { type: String, trim: true },
        message: { type: String, required: true, trim: true },
        status: { type: String, enum: ['new', 'replied', 'resolved'], default: 'new' },
        adminNotes: { type: String, default: '' },
        adminReply: { type: String, default: '' },
        adminEmail: { type: String, default: '' },
        repliedAt: { type: Date, default: null },
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Contact', ContactSchema);
