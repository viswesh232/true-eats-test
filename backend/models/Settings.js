const mongoose = require('mongoose');

const couponSchema = {
    code:     { type: String, required: true },
    type:     { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value:    { type: Number, required: true },
    desc:     { type: String, default: '' },
    minOrder: { type: Number, default: 0 },
};

const settingsSchema = new mongoose.Schema({
    _id: { type: String, default: 'global' },

    deliveryFee:         { type: Number, default: 40 },
    minOrderValue:       { type: Number, default: 199 },
    platformFee:         { type: Number, default: 5 },
    gstPercent:          { type: Number, default: 5 },
    gstEnabled:          { type: Boolean, default: true },
    freeDeliveryAbove:   { type: Number, default: 499 },
    freeDeliveryEnabled: { type: Boolean, default: true },

    orderingEnabled:        { type: Boolean, default: true },
    codEnabled:             { type: Boolean, default: true },
    newUserDiscountEnabled: { type: Boolean, default: false },
    newUserDiscount:        { type: Number, default: 0 },

    coupons:       [couponSchema],
    hiddenCoupons: [couponSchema],

    restrictedUsers: [{
        userId:   { type: String, required: true },
        userName: { type: String, default: '' },
    }],

    announcements: [{
        text:   { type: String, required: true },
        active: { type: Boolean, default: true },
        emoji:  { type: String, default: '[!]' },
    }],

}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
