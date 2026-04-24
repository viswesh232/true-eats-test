import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
    ArrowLeft, ShoppingCart, Star, ChevronLeft, ChevronRight,
    Plus, Minus, Send, Trash2, CheckCircle, Tag
} from 'lucide-react';

const c = {
    forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a',
    white: '#fff', bg: '#fafafa', slate: '#64748b', light: '#f1f5f9',
};

// ── Star rating display ───────────────────────────────────────────────────────
const Stars = ({ value, size = 16, interactive = false, onChange }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(n => (
            <Star key={n}
                size={size}
                fill={n <= value ? '#f59e0b' : 'none'}
                color={n <= value ? '#f59e0b' : '#cbd5e1'}
                style={{ cursor: interactive ? 'pointer' : 'default', transition: '0.1s' }}
                onClick={() => interactive && onChange && onChange(n)}
            />
        ))}
    </div>
);

// ── Average rating helper ────────────────────────────────────────────────────
const avgRating = (reviews) => {
    if (!reviews.length) return 0;
    return (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
};

// ── Image carousel ───────────────────────────────────────────────────────────
const Carousel = ({ images }) => {
    const [idx, setIdx] = useState(0);
    const list = images?.length > 0 ? images : [];

    if (!list.length) return (
        <div style={{ height: '420px', backgroundColor: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: c.slate, fontSize: '14px' }}>No image available</span>
        </div>
    );

    return (
        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#000' }}>
            <img src={list[idx]} alt=""
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block', transition: '0.25s' }}
                onError={e => { e.target.src = 'https://placehold.co/600x420?text=No+Image'; }} />

            {list.length > 1 && (
                <>
                    <button onClick={() => setIdx(i => (i - 1 + list.length) % list.length)}
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setIdx(i => (i + 1) % list.length)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={20} />
                    </button>
                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.4)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        {list.map((img, i) => (
                            <img key={i} src={img} alt=""
                                onClick={() => setIdx(i)}
                                style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: i === idx ? '2px solid #fcd5ce' : '2px solid transparent', opacity: i === idx ? 1 : 0.6, transition: '0.15s' }} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────
const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToCart, cartItems } = useContext(CartContext);

    const [product, setProduct]   = useState(null);
    const [reviews, setReviews]   = useState([]);
    const [qty, setQty]           = useState(1);
    const [toast, setToast]       = useState('');
    const [loading, setLoading]   = useState(true);

    // Review form
    const [myRating, setMyRating]   = useState(0);
    const [myTitle, setMyTitle]     = useState('');
    const [myBody, setMyBody]       = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const cartQty = cartItems.find(x => x._id === id)?.qty || 0;

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const fetchReviews = async () => {
        try {
            const { data } = await API.get(`/reviews/${id}`);
            setReviews(data);
        } catch {
            console.error('Failed to fetch reviews');
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch single product — use the existing getProducts and filter
                // (we don't have a getProductById route, so fetch all and find)
                const { data } = await API.get('/products');
                const found = data.find(p => p._id === id);
                if (!found) { navigate('/'); return; }
                setProduct(found);
            } catch { navigate('/'); }
            setLoading(false);
        };
        const loadReviews = async () => {
            try {
                const { data } = await API.get(`/reviews/${id}`);
                setReviews(data);
            } catch {
                console.error('Failed to fetch reviews');
            }
        };

        load();
        loadReviews();
    }, [id, navigate]);

    const handleAddToCart = () => {
        for (let i = 0; i < qty; i++) addToCart(product);
        showToast(`${qty} × ${product.name} added to cart`);
    };

    const handleBuyNow = () => {
        for (let i = 0; i < qty; i++) addToCart(product);
        navigate('/cart');
    };

    const handleSubmitReview = async () => {
        if (!user) { navigate('/login'); return; }
        if (myRating === 0) { setReviewError('Please select a star rating'); return; }
        if (!myBody.trim()) { setReviewError('Please write your review'); return; }
        setReviewError('');
        setSubmitting(true);
        try {
            await API.post(`/reviews/${id}`, { rating: myRating, title: myTitle, body: myBody });
            setMyRating(0); setMyTitle(''); setMyBody('');
            fetchReviews();
            showToast('Review submitted! Thank you');
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review');
        }
        setSubmitting(false);
    };

    const alreadyReviewed = reviews.some(r => r.user === user?._id);
    const avg = avgRating(reviews);

    // Rating breakdown
    const breakdown = [5, 4, 3, 2, 1].map(n => ({
        n,
        count: reviews.filter(r => r.rating === n).length,
        pct: reviews.length ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : 0,
    }));

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.slate, fontFamily: 'sans-serif' }}>
            Loading...
        </div>
    );
    if (!product) return null;

    const inp = { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: c.white };

    return (
        <div style={{ backgroundColor: c.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: c.forest, color: '#fff', padding: '13px 26px', borderRadius: '50px', fontWeight: 'bold', zIndex: 999, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
                    <CheckCircle size={16} color={c.peach} /> {toast}
                </div>
            )}

            {/* Navbar */}
            <nav style={{ backgroundColor: 'rgba(252,213,206,0.95)', backdropFilter: 'blur(10px)', padding: '14px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(26,67,49,0.08)' }}>
                <button onClick={() => navigate('/')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: c.forest, fontWeight: '700', fontSize: '14px' }}>
                    <ArrowLeft size={18} /> Back to Menu
                </button>
                <div style={{ fontWeight: '900', fontSize: '18px', color: c.forest }}>TRUE EATS</div>
                <div onClick={() => navigate('/cart')} style={{ position: 'relative', cursor: 'pointer', backgroundColor: c.white, padding: '9px', borderRadius: '50%', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <ShoppingCart color={c.forest} size={20} />
                    {cartQty > 0 && (
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: c.chocolate, color: '#fff', borderRadius: '50%', padding: '2px 5px', fontSize: '10px', fontWeight: 'bold' }}>{cartQty}</span>
                    )}
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

                {/* ── PRODUCT SECTION ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '64px' }}>

                    {/* Left — images */}
                    <Carousel images={product.images} />

                    {/* Right — details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Category + availability */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ backgroundColor: c.peach, color: c.forest, fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Tag size={11} /> {product.category}
                            </span>
                            {!product.isAvailable && (
                                <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>
                                    Currently Unavailable
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: c.chocolate, lineHeight: '1.2' }}>{product.name}</h1>

                        {/* Rating summary */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Stars value={Math.round(avg)} size={18} />
                            <span style={{ fontWeight: '800', fontSize: '16px', color: c.chocolate }}>{avg}</span>
                            <span style={{ color: c.slate, fontSize: '14px' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                        </div>

                        {/* Price */}
                        <div style={{ fontSize: '36px', fontWeight: '900', color: c.forest }}>₹{product.price}</div>

                        {/* Description */}
                        <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>{product.description}</p>

                        {/* Quantity + add to cart */}
                        {product.isAvailable && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '2px solid #e2e8f0', borderRadius: '14px', padding: '8px 16px', backgroundColor: c.white }}>
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: c.forest, display: 'flex' }}>
                                            <Minus size={18} />
                                        </button>
                                        <span style={{ fontWeight: '900', fontSize: '18px', minWidth: '24px', textAlign: 'center' }}>{qty}</span>
                                        <button onClick={() => setQty(q => q + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: c.forest, display: 'flex' }}>
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <span style={{ color: c.slate, fontSize: '14px' }}>Total: <strong style={{ color: c.forest }}>₹{product.price * qty}</strong></span>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={handleAddToCart} style={{ flex: 1, padding: '15px', backgroundColor: c.white, color: c.forest, border: `2px solid ${c.forest}`, borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <ShoppingCart size={18} /> Add to Cart
                                    </button>
                                    <button onClick={handleBuyNow} style={{ flex: 1, padding: '15px', backgroundColor: c.chocolate, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                                        Buy It Now
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── REVIEWS SECTION ── */}
                <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '48px' }}>
                    <h2 style={{ margin: '0 0 32px', fontSize: '24px', fontWeight: '900', color: c.chocolate }}>
                        Customer Reviews
                        {reviews.length > 0 && <span style={{ marginLeft: '12px', fontSize: '16px', fontWeight: '600', color: c.slate }}>({reviews.length})</span>}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

                        {/* Rating summary + breakdown */}
                        <div>
                            {reviews.length > 0 ? (
                                <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '52px', fontWeight: '900', color: c.chocolate, lineHeight: 1 }}>{avg}</div>
                                            <Stars value={Math.round(avg)} size={20} />
                                            <div style={{ fontSize: '13px', color: c.slate, marginTop: '4px' }}>{reviews.length} reviews</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            {breakdown.map(b => (
                                                <div key={b.n} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '12px', color: c.slate, width: '10px', textAlign: 'right' }}>{b.n}</span>
                                                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                                    <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${b.pct}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px', transition: '0.4s' }} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: c.slate, width: '28px' }}>{b.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
                                    <Star size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                                    <p style={{ color: c.slate, margin: 0, fontSize: '15px', fontWeight: '600' }}>No reviews yet</p>
                                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '6px 0 0' }}>Be the first to share your experience</p>
                                </div>
                            )}

                            {/* Write a review */}
                            <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: c.forest }}>
                                    {alreadyReviewed ? 'You have already reviewed this product' : user ? 'Write a Review' : 'Login to write a review'}
                                </h3>

                                {!user ? (
                                    <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '12px', backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Login to Review
                                    </button>
                                ) : alreadyReviewed ? (
                                    <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '12px', fontSize: '14px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle size={16} /> Your review has been submitted
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '14px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: c.slate, marginBottom: '8px', textTransform: 'uppercase' }}>Your Rating *</label>
                                            <Stars value={myRating} size={28} interactive onChange={setMyRating} />
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <input value={myTitle} onChange={e => setMyTitle(e.target.value)}
                                                placeholder="Review title (optional)"
                                                style={inp} />
                                        </div>
                                        <div style={{ marginBottom: '14px' }}>
                                            <textarea value={myBody} onChange={e => setMyBody(e.target.value)}
                                                placeholder="Share your experience with this product..."
                                                rows={4} style={{ ...inp, resize: 'none' }} />
                                        </div>
                                        {reviewError && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px', fontWeight: '600' }}>⚠ {reviewError}</p>}
                                        <button onClick={handleSubmitReview} disabled={submitting} style={{ width: '100%', padding: '13px', backgroundColor: submitting ? '#94a3b8' : c.forest, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Send size={15} /> {submitting ? 'Submitting…' : 'Submit Review'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Review list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                            {reviews.length === 0 ? (
                                <p style={{ color: c.slate, textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>No reviews yet. Be the first!</p>
                            ) : reviews.map(r => (
                                <div key={r._id} style={{ backgroundColor: c.white, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: c.forest, color: c.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px', flexShrink: 0 }}>
                                                {r.userAvatar || r.userName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '14px', color: c.chocolate }}>{r.userName}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </div>
                                        </div>
                                        <Stars value={r.rating} size={14} />
                                    </div>
                                    {r.title && <div style={{ fontWeight: '700', color: c.chocolate, fontSize: '14px', marginBottom: '6px' }}>{r.title}</div>}
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>{r.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
