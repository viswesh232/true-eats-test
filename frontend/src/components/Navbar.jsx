import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react';
import API from '../api/axios';
import CartDrawer from './CartDrawer';
const c = {
    forest: '#1a4331',
    peach: '#fcd5ce',
    chocolate: '#4a2c2a',
    white: '#ffffff',
    bg: '#fafafa',
    slate: '#64748b'
};

const formatPrice = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(amount || 0);

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [allProducts, setAllProducts] = useState([]);

    useEffect(() => {
        API.get('/products').then(res => setAllProducts(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            const results = allProducts.filter(p => p.name.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query)));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchResults(results.slice(0, 5));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsDropdownOpen(true);
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsDropdownOpen(false);
        }
    }, [searchQuery, allProducts]);

    const totalCartQty = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0), [cartItems]);

    return (
        <>
            <style>
                {`
                .nav-container { padding: 14px 40px; }
                .nav-left-gap { gap: 32px; }
                .desktop-search { display: flex; }
                .mobile-search { display: none; }
                
                @media (max-width: 800px) {
                    .nav-container { padding: 12px 16px !important; flex-direction: column; gap: 12px; }
                    .nav-top-row { width: 100%; display: flex; justify-content: space-between; align-items: center; }
                    .nav-links { display: none !important; }
                    .mobile-menu-btn { display: flex !important; align-items: center; }
                    .nav-left-gap { gap: 16px !important; }
                    .desktop-search { display: none !important; }
                    .mobile-search { display: flex !important; width: 100%; }
                }
                `}
            </style>
            <nav className="nav-container" style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                borderBottom: '1px solid #e2e8f0',
                fontFamily: "'Inter', sans-serif"
            }}>
                <div className="nav-top-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div className="nav-left-gap" style={{ display: 'flex', alignItems: 'center' }}>
                        <button onClick={() => setIsMenuOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} className="mobile-menu-btn">
                            <Menu size={24} color={c.forest} />
                        </button>
                        <div onClick={() => navigate('/')} style={{ fontWeight: '900', fontSize: '22px', color: c.forest, cursor: 'pointer', letterSpacing: '-0.5px' }}>
                            True<span style={{ color: '#a5c11f' }}>Eats</span>
                        </div>

                        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <button onClick={() => navigate('/?scrollToMenu=true')} style={{ background: 'none', border: 'none', color: c.forest, fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>Menu</button>
                            <button onClick={() => navigate('/our-story')} style={{ background: 'none', border: 'none', color: c.forest, fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>Our Story</button>
                            <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: c.forest, fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>My Orders</button>
                            <button onClick={() => navigate('/support')} style={{ background: 'none', border: 'none', color: c.forest, fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>Support</button>
                        </div>
                    </div>

                    <div className="desktop-search" style={{ flex: 1, justifyContent: 'center', position: 'relative', margin: '0 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '50px', padding: '10px 18px', width: '100%', maxWidth: '360px' }}>
                            <Search size={18} color={c.slate} style={{ marginRight: '8px' }} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => { if (searchQuery.trim()) setIsDropdownOpen(true); }}
                                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                placeholder="Search snacks, sweets..."
                                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '14px', width: '100%', color: c.forest }}
                            />
                        </div>
                        {isDropdownOpen && searchResults.length > 0 && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '360px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 200 }}>
                                {searchResults.map(p => (
                                    <div key={p._id} onMouseDown={() => { navigate(`/product/${p.slug || p._id}`); setIsDropdownOpen(false); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                                        <img src={p.image || (p.images && p.images[0]) || ''} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#111', fontSize: '13px' }}>{p.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '11px' }}>{formatPrice(p.weights?.[0]?.price || p.price)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ backgroundColor: '#f1f5f9', borderRadius: '50%', padding: '8px' }}>
                                        <User size={18} color={c.forest} />
                                    </div>
                                </div>
                                <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: c.forest, fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                                Log In
                            </button>
                        )}

                        <div onClick={() => setIsCartOpen(true)} style={{ position: 'relative', cursor: 'pointer', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                            <ShoppingCart color={c.forest} size={20} />
                            {totalCartQty > 0 && (
                                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#e11d48', color: '#fff', borderRadius: '50%', padding: '2px 5px', fontSize: '10px', fontWeight: 'bold' }}>{totalCartQty}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Row */}
                <div className="mobile-search" style={{ position: 'relative', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '50px', padding: '10px 16px', width: '100%' }}>
                        <Search size={16} color={c.slate} style={{ marginRight: '8px' }} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => { if (searchQuery.trim()) setIsDropdownOpen(true); }}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                            placeholder="Search snacks, sweets..."
                            style={{ border: 'none', background: 'none', outline: 'none', fontSize: '14px', width: '100%', color: c.forest }}
                        />
                    </div>
                    {isDropdownOpen && searchResults.length > 0 && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 200 }}>
                            {searchResults.map(p => (
                                <div key={p._id} onMouseDown={() => { navigate(`/product/${p.slug || p._id}`); setIsDropdownOpen(false); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                                    <img src={p.image || (p.images && p.images[0]) || ''} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#111', fontSize: '13px' }}>{p.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '11px' }}>{formatPrice(p.weights?.[0]?.price || p.price)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={() => setIsMenuOpen(false)}>
                    <div style={{ width: '280px', height: '100%', backgroundColor: '#fff', padding: '24px', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ fontWeight: '900', fontSize: '20px', color: c.forest }}>True<span style={{ color: '#a5c11f' }}>Eats</span></div>
                            <X size={24} color={c.forest} cursor="pointer" onClick={() => setIsMenuOpen(false)} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '18px', fontWeight: '700', color: c.forest }}>
                            <div onClick={() => { navigate('/?scrollToMenu=true'); setIsMenuOpen(false); }}>Menu</div>
                            <div onClick={() => { navigate('/our-story'); setIsMenuOpen(false); }}>Our Story</div>
                            <div onClick={() => { navigate('/orders'); setIsMenuOpen(false); }}>My Orders</div>
                            <div onClick={() => { navigate('/support'); setIsMenuOpen(false); }}>Support</div>
                            {user ? (
                                <>
                                    <div onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>My Profile</div>
                                    <div onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} style={{ color: '#e11d48', cursor: 'pointer' }}>Log Out</div>
                                </>
                            ) : (
                                <div onClick={() => { navigate('/login'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>Log In</div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};

export default Navbar;
