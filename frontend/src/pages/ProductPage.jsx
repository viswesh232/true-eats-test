import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
    ArrowLeft, ShoppingCart, Star, ChevronLeft, ChevronRight,
    Plus, Minus, Send, CheckCircle, Tag, Heart, Clock, Share2, Camera
} from 'lucide-react';
import './ProductPage.css';
import './Home.css';

const c = {
    forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a',
    white: '#fff', bg: '#fafafa', slate: '#64748b', light: '#f1f5f9',
};

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const list = images?.length > 0 ? images : [];

    if (!list.length) return (
        <div style={{ height: '420px', backgroundColor: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: c.slate, fontSize: '14px' }}>No image available</span>
        </div>
    );

    return (
        <>
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#f8fafc', aspectRatio: '1/1', width: '100%' }}>
                
                <img src={list[idx]} alt=""
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        width: '100%', height: '100%', objectFit: 'contain', display: 'block', 
                        cursor: 'zoom-in', transition: '0.2s'
                    }}
                    onError={e => { e.target.src = 'https://placehold.co/600x500?text=No+Image'; }} />

            {list.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + list.length) % list.length); }}
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(255,255,255,0.8)', color: '#1a3a2a', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % list.length); }}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(255,255,255,0.8)', color: '#1a3a2a', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <ChevronRight size={20} />
                    </button>
                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: '10px', padding: '16px', position: 'absolute', bottom: 0, left: 0, right: 0, overflowX: 'auto', justifyContent: 'center' }}>
                        {list.map((img, i) => (
                            <img key={i} src={img} alt=""
                                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', border: i === idx ? `2px solid ${c.forest}` : '2px solid transparent', opacity: i === idx ? 1 : 0.7, transition: 'all 0.2s', flexShrink: 0, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                        ))}
                    </div>
                </>
            )}
            </div>

            {/* Lightbox Modal */}
            {isModalOpen && (
                <div 
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 10000,
                        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                        overflowY: 'auto', padding: '60px 20px', cursor: 'zoom-out'
                    }}
                >
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        style={{
                            position: 'fixed', top: '24px', right: '32px',
                            background: '#fff', border: 'none', borderRadius: '50%',
                            width: '44px', height: '44px', fontSize: '24px', fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#111', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            zIndex: 10001
                        }}
                    >✕</button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                        {list.map((img, i) => (
                            <img 
                                key={i} src={img} alt="" 
                                onClick={(e) => e.stopPropagation()} 
                                style={{
                                    width: '100%', height: 'auto', objectFit: 'contain',
                                    borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    cursor: 'default', backgroundColor: '#fff'
                                }} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

// ── Accordion ────────────────────────────────────────────────────────────────
const Accordion = ({ title, icon: Icon, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="accordion">
            <button className="accordion-header" onClick={() => setOpen(!open)}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {Icon && <Icon size={18} />}
                    <span style={{ fontWeight: '700' }}>{title}</span>
                </div>
                {open ? <Minus size={16} /> : <Plus size={16} />}
            </button>
            {open && <div className="accordion-body">{children}</div>}
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────
const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToCart, cartItems } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [qty, setQty] = useState(1);
    const [toast, setToast] = useState('');
    const [loading, setLoading] = useState(true);

    const [weight, setWeight] = useState('');

    // Review form
    const [myRating, setMyRating] = useState(0);
    const [myTitle, setMyTitle] = useState('');
    const [myBody, setMyBody] = useState('');
    const [myImages, setMyImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const totalCartQty = cartItems.reduce((a, i) => a + i.qty, 0);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const fetchReviews = async (productId) => {
        try {
            const { data } = await API.get(`/reviews/${productId}`);
            setReviews(data);
        } catch {
            console.error('Failed to fetch reviews');
        }
    };

    // SEO Meta Tags
    useEffect(() => {
        if (product) {
            document.title = `${product.name} | True Eats`;
            
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = product.description ? product.description.substring(0, 150) + '...' : 'Delicious food from True Eats.';
            
            let ogImage = document.querySelector('meta[property="og:image"]');
            if (!ogImage) {
                ogImage = document.createElement('meta');
                ogImage.setAttribute('property', 'og:image');
                document.head.appendChild(ogImage);
            }
            const mainImg = (product.images && product.images[0]) ? product.images[0] : product.image;
            if (mainImg) ogImage.content = mainImg;
            
            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (!ogTitle) {
                ogTitle = document.createElement('meta');
                ogTitle.setAttribute('property', 'og:title');
                document.head.appendChild(ogTitle);
            }
            ogTitle.content = product.name;
        }
        
        // Cleanup title on unmount
        return () => { document.title = 'True Eats'; };
    }, [product]);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await API.get('/products');
                setAllProducts(data);
                const found = data.find(p => p.slug === id || p._id === id);
                if (!found) { navigate('/'); return; }
                setProduct(found);
                if (found.weights?.length > 0) setWeight(found.weights[0].weight);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                await fetchReviews(found._id);
            } catch { navigate('/'); }
            setLoading(false);
        };

        load();
    }, [id, navigate]);

    const selectedWeightPrice = product?.weights?.find(w => w.weight === weight)?.price || product?.price || 0;

    const handleAddToCart = () => {
        for (let i = 0; i < qty; i++) addToCart({ ...product, price: selectedWeightPrice, weight: weight });
        showToast(`${qty} × ${product.name} (${weight}) added to cart`);
    };

    const handleBuyNow = () => {
        for (let i = 0; i < qty; i++) addToCart({ ...product, price: selectedWeightPrice, weight: weight });
        navigate('/cart');
    };

    const handleSubmitReview = async () => {
        if (!user) { navigate('/login'); return; }
        if (myRating === 0) { setReviewError('Please select a star rating'); return; }
        if (!myBody.trim()) { setReviewError('Please write your review'); return; }
        setReviewError('');
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('rating', myRating);
            fd.append('title', myTitle);
            fd.append('body', myBody);
            myImages.forEach(file => fd.append('images', file));

            await API.post(`/reviews/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMyRating(0); setMyTitle(''); setMyBody(''); setMyImages([]);
            fetchReviews(product._id);
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
    const origPrice = product.originalPrice || product.comparePrice || product.price * 1.2;

    return (
        <div className="product-page-container">

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: c.forest, color: '#fff', padding: '13px 26px', borderRadius: '50px', fontWeight: 'bold', zIndex: 999, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
                    <CheckCircle size={16} color={c.peach} /> {toast}
                </div>
            )}



            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

                {/* ── BACK BUTTON ── */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: c.forest, fontWeight: '700', fontSize: '14px',
                        marginBottom: '24px', padding: '8px 0'
                    }}
                >
                    <ArrowLeft size={18} /> Back
                </button>

                {/* ── PRODUCT SECTION ── */}
                <div className="product-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '64px' }}>

                    {/* Left — images */}
                    <div>
                        <Carousel images={product.images || (product.image ? [product.image] : [])} />
                    </div>

                    {/* Right — details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Category + availability */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ color: c.slate, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: '600' }}>
                                True Eats
                            </span>
                            {!product.isAvailable && (
                                <span style={{ backgroundColor: '#111', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>
                                    Sold out
                                </span>
                            )}
                            {origPrice > product.price && (
                                <span style={{ backgroundColor: '#111', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>
                                    Sale
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: c.chocolate, lineHeight: '1.2' }}>{product.name}</h1>

                        {/* Rating summary */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                            <Stars value={Math.round(avg)} size={18} />
                            <span style={{ fontWeight: '800', fontSize: '15px', color: c.chocolate }}>{avg}</span>
                            <span style={{ color: '#3b82f6', fontSize: '14px', textDecoration: 'underline' }}>{reviews.length} reviews</span>
                        </div>

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '4px 0' }}>
                            <span style={{ fontSize: '28px', fontWeight: '900', color: '#111' }}>{fmt(selectedWeightPrice)}</span>
                            {origPrice > selectedWeightPrice && (
                                <span style={{ fontSize: '18px', color: '#94a3b8', textDecoration: 'line-through' }}>{fmt(origPrice)}</span>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: c.slate, marginTop: '-12px' }}>Taxes included. Discounts and shipping calculated at checkout.</div>

                        {/* Description */}
                        <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.7', margin: '8px 0' }}>{product.description}</p>

                        <hr style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0', borderBottom: 'none' }} />

                        {/* Variants */}
                        {product.weights && product.weights.length > 0 && (
                            <fieldset className="variant-fieldset">
                                <legend className="variant-legend">Weight</legend>
                                <div className="pill-group">
                                    {product.weights.map(w => (
                                        <button key={w.weight} className={`variant-pill ${weight === w.weight ? 'active' : ''}`} onClick={() => setWeight(w.weight)}>{w.weight}</button>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                        {/* Quantity */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: c.chocolate, marginBottom: '8px' }}>Quantity</label>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', backgroundColor: c.bg }}>
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#111', display: 'flex' }}>
                                    <Minus size={16} />
                                </button>
                                <span style={{ fontWeight: '700', fontSize: '16px', minWidth: '32px', textAlign: 'center' }}>{qty}</span>
                                <button onClick={() => setQty(q => q + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#111', display: 'flex' }}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Badges Row */}
                        <div className="badges-row">
                            <img src="https://cdn.shopify.com/s/files/1/0612/9690/2243/files/Hygenic.png?v=1764496263" alt="Hygienic" />
                            <img src="https://cdn.shopify.com/s/files/1/0612/9690/2243/files/International_Shipping.png?v=1764496263" alt="International Shipping" />
                            <img src="https://cdn.shopify.com/s/files/1/0612/9690/2243/files/Halal.png?v=1764496264" alt="Halal" />
                            <img src="https://cdn.shopify.com/s/files/1/0612/9690/2243/files/Secured_Payment.png?v=1764496263" alt="Secured Payment" />
                        </div>

                        {/* Action Buttons */}
                        {product.isAvailable ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button onClick={handleAddToCart} style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', color: c.forest, border: `1.5px solid ${c.forest}`, borderRadius: '4px', fontWeight: '800', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Add to Cart
                                </button>
                                <button onClick={handleBuyNow} style={{ width: '100%', padding: '16px', backgroundColor: '#5a31f4', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundImage: 'linear-gradient(to right, #5a31f4, #8b5cf6)' }}>
                                    Buy It Now
                                </button>
                            </div>
                        ) : (
                            <button disabled style={{ width: '100%', padding: '16px', backgroundColor: '#e2e8f0', color: '#94a3b8', border: 'none', borderRadius: '4px', fontWeight: '800', cursor: 'not-allowed', fontSize: '15px', textTransform: 'uppercase' }}>
                                Sold Out
                            </button>
                        )}

                        {/* Accordions */}
                        <div style={{ marginTop: '24px' }}>
                            {product.ingredients && (
                                <Accordion title="Ingredients" icon={Heart}>
                                    <p style={{ margin: '0', whiteSpace: 'pre-line' }}>{product.ingredients}</p>
                                </Accordion>
                            )}
                            {product.shelfLife && (
                                <Accordion title="Shelf Life" icon={Clock}>
                                    <p style={{ margin: '0', whiteSpace: 'pre-line' }}>{product.shelfLife}</p>
                                </Accordion>
                            )}
                            {product.instructions && (
                                <Accordion title="Instructions" icon={Tag}>
                                    <p style={{ margin: '0', whiteSpace: 'pre-line' }}>{product.instructions}</p>
                                </Accordion>
                            )}
                        </div>

                        {/* Share */}
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link copied to clipboard!'); }} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: c.chocolate, cursor: 'pointer', marginTop: '16px', fontWeight: '600', fontSize: '14px' }}>
                            <Share2 size={16} /> Share
                        </button>
                    </div>
                </div>

                {/* ── REVIEWS SECTION ── */}
                <div id="reviews-section" style={{ borderTop: '2px solid #f1f5f9', paddingTop: '48px' }}>
                    <h2 style={{ margin: '0 0 32px', fontSize: '24px', fontWeight: '900', color: c.chocolate, textAlign: 'center' }}>
                        Customer Reviews
                    </h2>

                    <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

                        {/* Rating summary + breakdown */}
                        <div>
                            {reviews.length > 0 ? (
                                <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '52px', fontWeight: '900', color: '#111', lineHeight: 1 }}>{avg}</div>
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
                                <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '32px', textAlign: 'center', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                    <Star size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                                    <p style={{ color: c.slate, margin: 0, fontSize: '15px', fontWeight: '600' }}>No reviews yet</p>
                                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '6px 0 0' }}>Be the first to share your experience</p>
                                </div>
                            )}

                            {/* Write a review */}
                            <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
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

                                        <div style={{ marginBottom: '14px' }}>
                                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: c.forest, fontWeight: '700', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '10px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#e2e8f0'} onMouseLeave={e => e.currentTarget.style.backgroundColor='#f1f5f9'}>
                                                <Camera size={18} /> Upload Photos (Optional)
                                                <input type="file" multiple accept="image/*" onChange={(e) => setMyImages([...myImages, ...Array.from(e.target.files)])} style={{ display: 'none' }} />
                                            </label>
                                            {myImages.length > 0 && (
                                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                                                    {myImages.map((file, i) => (
                                                        <div key={i} style={{ position: 'relative' }}>
                                                            <img src={URL.createObjectURL(file)} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                                            <button onClick={() => setMyImages(myImages.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>✕</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={handleSubmitReview} disabled={submitting} style={{ width: '100%', padding: '13px', backgroundColor: submitting ? '#94a3b8' : '#111', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase' }}>
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
                                <div key={r._id} style={{ backgroundColor: c.white, borderRadius: '8px', padding: '20px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px', flexShrink: 0 }}>
                                                {r.userAvatar || r.userName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '14px', color: '#111' }}>{r.userName}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </div>
                                        </div>
                                        <Stars value={r.rating} size={14} />
                                    </div>
                                    {r.title && <div style={{ fontWeight: '700', color: '#111', fontSize: '14px', marginBottom: '6px' }}>{r.title}</div>}
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>{r.body}</p>
                                    {r.images && r.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto' }}>
                                            {r.images.map((imgUrl, i) => (
                                                <img key={i} src={imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`} alt="Review" style={{ height: '72px', width: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── YOU MIGHT ALSO LIKE SECTION ── */}
                {allProducts.length > 1 && (
                    <div className="new-arrivals">
                        <h2 style={{ textAlign: 'center' }}>You Might Also <strong>Like</strong></h2>
                        <div className="vcard-shelf">
                            {allProducts
                                .filter(p => p._id !== product._id && (!product.category || p.category === product.category))
                                .concat(allProducts.filter(p => p._id !== product._id && product.category && p.category !== product.category))
                                .slice(0, 4)
                                .map(p => {
                                const imgs = (p.images || []).filter(Boolean).length ? p.images : p.image ? [p.image] : [];
                                const q = cartItems.find(i => i._id === p._id)?.qty || 0;
                                const original = p.originalPrice || p.comparePrice || null;
                                const basePrice = p.weights?.[0]?.price || p.price || 0;
                                const discount = original && original > basePrice ? Math.round((1 - basePrice / original) * 100) : null;
                                return (
                                    <div key={p._id} className="vcard">
                                        <div className="vcard-img-wrap">
                                            {imgs[0]
                                                ? <img src={imgs[0]} alt={p.name} className="vcard-img" onClick={() => navigate(`/product/${p.slug || p._id}`)} />
                                                : <div className="vcard-img img-placeholder">📦</div>
                                            }
                                            {imgs[1] && <img src={imgs[1]} alt={p.name} className="vcard-img-hover" onClick={() => navigate(`/product/${p.slug || p._id}`)} />}
                                            {p.category && <span className="vcard-badge">{p.category}</span>}
                                            {q === 0 && (
                                                <button className="vcard-quick" onClick={(e) => { e.stopPropagation(); addToCart(p); showToast(`${p.name} added!`); }}>+ Quick Add</button>
                                            )}
                                        </div>
                                        <div className="vcard-body">
                                            <button className="vcard-name" onClick={() => navigate(`/product/${p.slug || p._id}`)}>{p.name}</button>
                                            <div className="vcard-price-row">
                                                <span className="vcard-price">{fmt(basePrice)}</span>
                                                {original && original > basePrice && (
                                                    <span className="vcard-price-orig">{fmt(original)}</span>
                                                )}
                                                {discount && <span className="vcard-price-badge">{discount}% off</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
