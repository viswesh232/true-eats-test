import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Package, Home, ShoppingBag, XCircle, RefreshCw, Phone, Clock } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const c = { forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a', white: '#fff' };

const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

const CONFETTI_COLORS = ['#fcd5ce', '#1a4331', '#4a2c2a', '#f59e0b', '#10b981', '#a7f3d0'];
const createDots = () => Array.from({ length: 22 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 8,
}));

/* ── Success screen ─────────────────────────────────────────────────────── */
function SuccessScreen({ order, navigate }) {
    const [confetti, setConfetti] = useState(true);
    const [dots] = useState(createDots);

    useEffect(() => {
        const t = setTimeout(() => setConfetti(false), 3800);
        return () => clearTimeout(t);
    }, []);

    const isCOD = order?.paymentMethod === 'COD';

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #d1fae5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <style>{`
                @keyframes fall { 0% { transform:translateY(0) rotate(0deg); opacity:1; } 100% { transform:translateY(110vh) rotate(720deg); opacity:0; } }
                @keyframes popIn { 0% { transform:scale(0.4); opacity:0; } 70% { transform:scale(1.12); } 100% { transform:scale(1); opacity:1; } }
                @keyframes slideUp { from { transform:translateY(28px); opacity:0; } to { transform:translateY(0); opacity:1; } }
                @keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(5,150,105,0.4); } 50% { box-shadow:0 0 0 14px rgba(5,150,105,0); } }
            `}</style>

            {confetti && dots.map((d, i) => (
                <div key={i} style={{ position: 'fixed', left: d.left, top: '-20px', width: d.size, height: d.size, borderRadius: '50%', backgroundColor: d.color, pointerEvents: 'none', animation: `fall 3.5s ${d.delay} ease-in forwards` }} />
            ))}

            <div style={{ backgroundColor: c.white, borderRadius: '32px', padding: '48px 40px', maxWidth: '520px', width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(26,67,49,0.18)', animation: 'slideUp 0.5s ease both' }}>
                <button onClick={() => navigate('/')} style={{ position: 'absolute', top: '24px', left: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '999px', padding: '10px 14px', color: c.forest, cursor: 'pointer', fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}>
                    <ArrowLeft size={18} /> Home
                </button>

                {/* Check icon */}
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5, #6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: 'popIn 0.65s 0.1s ease both, pulse 2s 1s ease infinite' }}>
                    <CheckCircle size={52} color="#059669" strokeWidth={2.5} />
                </div>

                <h1 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: '28px', color: c.forest }}>
                    {isCOD ? '🎉 Order Placed!' : '🎉 Payment Successful!'}
                </h1>
                <p style={{ margin: '0 0 4px', color: '#475569', fontSize: '15px', fontWeight: 500 }}>
                    {isCOD
                        ? 'Your order is confirmed. Pay when it arrives at your doorstep!'
                        : 'Your payment is verified and your order is now confirmed.'}
                </p>
                <p style={{ margin: '0 0 30px', color: '#94a3b8', fontSize: '13px' }}>
                    You'll receive an email confirmation shortly.
                </p>

                {/* Order summary card */}
                {order && (
                    <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '20px 22px', marginBottom: '24px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Order ID</span>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: c.forest }}>{order.orderId}</span>
                        </div>

                        <div style={{ display: 'grid', gap: '10px' }}>
                            {[
                                ['Amount', fmt(order.totalPrice), '#1a3a2a', 900],
                                ['Payment', isCOD ? '💵 Cash on Delivery' : '✅ Paid Online', isCOD ? '#92400e' : '#059669', 700],
                                ['Status', isCOD ? 'Order Placed' : 'Payment Received', isCOD ? '#92400e' : '#059669', 700],
                                ...(order.paidAt ? [['Paid at', fmtDate(order.paidAt), '#475569', 600]] : []),
                                ...(order.razorpayPaymentId ? [['Txn ID', order.razorpayPaymentId, '#475569', 500]] : []),
                            ].map(([label, value, col, wt]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', flexShrink: 0 }}>{label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: wt, color: col, textAlign: 'right', wordBreak: 'break-all', fontFamily: label === 'Txn ID' ? 'monospace' : 'inherit' }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Items */}
                        {order.orderItems?.length > 0 && (
                            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Items ordered</div>
                                {order.orderItems.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                                        <span>{item.qty}× {item.name}</span>
                                        <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Delivery info */}
                <div style={{ background: c.forest, borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '14px', textAlign: 'left' }}>
                    <Clock size={22} color={c.peach} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '14px' }}>Delivery in 7–10 working days</p>
                        <p style={{ margin: '4px 0 0', color: 'rgba(252,213,206,0.8)', fontSize: '12.5px', lineHeight: 1.5 }}>
                            We'll carefully pack your order and ship it out. You can track the status and get courier updates in <strong>My Orders</strong>.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => navigate('/orders')} style={{ width: '100%', padding: '15px', background: c.forest, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
                        <ShoppingBag size={18} /> View My Orders
                    </button>
                    <button onClick={() => navigate('/')} style={{ width: '100%', padding: '15px', background: c.peach, color: c.chocolate, border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
                        <Home size={18} /> Continue Shopping
                    </button>
                </div>

                <p style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
                    Need help? <span onClick={() => navigate('/support')} style={{ color: c.forest, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Contact our support team</span>
                </p>
            </div>
        </div>
    );
}

/* ── Failed screen ──────────────────────────────────────────────────────── */
function FailedScreen({ reason, navigate }) {
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
            <style>{`
                @keyframes shakeIn { 0% { transform:scale(0.4) rotate(-8deg); opacity:0; } 60% { transform:scale(1.08) rotate(2deg); } 100% { transform:scale(1) rotate(0); opacity:1; } }
                @keyframes slideUp { from { transform:translateY(28px); opacity:0; } to { transform:translateY(0); opacity:1; } }
            `}</style>
            <div style={{ backgroundColor: c.white, borderRadius: '32px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(185,28,28,0.12)', animation: 'slideUp 0.5s ease both' }}>

                <div style={{ width: '92px', height: '92px', borderRadius: '50%', background: 'linear-gradient(135deg, #fee2e2, #fca5a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: 'shakeIn 0.6s 0.1s ease both' }}>
                    <XCircle size={50} color="#dc2626" strokeWidth={2.5} />
                </div>

                <h1 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: '26px', color: '#b91c1c' }}>Payment Failed</h1>
                <p style={{ margin: '0 0 6px', color: '#475569', fontSize: '15px' }}>
                    {reason || 'Your payment could not be completed.'}
                </p>
                <p style={{ margin: '0 0 30px', color: '#94a3b8', fontSize: '13px' }}>
                    No amount has been deducted from your account. Please try again.
                </p>

                <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', textAlign: 'left', border: '1px solid #fecaca' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13.5px', color: '#b91c1c' }}>Common reasons for failure:</p>
                    <ul style={{ margin: '10px 0 0', paddingLeft: '18px', fontSize: '13px', color: '#6b7280', lineHeight: 1.8 }}>
                        <li>Insufficient balance or card limit</li>
                        <li>Bank declined the transaction</li>
                        <li>OTP timeout or incorrect OTP</li>
                        <li>Network issue during payment</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '15px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
                        <RefreshCw size={18} /> Try Again
                    </button>
                    <button onClick={() => navigate('/')} style={{ width: '100%', padding: '15px', background: '#f8fafc', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
                        <Home size={17} /> Back to Home
                    </button>
                    <button onClick={() => navigate('/support')} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13.5px' }}>
                        <Phone size={15} /> Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main export ────────────────────────────────────────────────────────── */
const PaymentSuccess = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useContext(CartContext);

    const order = state?.order;
    const failed = state?.failed;
    const failReason = state?.reason;
    const shouldClearCart = state?.clearCart;

    useEffect(() => {
        if (shouldClearCart) {
            clearCart();
        }
    }, [shouldClearCart, clearCart]);

    if (failed) {
        return <FailedScreen reason={failReason} navigate={navigate} />;
    }

    return <SuccessScreen order={order} navigate={navigate} />;
};

export default PaymentSuccess;
