import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Home, Star, ShoppingBag } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a', white: '#fff' };
const CONFETTI_COLORS = ['#fcd5ce', '#1a4331', '#4a2c2a', '#f59e0b', '#10b981'];
const createDots = () => Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 8,
}));

const PaymentSuccess = () => {
    const { state } = useLocation();
    const navigate  = useNavigate();
    const order     = state?.order;
    const [confetti, setConfetti] = useState(true);
    const [dots] = useState(createDots);

    useEffect(() => {
        const t = setTimeout(() => setConfetti(false), 3500);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: c.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' }}>

            {/* Confetti dots */}
            {confetti && dots.map((d, i) => (
                <div key={i} style={{
                    position: 'fixed', left: d.left, top: '-20px',
                    width: d.size, height: d.size, borderRadius: '50%',
                    backgroundColor: d.color, pointerEvents: 'none',
                    animation: `fall 3s ${d.delay} ease-in forwards`,
                }} />
            ))}
            <style>{`
                @keyframes fall {
                    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                @keyframes popIn {
                    0%   { transform: scale(0.5); opacity: 0; }
                    70%  { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <div style={{ backgroundColor: c.white, borderRadius: '32px', padding: '48px 40px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(26,67,49,0.18)', animation: 'slideUp 0.5s ease both' }}>

                {/* Animated check */}
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'popIn 0.6s 0.1s ease both' }}>
                    <CheckCircle size={50} color="#059669" strokeWidth={2.5} />
                </div>

                <h1 style={{ margin: '0 0 8px', fontWeight: '900', fontSize: '28px', color: c.forest }}>
                    {order?.paymentMethod === 'COD' ? '🎉 Order Placed!' : '🎉 Payment Successful!'}
                </h1>
                <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: '15px' }}>
                    {order?.paymentMethod === 'COD'
                        ? 'Your order is confirmed. Pay when it arrives!'
                        : 'Your payment went through and your order is confirmed.'}
                </p>
                <p style={{ margin: '0 0 28px', color: '#94a3b8', fontSize: '13px' }}>
                    We'll start preparing it right away 🍪
                </p>

                {/* Order card */}
                {order && (
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '18px', padding: '20px 24px', marginBottom: '28px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</span>
                            <span style={{ fontSize: '15px', fontWeight: '900', color: c.forest }}>#{order.orderId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Amount Paid</span>
                            <span style={{ fontSize: '15px', fontWeight: '900', color: c.chocolate }}>₹{order.totalPrice}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Payment</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: order.paymentMethod === 'COD' ? '#f59e0b' : '#059669' }}>
                                {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '✅ Paid Online'}
                            </span>
                        </div>
                        {order.orderItems?.length > 0 && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                                {order.orderItems.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                                        <span>{item.qty}× {item.name}</span>
                                        <span>₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Delivery note */}
                <div style={{ backgroundColor: c.forest, borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <Package size={22} color={c.peach} />
                    <div>
                        <p style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '13px' }}>What happens next?</p>
                        <p style={{ margin: '3px 0 0', color: 'rgba(252,213,206,0.8)', fontSize: '12px', lineHeight: '1.5' }}>
                            Our team will pack your order and update you via email. You can track status in My Orders.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => navigate('/orders')} style={{ width: '100%', padding: '15px', backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
                        <ShoppingBag size={18} /> Track My Order
                    </button>
                    <button onClick={() => navigate('/')} style={{ width: '100%', padding: '15px', backgroundColor: c.peach, color: c.chocolate, border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
                        <Home size={18} /> Continue Shopping
                    </button>
                </div>

                <p style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
                    Questions? <span onClick={() => navigate('/support')} style={{ color: c.forest, fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>Contact our support team</span>
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
