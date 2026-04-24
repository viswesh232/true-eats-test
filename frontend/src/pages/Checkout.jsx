import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { MapPin, CreditCard, ArrowLeft, CheckCircle, Tag, X, Shield } from 'lucide-react';

const colors = {
    forest: '#234232',
    orange: '#dd7a2f',
    cream: '#fcfaf6',
    white: '#ffffff',
    ink: '#1f2937',
    muted: '#6b7280',
    border: '#e7e0d4',
    softForest: '#eef5ef',
    blush: '#fff1e4',
};

const formatPrice = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(amount || 0);

const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) {
        resolve(true);
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
});

const Checkout = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [settings, setSettings] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [loading, setLoading] = useState(false);
    const [userDiscount, setUserDiscount] = useState(location.state?.userDiscount || null);

    const passedCoupon = location.state?.coupon || null;
    const [couponResult, setCouponResult] = useState(passedCoupon);
    const [couponCode, setCouponCode] = useState(passedCoupon?.coupon?.code || '');
    const [couponError, setCouponError] = useState('');

    const [address, setAddress] = useState({
        doorNo: '',
        colony: '',
        city: '',
        pincode: '',
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!cartItems.length) {
            navigate('/');
            return;
        }

        API.get('/settings').then(({ data }) => setSettings(data)).catch(() => {});
        API.get(`/settings/user-discount/${user._id}`).then(({ data }) => setUserDiscount(data)).catch(() => setUserDiscount(null));

        API.get('/auth/profile')
            .then(({ data }) => {
                if (data?.address) {
                    setAddress({
                        doorNo: data.address.doorNo || '',
                        colony: data.address.colony || '',
                        city: data.address.city || '',
                        pincode: data.address.pincode || '',
                    });
                    return;
                }

                return API.get('/orders/myorders').then(({ data: orders }) => {
                    if (orders.length > 0 && orders[0].shippingAddress) {
                        const parts = orders[0].shippingAddress.split(',');
                        setAddress({
                            doorNo: parts[0]?.trim() || '',
                            colony: parts[1]?.trim() || '',
                            city: parts[2]?.replace(/- \d+/, '')?.trim() || '',
                            pincode: orders[0].shippingAddress.match(/\d{6}/)?.[0] || '',
                        });
                    }
                });
            })
            .catch(() => null);
    }, [cartItems.length, navigate, user]);

    const subtotal = useMemo(
        () => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
        [cartItems]
    );

    const rawDelivery = settings?.deliveryFee ?? 40;
    const freeThreshold = settings?.freeDeliveryEnabled ? (settings?.freeDeliveryAbove ?? 499) : Infinity;
    const deliveryFee = subtotal >= freeThreshold ? 0 : rawDelivery;
    const platformFee = settings?.platformFee ?? 5;
    const gstRate = settings?.gstEnabled && settings?.gstPercent ? settings.gstPercent : 0;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const couponDiscount = couponResult?.discount || 0;
    const userDiscountAmt = userDiscount
        ? (userDiscount.type === 'percent'
            ? Math.round((subtotal * userDiscount.value) / 100)
            : userDiscount.value)
        : 0;
    const total = Math.max(0, subtotal + deliveryFee + platformFee + gstAmount - couponDiscount - userDiscountAmt);
    const codEnabled = settings?.codEnabled !== false;
    const selectedPaymentMethod = !codEnabled && paymentMethod === 'COD' ? 'Online' : paymentMethod;

    const handleApplyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) {
            setCouponError('Enter a coupon code first.');
            setCouponResult(null);
            return;
        }

        setCouponError('');
        setCouponResult(null);
        try {
            const { data } = await API.post('/settings/validate-coupon', { code, subtotal });
            setCouponCode(code);
            setCouponResult(data);
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid coupon code.');
        }
    };

    const buildShippingAddress = () => {
        const parts = [address.doorNo, address.colony, address.city].filter(Boolean).join(', ');
        const pin = address.pincode ? ` - ${address.pincode}` : '';
        return (parts + pin).trim() || 'Address not provided';
    };

    const buildOrderPayload = (extra = {}) => ({
        orderItems: cartItems.map((item) => ({
            name: item.name,
            qty: item.qty,
            image: (item.images && item.images[0]) || item.image || '',
            price: item.price,
            product: item._id,
        })),
        totalPrice: total,
        shippingAddress: buildShippingAddress(),
        couponCode: couponResult?.coupon?.code || '',
        couponDiscount,
        userDiscount: userDiscountAmt,
        paymentMethod: selectedPaymentMethod,
        ...extra,
    });

    const handleOnlinePayment = async () => {
        setLoading(true);

        const sdkLoaded = await loadRazorpay();
        if (!sdkLoaded || !window.Razorpay) {
            alert('Payment gateway could not be loaded. Disable ad blockers for this page or choose Cash on Delivery.');
            setLoading(false);
            return;
        }

        try {
            const { data: rzpOrder } = await API.post('/orders/create-razorpay-order', buildOrderPayload());
            if (!rzpOrder?.razorpayOrderId || !rzpOrder?.key_id) {
                alert('Online payment is not configured correctly right now. Please try again later.');
                setLoading(false);
                return;
            }

            const options = {
                key: rzpOrder.key_id,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: 'True Eats',
                description: `${cartItems.reduce((count, item) => count + item.qty, 0)} item(s)`,
                order_id: rzpOrder.razorpayOrderId,
                prefill: {
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    email: user.email || '',
                    contact: user.phoneNumber || user.phone || '',
                },
                theme: { color: colors.forest },
                handler: async (response) => {
                    try {
                        const payload = buildOrderPayload({
                            razorpayOrderId: rzpOrder.razorpayOrderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        const { data: order } = await API.post('/orders', payload);
                        clearCart();
                        navigate('/payment-success', { state: { order } });
                    } catch {
                        alert(`Payment succeeded but the order could not be placed. Save payment ID ${response.razorpay_payment_id} and contact support.`);
                    }
                },
                modal: {
                    ondismiss: () => setLoading(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                alert(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            alert(`Could not start payment: ${err.response?.data?.message || err.message}`);
            setLoading(false);
        }
    };

    const handleCOD = async () => {
        setLoading(true);
        try {
            const { data: order } = await API.post('/orders', buildOrderPayload({ paymentMethod: 'COD' }));
            clearCart();
            navigate('/payment-success', { state: { order } });
        } catch (err) {
            alert(`Order failed: ${err.response?.data?.message || 'Server error'}`);
        }
        setLoading(false);
    };

    const handlePay = () => {
        if (selectedPaymentMethod === 'COD') {
            handleCOD();
            return;
        }
        handleOnlinePayment();
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        backgroundColor: colors.white,
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.cream, fontFamily: "'Inter', sans-serif", color: colors.ink }}>
            <div style={{ backgroundColor: colors.forest, color: '#fff' }}>
                <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '20px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button onClick={() => navigate('/cart')} style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', padding: '10px 14px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} /> Back to cart
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px' }}>Checkout</h1>
                        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>Secure payment and delivery details</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>
                        <Shield size={15} /> Secure checkout
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px 56px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '28px', alignItems: 'start' }}>
                <div style={{ display: 'grid', gap: '20px' }}>
                    <section style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px' }}>
                        <h2 style={{ margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px' }}>
                            <MapPin size={18} color={colors.orange} /> Delivery address
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            {[
                                { key: 'doorNo', label: 'Door no / flat' },
                                { key: 'colony', label: 'Colony / area' },
                                { key: 'city', label: 'City' },
                                { key: 'pincode', label: 'Pincode' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: colors.muted, fontWeight: 700 }}>{field.label}</label>
                                    <input value={address[field.key]} onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })} style={inputStyle} placeholder={field.label} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px' }}>
                        <h2 style={{ margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px' }}>
                            <CreditCard size={18} color={colors.orange} /> Payment method
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            {[
                                { id: 'Online', label: 'Pay online', sub: 'UPI, cards, net banking' },
                                { id: 'COD', label: 'Cash on delivery', sub: codEnabled ? 'Pay when order arrives' : 'Currently unavailable', disabled: !codEnabled },
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => !method.disabled && setPaymentMethod(method.id)}
                                    style={{
                                        border: `1px solid ${selectedPaymentMethod === method.id ? colors.forest : colors.border}`,
                                        borderRadius: '20px',
                                        padding: '18px',
                                        backgroundColor: selectedPaymentMethod === method.id ? colors.softForest : method.disabled ? '#f8fafc' : colors.white,
                                        cursor: method.disabled ? 'not-allowed' : 'pointer',
                                        textAlign: 'left',
                                        opacity: method.disabled ? 0.6 : 1,
                                    }}
                                >
                                    <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>{method.label}</div>
                                    <div style={{ color: colors.muted, fontSize: '13px' }}>{method.sub}</div>
                                    {selectedPaymentMethod === method.id && <div style={{ marginTop: '10px', color: colors.forest, fontWeight: 700, fontSize: '13px' }}>Selected</div>}
                                </button>
                            ))}
                        </div>
                        {!codEnabled && <p style={{ margin: '14px 0 0', color: colors.orange, fontSize: '13px', fontWeight: 600 }}>Cash on Delivery is not Available.</p>}
                    </section>

                    <section style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px' }}>
                        <h2 style={{ margin: '0 0 18px', fontSize: '20px' }}>Your items</h2>
                        {cartItems.map((item) => (
                            <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0, 1fr) auto', gap: '14px', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1ede5' }}>
                                <img src={(item.images && item.images[0]) || item.image || ''} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', backgroundColor: '#f3f4f6' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                <div>
                                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                                    <div style={{ color: colors.muted, fontSize: '13px', marginTop: '4px' }}>Qty {item.qty} x {formatPrice(item.price)}</div>
                                </div>
                                <div style={{ fontWeight: 800 }}>{formatPrice(item.price * item.qty)}</div>
                            </div>
                        ))}
                    </section>
                </div>

                <aside style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px', position: 'sticky', top: '20px' }}>
                    <h2 style={{ margin: '0 0 18px', fontSize: '24px' }}>Order summary</h2>

                    <div style={{ marginBottom: '18px' }}>
                        {couponResult ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 16px', borderRadius: '18px', backgroundColor: colors.softForest, border: '1px solid #bbf7d0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Tag size={16} color={colors.orange} />
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{couponResult.coupon.code}</div>
                                        <div style={{ color: colors.muted, fontSize: '13px' }}>{formatPrice(couponResult.discount)} saved</div>
                                    </div>
                                </div>
                                <button onClick={() => { setCouponResult(null); setCouponCode(''); }} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()} placeholder='Coupon code' style={{ flex: '1 1 220px', border: '1px solid ' + colors.border, borderRadius: '16px', padding: '14px 16px', fontSize: '14px', outline: 'none' }} />
                                    <button onClick={handleApplyCoupon} style={{ border: 'none', borderRadius: '16px', padding: '14px 16px', backgroundColor: colors.forest, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                                </div>
                                {couponError && <p style={{ margin: '10px 0 0', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>{couponError}</p>}
                            </>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        <SummaryRow label='Subtotal' value={formatPrice(subtotal)} />
                        <SummaryRow label='Delivery fee' value={deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)} highlight={deliveryFee === 0} />
                        {platformFee > 0 && <SummaryRow label='Platform fee' value={formatPrice(platformFee)} />}
                        {gstAmount > 0 && <SummaryRow label={`GST (${gstRate}%)`} value={formatPrice(gstAmount)} />}
                        {couponDiscount > 0 && <SummaryRow label='Coupon discount' value={`- ${formatPrice(couponDiscount)}`} highlight />}
                        {userDiscountAmt > 0 && <SummaryRow label={userDiscount?.label || 'Discount'} value={`- ${formatPrice(userDiscountAmt)}`} highlight />}
                    </div>

                    {userDiscountAmt > 0 && (
                        <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '16px', backgroundColor: colors.softForest, color: colors.forest, fontSize: '13px', fontWeight: 600 }}>
                            First-order discount applied for this checkout.
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid ' + colors.border, paddingTop: '16px', marginTop: '18px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>Total</span>
                        <span style={{ fontWeight: 900, fontSize: '28px' }}>{formatPrice(total)}</span>
                    </div>

                    <button onClick={handlePay} disabled={loading} style={{ marginTop: '18px', width: '100%', padding: '16px', borderRadius: '18px', border: 'none', backgroundColor: loading ? '#cbd5e1' : colors.forest, color: '#fff', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
                        {loading ? 'Processing...' : selectedPaymentMethod === 'COD' ? 'Place order (COD)' : `Pay ${formatPrice(total)}`}
                    </button>

                    <p style={{ margin: '12px 0 0', color: colors.muted, fontSize: '12px', lineHeight: 1.6 }}>
                        Powered by Razorpay with secure payment verification on the server.
                    </p>
                </aside>
            </div>
        </div>
    );
};

const SummaryRow = ({ label, value, highlight = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: highlight ? '#166534' : colors.ink, fontWeight: highlight ? 700 : 500 }}>
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default Checkout;
