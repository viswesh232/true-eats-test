const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    title:   { type: String, default: '' },
    body:    { type: String, required: true },
    // Denormalised for fast display without populate
    userName:  { type: String, default: '' },
    userAvatar:{ type: String, default: '' }, // first letter of name
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);