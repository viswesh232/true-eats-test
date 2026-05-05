import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { getImageUrl } from '../utils/helpers';
import heroImage from '../assets/hero.png';
import banner1 from '../assets/banner.png';
import logo from '../assets/logo.jpg'
import banner2 from '../assets/banner2.png'
import {
    ShoppingCart, Search, ArrowRight, UserRound, Minus, Plus,
    Camera, MessagesSquare, Play, Phone, MapPin,
    ChevronLeft, ChevronRight, Star, Clock, Truck, Shield, Menu, X,
} from 'lucide-react';
import './Home.css';

// ─── ADD YOUR BANNERS HERE ────────────────────────────────────────────────────
// Each banner needs: image, title, subtitle. Add as many as you like.
const BANNERS = [
    {
        image: banner1,
        title: 'Premium quality,\ndirect to your door.',
        subtitle: 'Handpicked food products packed fresh and delivered across India in 7–10 days.',
    },
    {
        image: banner2,
        title: 'Eat better,\nlive better.',
        subtitle: 'Clean ingredients, zero compromise. Every product is sourced and packed with care.',
    },
];

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const STATS = [['500+', 'Happy Customers'], ['20+', 'Products'], ['7–10 Days', 'Delivery'], ['4.9★', 'Rating']];
const PERKS = [
    [<Truck size={22} />, 'Pan-India Delivery', 'Delivered in 7–10 working days'],
    [<Shield size={22} />, 'Quality Assured', 'Every product hygiene checked'],
    [<Clock size={22} />, 'Long Shelf Life', 'Packed for freshness & safety'],
    [<Star size={22} />, 'Top Rated', '4.9 stars from customers'],
];

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState(['All']);
    const [activeCategory, setActiveCategory] = useState('All');

    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search') || '';
    const scrollToMenuParam = queryParams.get('scrollToMenu') === 'true';

    const [searchTerm, setSearchTerm] = useState(searchParam);
    const [toast, setToast] = useState('');
    const [bannerIdx, setBannerIdx] = useState(0);

    const [announcements, setAnnouncements] = useState([]);
    const [announcementIdx, setAnnouncementIdx] = useState(0);

    const [quickAddProduct, setQuickAddProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [modalQty, setModalQty] = useState(1);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    const { cartItems, addToCart } = useContext(CartContext);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const isMobile = windowWidth <= 480;
    const isTablet = windowWidth <= 768;

    useEffect(() => {
        if (searchParam) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchTerm(searchParam);
            document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchParam]);

    useEffect(() => {
        if (scrollToMenuParam) {
            // Slight delay ensures the DOM is fully painted if we just routed from another page
            setTimeout(() => {
                document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [scrollToMenuParam]);

    useEffect(() => {
        (async () => {
            try {
                const [{ data: menu }, { data: settings }] = await Promise.all([
                    API.get('/products'),
                    API.get('/settings').catch(() => ({ data: {} })),
                ]);
                setProducts(menu || []);
                setCategories(['All', ...new Set((menu || []).map(p => p.category).filter(Boolean))]);
                const anns = settings?.announcements?.filter(a => a.active) || [];
                setAnnouncements(anns);
            } catch (e) { console.error(e); }
        })();
    }, []);

    useEffect(() => {
        if (BANNERS.length <= 1) return;
        const t = setInterval(() => setBannerIdx(s => (s + 1) % BANNERS.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (announcements.length <= 1) return;
        const t = setInterval(() => setAnnouncementIdx(s => (s + 1) % announcements.length), 4000);
        return () => clearInterval(t);
    }, [announcements.length]);

    useEffect(() => {
        if (announcementIdx >= announcements.length) {
            setAnnouncementIdx(0);
        }
    }, [announcements.length, announcementIdx]);

    const filtered = useMemo(() => products.filter(p => {
        if (p.isHidden) return false;
        const cat = activeCategory === 'All' || p.category === activeCategory;
        const src = `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase();
        return cat && (!searchTerm.trim() || src.includes(searchTerm.toLowerCase()));
    }), [activeCategory, products, searchTerm]);

    const backendUrl = API.defaults.baseURL.replace('/api', '');

    const getQty = id => cartItems.find(i => i._id === id)?.qty || 0;
    const getImgs = p => {
        const a = (p.images || []).filter(Boolean).map(getImageUrl);
        return a.length ? a : (p.image ? [getImageUrl(p.image)] : []);
    };

    const openQuickAdd = (p) => {
        setQuickAddProduct(p);
        setSelectedVariant(p.weights?.[0] || null);
        setModalQty(1);
        setModalImageIdx(0);
    };

    const scrollMenu = () => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    const curBanner = BANNERS[bannerIdx] || BANNERS[0];

    return (
        <>
            {toast && <div className="toast">✓ {toast}</div>}

            {/* ANNOUNCEMENT */}
            {announcements.length > 0 && announcements[announcementIdx] && (
                <div className="announce" style={{ transition: 'all 0.3s ease-in-out' }}>
                    {announcements[announcementIdx].emoji} {announcements[announcementIdx].text}
                </div>
            )}

            {/* PHOTO SLIDER */}
            <div style={{ display: 'block', width: '100%', fontSize: 0 }}>
                <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>

                    {/* The photo */}
                    <img
                        src={BANNERS[bannerIdx].image}
                        alt="True Eats"
                        style={{ width: '100%', height: isMobile ? '220px' : isTablet ? '320px' : '480px', objectFit: 'cover', display: 'block', verticalAlign: 'top' }}
                    />

                    {/* Prev / Next arrows */}
                    {BANNERS.length > 1 && (<>
                        <button onClick={() => setBannerIdx(i => (i - 1 + BANNERS.length) % BANNERS.length)}
                            style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%', width: isMobile ? '28px' : '38px', height: isMobile ? '28px' : '38px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                            <ChevronLeft size={isMobile ? 14 : 18} />
                        </button>
                        <button onClick={() => setBannerIdx(i => (i + 1) % BANNERS.length)}
                            style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%', width: isMobile ? '28px' : '38px', height: isMobile ? '28px' : '38px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                            <ChevronRight size={isMobile ? 14 : 18} />
                        </button>
                    </>)}

                    {/* Shop Now button — bottom left */}
                    <button onClick={scrollMenu}
                        style={{ position: 'absolute', bottom: isMobile ? '10px' : '18px', left: isMobile ? '12px' : '24px', display: 'flex', alignItems: 'center', gap: '6px', background: '#a5c11f', color: '#1a3a2a', border: 'none', borderRadius: '6px', padding: isMobile ? '6px 12px' : '9px 20px', fontSize: isMobile ? '12px' : '14px', fontWeight: '800', fontFamily: 'Inter, sans-serif', cursor: 'pointer', zIndex: 2 }}>
                        Shop Now <ArrowRight size={isMobile ? 12 : 15} />
                    </button>

                    {/* Slide dots — bottom right */}
                    {BANNERS.length > 1 && (
                        <div style={{ position: 'absolute', bottom: isMobile ? '14px' : '22px', right: isMobile ? '12px' : '24px', display: 'flex', gap: '5px', zIndex: 2 }}>
                            {BANNERS.map((_, i) => (
                                <button key={i} onClick={() => setBannerIdx(i)}
                                    style={{ width: i === bannerIdx ? '18px' : '7px', height: '7px', borderRadius: '999px', border: 'none', background: i === bannerIdx ? '#a5c11f' : 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0, transition: 'all 0.25s' }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* STATS BAR — directly below, no gap */}
                <div style={{ display: 'flex', background: '#fcd5ce', borderTop: '3px solid #f9bbb0', fontSize: '14px' }}>
                    {STATS.map(([num, label]) => (
                        <div key={label} style={{ flex: 1, textAlign: 'center', padding: isMobile ? '10px 4px' : '14px 8px', borderRight: '1px solid rgba(74,44,42,0.12)' }}>
                            <span style={{ display: 'block', fontSize: isMobile ? '16px' : '20px', fontWeight: '900', color: '#1a4331' }}>{num}</span>
                            <span style={{ fontSize: isMobile ? '9px' : '10px', color: '#6b4c43', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                        </div>
                    ))}
                    <div style={{ borderRight: 'none' }} />
                </div>
            </div>



            {/* PERKS */}
            <div className="perks">
                {PERKS.map(([icon, title, desc]) => (
                    <div key={title} className="perk">
                        <div className="perk-icon">{icon}</div>
                        <div><div className="perk-title">{title}</div><div className="perk-desc">{desc}</div></div>
                    </div>
                ))}
            </div>

            {/* MENU */}
            <div className="section-full" id="menu-section">
                <div className="section-label">🛍️ Our Products</div>
                <h2 className="section-title">Browse &amp; Order</h2>
                <div className="cat-row">
                    {categories.map(cat => (
                        <button key={cat} className={`cat-pill${activeCategory === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="empty">Nothing matched your search.</div>
                ) : (
                    <div className="vcard-shelf">
                        {filtered.map(p => {
                            const imgs = getImgs(p);
                            const qty = getQty(p._id);
                            const rating = p.rating || null;
                            const reviewCount = p.reviewCount || p.numReviews || 0;
                            const stars = rating ? '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)) : null;
                            const origPrice = p.originalPrice || p.comparePrice || null;
                            const basePrice = p.weights?.[0]?.price || p.price || 0;
                            const discount = origPrice && origPrice > basePrice
                                ? Math.round((1 - basePrice / origPrice) * 100)
                                : null;
                            return (
                                <div key={p._id} className="vcard">
                                    {/* Image with hover-swap + badge + quick-add */}
                                    <div className="vcard-img-wrap">
                                        {imgs[0]
                                            ? <img src={imgs[0]} alt={p.name} className="vcard-img" onClick={() => navigate(`/product/${p.slug || p._id}`)} />
                                            : <div className="vcard-img img-placeholder">📦</div>
                                        }
                                        {imgs[1] && <img src={imgs[1]} alt={p.name} className="vcard-img-hover" onClick={() => navigate(`/product/${p.slug || p._id}`)} />}
                                        {p.category && <span className="vcard-badge">{p.category}</span>}
                                        {qty === 0 && (
                                            <button className="vcard-quick" onClick={() => openQuickAdd(p)}>Choose Options</button>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="vcard-body">
                                        <button className="vcard-name" onClick={() => navigate(`/product/${p.slug || p._id}`)}>{p.name}</button>
                                        {stars && (
                                            <div className="vcard-rating">
                                                <span className="vcard-stars">{stars}</span>
                                                <span className="vcard-rating-text">{rating} ({reviewCount})</span>
                                            </div>
                                        )}
                                        <div className="vcard-price-row">
                                            <span className="vcard-price">{fmt(basePrice)}</span>
                                            {origPrice && origPrice > basePrice && (
                                                <span className="vcard-price-orig">{fmt(origPrice)}</span>
                                            )}
                                            {discount && <span className="vcard-price-badge">{discount}% off</span>}
                                        </div>
                                        <button className="vcard-add" onClick={() => openQuickAdd(p)}>Choose Options</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* STORY */}
            <section className="story-band">
                <div className="story-inner">
                    <div>
                        <div className="section-label" style={{ color: '#a5c11f' }}>🌱 About True Eats</div>
                        <h2 className="section-title" style={{ color: '#fff' }}>Quality food products, delivered to you.</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, marginTop: '14px' }}>
                            True Eats curates and sells premium food products with a focus on quality, freshness, and transparency. Every item is carefully sourced, hygiene-checked, and packed to reach you in perfect condition.
                        </p>
                        <button className="cta-primary" style={{ marginTop: '28px' }} onClick={() => navigate('/our-story')}>
                            Read our story <ArrowRight size={16} />
                        </button>
                    </div>
                    <img src={logo} alt="True Eats products" className="story-img" />
                </div>
            </section>

            {/* QUICK ADD MODAL */}
            {quickAddProduct && (
                <div className="qa-overlay" onClick={() => setQuickAddProduct(null)}>
                    <div className="qa-modal" onClick={e => e.stopPropagation()}>
                        <button className="qa-close" onClick={() => setQuickAddProduct(null)}><X size={24} /></button>
                        <div className="qa-content">
                            {/* Left: Gallery */}
                            <div className="qa-gallery">
                                <img src={getImgs(quickAddProduct)[modalImageIdx] || '/placeholder.png'} alt={quickAddProduct.name} className="qa-main-img" />
                                {getImgs(quickAddProduct).length > 1 && (
                                    <div className="qa-thumbnails">
                                        {getImgs(quickAddProduct).map((img, i) => (
                                            <img key={i} src={img} className={i === modalImageIdx ? 'active' : ''} onClick={() => setModalImageIdx(i)} alt="thumbnail" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Details */}
                            <div className="qa-details">
                                <h2 className="qa-title">{quickAddProduct.name}</h2>
                                {quickAddProduct.description && (
                                    <p className="qa-desc">{quickAddProduct.description}</p>
                                )}
                                <div className="qa-price">
                                    {fmt(selectedVariant ? selectedVariant.price : quickAddProduct.price)}
                                    {selectedVariant?.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                                        <span className="qa-price-orig">{fmt(selectedVariant.originalPrice)}</span>
                                    )}
                                </div>

                                {quickAddProduct.weights && quickAddProduct.weights.length > 0 && (
                                    <div className="qa-variants">
                                        <label>Weight / Size</label>
                                        <div className="qa-pills">
                                            {quickAddProduct.weights.map(w => (
                                                <button
                                                    key={w.weight}
                                                    className={`qa-pill ${selectedVariant?.weight === w.weight ? 'active' : ''}`}
                                                    onClick={() => setSelectedVariant(w)}
                                                >
                                                    {w.weight}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="qa-qty-row">
                                    <label>Quantity</label>
                                    <div className="qa-qty-ctrl">
                                        <button onClick={() => setModalQty(Math.max(1, modalQty - 1))}><Minus size={16} /></button>
                                        <span>{modalQty}</span>
                                        <button onClick={() => setModalQty(modalQty + 1)}><Plus size={16} /></button>
                                    </div>
                                </div>

                                <div className="qa-actions">
                                    <button className="qa-add-btn" onClick={() => {
                                        addToCart({ ...quickAddProduct, weight: selectedVariant?.weight, price: selectedVariant?.price || quickAddProduct.price, originalPrice: selectedVariant?.originalPrice || quickAddProduct.originalPrice }, modalQty);
                                        setToast(`${modalQty}x ${quickAddProduct.name} added!`);
                                        setTimeout(() => setToast(''), 2000);
                                        setQuickAddProduct(null);
                                    }}>Add to Cart</button>

                                    <button className="qa-buy-btn" onClick={() => {
                                        addToCart({ ...quickAddProduct, weight: selectedVariant?.weight, price: selectedVariant?.price || quickAddProduct.price, originalPrice: selectedVariant?.originalPrice || quickAddProduct.originalPrice }, modalQty);
                                        navigate('/checkout');
                                    }}>Buy Now</button>
                                </div>

                                <button className="qa-view-full" onClick={() => navigate(`/product/${quickAddProduct.slug || quickAddProduct._id}`)}>
                                    View full details <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
