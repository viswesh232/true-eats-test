import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Leaf, Star, Users } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a', white: '#fff', dark: '#1e293b' };

const OurStory = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#fafafa' }}>

            {/* Header */}
            <div style={{ backgroundColor: c.forest, padding: '20px 60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/')} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: '900', fontSize: '20px', color: '#fff' }}>TRUE EATS</span>
            </div>

            {/* Hero */}
            <div style={{ backgroundColor: c.peach, padding: '80px 60px', textAlign: 'center' }}>
                <p style={{ color: c.forest, fontWeight: '700', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 16px' }}>Our Story</p>
                <h1 style={{ fontSize: '52px', fontWeight: '900', color: c.chocolate, margin: '0 0 20px', lineHeight: '1.1' }}>Made with Love,<br />The True Eats Way</h1>
                <p style={{ color: '#6b4c43', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
                    We started with one belief — that food should be honest, wholesome, and made the way your grandmother would approve of.
                </p>
            </div>

            {/* Story body */}
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 24px' }}>

                {/* Values */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '72px' }}>
                    {[
                        { icon: Leaf, title: 'Real Ingredients', body: 'No preservatives, no shortcuts. Every ingredient is chosen for quality, not shelf life.' },
                        { icon: Heart, title: 'Made with Care', body: 'Every batch is made in small quantities so every item you receive is fresh and full of heart.' },
                        { icon: Users, title: 'Community First', body: "We're a small business built on word of mouth. Your satisfaction is literally our growth strategy." },
                    ].map(({ icon, title, body }) => (
                        <div key={title} style={{ backgroundColor: c.white, borderRadius: '20px', padding: '28px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                            <div style={{ backgroundColor: c.peach, padding: '14px', borderRadius: '50%', display: 'inline-flex', marginBottom: '16px' }}>
                                {React.createElement(icon, { size: 22, color: c.forest })}
                            </div>
                            <h3 style={{ margin: '0 0 8px', color: c.forest, fontWeight: '800', fontSize: '16px' }}>{title}</h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>{body}</p>
                        </div>
                    ))}
                </div>

                {/* Story paragraphs */}
                {[
                    { heading: 'How It Started', body: "True Eats was born in a home kitchen in Hyderabad. What started as weekend baking for friends and family quickly grew into something bigger — because people kept coming back. Not for gimmicks, but for the taste of something real." },
                    { heading: 'What We Stand For', body: "We don't use refined sugars where whole alternatives work. We don't add colours that serve no purpose. We believe that the best snacks are the ones that taste great because they're made with care — not chemistry." },
                    { heading: "Where We're Going", body: "We're still small by design. We'd rather grow slow and keep the quality than rush and compromise what made us who we are. Every order you place helps us keep this going. Thank you for being part of the journey." },
                ].map(s => (
                    <div key={s.heading} style={{ marginBottom: '48px' }}>
                        <h2 style={{ color: c.chocolate, fontWeight: '900', fontSize: '24px', margin: '0 0 14px' }}>{s.heading}</h2>
                        <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.8', margin: 0 }}>{s.body}</p>
                    </div>
                ))}

                {/* CTA */}
                <div style={{ backgroundColor: c.forest, borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
                    <Star size={28} color={c.peach} style={{ marginBottom: '12px' }} />
                    <h2 style={{ color: '#fff', fontWeight: '900', margin: '0 0 10px', fontSize: '24px' }}>Ready to taste the difference?</h2>
                    <p style={{ color: 'rgba(252,213,206,0.8)', margin: '0 0 24px', fontSize: '15px' }}>Browse our menu and find your new favourite.</p>
                    <button onClick={() => navigate('/')} style={{ backgroundColor: c.peach, color: c.chocolate, border: 'none', padding: '14px 32px', borderRadius: '50px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                        Shop Now →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OurStory;
