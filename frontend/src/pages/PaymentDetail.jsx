import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
    ArrowLeft, Printer, CheckCircle, XCircle, Clock,
    RefreshCw, CreditCard, Package, User, MapPin,
    Hash, Calendar, IndianRupee, ShieldCheck, AlertTriangle
} from 'lucide-react';

/* ── helpers ── */
const fmt  = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) : '—';
const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) : '—';
const fmtFull = d => d ? `${fmtDate(d)} at ${fmtTime(d)}` : '—';

const STATUS = {
    Paid:     { bg:'#dcfce7', text:'#15803d', border:'#86efac', Icon: CheckCircle,   label:'Payment Successful' },
    Pending:  { bg:'#fef9c3', text:'#854d0e', border:'#fde047', Icon: Clock,         label:'Payment Pending' },
    Failed:   { bg:'#fee2e2', text:'#b91c1c', border:'#fca5a5', Icon: XCircle,       label:'Payment Failed' },
    Refunded: { bg:'#ede9fe', text:'#6d28d9', border:'#c4b5fd', Icon: RefreshCw,     label:'Refunded' },
};

/* ── Info row component ── */
const InfoRow = ({ label, value, mono, highlight }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'11px 0', borderBottom:'1px solid #f1f5f9' }}>
        <span style={{ fontSize:'13px', color:'#64748b', flexShrink:0, width:'160px', fontWeight:500 }}>{label}</span>
        <span style={{
            fontSize:'13.5px', fontWeight: highlight ? 800 : 600, color: highlight ? '#1a3a2a' : '#1e293b',
            textAlign:'right', wordBreak:'break-all',
            fontFamily: mono ? 'monospace' : 'inherit',
            background: mono ? '#f8fafc' : 'transparent',
            padding: mono ? '2px 8px' : 0,
            borderRadius: mono ? '5px' : 0,
        }}>{value || '—'}</span>
    </div>
);

const Section = ({ title, icon: Icon, children }) => (
    <div style={{ background:'#fff', borderRadius:'16px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', marginBottom:'20px', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'16px 22px', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' }}>
            <div style={{ background:'#e8f4ee', padding:'8px', borderRadius:'10px' }}>
                <Icon size={17} color="#1a3a2a" />
            </div>
            <h3 style={{ margin:0, fontWeight:800, fontSize:'14px', color:'#1a3a2a', textTransform:'uppercase', letterSpacing:'0.05em' }}>{title}</h3>
        </div>
        <div style={{ padding:'4px 22px 8px' }}>
            {children}
        </div>
    </div>
);

export default function PaymentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const printRef = useRef();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await API.get(`/orders/${id}`);
                setOrder(data);
            } catch {
                setError('Could not load payment details.');
            }
            setLoading(false);
        })();
    }, [id]);

    // handlePrint is defined below after null guards (order must not be null)

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:"'Inter',sans-serif", color:'#64748b' }}>
            Loading payment details…
        </div>
    );

    if (error || !order) return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:"'Inter',sans-serif", gap:'16px' }}>
            <AlertTriangle size={40} color="#ef4444" />
            <p style={{ color:'#64748b' }}>{error || 'Order not found'}</p>
            <button onClick={() => navigate('/admin/payments')} style={{ border:'none', background:'#1a3a2a', color:'#fff', borderRadius:'10px', padding:'10px 20px', cursor:'pointer', fontWeight:700 }}>← Back</button>
        </div>
    );

    const ps = STATUS[order.paymentStatus] || STATUS.Pending;
    const PsIcon = ps.Icon;
    const subtotal = (order.orderItems || []).reduce((a, i) => a + i.price * i.qty, 0);
    const couponDiscount = Number(order.couponDiscount || 0);
    const userDiscount = Number(order.userDiscount || 0);
    const deliveryFee = Number(order.totalPrice || 0) - subtotal + couponDiscount + userDiscount;

    const handlePrint = () => {
        const pStatus = STATUS[order.paymentStatus] || STATUS.Pending;
        const style = `<style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; -webkit-print-color-adjust:exact; }
            body { padding:40px; color:#111; font-size:13px; }
            .print-header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1a3a2a; padding-bottom:20px; margin-bottom:24px; }
            .brand { font-size:26px; font-weight:900; color:#1a3a2a; }
            .brand-sub { font-size:12px; color:#64748b; margin-top:3px; }
            .receipt-id { font-size:20px; font-weight:900; color:#1a3a2a; }
            .status-hero { text-align:center; padding:20px; border-radius:12px; margin-bottom:24px; }
            .status-label { font-size:22px; font-weight:900; }
            .status-sub { font-size:13px; margin-top:6px; opacity:0.8; }
            .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px; }
            .section { break-inside:avoid; }
            .section-title { font-size:11px; font-weight:800; text-transform:uppercase; color:#1a3a2a; background:#f0fdf4; padding:8px 12px; border-left:3px solid #1a3a2a; margin-bottom:10px; }
            .row { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #f1f5f9; }
            .lbl { color:#64748b; font-size:12px; }
            .val { font-weight:600; font-size:12.5px; text-align:right; word-break:break-all; }
            .mono { font-family:monospace; background:#f8fafc; padding:1px 6px; border-radius:4px; font-size:11px; }
            table { width:100%; border-collapse:collapse; margin-top:8px; }
            th { font-size:11px; font-weight:700; color:#64748b; padding:8px 0; border-bottom:2px solid #e2e8f0; text-align:left; }
            th:not(:first-child) { text-align:right; }
            td { padding:9px 0; border-bottom:1px solid #f8fafc; font-size:12.5px; }
            td:not(:first-child) { text-align:right; }
            .total-row { display:flex; justify-content:space-between; padding:14px 0; border-top:2px solid #1a3a2a; margin-top:6px; }
            .total-label { font-size:16px; font-weight:900; color:#1a3a2a; }
            .total-value { font-size:22px; font-weight:900; color:#1a3a2a; }
            .footer { text-align:center; margin-top:32px; padding-top:16px; border-top:1px dashed #e2e8f0; color:#94a3b8; font-size:11px; }
        </style>`;
        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) return;
        w.document.write(`<html><head><title>Receipt - ${order.orderId}</title>${style}</head><body>
            <div class="print-header">
                <div><div class="brand">🌿 True Eats</div><div class="brand-sub">Payment Receipt · Official Document</div></div>
                <div style="text-align:right"><div style="font-size:14px;font-weight:700;color:#64748b">Receipt for Order</div><div class="receipt-id">${order.orderId}</div><div style="font-size:12px;color:#64748b;margin-top:4px">Generated: ${fmtFull(new Date())}</div></div>
            </div>
            <div class="status-hero" style="background:${pStatus.bg};color:${pStatus.text};border:1.5px solid ${pStatus.border}">
                <div class="status-label">${pStatus.label}</div>
                <div class="status-sub">${order.paidAt ? 'Paid on ' + fmtFull(order.paidAt) : 'Payment not yet completed'}</div>
            </div>
            <div class="grid2">
                <div class="section">
                    <div class="section-title">Transaction Details</div>
                    <div class="row"><span class="lbl">Order ID</span><span class="val">${order.orderId}</span></div>
                    <div class="row"><span class="lbl">Status</span><span class="val" style="color:${pStatus.text};font-weight:800">${pStatus.label}</span></div>
                    <div class="row"><span class="lbl">Method</span><span class="val">${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}</span></div>
                    <div class="row"><span class="lbl">Placed</span><span class="val">${fmtFull(order.createdAt)}</span></div>
                    <div class="row"><span class="lbl">Paid at</span><span class="val">${order.paidAt ? fmtFull(order.paidAt) : '—'}</span></div>
                    ${order.razorpayOrderId ? '<div class="row"><span class="lbl">Razorpay Order</span><span class="val mono">' + order.razorpayOrderId + '</span></div>' : ''}
                    ${order.razorpayPaymentId ? '<div class="row"><span class="lbl">Razorpay Txn</span><span class="val mono">' + order.razorpayPaymentId + '</span></div>' : ''}
                </div>
                <div class="section">
                    <div class="section-title">Customer Details</div>
                    <div class="row"><span class="lbl">Name</span><span class="val">${(order.user?.firstName || '') + ' ' + (order.user?.lastName || '')}</span></div>
                    <div class="row"><span class="lbl">Email</span><span class="val">${order.user?.email || '—'}</span></div>
                    <div class="row"><span class="lbl">Phone</span><span class="val">${order.user?.phoneNumber || '—'}</span></div>
                    <div class="row"><span class="lbl">Ship to</span><span class="val">${order.shippingAddress || '—'}</span></div>
                </div>
            </div>
            <div class="section">
                <div class="section-title">Items Ordered</div>
                <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
                ${(order.orderItems || []).map(item => '<tr><td>' + item.name + '</td><td>' + item.qty + '</td><td>' + fmt(item.price) + '</td><td style="font-weight:700">' + fmt(item.price * item.qty) + '</td></tr>').join('')}
                </tbody></table>
                ${deliveryFee > 0 ? '<div class="row" style="margin-top:8px"><span class="lbl">Delivery Fee</span><span class="val">' + fmt(deliveryFee) + '</span></div>' : ''}
                ${(order.couponDiscount > 0) ? '<div class="row" style="margin-top:8px"><span class="lbl">Coupon (' + order.couponCode + ')</span><span class="val" style="color:#16a34a">−' + fmt(order.couponDiscount) + '</span></div>' : ''}
                ${(order.userDiscount > 0) ? '<div class="row"><span class="lbl">First-order Discount</span><span class="val" style="color:#16a34a">−' + fmt(order.userDiscount) + '</span></div>' : ''}
                <div class="total-row"><span class="total-label">Total Paid</span><span class="total-value">${fmt(order.totalPrice)}</span></div>
            </div>
            <div class="footer">Official payment receipt from True Eats · support@trueeats.in · +91 81796 06489</div>
        </body></html>`);
        w.document.close();
        setTimeout(() => w.print(), 600);
    };

    return (
        <div style={{ background:'#f8fafc', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>
            {/* Top bar */}
            <div style={{ background:'#fff', borderBottom:'1px solid #f1f5f9', padding:'14px 36px', display:'flex', alignItems:'center', gap:'14px', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                <button onClick={() => navigate('/admin/payments')} style={{ border:'none', background:'#f1f5f9', borderRadius:'10px', padding:'9px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontWeight:700, fontSize:'13px', color:'#1a3a2a' }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div>
                    <h1 style={{ margin:0, fontWeight:900, fontSize:'18px', color:'#1a3a2a' }}>Payment Detail</h1>
                    <div style={{ fontSize:'12px', color:'#94a3b8', marginTop:'1px' }}>{order.orderId}</div>
                </div>
                <button onClick={handlePrint} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'8px', border:'none', background:'#1a3a2a', color:'#fff', borderRadius:'12px', padding:'11px 22px', cursor:'pointer', fontWeight:800, fontSize:'14px', boxShadow:'0 4px 14px rgba(26,58,42,0.3)' }}>
                    <Printer size={16} /> Print Receipt
                </button>
            </div>

            <div style={{ maxWidth:'860px', margin:'0 auto', padding:'32px 24px' }}>

                {/* Status hero */}
                <div style={{ background: ps.bg, border:`2px solid ${ps.border}`, borderRadius:'18px', padding:'28px 32px', display:'flex', alignItems:'center', gap:'20px', marginBottom:'24px' }}>
                    <div style={{ background:'#fff', borderRadius:'50%', width:'60px', height:'60px', display:'grid', placeItems:'center', boxShadow:`0 4px 16px ${ps.border}` }}>
                        <PsIcon size={28} color={ps.text} />
                    </div>
                    <div style={{ flex:1 }}>
                        <div style={{ fontSize:'22px', fontWeight:900, color:ps.text }}>{ps.label}</div>
                        <div style={{ fontSize:'13px', color:ps.text, opacity:0.75, marginTop:'4px' }}>
                            {order.paidAt ? `Paid on ${fmtFull(order.paidAt)}` : 'Payment has not been completed yet'}
                        </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:'13px', color:ps.text, opacity:0.7 }}>Total Amount</div>
                        <div style={{ fontSize:'32px', fontWeight:900, color:ps.text }}>{fmt(order.totalPrice)}</div>
                    </div>
                </div>

                {/* Transaction */}
                <Section title="Transaction Details" icon={CreditCard}>
                    <InfoRow label="Order ID"           value={order.orderId}         highlight />
                    <InfoRow label="Payment Status"     value={ps.label}              highlight />
                    <InfoRow label="Payment Method"     value={order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online via Razorpay'} />
                    <InfoRow label="Order Placed"       value={fmtFull(order.createdAt)} />
                    <InfoRow label="Payment Time"       value={order.paidAt ? fmtFull(order.paidAt) : 'Not yet paid'} />
                    <InfoRow label="Order Status"       value={order.status} />
                    {order.razorpayOrderId   && <InfoRow label="Razorpay Order ID"  value={order.razorpayOrderId}   mono />}
                    {order.razorpayPaymentId && <InfoRow label="Razorpay Payment ID" value={order.razorpayPaymentId} mono />}
                    {order.razorpaySignature && <InfoRow label="Razorpay Signature"  value={order.razorpaySignature.slice(0,32) + '…'} mono />}
                </Section>

                {/* Customer */}
                <Section title="Customer Details" icon={User}>
                    <InfoRow label="Full Name"   value={`${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim()} />
                    <InfoRow label="Email"       value={order.user?.email} />
                    <InfoRow label="Phone"       value={order.user?.phoneNumber} />
                    <InfoRow label="Ship to"     value={order.shippingAddress} />
                </Section>

                {/* Items */}
                <Section title="Items Ordered" icon={Package}>
                    <table style={{ width:'100%', borderCollapse:'collapse', marginTop:'4px' }}>
                        <thead>
                            <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                                {['Product', 'Qty', 'Unit Price', 'Line Total'].map((h, i) => (
                                    <th key={h} style={{ padding:'10px 0', fontSize:'11px', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(order.orderItems || []).map((item, i) => (
                                <tr key={i} style={{ borderBottom:'1px solid #f8fafc' }}>
                                    <td style={{ padding:'11px 0', fontSize:'13.5px', fontWeight:600, color:'#1e293b' }}>{item.name}</td>
                                    <td style={{ padding:'11px 0', textAlign:'right', color:'#64748b', fontSize:'13px' }}>{item.qty}</td>
                                    <td style={{ padding:'11px 0', textAlign:'right', color:'#64748b', fontSize:'13px' }}>{fmt(item.price)}</td>
                                    <td style={{ padding:'11px 0', textAlign:'right', fontWeight:800, fontSize:'14px', color:'#1a3a2a' }}>{fmt(item.price * item.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Price breakdown */}
                    <div style={{ background:'#f8fafc', borderRadius:'12px', padding:'16px 18px', marginTop:'16px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13.5px' }}>
                            <span style={{ color:'#64748b' }}>Subtotal</span>
                            <span style={{ fontWeight:600 }}>{fmt(subtotal)}</span>
                        </div>
                        {deliveryFee > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13.5px' }}>
                                <span style={{ color:'#64748b' }}>Delivery Fee</span>
                                <span style={{ fontWeight:600 }}>{fmt(deliveryFee)}</span>
                            </div>
                        )}
                        {order.couponDiscount > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13.5px' }}>
                                <span style={{ color:'#64748b' }}>Coupon ({order.couponCode})</span>
                                <span style={{ color:'#16a34a', fontWeight:700 }}>−{fmt(order.couponDiscount)}</span>
                            </div>
                        )}
                        {order.userDiscount > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13.5px' }}>
                                <span style={{ color:'#64748b' }}>First-order Discount</span>
                                <span style={{ color:'#16a34a', fontWeight:700 }}>−{fmt(order.userDiscount)}</span>
                            </div>
                        )}
                        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'12px', borderTop:'2px solid #e2e8f0' }}>
                            <span style={{ fontWeight:900, fontSize:'16px', color:'#1a3a2a' }}>Total Paid</span>
                            <span style={{ fontWeight:900, fontSize:'22px', color:'#1a3a2a' }}>{fmt(order.totalPrice)}</span>
                        </div>
                    </div>
                </Section>

                {/* Shipping */}
                {(order.trackingId || order.courierName) && (
                    <Section title="Shipping Info" icon={MapPin}>
                        {order.courierName && <InfoRow label="Courier" value={order.courierName} />}
                        {order.trackingId  && <InfoRow label="Tracking ID" value={order.trackingId} mono />}
                        {order.shippedAt   && <InfoRow label="Shipped On"  value={fmtFull(order.shippedAt)} />}
                        {order.customNote  && <InfoRow label="Note"        value={order.customNote} />}
                    </Section>
                )}
            </div>
        </div>
    );
}
