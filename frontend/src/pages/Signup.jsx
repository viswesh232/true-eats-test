import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Utensils, User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

const IconWrap = ({ icon }) => (
    React.createElement(icon, {
        size: 16,
        color: '#94a3b8',
        style: { position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
    })
);

const SectionLabel = ({ icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '20px 0 12px', color: '#1a3a2a', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {React.createElement(icon, { size: 14 })} {label}
    </div>
);

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', phoneNumber: '',
    });
    const [showPw, setShowPw] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/signup', formData);
            setMessage(res.data.message);
            setIsError(false);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong');
            setIsError(true);
        }
        setLoading(false);
    };

    const inp = (pl) => ({
        style: {
            width: '100%', padding: '13px 14px 13px 42px', borderRadius: '12px',
            border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', transition: '0.2s',
            color: '#213128'
        },
        placeholder: pl,
        onFocus: e => e.target.style.borderColor = '#1a3a2a',
        onBlur: e => e.target.style.borderColor = '#e2e8f0',
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '30px 20px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div onClick={() => window.location.href = '/'} style={{ fontWeight: '900', fontSize: '28px', color: '#1a3a2a', cursor: 'pointer', letterSpacing: '-0.5px' }}>
                        True<span style={{ color: '#a5c11f' }}>Eats</span>
                    </div>
                </div>

                {/* Card */}
                <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '36px', border: '1.5px solid #e5ddd2', boxShadow: '0 20px 44px rgba(35,49,40,0.08)' }}>
                    <h2 style={{ margin: '0 0 4px', fontWeight: '900', color: '#1a3a2a', fontSize: '24px', letterSpacing: '-0.02em' }}>Create your account</h2>
                    <p style={{ margin: '0 0 24px', color: '#66756d', fontSize: '14px' }}>Join True Eats to start ordering</p>

                    <form onSubmit={handleSubmit}>
                        {/* Personal info */}
                        <SectionLabel icon={User} label="Personal Info" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ position: 'relative' }}>
                                <IconWrap icon={User} />
                                <input name="firstName" {...inp('First Name')} onChange={handleChange} required />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <IconWrap icon={User} />
                                <input name="lastName" {...inp('Last Name')} onChange={handleChange} required />
                            </div>
                        </div>
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <IconWrap icon={Mail} />
                            <input type="email" name="email" {...inp('Email address')} onChange={handleChange} required />
                        </div>
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <IconWrap icon={Phone} />
                            <input name="phoneNumber" {...inp('Phone Number')} onChange={handleChange} required />
                        </div>
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <IconWrap icon={Lock} />
                            <input type={showPw ? 'text' : 'password'} name="password" {...inp('Password')} onChange={handleChange} required />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {message && (
                            <div style={{ margin: '16px 0', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', backgroundColor: isError ? '#fee2e2' : '#d1fae5', color: isError ? '#991b1b' : '#065f46' }}>
                                {isError ? '⚠ ' : '✓ '}{message}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#1a3a2a',
                            color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800',
                            fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: '0.2s'
                        }}>
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#66756d' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#1a3a2a', fontWeight: '800', textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
