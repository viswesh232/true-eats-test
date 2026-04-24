import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, ExternalLink, Printer, Send, Tag, CheckCircle } from 'lucide-react';

const colors = {
    forest: '#234232',
    orange: '#dd7a2f',
    cream: '#fcfaf6',
    white: '#ffffff',
    ink: '#1f2937',
    muted: '#6b7280',
    border: '#e7e0d4',
    softForest: '#eef5ef',
};

const formatPrice = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(amount || 0);

const CustomerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [userOrders, setUserOrders] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [toast, setToast] = useState('');
    const [loading, setLoading] = useState(true);

    const [emailMsg, setEmailMsg] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    const [selectedCoupon, setSelectedCoupon] = useState('');
    const [couponMsg, setCouponMsg] = useState('');
    const [sendingCoupon, setSendingCoupon] = useState(false);

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ordersRes, settingsRes, usersRes] = await Promise.all([
                    API.get('/orders'),
                    API.get('/settings'),
                    API.get('/admin/users'),
                ]);

                const filteredOrders = ordersRes.data.filter((order) => order.user?._id === id);
                const selectedCustomer = usersRes.data.find((entry) => entry._id === id) || filteredOrders[0]?.user || null;
                const allCoupons = [...(settingsRes.data.coupons || []), ...(settingsRes.data.hiddenCoupons || [])];

                setUserOrders(filteredOrders);
                setCustomer(selectedCustomer);
                setCoupons(allCoupons);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const totalSpend = useMemo(
        () => userOrders.reduce((acc, order) => acc + order.totalPrice, 0),
        [userOrders]
    );

    const handleSendEmail = async () => {
        if (!emailMsg.trim()) {
            alert('Enter a message first.');
            return;
        }

        setSendingEmail(true);
        try {
            await API.post('/settings/send-mail', {
                userId: id,
                message: emailMsg,
                subject: 'Message from True Eats',
            });
            showToast(`Email sent to ${customer.email}`);
            setEmailMsg('');
        } catch (error) {
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        }
        setSendingEmail(false);
    };

    const handleSendCoupon = async () => {
        if (!selectedCoupon) {
            alert('Select a coupon to send.');
            return;
        }

        setSendingCoupon(true);
        try {
            await API.post('/settings/send-coupon', {
                userId: id,
                couponCode: selectedCoupon,
                message: couponMsg,
            });
            showToast(`Coupon ${selectedCoupon} sent to ${customer.email}`);
            setSelectedCoupon('');
            setCouponMsg('');
        } catch (error) {
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        }
        setSendingCoupon(false);
    };

    const handlePrint = (order) => {
        const popup = window.open('', '_blank');
        if (!popup) return;

        popup.document.write(`
            <html>
            <head>
                <title>Invoice</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
                    h1 { text-align: center; margin-bottom: 24px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; border-bottom: 1px solid #cbd5e1; text-align: left; }
                    .meta { margin-bottom: 20px; line-height: 1.7; }
                    .total { margin-top: 20px; text-align: right; font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>
                <h1>True Eats Invoice</h1>
                <div class="meta">
                    <div><strong>Order:</strong> #${order.orderId}</div>
                    <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
                    <div><strong>Customer:</strong> ${customer?.firstName || ''} ${customer?.lastName || ''}</div>
                    <div><strong>Phone:</strong> ${customer?.phoneNumber || '-'}</div>
                    <div><strong>Address:</strong> ${order.shippingAddress}</div>
                </div>
                <table>
                    <thead>
                        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map((item) => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.qty}</td>
                                <td>${formatPrice(item.price)}</td>
                                <td>${formatPrice(item.price * item.qty)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
                <div class="total">Total paid: ${formatPrice(order.totalPrice)}</div>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `);
        popup.document.close();
    };

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: colors.cream, color: colors.muted }}>Loading customer profile...</div>;
    }

    if (!customer) {
        return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: colors.cream, color: colors.muted }}>Customer not found.</div>;
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        outline: 'none',
        fontSize: '14px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        backgroundColor: '#f9fafb',
    };

    return (
        <div style={{ minHeight: '100vh', padding: '32px 20px 56px', backgroundColor: colors.cream, fontFamily: "'Inter', sans-serif", color: colors.ink }}>
            <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
                {toast && (
                    <div style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: colors.forest, color: '#fff', padding: '14px 24px', borderRadius: '999px', fontWeight: 700, zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 12px 30px rgba(35,66,50,0.24)' }}>
                        <CheckCircle size={16} color='#bbf7d0' /> {toast}
                    </div>
                )}

                <button onClick={() => navigate(-1)} style={{ border: '1px solid ' + colors.border, backgroundColor: colors.white, color: colors.ink, borderRadius: '999px', padding: '10px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
                    <div style={{ display: 'grid', gap: '18px' }}>
                        <div style={cardStyle}>
                            <div style={{ width: '74px', height: '74px', borderRadius: '50%', backgroundColor: colors.softForest, color: colors.forest, display: 'grid', placeItems: 'center', fontSize: '30px', fontWeight: 900, margin: '0 auto 14px' }}>
                                {customer.firstName?.[0] || '?'}
                            </div>
                            <h2 style={{ margin: '0 0 6px', textAlign: 'center', fontSize: '22px' }}>{customer.firstName} {customer.lastName}</h2>
                            <p style={{ margin: '0 0 18px', color: colors.muted, textAlign: 'center' }}>{userOrders.length} orders | {formatPrice(totalSpend)} total spend</p>
                            <DetailRow icon={<Mail size={14} />} label='Email' value={customer.email} />
                            <DetailRow icon={<Phone size={14} />} label='Phone' value={customer.phoneNumber || '-'} />
                            <DetailRow icon={<MapPin size={14} />} label='Address' value={userOrders[0]?.shippingAddress || '-'} />
                        </div>

                        <div style={cardStyle}>
                            <h3 style={sectionTitle}><Mail size={16} color={colors.orange} /> Send email</h3>
                            <textarea value={emailMsg} onChange={(e) => setEmailMsg(e.target.value)} placeholder='Type a message to send to this customer...' rows={4} style={{ ...inputStyle, resize: 'vertical', marginBottom: '12px' }} />
                            <button onClick={handleSendEmail} disabled={sendingEmail} style={primaryButton(colors.forest)}>
                                <Send size={14} /> {sendingEmail ? 'Sending...' : 'Send email'}
                            </button>
                        </div>

                        <div style={cardStyle}>
                            <h3 style={sectionTitle}><Tag size={16} color={colors.orange} /> Send coupon</h3>
                            <select value={selectedCoupon} onChange={(e) => setSelectedCoupon(e.target.value)} style={{ ...inputStyle, marginBottom: '10px', cursor: 'pointer' }}>
                                <option value=''>Select coupon to send</option>
                                {coupons.map((coupon) => (
                                    <option key={coupon._id || coupon.code} value={coupon.code}>
                                        {coupon.code} - {coupon.type === 'percent' ? `${coupon.value}%` : formatPrice(coupon.value)} off{coupon.minOrder ? ` (min ${formatPrice(coupon.minOrder)})` : ''}
                                    </option>
                                ))}
                            </select>
                            <textarea value={couponMsg} onChange={(e) => setCouponMsg(e.target.value)} placeholder='Optional personal message...' rows={3} style={{ ...inputStyle, resize: 'vertical', marginBottom: '12px' }} />
                            <button onClick={handleSendCoupon} disabled={sendingCoupon} style={primaryButton(colors.orange)}>
                                <Tag size={14} /> {sendingCoupon ? 'Sending...' : 'Send coupon'}
                            </button>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <h3 style={sectionTitle}><ShoppingBag size={18} color={colors.orange} /> Order history</h3>
                        {userOrders.length === 0 ? (
                            <p style={{ margin: 0, color: colors.muted, padding: '18px 0' }}>This customer has not placed any orders yet.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: colors.muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {['Order ID', 'Date', 'Status', 'Payment', 'Total', 'Actions'].map((heading) => (
                                                <th key={heading} style={{ padding: '12px 10px' }}>{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userOrders.map((order) => (
                                            <tr key={order._id} style={{ borderBottom: '1px solid #f1ede5' }}>
                                                <td style={{ padding: '14px 10px', fontWeight: 700 }}>#{order.orderId}</td>
                                                <td style={{ padding: '14px 10px', color: colors.muted }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '14px 10px' }}><span style={badgeStyle(order.status === 'Delivered' ? '#ecfdf5' : order.status === 'Cancelled' ? '#fef2f2' : '#fff7ed', order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#b91c1c' : '#c2410c')}>{order.status}</span></td>
                                                <td style={{ padding: '14px 10px' }}><span style={badgeStyle(order.paymentStatus === 'Paid' ? '#ecfdf5' : '#fffbeb', order.paymentStatus === 'Paid' ? '#166534' : '#a16207')}>{order.paymentStatus}</span></td>
                                                <td style={{ padding: '14px 10px', fontWeight: 700 }}>{formatPrice(order.totalPrice)}</td>
                                                <td style={{ padding: '14px 10px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handlePrint(order)} style={iconButton} title='Print invoice'><Printer size={14} /></button>
                                                        <button onClick={() => navigate(`/admin/order/view/${order._id}`)} style={iconButton} title='View order'><ExternalLink size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const cardStyle = {
    backgroundColor: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '24px',
};

const sectionTitle = {
    margin: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
};

const iconButton = {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    color: colors.forest,
};

const badgeStyle = (backgroundColor, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '999px',
    padding: '6px 10px',
    backgroundColor,
    color,
    fontWeight: 700,
    fontSize: '12px',
});

const primaryButton = (backgroundColor) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: '16px',
    border: 'none',
    backgroundColor,
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
});

const DetailRow = ({ icon, label, value }) => (
    <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.muted, fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>{icon} {label}</div>
        <div style={{ marginTop: '4px', fontWeight: 600, wordBreak: 'break-word' }}>{value}</div>
    </div>
);

export default CustomerProfile;
