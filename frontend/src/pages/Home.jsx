import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
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

    const [quickAddProduct, setQuickAddProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [modalQty, setModalQty] = useState(1);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    const { cartItems, addToCart } = useContext(CartContext);

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
                const [{ data: menu }] = await Promise.all([
                    API.get('/products'),
                    API.get('/settings').catch(() => ({ data: {} })),
                ]);
                setProducts(menu || []);
                setCategories(['All', ...new Set((menu || []).map(p => p.category).filter(Boolean))]);
            } catch (e) { console.error(e); }
        })();
    }, []);

    useEffect(() => {
        if (BANNERS.length <= 1) return;
        const t = setInterval(() => setBannerIdx(s => (s + 1) % BANNERS.length), 5000);
        return () => clearInterval(t);
    }, []);

    const filtered = useMemo(() => products.filter(p => {
        const cat = activeCategory === 'All' || p.category === activeCategory;
        const src = `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase();
        return cat && (!searchTerm.trim() || src.includes(searchTerm.toLowerCase()));
    }), [activeCategory, products, searchTerm]);

    const backendUrl = API.defaults.baseURL.replace('/api', '');
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/uploads')) return `${backendUrl}${url}`;
        return url;
    };

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



            {/* BANNER */}
            <section className="banner">
                {BANNERS.map((b, i) => (
                    <div
                        key={i}
                        className="banner-img"
                        style={{
                            backgroundImage: `url(${b.image})`,
                            opacity: i === bannerIdx ? 1 : 0,
                            zIndex: i === bannerIdx ? 1 : 0
                        }}
                    />
                ))}
                <div className="banner-overlay" />
                {BANNERS.length > 1 && (
                    <>
                        <button className="banner-arrow banner-arrow-left" onClick={() => setBannerIdx(i => (i - 1 + BANNERS.length) % BANNERS.length)}><ChevronLeft size={20} /></button>
                        <button className="banner-arrow banner-arrow-right" onClick={() => setBannerIdx(i => (i + 1) % BANNERS.length)}><ChevronRight size={20} /></button>
                    </>
                )}
                <div className="banner-content">
                    <h1 className="banner-headline">{curBanner.title}</h1>
                    <p className="banner-sub">{curBanner.subtitle}</p>
                    <div className="banner-ctas">
                        <button className="cta-primary" onClick={scrollMenu}>Shop Now <ArrowRight size={18} /></button>
                        <button className="cta-ghost" onClick={() => navigate('/our-story')}>Our Story</button>
                    </div>
                    {BANNERS.length > 1 && (
                        <div className="banner-dots">
                            {BANNERS.map((_, i) => (
                                <button key={i} className={`hero-dot${i === bannerIdx ? ' active' : ''}`} onClick={() => setBannerIdx(i)} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="banner-stats">
                    {STATS.map(([num, label]) => (
                        <div key={label} className="hero-stat">
                            <span className="hero-stat-num">{num}</span>
                            <span className="hero-stat-label">{label}</span>
                        </div>
                    ))}
                </div>
            </section>



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
