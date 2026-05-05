const Order = require('../models/Order');
const Product = require('../models/Product');
const Counter = require('../models/Counter');
const { sendOrderUpdateEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const Settings = require('../models/Settings');

// ── Helper: generate TRU-101 style orderId ───────────────────────────────────
// Finds the highest existing number and adds 1, so IDs stay short and sequential
const getAlphaSeries = (index) => {
    let current = index;
    let output = '';

    while (current >= 0) {
        output = String.fromCharCode(65 + (current % 26)) + output;
        current = Math.floor(current / 26) - 1;
    }

    return output;
};

const generateOrderId = async () => {
    const counter = await Counter.findByIdAndUpdate(
        'orders',
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const index = counter.seq - 1;
    const numberPerSeries = 899; // 101-999
    const seriesIndex = Math.floor(index / numberPerSeries);
    const orderNumber = 101 + (index % numberPerSeries);

    return `#TRU${getAlphaSeries(seriesIndex)}${orderNumber}`;
};

const getEligibleUserDiscount = async (userId, settings) => {
    if (!settings?.newUserDiscountEnabled || !settings?.newUserDiscount) {
        return null;
    }

    const existingOrder = await Order.exists({
        user: userId,
        status: { $ne: 'Cancelled' },
    });

    if (existingOrder) {
        return null;
    }

    return {
        type: 'percent',
        value: settings.newUserDiscount,
        label: 'First order discount',
    };
};

const calculateOrderPricing = async ({ orderItems, couponCode, userId }) => {
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        return { error: 'No order items' };
    }

    const settings = await Settings.findById('global').select([
        'deliveryFee',
        'minOrderValue',
        'platformFee',
        'gstPercent',
        'gstEnabled',
        'freeDeliveryAbove',
        'freeDeliveryEnabled',
        'newUserDiscountEnabled',
        'newUserDiscount',
        'coupons',
        'hiddenCoupons',
    ].join(' '));

    const requestedItems = orderItems
        .map((item) => ({
            productId: String(item.product || item._id || ''),
            qty: Number(item.qty),
        }))
        .filter((item) => item.productId);

    if (requestedItems.length === 0 || requestedItems.some((item) => !Number.isInteger(item.qty) || item.qty <= 0)) {
        return { error: 'Invalid order items' };
    }

    const uniqueProductIds = [...new Set(requestedItems.map((item) => item.productId))];
    const products = await Product.find({
        _id: { $in: uniqueProductIds },
        isAvailable: true,
    }).select('name price images');

    if (products.length !== uniqueProductIds.length) {
        return { error: 'One or more selected products are unavailable' };
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const normalizedItems = requestedItems.map((item) => {
        const product = productMap.get(item.productId);
        return {
            name: product.name,
            qty: item.qty,
            image: product.images?.[0] || '',
            price: product.price,
            product: product._id,
        };
    });

    const subtotal = normalizedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const minOrderValue = settings?.minOrderValue ?? 199;
    if (subtotal < minOrderValue) {
        return { error: `Minimum order value is Rs. ${minOrderValue}` };
    }

    const rawDelivery = settings?.deliveryFee ?? 40;
    const freeThreshold = settings?.freeDeliveryEnabled ? (settings?.freeDeliveryAbove ?? 499) : Infinity;
    const deliveryFee = subtotal >= freeThreshold ? 0 : rawDelivery;
    const platformFee = settings?.platformFee ?? 5;
    const gstRate = settings?.gstEnabled && settings?.gstPercent ? settings.gstPercent : 0;
    const gstAmount = Math.round((subtotal * gstRate) / 100);

    let appliedCouponCode = '';
    let couponDiscount = 0;
    const trimmedCouponCode = couponCode?.toUpperCase().trim();

    if (trimmedCouponCode) {
        const allCoupons = [...(settings?.coupons || []), ...(settings?.hiddenCoupons || [])];
        const coupon = allCoupons.find((entry) => entry.code === trimmedCouponCode);

        if (!coupon) {
            return { error: 'Invalid coupon code' };
        }

        if (coupon.minOrder > 0 && subtotal < coupon.minOrder) {
            return { error: `This coupon requires a minimum order of Rs. ${coupon.minOrder}` };
        }

        couponDiscount = coupon.type === 'percent'
            ? Math.round((subtotal * coupon.value) / 100)
            : coupon.value;
        couponDiscount = Math.min(couponDiscount, subtotal);
        appliedCouponCode = coupon.code;
    }

    const userDiscount = await getEligibleUserDiscount(userId, settings);
    const userDiscountAmount = userDiscount
        ? (userDiscount.type === 'percent'
            ? Math.round((subtotal * userDiscount.value) / 100)
            : userDiscount.value)
        : 0;

    const totalPrice = Math.max(0, subtotal + deliveryFee + platformFee + gstAmount - couponDiscount - userDiscountAmount);

    return {
        normalizedItems,
        couponCode: appliedCouponCode,
        couponDiscount,
        userDiscountAmount,
        totalPrice,
    };
};

// ── 1. CREATE RAZORPAY ORDER ─────────────────────────────────────────────────
// @route POST /api/orders/create-razorpay-order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const Razorpay = require('razorpay');
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;

        if (!razorpayKeyId || !razorpayKeySecret) {
            return res.status(500).json({ message: 'Razorpay keys are not configured' });
        }

        const razorpay = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
        });

        const pricing = await calculateOrderPricing({
            orderItems: req.body.orderItems,
            couponCode: req.body.couponCode,
            userId: req.user._id,
        });

        if (pricing.error) {
            return res.status(400).json({ message: pricing.error });
        }

        const options = {
            amount: Math.round(pricing.totalPrice * 100), // Razorpay needs paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);
        res.json({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: razorpayKeyId,
            totalPrice: pricing.totalPrice,
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ message: 'Payment initiation failed', error: error.message });
    }
};

// ── 2. PLACE ORDER (after payment success) ───────────────────────────────────
// @route POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const {
            orderItems, shippingAddress,
            couponCode, customNote,
            razorpayOrderId, razorpayPaymentId, razorpaySignature,
            paymentMethod
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        const settings = await Settings.findById('global').select('restrictedUsers orderingEnabled codEnabled');
        if (settings?.orderingEnabled === false) {
            return res.status(403).json({ message: 'Ordering is currently disabled' });
        }

        if (paymentMethod === 'COD' && settings?.codEnabled === false) {
            return res.status(403).json({ message: 'Cash on Delivery is currently unavailable' });
        }

        const isRestricted = settings?.restrictedUsers?.some(
            (entry) => entry.userId === String(req.user._id)
        );
        if (isRestricted) {
            return res.status(403).json({ message: 'Your account is restricted from placing orders' });
        }

        const pricing = await calculateOrderPricing({
            orderItems,
            couponCode,
            userId: req.user._id,
        });
        if (pricing.error) {
            return res.status(400).json({ message: pricing.error });
        }

        // Verify Razorpay signature if payment was online
        let paymentStatus = 'Pending';
        let paidAt = null;

        if (paymentMethod !== 'COD' && (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)) {
            return res.status(400).json({ message: 'Verified online payment is required before placing this order' });
        }

        if (paymentMethod !== 'COD' && razorpayPaymentId && razorpaySignature) {
            const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
            if (!razorpaySecret) {
                return res.status(500).json({ message: 'Razorpay verification secret is not configured' });
            }

            const body = razorpayOrderId + '|' + razorpayPaymentId;
            const expectedSignature = crypto
                .createHmac('sha256', razorpaySecret)
                .update(body)
                .digest('hex');

            if (expectedSignature === razorpaySignature) {
                paymentStatus = 'Paid';
                paidAt = new Date();
            } else {
                return res.status(400).json({ message: 'Payment verification failed. Order not placed.' });
            }
        }

        const orderId = await generateOrderId();

        const order = new Order({
            user: req.user._id,
            orderId,
            orderItems: pricing.normalizedItems,
            shippingAddress,
            totalPrice: pricing.totalPrice,
            couponCode: pricing.couponCode || '',
            couponDiscount: pricing.couponDiscount || 0,
            userDiscount: pricing.userDiscountAmount || 0,
            customNote: customNote || '',
            status: paymentStatus === 'Paid' ? 'Placed' : (paymentMethod === 'COD' ? 'Placed' : 'Pending Payment'),
            paymentMethod: paymentMethod || 'Online',
            paymentStatus,
            razorpayOrderId: razorpayOrderId || '',
            razorpayPaymentId: razorpayPaymentId || '',
            razorpaySignature: razorpaySignature || '',
            paidAt,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ── 3. GET SINGLE ORDER ──────────────────────────────────────────────────────
// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        let order = null;

        if (id.startsWith('TRU-') || id.startsWith('#TRU')) {
            order = await Order.findOne({ orderId: id })
                .populate('user', 'firstName lastName email phoneNumber address');
        }

        // Fall back to MongoDB _id
        if (!order) {
            order = await Order.findById(id)
                .populate('user', 'firstName lastName email phoneNumber address');
        }

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Customers can only see their own orders
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        // Handle invalid ObjectId format gracefully
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

// ── 4. GET ALL ORDERS (Admin) ────────────────────────────────────────────────
// @route GET /api/orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'firstName lastName email phoneNumber')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 5. GET MY ORDERS (Customer) ──────────────────────────────────────────────
// @route GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product', 'name image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 6. UPDATE ORDER STATUS (Admin) ──────────────────────────────────────────
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = req.body.status;

        if (req.body.status === 'Delivered') {
            order.completedAt = new Date();
        } else {
            order.completedAt = null;
        }

        if (!order.shippingAddress) {
            order.shippingAddress = 'Address not provided';
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 7. UPDATE DELIVERY INFO (Admin) ─────────────────────────────────────────
// @route PUT /api/orders/:id/delivery
exports.updateDeliveryInfo = async (req, res) => {
    try {
        const { trackingId, courierName, customNote } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.trackingId  = trackingId || order.trackingId;
        order.courierName = courierName || 'Private Courier';
        order.customNote  = customNote || '';
        order.status      = 'Shipped';
        order.shippedAt   = new Date();

        await order.save();
        res.json({ message: 'Delivery info updated', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 8. CONFIRM PAYMENT MANUALLY (Admin) ─────────────────────────────────────
// @route PUT /api/orders/:id/confirm-payment
exports.confirmPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = 'Paid';
        order.paidAt = new Date();
        if (order.status === 'Pending Payment') {
            order.status = 'Placed';
        }

        await order.save();
        res.json({ message: 'Payment confirmed', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 9. SEND ORDER UPDATE EMAIL (Admin) ──────────────────────────────────────
// @route POST /api/orders/:id/send-update
exports.sendOrderUpdate = async (req, res) => {
    try {
        const { message, trackingId, courierName } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Send order update email without awaiting
        sendOrderUpdateEmail(order.user.email, {
            customerName: order.user.firstName,
            orderId: order.orderId,
            message,
            trackingId,
            courierName,
        }).catch(err => console.error('Order update email failed:', err));

        res.json({ message: 'Email sent to ' + order.user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route GET /api/orders/stats/revenue
exports.getRevenueStats = async (req, res) => {
    try {
        const { range, start, end } = req.query;
        let startDate = new Date();
        let endDate   = new Date();

        if (range === 'today') {
            startDate = new Date(new Date().setHours(0, 0, 0, 0));
            endDate   = new Date(new Date().setHours(23, 59, 59, 999));
        } else if (range === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (range === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (range === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        } else if (range === 'custom' && start && end) {
            startDate = new Date(start); startDate.setHours(0, 0, 0, 0);
            endDate   = new Date(end);   endDate.setHours(23, 59, 59, 999);
        } else {
            startDate = new Date(0);
        }

        const orders = await Order.find({
            paymentStatus: 'Paid',
            $or: [
                { paidAt:     { $gte: startDate, $lte: endDate } },
                { createdAt:  { $gte: startDate, $lte: endDate } },
            ],
        }).populate('user', 'firstName lastName');

        const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
        const averageOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

        res.json({ totalRevenue, averageOrderValue, totalOrders: orders.length, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 2b. RECORD FAILED PAYMENT ────────────────────────────────────────────────
// @route POST /api/orders/record-failed
// Called from frontend when Razorpay fires payment.failed
exports.recordFailedPayment = async (req, res) => {
    try {
        const { orderItems, shippingAddress, couponCode, customNote, razorpayOrderId, paymentMethod } = req.body;
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const pricing = await calculateOrderPricing({ orderItems, couponCode, userId: req.user._id });
        const items = pricing.normalizedItems || orderItems.map(i => ({
            name: i.name || 'Product',
            qty: i.qty,
            image: (i.images && i.images[0]) || i.image || '',
            price: i.price,
            product: i.product || i._id,
        }));
        const totalPrice = pricing.totalPrice || orderItems.reduce((a, i) => a + i.price * i.qty, 0);
        const orderId = await generateOrderId();

        const order = new Order({
            user:          req.user._id,
            orderId,
            orderItems:    items,
            shippingAddress: shippingAddress || 'Address not provided',
            totalPrice,
            couponCode:    pricing.couponCode || '',
            couponDiscount: pricing.couponDiscount || 0,
            userDiscount:  pricing.userDiscountAmount || 0,
            customNote:    customNote || '',
            status:        'Pending Payment',
            paymentMethod: paymentMethod || 'Online',
            paymentStatus: 'Failed',
            razorpayOrderId: razorpayOrderId || '',
            razorpayPaymentId: '',
            razorpaySignature: '',
        });

        const created = await order.save();
        res.status(201).json({ message: 'Failed payment recorded', order: created });
    } catch (error) {
        console.error('Record failed payment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ── USER CANCEL ORDER ────────────────────────────────────────────────
// @route PUT /api/orders/:id/cancel
exports.userCancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

        if (['Delivered', 'Shipped', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({ message: 'Cannot cancel an order at this stage' });
        }

        order.status = 'Cancelled';
        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: error.message });
    }
};

