const express = require('express');
const router  = express.Router();
const {
    getSettings, updateSettings, validateCoupon,
    getPublicCoupons, getUserDiscount, sendCouponToUser, sendMailToUser,
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/',                     getSettings);
router.get('/user-discount/:userId', protect,        getUserDiscount);
router.put('/',                     protect, admin, updateSettings);
router.post('/validate-coupon',     validateCoupon);
router.get('/public-coupons',       getPublicCoupons);
router.post('/send-coupon',         protect, admin, sendCouponToUser);
router.post('/send-mail',           protect, admin, sendMailToUser);

module.exports = router;
