import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a', white: '#fff' };

const ContactUs = () => {
    const navigate = useNavigate();
    const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent]       = useState(false);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!form.name || !form.email || !form.message) { alert('Please fill in all required fields'); return; }
        setSending(true);
        // Simple mailto fallback — replace with API call when backend email is set up
        setTimeout(() => {
            setSent(true);
            setSending(false);
        }, 1000);
    };

    const inp = { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: '#f8fafc' };

    if (sent) return (
        <div style={{ minHeight: '100vh', backgroundColor: c.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ backgroundColor: c.white, borderRadius: '24px', padding: '48px 40px', maxWidth: '440px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
                <h2 style={{ color: c.forest, fontWeight: '900', margin: '0 0 10px' }}>Message Received!</h2>
                <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 28px', lineHeight: '1.6' }}>
                    Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button onClick={() => navigate('/')} style={{ backgroundColor: c.forest, color: '#fff', border: 'none', padding: '13px 28px', borderRadius: '50px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                    Back to Home
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ backgroundColor: c.forest, padding: '20px 60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/')} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: '900', fontSize: '20px', color: '#fff' }}>TRUE EATS</span>
            </div>

            {/* Hero banner */}
            <div style={{ backgroundColor: c.peach, padding: '60px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '44px', fontWeight: '900', color: c.chocolate, margin: '0 0 12px' }}>Get in Touch</h1>
                <p style={{ color: '#6b4c43', fontSize: '17px', margin: 0 }}>We're here to help. Drop us a line anytime.</p>
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '40px', alignItems: 'start' }}>

                {/* Info column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { icon: Mail,  title: 'Email',    val: 'hello@trueeats.in',  sub: 'We reply within 24 hours' },
                        { icon: Phone, title: 'Phone',    val: '+91 98765-43210',    sub: 'Mon–Sat, 10am–6pm' },
                        { icon: MapPin,title: 'Location', val: 'Hyderabad, India',   sub: 'No walk-ins — online orders only' },
                        { icon: Clock, title: 'Hours',    val: 'Mon–Sat 10am–6pm',  sub: 'Closed on Sundays' },
                    ].map(({ icon, title, val, sub }) => (
                        <div key={title} style={{ backgroundColor: c.white, borderRadius: '16px', padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                            <div style={{ backgroundColor: c.peach, padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
                                {React.createElement(icon, { size: 18, color: c.forest })}
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
                                <p style={{ margin: '2px 0', fontWeight: '700', color: c.chocolate, fontSize: '14px' }}>{val}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{sub}</p>
                            </div>
                        </div>
                    ))}

                    <div onClick={() => navigate('/support')} style={{ backgroundColor: c.forest, borderRadius: '16px', padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'center', cursor: 'pointer' }}>
                        <MessageCircle size={22} color={c.peach} />
                        <div>
                            <p style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '14px' }}>Need order help?</p>
                            <p style={{ margin: '3px 0 0', color: 'rgba(252,213,206,0.8)', fontSize: '12px' }}>Open a support ticket →</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div style={{ backgroundColor: c.white, borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 24px', color: c.forest, fontWeight: '900', fontSize: '20px' }}>Send a Message</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>Name *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" style={inp} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>Email *</label>
                            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" type="email" style={inp} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>Subject</label>
                        <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="What's it about?" style={inp} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>Message *</label>
                        <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                            placeholder="Tell us what's on your mind..."
                            rows={5} style={{ ...inp, resize: 'none' }} />
                    </div>
                    <button onClick={handleSend} disabled={sending} style={{ width: '100%', padding: '14px', backgroundColor: sending ? '#94a3b8' : c.forest, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
                        <Send size={16} /> {sending ? 'Sending…' : 'Send Message'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
