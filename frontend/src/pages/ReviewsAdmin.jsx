import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Star, Trash2, Search, RefreshCw, MessageSquare } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#fff', slate: '#64748b', light: '#f1f5f9', chocolate: '#4a2c2a' };

const Stars = ({ value }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
        {[1,2,3,4,5].map(n => (
            <Star key={n} size={13} fill={n <= value ? '#f59e0b' : 'none'} color={n <= value ? '#f59e0b' : '#cbd5e1'} />
        ))}
    </div>
);

const ReviewsAdmin = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [filter, setFilter]   = useState('all'); // all | 1 | 2 | 3 | 4 | 5
    const [toast, setToast]     = useState('');
    const navigate = useNavigate();

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/reviews/admin/all');
            setReviews(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        const loadReviews = async () => {
            setLoading(true);
            try {
                const { data } = await API.get('/reviews/admin/all');
                setReviews(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };

        loadReviews();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review? This cannot be undone.')) return;
        try {
            await API.delete(`/reviews/${id}`);
            setReviews(prev => prev.filter(r => r._id !== id));
            showToast('Review deleted');
        } catch { alert('Failed to delete review'); }
    };

    const filtered = reviews.filter(r => {
        const matchRating = filter === 'all' || r.rating === Number(filter);
        const matchSearch = !search ||
            r.userName?.toLowerCase().includes(search.toLowerCase()) ||
            r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.body?.toLowerCase().includes(search.toLowerCase());
        return matchRating && matchSearch;
    });

    // Stats
    const avg = reviews.length
        ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
        : '—';

    return (
        <div style={{ backgroundColor: c.light, minHeight: '100vh', padding: '40px', fontFamily: "'Inter', sans-serif" }}>

            {toast && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: c.forest, color: '#fff', padding: '13px 26px', borderRadius: '50px', fontWeight: 'bold', zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
                    ✓ {toast}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ border: 'none', background: c.white, borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <ArrowLeft size={20} color={c.forest} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontWeight: '900', color: c.forest, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={26} /> Customer Reviews
                    </h1>
                    <p style={{ margin: '4px 0 0', color: c.slate, fontSize: '13px' }}>Moderate reviews — delete spam or inappropriate content</p>
                </div>
                <button onClick={fetchReviews} style={{ marginLeft: 'auto', border: 'none', background: c.white, borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <RefreshCw size={18} color={c.forest} />
                </button>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Reviews',   value: reviews.length },
                    { label: 'Average Rating',  value: avg + ' ★' },
                    { label: '5 Star Reviews',  value: reviews.filter(r => r.rating === 5).length },
                    { label: '1-2 Star Reviews',value: reviews.filter(r => r.rating <= 2).length },
                ].map((s, i) => (
                    <div key={i} style={{ backgroundColor: c.white, borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <p style={{ margin: 0, fontSize: '11px', color: c.slate, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                        <h2 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: c.chocolate }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', backgroundColor: c.white, borderRadius: '12px', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', gap: '2px' }}>
                    {['all', '5', '4', '3', '2', '1'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '13px',
                            backgroundColor: filter === f ? c.forest : 'transparent',
                            color: filter === f ? '#fff' : c.slate,
                        }}>
                            {f === 'all' ? 'All' : `${f} ★`}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={15} color={c.slate} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by customer, product or review text..."
                        style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: c.white }} />
                </div>
            </div>

            {/* Reviews table / cards */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: c.slate }}>Loading reviews...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: c.slate, backgroundColor: c.white, borderRadius: '20px' }}>
                    No reviews found
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtered.map(r => (
                        <div key={r._id} style={{ backgroundColor: c.white, borderRadius: '18px', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                            {/* Product thumbnail */}
                            <img src={r.product?.images?.[0] || r.product?.image || ''}
                                alt={r.product?.name}
                                style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, backgroundColor: c.light }}
                                onError={e => { e.target.style.display = 'none'; }} />

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                    <div>
                                        <span style={{ fontWeight: '800', fontSize: '14px', color: c.forest }}>{r.product?.name || 'Unknown Product'}</span>
                                        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>·</span>
                                        <span style={{ fontSize: '13px', color: c.chocolate, fontWeight: '600' }}>{r.userName}</span>
                                        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>·</span>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <Stars value={r.rating} />
                                </div>
                                {r.title && <div style={{ fontWeight: '700', fontSize: '13px', color: c.chocolate, marginBottom: '4px' }}>{r.title}</div>}
                                <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>{r.body}</p>
                            </div>

                            {/* Delete */}
                            <button onClick={() => handleDelete(r._id)}
                                style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '9px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsAdmin;
