import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Tag, X, CheckCircle } from 'lucide-react';

const colors = {
    cream: '#fcfaf6',
    white: '#ffffff',
    ink: '#1f2937',
    muted: '#6b7280',
    border: '#e7e0d4',
    forest: '#234232',
    softForest: '#eef5ef',
    orange: '#dd7a2f',
    blush: '#fff1e4',
    danger: '#dc2626',
};

const formatPrice = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(amount || 0);

const Cart = () => {
    const { cartItems, addToCart, removeFromCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [settings, setSettings] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponResult, setCouponResult] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [userDiscount, setUserDiscount] = useState(null);
    const [publicCoupons, setPublicCoupons] = useState([]);

    useEffect(() => {
        API.get('/settings').then(({ data }) => setSettings(data)).catch(() => {});
        API.get('/settings/public-coupons').then(({ data }) => setPublicCoupons(data)).catch(() => {});

        if (user?._id) {
            API.get(`/settings/user-discount/${user._id}`)
                .then(({ data }) => setUserDiscount(data))
                .catch(() => setUserDiscount(null));
        }
    }, [user]);

    const subtotal = useMemo(
        () => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
        [cartItems]
    );

    const rawDelivery = settings?.deliveryFee ?? 40;
    const freeThreshold = settings?.freeDeliveryEnabled ? (settings?.freeDeliveryAbove ?? 499) : Infinity;
    const deliveryFee = subtotal === 0 ? 0 : subtotal >= freeThreshold ? 0 : rawDelivery;
    const platformFee = settings?.platformFee ?? 5;
    const gstRate = settings?.gstEnabled && settings?.gstPercent ? settings.gstPercent : 0;
    const gstAmount = Math.round((subtotal * gstRate) / 100);

    const couponMinOrder = couponResult?.coupon?.minOrder || 0;
    const couponInvalidForSubtotal = Boolean(couponResult && couponMinOrder > 0 && subtotal < couponMinOrder);
    const activeCoupon = couponInvalidForSubtotal ? null : couponResult;
    const derivedCouponError = couponInvalidForSubtotal
        ? `Coupon removed: minimum order of ${formatPrice(couponMinOrder)} required.`
        : couponError;
    const couponDiscount = activeCoupon?.discount || 0;

    const activeUserDiscount = user ? userDiscount : null;
    const userDiscountAmt = activeUserDiscount
        ? (activeUserDiscount.type === 'percent'
            ? Math.round((subtotal * activeUserDiscount.value) / 100)
            : activeUserDiscount.value)
        : 0;

    const total = Math.max(0, subtotal + deliveryFee + platformFee + gstAmount - couponDiscount - userDiscountAmt);

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

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (settings && !settings.orderingEnabled) {
            alert('Ordering is currently disabled. Please try again later.');
            return;
        }
        if (settings && subtotal < settings.minOrderValue) {
            alert(`Minimum order value is ${formatPrice(settings.minOrderValue)}.`);
            return;
        }

        navigate('/checkout', {
            state: {
                coupon: activeCoupon,
                userDiscount: activeUserDiscount,
            },
        });
    };

    if (cartItems.length === 0) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: colors.cream, padding: '24px' }}>
                <div style={{ textAlign: 'center', maxWidth: '420px' }}>
                    <div style={{ width: '88px', height: '88px', margin: '0 auto 20px', borderRadius: '50%', backgroundColor: colors.softForest, display: 'grid', placeItems: 'center' }}>
                        <ShoppingBag size={40} color={colors.forest} />
                    </div>
                    <h2 style={{ margin: '0 0 10px', color: colors.ink, fontSize: '30px' }}>Your cart is empty</h2>
                    <p style={{ margin: 0, color: colors.muted, lineHeight: 1.7 }}>Add a few items from the menu and we will bring everything together here.</p>
                    <button onClick={() => navigate('/')} style={{ marginTop: '24px', padding: '14px 26px', borderRadius: '999px', border: 'none', backgroundColor: colors.forest, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.cream, fontFamily: "'Inter', sans-serif", color: colors.ink }}>
            <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px 56px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/')} style={{ border: '1px solid ' + colors.border, backgroundColor: colors.white, borderRadius: '999px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: colors.ink }}>
                        <ArrowLeft size={16} /> Continue shopping
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '34px' }}>Your cart</h1>
                        <p style={{ margin: '6px 0 0', color: colors.muted }}>Review your items, offers, and totals before checkout.</p>
                    </div>
                    {settings && !settings.orderingEnabled && (
                        <div style={{ marginLeft: 'auto', padding: '10px 14px', borderRadius: '999px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '13px', fontWeight: 700 }}>
                            Ordering is currently disabled
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '28px', alignItems: 'start' }}>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px' }}>
                            {cartItems.map((item) => (
                                <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '92px minmax(0, 1fr) auto', gap: '18px', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #f1ede5' }}>
                                    <img src={(item.images && item.images[0]) || item.image || ''} alt={item.name} style={{ width: '92px', height: '92px', objectFit: 'cover', borderRadius: '18px', backgroundColor: '#f3f4f6' }} />
                                    <div>
                                        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{item.name}</h3>
                                        <div style={{ color: colors.muted, fontSize: '14px' }}>{formatPrice(item.price)} each</div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginTop: '14px', border: '1px solid ' + colors.border, borderRadius: '999px', padding: '8px 12px' }}>
                                            <button onClick={() => removeFromCart(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: colors.ink }}>
                                                <Minus size={16} />
                                            </button>
                                            <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                                            <button onClick={() => addToCart(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: colors.ink }}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 800 }}>{formatPrice(item.price * item.qty)}</div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={clearCart} style={{ marginTop: '18px', border: 'none', background: 'none', color: colors.danger, cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <Trash2 size={15} /> Clear cart
                            </button>
                        </div>

                        {publicCoupons.length > 0 && (
                            <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 800 }}>
                                    <Tag size={16} color={colors.orange} /> Available offers
                                </div>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {publicCoupons.map((coupon) => (
                                        <button
                                            key={coupon._id || coupon.code}
                                            onClick={() => {
                                                setCouponCode(coupon.code);
                                                setCouponResult(null);
                                                setCouponError('');
                                            }}
                                            style={{
                                                border: '1px solid ' + colors.border,
                                                borderRadius: '18px',
                                                backgroundColor: colors.blush,
                                                padding: '14px 16px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: '12px',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 800, letterSpacing: '0.08em' }}>{coupon.code}</div>
                                                <div style={{ marginTop: '6px', color: colors.muted, fontSize: '13px' }}>{coupon.desc || 'Tap to use this offer.'}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <div style={{ color: colors.forest, fontWeight: 800 }}>{coupon.type === 'percent' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}</div>
                                                {coupon.minOrder > 0 && <div style={{ marginTop: '6px', color: colors.muted, fontSize: '12px' }}>Min {formatPrice(coupon.minOrder)}</div>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontWeight: 800 }}>
                                <Tag size={16} color={colors.orange} /> Coupon code
                            </div>
                            {activeCoupon ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', border: '1px solid #bbf7d0', borderRadius: '18px', padding: '14px 16px', backgroundColor: '#f0fdf4' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <CheckCircle size={18} color='#059669' />
                                        <div>
                                            <div style={{ fontWeight: 800 }}>{activeCoupon.coupon.code}</div>
                                            <div style={{ color: colors.muted, fontSize: '13px' }}>{formatPrice(activeCoupon.discount)} saved</div>
                                        </div>
                                    </div>
                                    <button onClick={() => { setCouponResult(null); setCouponCode(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.danger }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                        placeholder='Enter coupon code'
                                        style={{ flex: '1 1 240px', border: '1px solid ' + colors.border, borderRadius: '16px', padding: '14px 16px', fontSize: '14px', outline: 'none' }}
                                    />
                                    <button onClick={handleApplyCoupon} style={{ border: 'none', borderRadius: '16px', padding: '14px 18px', backgroundColor: colors.forest, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                                        Apply
                                    </button>
                                </div>
                            )}
                            {derivedCouponError && <p style={{ margin: '10px 0 0', color: colors.danger, fontSize: '13px', fontWeight: 600 }}>{derivedCouponError}</p>}
                        </div>
                    </div>

                    <aside style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px', position: 'sticky', top: '20px' }}>
                        <h2 style={{ margin: '0 0 18px', fontSize: '24px' }}>Order summary</h2>
                        <div style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}>
                            <Row label='Subtotal' value={formatPrice(subtotal)} />
                            <Row label={deliveryFee === 0 && subtotal > 0 ? 'Delivery' : 'Delivery fee'} value={deliveryFee === 0 && subtotal > 0 ? 'Free' : formatPrice(deliveryFee)} highlight={deliveryFee === 0 && subtotal > 0} />
                            {platformFee > 0 && <Row label='Platform fee' value={formatPrice(platformFee)} />}
                            {gstAmount > 0 && <Row label={`GST (${gstRate}%)`} value={formatPrice(gstAmount)} />}
                            {couponDiscount > 0 && <Row label='Coupon discount' value={`- ${formatPrice(couponDiscount)}`} highlight />}
                            {userDiscountAmt > 0 && <Row label={activeUserDiscount?.label || 'Discount'} value={`- ${formatPrice(userDiscountAmt)}`} highlight />}
                        </div>

                        {userDiscountAmt > 0 && (
                            <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '16px', backgroundColor: colors.softForest, color: colors.forest, fontSize: '13px', fontWeight: 600 }}>
                                First-order discount has been applied for this account.
                            </div>
                        )}

                        {settings?.freeDeliveryEnabled && deliveryFee > 0 && subtotal > 0 && (
                            <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '16px', backgroundColor: colors.blush, color: colors.orange, fontSize: '13px', fontWeight: 600 }}>
                                Add {formatPrice(Math.max(settings.freeDeliveryAbove - subtotal, 0))} more for free delivery.
                            </div>
                        )}

                        {settings && subtotal > 0 && subtotal < settings.minOrderValue && (
                            <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '16px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '13px', fontWeight: 600 }}>
                                Minimum order is {formatPrice(settings.minOrderValue)}. Add {formatPrice(settings.minOrderValue - subtotal)} more.
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid ' + colors.border, paddingTop: '16px', marginTop: '10px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700 }}>Total</span>
                            <span style={{ fontSize: '28px', fontWeight: 900 }}>{formatPrice(total)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={Boolean(settings && (!settings.orderingEnabled || subtotal < settings.minOrderValue))}
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                padding: '16px',
                                borderRadius: '18px',
                                border: 'none',
                                backgroundColor: settings && (!settings.orderingEnabled || subtotal < settings.minOrderValue) ? '#cbd5e1' : colors.forest,
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '15px',
                                cursor: 'pointer',
                            }}
                        >
                            Proceed to checkout
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
};

const Row = ({ label, value, highlight = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: highlight ? '#166534' : colors.ink, fontWeight: highlight ? 700 : 500 }}>
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default Cart;
