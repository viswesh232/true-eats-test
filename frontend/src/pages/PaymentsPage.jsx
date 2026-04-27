import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
    ArrowLeft, CreditCard, CheckCircle, XCircle, Clock,
    RefreshCw, IndianRupee, Search, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

/* ── helpers ── */
const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
const fmtFull = d => d ? `${fmtDate(d)}, ${fmtTime(d)}` : '—';

const STATUS = {
    Paid:    { bg: '#dcfce7', text: '#15803d', border: '#86efac', icon: CheckCircle,  label: 'Paid' },
    Pending: { bg: '#fef9c3', text: '#854d0e', border: '#fde047', icon: Clock,        label: 'Pending' },
    Failed:  { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', icon: XCircle,      label: 'Failed' },
    Refunded:{ bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd', icon: RefreshCw,    label: 'Refunded' },
};

/* ── Receipt Modal ── */
function ReceiptModal({ order, onClose }) {
    const ps = STATUS[order.paymentStatus] || STATUS.Pending;
    const Icon = ps.icon;
    const printRef = useRef();

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const w = window.open('', '_blank');
        w.document.write(`
            <html><head><title>Receipt ${order.orderId}</title>
            <style>
                * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
                body { padding:32px; color:#111; }
                .header { text-align:center; border-bottom:2px solid #eee; padding-bottom:20px; margin-bottom:20px; }
                .logo { font-size:24px; font-weight:900; color:#1a3a2a; }
                .status-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 16px; border-radius:999px; font-weight:700; font-size:14px; margin:12px 0; background:${ps.bg}; color:${ps.text}; border:1px solid ${ps.border}; }
                .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f3f4f6; font-size:13px; }
                .row .label { color:#6b7280; }
                .row .value { font-weight:600; color:#111; text-align:right; }
                .total-row { display:flex; justify-content:space-between; padding:12px 0; font-size:18px; font-weight:900; color:#1a3a2a; margin-top:8px; }
                .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin:16px 0 8px; }
                .items table { width:100%; border-collapse:collapse; }
                .items th { font-size:11px; text-align:left; color:#9ca3af; padding:6px 0; border-bottom:1px solid #e5e7eb; }
                .items td { padding:8px 0; font-size:13px; border-bottom:1px solid #f3f4f6; }
                .footer { text-align:center; color:#9ca3af; font-size:11px; margin-top:24px; }
                .razorpay { font-family:monospace; font-size:11px; color:#6b7280; word-break:break-all; }
            </style></head>
            <body>${content}</body></html>
        `);
        w.document.close();
        w.print();
    };

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
            <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'560px', maxHeight:'90vh', overflow:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.25)' }}>
                {/* Modal header */}
                <div style={{ padding:'20px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <h2 style={{ fontWeight:800, fontSize:'18px', color:'#1a3a2a' }}>Payment Receipt</h2>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <button onClick={handlePrint} style={{ display:'flex', alignItems:'center', gap:'6px', border:'none', background:'#1a3a2a', color:'#fff', borderRadius:'10px', padding:'8px 14px', cursor:'pointer', fontWeight:700, fontSize:'13px' }}>
                            <Printer size={15} /> Print
                        </button>
                        <button onClick={onClose} style={{ border:'1px solid #e5e7eb', background:'#fff', borderRadius:'10px', padding:'8px 14px', cursor:'pointer', fontWeight:700, fontSize:'13px', color:'#374151' }}>Close</button>
                    </div>
                </div>

                {/* Printable receipt */}
                <div ref={printRef} style={{ padding:'28px 28px 0' }}>
                    {/* Header */}
                    <div className="header" style={{ textAlign:'center', borderBottom:'2px solid #f3f4f6', paddingBottom:'20px', marginBottom:'20px' }}>
                        <div style={{ fontSize:'22px', fontWeight:900, color:'#1a3a2a' }}>🌿 True Eats</div>
                        <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'4px' }}>Payment Receipt</div>
                        <div style={{ marginTop:'12px', display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 16px', borderRadius:'999px', fontWeight:700, fontSize:'14px', background:ps.bg, color:ps.text, border:`1px solid ${ps.border}` }}>
                            <Icon size={14} /> {ps.label}
                        </div>
                    </div>

                    {/* Transaction details */}
                    <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:'10px' }}>Transaction Details</div>
                    {[
                        ['Order ID',       order.orderId],
                        ['Payment Status', ps.label],
                        ['Payment Method', order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'],
                        ['Order Placed',   fmtFull(order.createdAt)],
                        ['Payment Time',   order.paidAt ? fmtFull(order.paidAt) : 'Not yet paid'],
                        ['Razorpay Order', order.razorpayOrderId || '—'],
                        ['Razorpay Txn',   order.razorpayPaymentId || '—'],
                    ].map(([label, value]) => (
                        <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'9px 0', borderBottom:'1px solid #f9fafb' }}>
                            <span style={{ fontSize:'13px', color:'#6b7280', flexShrink:0, width:'140px' }}>{label}</span>
                            <span style={{ fontSize:'13px', fontWeight:600, color:'#111', textAlign:'right', wordBreak:'break-all', fontFamily: label.includes('Razorpay') ? 'monospace' : 'inherit' }}>{value}</span>
                        </div>
                    ))}

                    {/* Customer */}
                    <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', margin:'18px 0 10px' }}>Customer</div>
                    {[
                        ['Name',  `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || '—'],
                        ['Email', order.user?.email || '—'],
                        ['Phone', order.user?.phoneNumber || '—'],
                        ['Ship to', order.shippingAddress || '—'],
                    ].map(([label, value]) => (
                        <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'9px 0', borderBottom:'1px solid #f9fafb' }}>
                            <span style={{ fontSize:'13px', color:'#6b7280', flexShrink:0, width:'100px' }}>{label}</span>
                            <span style={{ fontSize:'13px', fontWeight:600, color:'#111', textAlign:'right' }}>{value}</span>
                        </div>
                    ))}

                    {/* Items */}
                    <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', margin:'18px 0 10px' }}>Items Ordered</div>
                    <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'4px' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #e5e7eb' }}>
                                {['Item', 'Qty', 'Unit Price', 'Total'].map(h => (
                                    <th key={h} style={{ fontSize:'11px', color:'#9ca3af', fontWeight:700, padding:'6px 0', textAlign: h === 'Item' ? 'left' : 'right' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(order.orderItems || []).map((item, i) => (
                                <tr key={i} style={{ borderBottom:'1px solid #f9fafb' }}>
                                    <td style={{ fontSize:'13px', padding:'9px 0', color:'#111', fontWeight:500 }}>{item.name}</td>
                                    <td style={{ fontSize:'13px', padding:'9px 0', textAlign:'right', color:'#6b7280' }}>{item.qty}</td>
                                    <td style={{ fontSize:'13px', padding:'9px 0', textAlign:'right', color:'#6b7280' }}>{fmt(item.price)}</td>
                                    <td style={{ fontSize:'13px', padding:'9px 0', textAlign:'right', fontWeight:700, color:'#111' }}>{fmt(item.price * item.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Price breakdown */}
                    <div style={{ background:'#f9fafb', borderRadius:'12px', padding:'16px', margin:'16px 0 0' }}>
                        {order.couponDiscount > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13px' }}>
                                <span style={{ color:'#6b7280' }}>Coupon ({order.couponCode})</span>
                                <span style={{ color:'#16a34a', fontWeight:700 }}>−{fmt(order.couponDiscount)}</span>
                            </div>
                        )}
                        {order.userDiscount > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13px' }}>
                                <span style={{ color:'#6b7280' }}>First-order discount</span>
                                <span style={{ color:'#16a34a', fontWeight:700 }}>−{fmt(order.userDiscount)}</span>
                            </div>
                        )}
                        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'10px', borderTop:'1px solid #e5e7eb' }}>
                            <span style={{ fontWeight:900, fontSize:'16px', color:'#1a3a2a' }}>Total Paid</span>
                            <span style={{ fontWeight:900, fontSize:'20px', color:'#1a3a2a' }}>{fmt(order.totalPrice)}</span>
                        </div>
                    </div>

                    <div style={{ textAlign:'center', color:'#d1d5db', fontSize:'11px', padding:'20px 0 4px' }}>
                        Thank you for shopping with True Eats 🌿 · Generated {fmtFull(new Date())}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function PaymentsPage() {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('all');
    const [search, setSearch]   = useState('');
    const [expanded, setExpanded] = useState(null);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try { const { data } = await API.get('/orders'); setOrders(data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const confirmPayment = async (id) => {
        if (!window.confirm('Mark this payment as PAID manually?')) return;
        try { await API.put(`/orders/${id}/confirm-payment`); load(); }
        catch { alert('Failed'); }
    };

    const filtered = orders.filter(o => {
        const matchStatus = filter === 'all' || o.paymentStatus === filter;
        const matchSearch = !search ||
            o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
            o.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const totalPaid    = orders.filter(o => o.paymentStatus === 'Paid').reduce((a, o) => a + o.totalPrice, 0);
    const countPaid    = orders.filter(o => o.paymentStatus === 'Paid').length;
    const countPending = orders.filter(o => o.paymentStatus === 'Pending').length;
    const countFailed  = orders.filter(o => o.paymentStatus === 'Failed').length;

    return (
        <div style={{ background:'#f8fafc', minHeight:'100vh', padding:'36px 40px', fontFamily:"'Inter',sans-serif" }}>
                {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'30px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ border:'none', background:'#fff', borderRadius:'12px', padding:'10px 12px', cursor:'pointer', display:'flex', boxShadow:'0 2px 8px rgba(0,0,0,0.07)' }}>
                    <ArrowLeft size={20} color="#1a3a2a" />
                </button>
                <div>
                    <h1 style={{ margin:0, fontWeight:900, fontSize:'22px', color:'#1a3a2a', display:'flex', alignItems:'center', gap:'10px' }}>
                        <CreditCard size={24} /> Payment Ledger
                    </h1>
                    <p style={{ margin:'3px 0 0', fontSize:'13px', color:'#64748b' }}>All transactions · payment receipts · real-time status</p>
                </div>
                <button onClick={load} title="Refresh" style={{ marginLeft:'auto', border:'none', background:'#fff', borderRadius:'10px', padding:'10px', cursor:'pointer', display:'flex', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                    <RefreshCw size={17} color="#1a3a2a" />
                </button>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'26px' }}>
                {[
                    { label:'Total Collected', value: fmt(totalPaid),   Icon: IndianRupee, bg:'#dcfce7', col:'#15803d' },
                    { label:'Paid',            value: countPaid,         Icon: CheckCircle, bg:'#dcfce7', col:'#15803d' },
                    { label:'Pending',         value: countPending,      Icon: Clock,       bg:'#fef9c3', col:'#854d0e' },
                    { label:'Failed',          value: countFailed,       Icon: XCircle,     bg:'#fee2e2', col:'#b91c1c' },
                ].map(({ label, value, Icon, bg, col }) => (
                    <div key={label} style={{ background:'#fff', borderRadius:'16px', padding:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.04)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                            <div style={{ fontSize:'11px', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
                            <div style={{ fontSize:'24px', fontWeight:900, color:'#1a3a2a', marginTop:'6px' }}>{value}</div>
                        </div>
                        <div style={{ background:bg, padding:'12px', borderRadius:'12px' }}>
                            <Icon size={22} color={col} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display:'flex', gap:'12px', marginBottom:'18px', alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ display:'flex', background:'#fff', borderRadius:'12px', padding:'4px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', gap:'3px' }}>
                    {['all','Paid','Pending','Failed','Refunded'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding:'8px 14px', borderRadius:'9px', border:'none', cursor:'pointer',
                            fontWeight:700, fontSize:'12.5px',
                            background: filter === f ? '#1a3a2a' : 'transparent',
                            color: filter === f ? '#fff' : '#64748b',
                            transition:'all 0.15s',
                        }}>{f === 'all' ? 'All' : f}</button>
                    ))}
                </div>
                <div style={{ flex:1, position:'relative', minWidth:'220px' }}>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search order ID, name, email or Razorpay ID…"
                        style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:'12px', border:'1px solid #e2e8f0', outline:'none', fontSize:'13.5px', boxSizing:'border-box', background:'#fff', fontFamily:'inherit' }}
                    />
                    <Search size={15} color="#94a3b8" style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)' }} />
                </div>
                <div style={{ fontSize:'12px', color:'#94a3b8', fontWeight:600 }}>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</div>
            </div>

            {/* Table */}
            <div style={{ background:'#fff', borderRadius:'18px', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                        <tr style={{ background:'#f8fafc', borderBottom:'2px solid #f1f5f9' }}>
                            {['','Order ID','Customer','Amount','Method','Payment Status','Payment Time','Razorpay ID','Action'].map(h => (
                                <th key={h} style={{ padding:'13px 14px', textAlign:'left', fontSize:'11px', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>Loading transactions…</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={9} style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>No transactions found</td></tr>
                        ) : filtered.map(order => {
                            const ps = STATUS[order.paymentStatus] || STATUS.Pending;
                            const Icon = ps.icon;
                            const isExpanded = expanded === order._id;
                            return (
                                <React.Fragment key={order._id}>
                                    <tr
                                        style={{ borderBottom:'1px solid #f8fafc', transition:'background 0.1s', cursor:'pointer' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                        onMouseLeave={e => e.currentTarget.style.background = ''}
                                    >
                                        {/* Expand toggle */}
                                        <td style={{ padding:'12px 10px 12px 14px' }}>
                                            <button onClick={() => setExpanded(isExpanded ? null : order._id)}
                                                style={{ border:'none', background:'#f1f5f9', borderRadius:'6px', width:'26px', height:'26px', display:'grid', placeItems:'center', cursor:'pointer' }}>
                                                {isExpanded ? <ChevronUp size={13} color="#64748b" /> : <ChevronDown size={13} color="#64748b" />}
                                            </button>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <span style={{ fontWeight:800, color:'#1a3a2a', fontSize:'13px' }}>{order.orderId}</span>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <div style={{ fontWeight:600, fontSize:'13px', color:'#1e293b' }}>{order.user?.firstName} {order.user?.lastName}</div>
                                            <div style={{ fontSize:'11.5px', color:'#94a3b8' }}>{order.user?.email}</div>
                                        </td>
                                        <td style={{ padding:'12px 14px', fontWeight:800, fontSize:'14px', color:'#1a3a2a' }}>{fmt(order.totalPrice)}</td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <span style={{ fontSize:'11.5px', fontWeight:700, padding:'3px 10px', borderRadius:'20px',
                                                background: order.paymentMethod === 'COD' ? '#fef9c3' : '#dbeafe',
                                                color: order.paymentMethod === 'COD' ? '#854d0e' : '#1d4ed8' }}>
                                                {order.paymentMethod === 'COD' ? '💵 COD' : '💳 Online'}
                                            </span>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'12px', fontWeight:700, padding:'5px 11px', borderRadius:'20px', background:ps.bg, color:ps.text, border:`1px solid ${ps.border}` }}>
                                                <Icon size={12} /> {ps.label}
                                            </span>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            {order.paidAt ? (
                                                <>
                                                    <div style={{ fontSize:'12.5px', fontWeight:600, color:'#1e293b' }}>{fmtDate(order.paidAt)}</div>
                                                    <div style={{ fontSize:'11.5px', color:'#16a34a', fontWeight:600 }}>{fmtTime(order.paidAt)}</div>
                                                </>
                                            ) : (
                                                <span style={{ fontSize:'12px', color:'#94a3b8' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            {order.razorpayPaymentId ? (
                                                <span style={{ fontFamily:'monospace', fontSize:'11px', color:'#475569', background:'#f1f5f9', padding:'3px 7px', borderRadius:'5px', display:'inline-block', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                    {order.razorpayPaymentId}
                                                </span>
                                            ) : <span style={{ fontSize:'12px', color:'#94a3b8' }}>—</span>}
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                                                <button onClick={() => navigate(`/admin/payment/${order._id}`)}
                                                    style={{ display:'flex', alignItems:'center', gap:'5px', padding:'7px 13px', background:'#1a3a2a', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:700, fontSize:'12px', whiteSpace:'nowrap' }}>
                                                    <ExternalLink size={13} /> View Payment
                                                </button>
                                                {order.paymentStatus === 'Pending' && order.paymentMethod !== 'COD' && (
                                                    <button onClick={() => confirmPayment(order._id)}
                                                        style={{ padding:'7px 11px', background:'#dcfce7', color:'#15803d', border:'1px solid #86efac', borderRadius:'8px', cursor:'pointer', fontWeight:700, fontSize:'12px', whiteSpace:'nowrap' }}>
                                                        ✓ Confirm
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded row — transaction detail */}
                                    {isExpanded && (
                                        <tr style={{ background:'#f8fafc' }}>
                                            <td colSpan={9} style={{ padding:'0 20px 18px 60px' }}>
                                                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', paddingTop:'16px' }}>
                                                    {[
                                                        ['Order Placed',      fmtFull(order.createdAt)],
                                                        ['Payment Time',      order.paidAt ? fmtFull(order.paidAt) : 'Not yet paid'],
                                                        ['Razorpay Order ID', order.razorpayOrderId || '—'],
                                                        ['Razorpay Txn ID',   order.razorpayPaymentId || '—'],
                                                        ['Coupon',            order.couponCode ? `${order.couponCode} (−${fmt(order.couponDiscount)})` : 'None'],
                                                        ['Ship to',           order.shippingAddress || '—'],
                                                    ].map(([label, value]) => (
                                                        <div key={label} style={{ background:'#fff', borderRadius:'10px', padding:'12px 14px', border:'1px solid #f1f5f9' }}>
                                                            <div style={{ fontSize:'10.5px', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'5px' }}>{label}</div>
                                                            <div style={{ fontSize:'12.5px', fontWeight:600, color:'#1e293b', wordBreak:'break-all', fontFamily: label.includes('Razorpay') ? 'monospace' : 'inherit' }}>{value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
