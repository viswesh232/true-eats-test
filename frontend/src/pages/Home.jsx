import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import heroImage from '../assets/hero.png';
import logoImage from '../../logo.jpg';
import {
    ShoppingCart,
    Search,
    ArrowRight,
    UserRound,
    Minus,
    Plus,
    Camera,
    MessagesSquare,
    Play,
    Phone,
    MapPin,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const colors = {
    page: '#f7f4ee',
    surface: '#ffffff',
    soft: '#f4ede4',
    border: '#e2d8cb',
    text: '#213128',
    muted: '#66756d',
    forest: '#234232',
    lime: '#a5c11f',
    limeDeep: '#96b31b',
    orange: '#dd7a2f',
    orangeSoft: '#fff1e4',
};

const topBarHeights = {
    announcement: 42,
    nav: 82,
};

// Add any number of restaurant banner images here.
const restaurantBanners = [
    {
        image: heroImage,
        title: 'Fresh food, warm space',
        subtitle: 'Show your restaurant, kitchen, team, or signature dishes here.',
    },
    {
        image: logoImage,
        title: 'Your restaurant story',
        subtitle: 'You can keep adding more banner images in this array anytime.',
    },
];

const formatPrice = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(amount || 0);

const Home = () => {
    const [products, setProducts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [addedToast, setAddedToast] = useState('');
    const [bannerIndex, setBannerIndex] = useState(0);

    const { user, logout } = useContext(AuthContext);
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [{ data: menu }, settingsResponse] = await Promise.all([
                    API.get('/products'),
                    API.get('/settings').catch(() => ({ data: {} })),
                ]);

                const settings = settingsResponse?.data || {};
                const nextProducts = menu || [];

                setProducts(nextProducts);
                setCategories(['All', ...new Set(nextProducts.map((product) => product.category).filter(Boolean))]);
                setAnnouncements((settings.announcements || []).filter((item) => item.active && item.text?.trim()));
            } catch (error) {
                console.error(error);
            }
        };

        fetchHomeData();
    }, []);

    useEffect(() => {
        if (restaurantBanners.length <= 1) return undefined;

        const timer = window.setInterval(() => {
            setBannerIndex((current) => (current + 1) % restaurantBanners.length);
        }, 4500);

        return () => window.clearInterval(timer);
    }, []);

    const filteredProducts = useMemo(() => products.filter((product) => {
        const categoryMatch = activeCategory === 'All' || product.category === activeCategory;
        const searchSource = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();
        const searchMatch = !searchTerm.trim() || searchSource.includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    }), [activeCategory, products, searchTerm]);

    const featuredProducts = useMemo(() => products.slice(0, 3), [products]);
    const footerCategories = useMemo(() => categories.filter((category) => category !== 'All').slice(0, 6), [categories]);
    const totalCartQty = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const getCartQty = (productId) => cartItems.find((item) => item._id === productId)?.qty || 0;
    const currentBanner = restaurantBanners[bannerIndex] || restaurantBanners[0];

    const handleAddToCart = (product) => {
        addToCart(product);
        setAddedToast(`${product.name} added to cart`);
        window.setTimeout(() => setAddedToast(''), 1800);
    };

    const handleProfileClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role === 'admin') {
            navigate('/dashboard');
            return;
        }
        navigate('/profile');
    };

    const jumpToCategory = (category) => {
        setActiveCategory(category);
        document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const moveBanner = (direction) => {
        setBannerIndex((current) => {
            if (direction === 'prev') {
                return current === 0 ? restaurantBanners.length - 1 : current - 1;
            }
            return (current + 1) % restaurantBanners.length;
        });
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.page, color: colors.text, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", overflowX: 'hidden' }}>
            <style>{`
                .home-shell {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                .top-fixed {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 50;
                }
                .announcement-bar {
                    height: ${topBarHeights.announcement}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${colors.forest};
                    color: #f7f4ee;
                    padding: 0 16px;
                    text-align: center;
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }
                .nav-shell,
                .section-shell,
                .footer-shell {
                    width: 100%;
                    margin: 0;
                    padding-left: 24px;
                    padding-right: 24px;
                    box-sizing: border-box;
                }
                .home-nav {
                    display: grid;
                    grid-template-columns: 180px minmax(0, 1fr) auto;
                    align-items: center;
                    gap: 24px;
                    min-height: ${topBarHeights.nav}px;
                    background: rgba(247, 244, 238, 0.97);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid ${colors.border};
                }
                .home-links {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    flex-wrap: wrap;
                }
                .home-links button,
                .footer-links button {
                    border: none;
                    background: none;
                    color: inherit;
                    font: inherit;
                    cursor: pointer;
                    padding: 0;
                    text-align: left;
                }
                .home-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }
                .search-wrap {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: ${colors.surface};
                    border: 1px solid ${colors.border};
                    border-radius: 999px;
                    padding: 12px 16px;
                    min-width: 280px;
                }
                .search-wrap input {
                    border: none;
                    outline: none;
                    background: transparent;
                    width: 100%;
                    color: ${colors.text};
                    font-size: 14px;
                }
                .banner-shell {
                    width: 100%;
                    margin-bottom: 34px;
                }
                .banner-frame {
                    position: relative;
                    width: 100%;
                    min-height: 560px;
                    overflow: hidden;
                    background: #d9d9d9;
                }
                .banner-image {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .banner-content {
                    position: relative;
                    z-index: 2;
                    min-height: 560px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    align-items: flex-start;
                    padding: 44px 90px 44px 90px;
                    box-sizing: border-box;
                }
                .featured-row {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 18px;
                    margin-bottom: 36px;
                }
                .category-row {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin: 18px 0 26px;
                }
                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 22px;
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 28px;
                }
                .footer-links {
                    display: grid;
                    gap: 14px;
                }
                @media (max-width: 1080px) {
                    .home-nav {
                        grid-template-columns: 1fr;
                        justify-items: start;
                        padding-top: 16px;
                        padding-bottom: 16px;
                    }
                    .home-links,
                    .home-actions {
                        justify-content: flex-start;
                    }
                    .search-wrap {
                        width: 100%;
                        min-width: 0;
                    }
                    .featured-row,
                    .products-grid,
                    .footer-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .banner-content {
                        padding-left: 70px;
                        padding-right: 70px;
                    }
                }
                @media (max-width: 760px) {
                    .nav-shell,
                    .section-shell,
                    .footer-shell {
                        padding-left: 14px;
                        padding-right: 14px;
                    }
                    .featured-row,
                    .products-grid,
                    .footer-grid {
                        grid-template-columns: 1fr;
                    }
                    .banner-frame,
                    .banner-content {
                        min-height: 420px;
                    }
                    .banner-content {
                        padding-left: 56px;
                        padding-right: 56px;
                        padding-bottom: 30px;
                    }
                }
            `}</style>

            {addedToast && (
                <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: colors.forest, color: '#fff', padding: '12px 22px', borderRadius: '999px', fontWeight: 700, zIndex: 60, boxShadow: '0 12px 28px rgba(35,66,50,0.22)' }}>
                    {addedToast}
                </div>
            )}

            <div className='top-fixed'>
                <div className='announcement-bar'>
                    {announcements.length > 0 ? announcements[0].text : 'True Eats'}
                </div>
                <div className='nav-shell'>
                    <nav className='home-nav'>
                        <div style={{ color: colors.forest, fontSize: '32px', fontWeight: 900, letterSpacing: '-0.05em' }}>
                            True Eats
                        </div>

                        <div className='home-links' style={{ color: colors.forest, fontWeight: 600, fontSize: '14px' }}>
                            <button onClick={() => navigate('/')}>Home</button>
                            <button onClick={() => navigate('/our-story')}>Our Story</button>
                            <button onClick={() => navigate('/contact')}>Contact</button>
                            {user && <button onClick={() => navigate('/orders')}>My Orders</button>}
                            {user && <button onClick={() => navigate('/support')}>Support</button>}
                        </div>

                        <div className='home-actions'>
                            <div className='search-wrap'>
                                <Search size={16} color={colors.muted} />
                                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder='Search products' />
                            </div>
                            <button onClick={handleProfileClick} style={actionButton(colors.surface, colors.text, colors.border)}>
                                <UserRound size={16} /> {user ? (user.role === 'admin' ? 'Dashboard' : 'Profile') : 'Login'}
                            </button>
                            {user && (
                                <button onClick={() => { logout(); navigate('/'); }} style={actionButton('transparent', colors.muted, 'transparent')}>
                                    Logout
                                </button>
                            )}
                            <button onClick={() => navigate('/cart')} style={actionButton(colors.forest, '#fff', colors.forest)}>
                                <ShoppingCart size={16} /> {totalCartQty > 0 ? `Cart (${totalCartQty})` : 'Cart'}
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            <div className='home-shell'>
                <div style={{ height: `${topBarHeights.announcement + topBarHeights.nav}px` }} />

                <section className='banner-shell'>
                    <div className='banner-frame'>
                        <img src={currentBanner.image} alt={currentBanner.title} className='banner-image' />

                        <button onClick={() => moveBanner('prev')} style={{ ...bannerArrowButton, left: '22px' }}>
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => moveBanner('next')} style={{ ...bannerArrowButton, right: '22px' }}>
                            <ChevronRight size={20} />
                        </button>

                        <div className='banner-content'>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.92)', color: colors.orange, borderRadius: '999px', padding: '8px 14px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Restaurant banner
                            </div>

                            <h1 style={{ margin: '18px 0 10px', fontSize: '58px', lineHeight: 0.96, letterSpacing: '-0.06em', color: '#fff', maxWidth: '720px', textShadow: '0 4px 18px rgba(0,0,0,0.28)' }}>
                                {currentBanner.title}
                            </h1>

                            <p style={{ margin: 0, color: '#fff', maxWidth: '620px', lineHeight: 1.9, fontSize: '16px', textShadow: '0 2px 14px rgba(0,0,0,0.22)' }}>
                                {currentBanner.subtitle}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '28px' }}>
                                <button onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })} style={heroButton(colors.surface, colors.forest)}>
                                    Shop now <ArrowRight size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
                                {restaurantBanners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setBannerIndex(index)}
                                        style={{
                                            width: index === bannerIndex ? '30px' : '10px',
                                            height: '10px',
                                            borderRadius: '999px',
                                            border: 'none',
                                            background: index === bannerIndex ? '#fff' : 'rgba(255,255,255,0.52)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            padding: 0,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className='section-shell'>
                    {featuredProducts.length > 0 && (
                        <section className='featured-row'>
                            {featuredProducts.map((product) => (
                                <button
                                    key={product._id}
                                    onClick={() => navigate(`/product/${product._id}`)}
                                    style={{
                                        border: `1px solid ${colors.border}`,
                                        background: colors.surface,
                                        borderRadius: '26px',
                                        padding: '18px',
                                        display: 'grid',
                                        gridTemplateColumns: '88px minmax(0, 1fr)',
                                        gap: '14px',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        boxShadow: '0 14px 28px rgba(31,42,36,0.05)',
                                    }}
                                >
                                    <img
                                        src={(product.images && product.images[0]) || product.image || ''}
                                        alt={product.name}
                                        style={{ width: '88px', height: '88px', borderRadius: '20px', objectFit: 'cover', backgroundColor: colors.soft }}
                                    />
                                    <div>
                                        <div style={{ color: colors.orange, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            {product.category || 'Featured'}
                                        </div>
                                        <div style={{ marginTop: '7px', color: colors.forest, fontWeight: 800, fontSize: '22px' }}>
                                            {product.name}
                                        </div>
                                        <div style={{ marginTop: '8px', fontWeight: 900, fontSize: '20px', color: colors.text }}>
                                            {formatPrice(product.price)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </section>
                    )}

                    <section id='shop-section'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'end', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ color: colors.orange, fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                                    Products
                                </div>
                                <h2 style={{ margin: 0, fontSize: '40px', letterSpacing: '-0.05em', color: colors.forest }}>
                                    Shop what you need.
                                </h2>
                                <p style={{ margin: '10px 0 0', color: colors.muted, maxWidth: '640px', lineHeight: 1.8 }}>
                                    Pick a category, open a product, or add it straight to cart from here.
                                </p>
                            </div>
                        </div>

                        <div className='category-row'>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    style={{
                                        border: `1px solid ${activeCategory === category ? colors.forest : colors.border}`,
                                        backgroundColor: activeCategory === category ? colors.forest : colors.surface,
                                        color: activeCategory === category ? '#fff' : colors.forest,
                                        borderRadius: '999px',
                                        padding: '11px 18px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                    }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '34px', textAlign: 'center', color: colors.muted }}>
                                No products matched your search.
                            </div>
                        ) : (
                            <div className='products-grid'>
                                {filteredProducts.map((product) => {
                                    const cartQty = getCartQty(product._id);

                                    return (
                                        <div key={product._id} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '26px', overflow: 'hidden', boxShadow: '0 16px 34px rgba(31,42,36,0.05)' }}>
                                            <button onClick={() => navigate(`/product/${product._id}`)} style={{ width: '100%', border: 'none', background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                                <img
                                                    src={(product.images && product.images[0]) || product.image || ''}
                                                    alt={product.name}
                                                    style={{ width: '100%', height: '240px', objectFit: 'cover', backgroundColor: colors.soft }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </button>

                                            <div style={{ padding: '20px' }}>
                                                <div style={{ display: 'inline-flex', backgroundColor: colors.orangeSoft, color: colors.orange, borderRadius: '999px', padding: '6px 10px', fontSize: '12px', fontWeight: 800, marginBottom: '12px' }}>
                                                    {product.category || 'Menu'}
                                                </div>

                                                <button onClick={() => navigate(`/product/${product._id}`)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                                    <h3 style={{ margin: '0 0 8px', fontSize: '21px', color: colors.forest }}>{product.name}</h3>
                                                </button>

                                                <p style={{ margin: '0 0 16px', color: colors.muted, fontSize: '14px', lineHeight: 1.8, minHeight: '50px' }}>
                                                    {product.description || 'Freshly listed from the menu.'}
                                                </p>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '24px', fontWeight: 900, color: colors.forest }}>{formatPrice(product.price)}</div>
                                                </div>

                                                {cartQty > 0 ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '10px 12px', backgroundColor: colors.soft }}>
                                                        <span style={{ fontWeight: 700, color: colors.forest }}>Quantity</span>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                                            <button onClick={() => removeFromCart(product)} style={qtyButtonStyle}>
                                                                <Minus size={16} />
                                                            </button>
                                                            <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 800 }}>{cartQty}</span>
                                                            <button onClick={() => addToCart(product)} style={qtyButtonStyle}>
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleAddToCart(product)} style={{ width: '100%', borderRadius: '16px', border: `1px solid ${colors.forest}`, backgroundColor: colors.forest, color: '#fff', padding: '13px 16px', fontWeight: 700, cursor: 'pointer' }}>
                                                        Add to cart
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section style={{ marginTop: '46px', marginBottom: '8px', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '28px', padding: '34px', boxShadow: '0 14px 28px rgba(31,42,36,0.05)' }}>
                        <div style={{ color: colors.orange, fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                            Our Story
                        </div>
                        <h2 style={{ margin: 0, fontSize: '38px', letterSpacing: '-0.05em', color: colors.forest }}>
                            Built around better food and a simpler experience.
                        </h2>
                        <p style={{ margin: '14px 0 0', maxWidth: '840px', color: colors.muted, lineHeight: 1.9 }}>
                            True Eats is about fresh ingredients, cleaner choices, and a storefront that feels welcoming from the first visit. We wanted the experience to stay easy to use while still giving space to the story of the restaurant, the food, and the people behind it.
                        </p>
                        <button onClick={() => navigate('/our-story')} style={{ marginTop: '20px', ...heroButton(colors.forest, '#fff') }}>
                            Read our story <ArrowRight size={16} />
                        </button>
                    </section>
                </div>

                <footer style={{ marginTop: '52px', width: '100%', background: `linear-gradient(180deg, ${colors.lime} 0%, ${colors.limeDeep} 100%)`, color: '#f8fde7', padding: '40px 0 26px', boxShadow: '0 18px 38px rgba(85, 100, 18, 0.18)' }}>
                    <div className='footer-shell'>
                        <div className='footer-grid'>
                            <div>
                                <div style={{ fontWeight: 800, marginBottom: '18px', fontSize: '18px' }}>Quick links</div>
                                <div className='footer-links' style={{ maxWidth: '220px' }}>
                                    <button onClick={() => navigate('/')} style={{ fontWeight: 800, textDecoration: 'underline' }}>Home</button>
                                    {footerCategories.map((category) => (
                                        <button key={category} onClick={() => jumpToCategory(category)}>{category}</button>
                                    ))}
                                    <button onClick={() => navigate('/contact')}>Contact</button>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontWeight: 800, marginBottom: '18px', fontSize: '18px' }}>Customer Support</div>
                                <div className='footer-links'>
                                    <button onClick={() => navigate('/support')}>Support</button>
                                    <button onClick={() => navigate('/contact')}>Shipping Policy</button>
                                    <button onClick={() => navigate('/contact')}>Refund and Return Policy</button>
                                    <button onClick={() => navigate('/contact')}>Privacy Policy</button>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontWeight: 800, marginBottom: '18px', fontSize: '18px' }}>Contact information</div>
                                <div style={{ display: 'grid', gap: '14px', color: '#f8fde7' }}>
                                    <div style={{ fontWeight: 700 }}>True Eats</div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                        <Phone size={16} style={{ marginTop: '2px' }} />
                                        <span>+91 81796 06489</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: '320px', lineHeight: 1.7 }}>
                                        <MapPin size={16} style={{ marginTop: '3px', flexShrink: 0 }} />
                                        <span>Fresh meals, healthy snacks, and better food experiences from True Eats.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', flexWrap: 'wrap', marginTop: '34px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
                            <div style={{ color: 'rgba(248,253,231,0.84)', fontSize: '13px' }}>
                                Copyright {new Date().getFullYear()} True Eats. All rights reserved.
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {[Camera, MessagesSquare, Play].map((Icon, index) => (
                                    <div key={index} style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.22)', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.06)' }}>
                                        <Icon size={18} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const actionButton = (backgroundColor, color, borderColor = 'transparent') => ({
    border: `1px solid ${borderColor}`,
    backgroundColor,
    color,
    borderRadius: '999px',
    padding: '11px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
});

const heroButton = (backgroundColor, color, borderColor = 'transparent') => ({
    border: `1px solid ${borderColor}`,
    backgroundColor,
    color,
    borderRadius: '999px',
    padding: '14px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: '15px',
});

const bannerArrowButton = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 3,
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.6)',
    background: 'rgba(255,255,255,0.92)',
    color: '#213128',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
};

const qtyButtonStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.text,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
};

export default Home;
