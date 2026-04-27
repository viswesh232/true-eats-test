import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { Utensils, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');

    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('verified') === 'true') {
            setSuccessMessage('Email verified successfully! You can now log in.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            navigate(data.role === 'admin' ? '/dashboard' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
        setLoading(false);
    };

    const inp = {
        width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px',
        border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none',
        boxSizing: 'border-box', backgroundColor: '#fff', transition: '0.2s',
        fontFamily: 'inherit', color: '#213128'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div onClick={() => window.location.href = '/'} style={{ fontWeight: '900', fontSize: '28px', color: '#1a3a2a', cursor: 'pointer', letterSpacing: '-0.5px', marginBottom: '8px' }}>
                        True<span style={{ color: '#a5c11f' }}>Eats</span>
                    </div>
                    <p style={{ color: '#66756d', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"The Way Food Was Meant To Be"</p>
                </div>

                {/* Card */}
                <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '40px', border: '1.5px solid #e5ddd2', boxShadow: '0 20px 44px rgba(35,49,40,0.08)' }}>
                    <h2 style={{ margin: '0 0 6px', fontWeight: '900', color: '#1a3a2a', fontSize: '24px', letterSpacing: '-0.02em' }}>Welcome back</h2>
                    <p style={{ margin: '0 0 28px', color: '#66756d', fontSize: '14px' }}>Sign in to your True Eats account</p>

                    {successMessage && (
                        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
                            ✓ {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <Mail size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="Email address" style={inp} required
                                onFocus={e => e.target.style.borderColor = '#1a3a2a'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                        </div>

                        {/* Password */}
                        <div style={{ position: 'relative', marginBottom: '24px' }}>
                            <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="Password" style={inp} required
                                onFocus={e => e.target.style.borderColor = '#1a3a2a'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', marginBottom: '20px' }}>
                            <Link
                                to="/forgot-password"
                                style={{ color: '#1a3a2a', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none' }}
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {error && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                                ⚠ {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '16px', backgroundColor: '#1a3a2a', color: '#fff',
                            border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                            transition: '0.2s', letterSpacing: '0.5px'
                        }}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#66756d' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: '#1a3a2a', fontWeight: '800', textDecoration: 'none' }}>Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;