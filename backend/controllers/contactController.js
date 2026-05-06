const Contact = require('../models/Contact');
const User = require('../models/User');
const { sendEmail, sendAdminMessageEmail } = require('../utils/sendEmail');

// Create contact message
exports.createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }

        const contact = new Contact({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject?.trim() || '',
            message: message.trim(),
        });

        await contact.save();

        // Send confirmation email to user
        await sendEmail(
            email,
            'We received your message - True Eats',
            `Hi ${name},\n\nThank you for reaching out to True Eats! We have received your message and will get back to you within 24 hours.\n\nYour Message:\n${message}\n\nBest regards,\nTrue Eats Team`
        );

        res.status(201).json({ message: 'Message received! We will reply soon.', contact });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// Get all contact messages (admin only)
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .populate('repliedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

// Get single contact (admin only)
exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findById(id).populate('repliedBy', 'firstName lastName email');

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ message: 'Failed to fetch message' });
    }
};

// Send reply to contact (admin only)
exports.sendReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminReply } = req.body;
        const adminId = req.user._id;
        const adminEmail = req.user?.email || process.env.EMAIL_USER;

        if (!adminReply) {
            return res.status(400).json({ message: 'Reply message is required' });
        }

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        // Send email to customer
        await sendAdminMessageEmail(contact.email, {
            customerName: contact.name,
            subject: `Re: ${contact.subject || contact.name} - True Eats`,
            message: adminReply,
        });

        // Update contact record
        contact.adminReply = adminReply;
        contact.adminEmail = adminEmail;
        contact.status = 'replied';
        contact.repliedAt = new Date();
        contact.repliedBy = adminId;

        await contact.save();

        res.status(200).json({ message: 'Reply sent successfully!', contact });
    } catch (error) {
        console.error('Error sending reply:', error);
        res.status(500).json({ message: 'Failed to send reply' });
    }
};

// Update contact status (admin only)
exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!['new', 'replied', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        contact.status = status;
        if (adminNotes !== undefined) contact.adminNotes = adminNotes;
        await contact.save();

        res.status(200).json(contact);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ message: 'Failed to update message' });
    }
};

// Delete contact (admin only)
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await Contact.findByIdAndDelete(id);
        res.status(200).json({ message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};
