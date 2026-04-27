import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    Package, Truck, Clock, CheckCircle, XCircle,
    ArrowLeft, ShoppingBag, MessageSquareQuote,
    CreditCard, AlertTriangle, RefreshCw, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#ffffff', slate: '#64748b', chocolate: '#4a2c2a' };

/* ── Order status map (covers ALL backend enum values) ── */
const ORDER_STATUS = {
    'Pending Payment': { label: 'Pending Payment', icon: CreditCard,    bg: '#fef3c7', text: '#92400e' },
    'Placed':          { label: 'Order Placed',    icon: CheckCircle,   bg: '#dcfce7', text: '#15803d' },
    'Processing':      { label: 'Processing',      icon: Clock,         bg: '#dbeafe', text: '#1e40af' },
    'Preparing':       { label: 'Preparing',       icon: Package,       bg: '#ede9fe', text: '#5b21b6' },
    'Shipped':         { label: 'On the Way',      icon: Truck,         bg: '#cffafe', text: '#0e7490' },
    'Delivered':       { label: 'Delivered',       icon: CheckCircle,   bg: '#d1fae5', text: '#065f46' },
    'Cancelled':       { label: 'Cancelled',       icon: XCircle,       bg: '#fee2e2', text: '#991b1b' },
};

/* ── Payment status badge ── */
const PAY_STATUS = {
    Paid:     { label: '✅ Paid',      bg: '#dcfce7', text: '#15803d' },
    Pending:  { label: '⏳ Pending',   bg: '#fef9c3', text: '#854d0e' },
    Failed:   { label: '❌ Failed',    bg: '#fee2e2', text: '#b91c1c' },
    Refunded: { label: '↩ Refunded',  bg: '#ede9fe', text: '#6d28d9' },
};

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        API.get('/orders/myorders')
            .then(({ data }) => setOrders(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.slate, fontFamily: "'Inter', sans-serif" }}>
            Loading your orders…
        </div>
    );

    const filtered = filter === 'all' ? orders
        : filter === 'active' ? orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status))
        : filter === 'failed' ? orders.filter(o => o.paymentStatus === 'Failed' || o.status === 'Pending Payment')
        : orders.filter(o => o.status === filter);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await API.put(`/orders/${orderId}/cancel`);
            const { data } = await API.get('/orders/myorders');
            setOrders(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel order.');
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ backgroundColor: c.forest, padding: '20px 36px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/')} style={{ border: 'none', background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={17} /> Home
                </button>
                <h1 style={{ margin: 0, color: '#fff', fontWeight: 900, fontSize: '22px' }}>My Orders</h1>
                <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                    {orders.length} total
                </span>
            </div>

            {/* Filter tabs */}
            {orders.length > 0 && (
                <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '0 36px', display: 'flex', gap: '4px', overflowX: 'auto' }}>
                    {[
                        { key: 'all',     label: 'All Orders' },
                        { key: 'active',  label: 'Active' },
                        { key: 'Shipped', label: 'Shipped' },
                        { key: 'Delivered', label: 'Delivered' },
                        { key: 'failed',  label: '⚠ Failed / Pending' },
                        { key: 'Cancelled', label: 'Cancelled' },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{
                            border: 'none', background: 'transparent', padding: '14px 16px',
                            fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                            color: filter === f.key ? c.forest : c.slate,
                            borderBottom: filter === f.key ? `3px solid ${c.forest}` : '3px solid transparent',
                        }}>{f.label}</button>
                    ))}
                </div>
            )}

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <ShoppingBag size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: c.slate, fontWeight: 700, margin: '0 0 8px' }}>No orders yet</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px' }}>Start shopping to place your first order!</p>
                        <button onClick={() => navigate('/')} style={{ padding: '12px 28px', backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }}>
                            Browse Products
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: c.slate }}>
                        No orders in this category.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {filtered.map(order => {
                            const st = ORDER_STATUS[order.status] || ORDER_STATUS['Placed'];
                            const ps = PAY_STATUS[order.paymentStatus] || PAY_STATUS['Pending'];
                            const StatusIcon = st.icon;
                            const isFailedPayment = order.paymentStatus === 'Failed';
                            const isPendingPayment = order.status === 'Pending Payment';

                            return (
                                <div key={order._id} style={{
                                    backgroundColor: c.white, borderRadius: '24px', padding: '24px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                                    border: isFailedPayment || isPendingPayment ? '2px solid #fca5a5' : '1px solid #f1f5f9',
                                }}>
                                    {/* Failed/Pending payment alert banner */}
                                    {(isFailedPayment || isPendingPayment) && (
                                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#b91c1c' }}>
                                                    {isFailedPayment ? 'Payment Failed' : 'Payment Pending'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                                                    {isFailedPayment
                                                        ? 'Your payment was not completed. No amount was charged. You can try placing the order again.'
                                                        : 'Your payment is being processed or was not completed. Contact support if you were charged.'}
                                                </div>
                                            </div>
                                            <button onClick={() => navigate('/checkout')} style={{ marginLeft: 'auto', flexShrink: 0, padding: '7px 14px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <RotateCcw size={13} /> Try Again
                                            </button>
                                        </div>
                                    )}

                                    {/* Order header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <span style={{ fontSize: '11px', color: c.slate, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</span>
                                            <h3 style={{ margin: '3px 0 2px', color: c.forest, fontWeight: 900, fontSize: '18px' }}>{order.orderId}</h3>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{fmtDate(order.createdAt)}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                            {/* Order status badge */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '50px', backgroundColor: st.bg, color: st.text, fontSize: '12px', fontWeight: 800 }}>
                                                <StatusIcon size={13} />
                                                {st.label}
                                            </div>
                                            {/* Payment status badge */}
                                            <div style={{ padding: '4px 12px', borderRadius: '50px', backgroundColor: ps.bg, color: ps.text, fontSize: '11.5px', fontWeight: 700 }}>
                                                {ps.label} · {order.paymentMethod === 'COD' ? 'COD' : 'Online'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipped tracking box */}
                                    {order.status === 'Shipped' && (
                                        <div style={{ backgroundColor: '#f0fdf4', padding: '16px 20px', borderRadius: '16px', border: '1px solid #bbf7d0', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                <Truck size={17} color="#16a34a" />
                                                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '14px' }}>Your order is on the way!</span>
                                            </div>
                                            <p style={{ margin: '4px 0', fontSize: '13px', color: '#166534' }}>
                                                <b>Tracking ID:</b> {order.trackingId || 'Not provided yet'}
                                            </p>
                                            {order.courierName && (
                                                <p style={{ margin: '4px 0', fontSize: '13px', color: '#166534' }}>
                                                    <b>Courier:</b> {order.courierName}
                                                </p>
                                            )}
                                            {order.customNote && (
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', backgroundColor: '#fff', padding: '10px 14px', borderRadius: '12px' }}>
                                                    <MessageSquareQuote size={15} color={c.forest} />
                                                    <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: c.chocolate }}>{order.customNote}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Delivered info */}
                                    {order.status === 'Delivered' && (
                                        <div style={{ backgroundColor: '#f0fdf4', padding: '12px 18px', borderRadius: '14px', border: '1px solid #bbf7d0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <CheckCircle size={17} color="#16a34a" />
                                            <span style={{ fontWeight: 700, color: '#15803d', fontSize: '13.5px' }}>
                                                Order delivered successfully!
                                                {order.completedAt && ` · ${fmtDate(order.completedAt)}`}
                                            </span>
                                        </div>
                                    )}

                                    {/* Items */}
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                        {order.orderItems.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: c.chocolate }}>
                                                <span>{item.qty}× {item.name}</span>
                                                <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty)}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '2px dashed #f1f5f9', fontWeight: 900, fontSize: '17px' }}>
                                            <span style={{ color: c.forest }}>
                                                {order.paymentStatus === 'Paid' ? 'Total Paid' : order.paymentMethod === 'COD' ? 'Total (Pay on Delivery)' : 'Order Total'}
                                            </span>
                                            <span>{fmt(order.totalPrice)}</span>
                                        </div>
                                        {order.paidAt && (
                                            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, textAlign: 'right', marginTop: '4px' }}>
                                                Paid on {fmtDate(order.paidAt)}
                                            </div>
                                        )}
                                        
                                        {!['Delivered', 'Shipped', 'Cancelled'].includes(order.status) && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                                <button onClick={() => handleCancelOrder(order._id)} style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <XCircle size={15} /> Cancel Order
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;