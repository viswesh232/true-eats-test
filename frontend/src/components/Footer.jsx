import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const navigate = useNavigate();
    const c = { forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a' };

    const IconInsta = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    const IconFb = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
    const IconTwit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>;

    return (
        <footer style={{ backgroundColor: c.forest, color: '#fff', padding: '60px 40px 30px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '60px' }}>
                
                <div>
                    <div style={{ fontWeight: '900', fontSize: '24px', color: '#fff', marginBottom: '16px' }}>
                        True<span style={{ color: '#a5c11f' }}>Eats</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', maxWidth: '280px' }}>
                        Honest ingredients, traditional recipes, and small-batch quality. We make food the way it was meant to be made.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <a href="#" style={{ color: c.peach }}><IconInsta /></a>
                        <a href="#" style={{ color: c.peach }}><IconFb /></a>
                        <a href="#" style={{ color: c.peach }}><IconTwit /></a>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: c.peach }}>Quick Links</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '14px' }}>Menu</button>
                        <button onClick={() => navigate('/our-story')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '14px' }}>Our Story</button>
                        <button onClick={() => navigate('/contact')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '14px' }}>Contact Us</button>
                        <button onClick={() => navigate('/support')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '14px' }}>Support & FAQs</button>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: c.peach }}>Get in Touch</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={16} color={c.peach} /> hello@trueeats.in</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={16} color={c.peach} /> +91 98765-43210</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><MapPin size={16} color={c.peach} style={{ marginTop: '2px' }} /> <span>Hyderabad, India<br/>Online Orders Only</span></div>
                    </div>
                </div>

            </div>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                <p style={{ margin: 0 }}>© {new Date().getFullYear()} True Eats. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                    <span style={{ cursor: 'pointer' }}>Terms of Service</span>
                    <span style={{ cursor: 'pointer' }}>Refund Policy</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
