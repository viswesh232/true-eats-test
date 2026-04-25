import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import heroImage from '../assets/hero.png';

// ─── ADD YOUR BANNERS HERE ────────────────────────────────────────────────────
// Each banner needs: image, title, subtitle. Add as many as you like.
const BANNERS = [
    {
        image: heroImage,
        title: 'Premium quality,\ndirect to your door.',
        subtitle: 'Handpicked food products packed fresh and delivered across India in 7–10 days.',
    },
    {
        image: heroImage,
        title: 'Eat better,\nlive better.',
        subtitle: 'Clean ingredients, zero compromise. Every product is sourced and packed with care.',
    },
    // Add more banners by duplicating the block above ↑
];
import {
    ShoppingCart, Search, ArrowRight, UserRound, Minus, Plus,
    Camera, MessagesSquare, Play, Phone, MapPin,
    ChevronLeft, ChevronRight, Star, Clock, Truck, Shield, Menu, X,
} from 'lucide-react';
import './Home.css';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const STATS = [['500+', 'Happy Customers'], ['20+', 'Products'], ['7–10 Days', 'Delivery'], ['4.9★', 'Rating']];
const PERKS = [
    [<Truck size={22} />, 'Pan-India Delivery', 'Delivered in 7–10 working days'],
    [<Shield size={22} />, 'Quality Assured', 'Every product hygiene checked'],
    [<Clock size={22} />, 'Long Shelf Life', 'Packed for freshness & safety'],
    [<Star size={22} />, 'Top Rated', '4.9 stars from customers'],
];

export default function Home() {
    const [products, setProducts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState('');
    const [bannerIdx, setBannerIdx] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [imgIdx, setImgIdx] = useState({});

    const { user, logout } = useContext(AuthContext);
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const [{ data: menu }, settingsRes] = await Promise.all([
                    API.get('/products'),
                    API.get('/settings').catch(() => ({ data: {} })),
                ]);
                const s = settingsRes?.data || {};
                setProducts(menu || []);
                setCategories(['All', ...new Set((menu || []).map(p => p.category).filter(Boolean))]);
                setAnnouncements((s.announcements || []).filter(a => a.active && a.text?.trim()));
            } catch (e) { console.error(e); }
        })();
    }, []);

    useEffect(() => {
        if (BANNERS.length <= 1) return;
        const t = setInterval(() => setBannerIdx(s => (s + 1) % BANNERS.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const filtered = useMemo(() => products.filter(p => {
        const cat = activeCategory === 'All' || p.category === activeCategory;
        const src = `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase();
        return cat && (!searchTerm.trim() || src.includes(searchTerm.toLowerCase()));
    }), [activeCategory, products, searchTerm]);


    const footerCats = useMemo(() => categories.filter(c => c !== 'All').slice(0, 6), [categories]);
    const totalQty = cartItems.reduce((a, i) => a + i.qty, 0);
    const getQty = id => cartItems.find(i => i._id === id)?.qty || 0;
    const getImgs = p => { const a = (p.images || []).filter(Boolean); return a.length ? a : p.image ? [p.image] : []; };
    const setImg = (id, i) => setImgIdx(prev => ({ ...prev, [id]: i }));

    const handleAdd = (product) => {
        addToCart(product);
        setToast(`${product.name} added!`);
        setTimeout(() => setToast(''), 2000);
    };

    const goProfile = () => navigate(!user ? '/login' : user.role === 'admin' ? '/dashboard' : '/profile');
    const scrollMenu = () => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    const curBanner = BANNERS[bannerIdx] || BANNERS[0];

    return (
        <>
            {toast && <div className="toast">✓ {toast}</div>}

            {/* NAV */}
            <header className={`nav${scrolled ? ' scrolled' : ''}`}>
                {announcements[0] && !scrolled && <div className="announce">{announcements[0].text}</div>}
                <div className="nav-bar">
                    <button className="nav-logo" onClick={() => navigate('/')}>True<span>Eats</span></button>
                    <nav className="nav-links">
                        <button onClick={() => navigate('/')}>Home</button>
                        <button onClick={() => navigate('/our-story')}>Our Story</button>
                        <button onClick={scrollMenu}>Menu</button>
                        <button onClick={() => navigate('/contact')}>Contact</button>
                        {user && <button onClick={() => navigate('/orders')}>My Orders</button>}
                    </nav>
                    <div className="nav-actions">
                        <div className="search-box">
                            <Search size={15} color="#66756d" />
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search menu…" />
                        </div>
                        <button className="btn btn-ghost" onClick={goProfile}>
                            <UserRound size={16} />{user ? (user.role === 'admin' ? 'Dashboard' : 'Profile') : 'Login'}
                        </button>
                        {user && <button className="btn btn-ghost" onClick={() => { logout(); navigate('/'); }}>Logout</button>}
                        <button className="btn btn-primary" onClick={() => navigate('/cart')}>
                            <ShoppingCart size={16} />{totalQty > 0 ? `Cart (${totalQty})` : 'Cart'}
                        </button>
                        <button className="hamburger" onClick={() => setMobileOpen(o => !o)}>
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
                {mobileOpen && (
                    <div className="mobile-menu">
                        {[['/', 'Home'], ['/our-story', 'Our Story'], ['/contact', 'Contact'], ['/orders', 'My Orders']].map(([path, label]) => (
                            <button key={path} onClick={() => { navigate(path); setMobileOpen(false); }}>{label}</button>
                        ))}
                        {user && <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}>Logout</button>}
                    </div>
                )}
            </header>

            {/* BANNER */}
            <section className="banner">
                <div className="banner-img" style={{ backgroundImage: `url(${curBanner.image})` }} />
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
                            const discount = origPrice && origPrice > p.price
                                ? Math.round((1 - p.price / origPrice) * 100)
                                : null;
                            return (
                                <div key={p._id} className="vcard">
                                    {/* Image with hover-swap + badge + quick-add */}
                                    <div className="vcard-img-wrap">
                                        {imgs[0]
                                            ? <img src={imgs[0]} alt={p.name} className="vcard-img" onClick={() => navigate(`/product/${p._id}`)} />
                                            : <div className="vcard-img img-placeholder">📦</div>
                                        }
                                        {imgs[1] && <img src={imgs[1]} alt={p.name} className="vcard-img-hover" onClick={() => navigate(`/product/${p._id}`)} />}
                                        {p.category && <span className="vcard-badge">{p.category}</span>}
                                        {qty === 0 && (
                                            <button className="vcard-quick" onClick={() => handleAdd(p)}>+ Quick Add</button>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="vcard-body">
                                        <button className="vcard-name" onClick={() => navigate(`/product/${p._id}`)}>{p.name}</button>
                                        {stars && (
                                            <div className="vcard-rating">
                                                <span className="vcard-stars">{stars}</span>
                                                <span className="vcard-rating-text">{rating} ({reviewCount})</span>
                                            </div>
                                        )}
                                        <div className="vcard-price-row">
                                            <span className="vcard-price">{fmt(p.price)}</span>
                                            {origPrice && origPrice > p.price && (
                                                <span className="vcard-price-orig">{fmt(origPrice)}</span>
                                            )}
                                            {discount && <span className="vcard-price-badge">{discount}% off</span>}
                                        </div>
                                        {qty > 0 ? (
                                            <div className="vcard-qty">
                                                <button onClick={() => removeFromCart(p)}>−</button>
                                                <span>{qty}</span>
                                                <button onClick={() => addToCart(p)}>+</button>
                                            </div>
                                        ) : (
                                            <button className="vcard-add" onClick={() => handleAdd(p)}>Add to Cart</button>
                                        )}
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
                    <img src={heroImage} alt="True Eats products" className="story-img" />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-inner">
                    <div>
                        <div className="nav-logo" style={{ fontSize: '28px', marginBottom: '14px', cursor: 'default' }}>True<span>Eats</span></div>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.8, maxWidth: '220px' }}>
                            Fresh meals, healthy snacks, and better food experiences.
                        </p>
                        <div className="social-row">
                            {[Camera, MessagesSquare, Play].map((Icon, i) => <div key={i} className="social-btn"><Icon size={17} /></div>)}
                        </div>
                    </div>
                    <div>
                        <div className="footer-heading">Quick Links</div>
                        <div className="footer-links">
                            <button onClick={() => navigate('/')}>Home</button>
                            {footerCats.map(c => <button key={c} onClick={() => { setActiveCategory(c); scrollMenu(); }}>{c}</button>)}
                            <button onClick={() => navigate('/contact')}>Contact</button>
                        </div>
                    </div>
                    <div>
                        <div className="footer-heading">Support</div>
                        <div className="footer-links">
                            <button onClick={() => navigate('/support')}>Support</button>
                            <button onClick={() => navigate('/contact')}>Shipping Policy</button>
                            <button onClick={() => navigate('/contact')}>Refund Policy</button>
                            <button onClick={() => navigate('/contact')}>Privacy Policy</button>
                        </div>
                    </div>
                    <div>
                        <div className="footer-heading">Contact</div>
                        <div style={{ display: 'grid', gap: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}><Phone size={15} style={{ marginTop: 2, flexShrink: 0 }} /><span>+91 81796 06489</span></div>
                            <div style={{ display: 'flex', gap: '10px' }}><MapPin size={15} style={{ marginTop: 2, flexShrink: 0 }} /><span>True Eats, Your City</span></div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© {new Date().getFullYear()} True Eats. All rights reserved.</span>
                </div>
            </footer>
        </>
    );
}
