import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';

const c = { forest: '#1a3a2a', white: '#ffffff', slate: '#66756d', light: '#f7f4ee' };

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStatus('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: c.light, fontFamily: "'Inter', sans-serif", padding: '20px' }}>
      <div style={{ backgroundColor: c.white, padding: '40px', borderRadius: '24px', border: '1.5px solid #e5ddd2', boxShadow: '0 20px 44px rgba(35,49,40,0.08)', maxWidth: '440px', width: '100%' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div onClick={() => window.location.href = '/'} style={{ fontWeight: '900', fontSize: '28px', color: '#1a3a2a', cursor: 'pointer', letterSpacing: '-0.5px' }}>
                True<span style={{ color: '#a5c11f' }}>Eats</span>
            </div>
        </div>

        <h2 style={{ color: c.forest, margin: '0 0 6px 0', textAlign: 'center', fontWeight: '900', fontSize: '24px', letterSpacing: '-0.02em' }}>Reset Password</h2>
        <p style={{ color: c.slate, textAlign: 'center', marginBottom: '28px', fontSize: '14px' }}>Enter your email and we'll send you a secure link to reset your password.</p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 15px' }} />
            <div style={{ color: '#065f46', backgroundColor: '#d1fae5', padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}>{message}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>{message}</div>}
            
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', marginBottom: '24px', backgroundColor: '#fff', transition: '0.2s' }}>
              <Mail size={18} color="#94a3b8" />
              <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} 
                onFocus={e => e.target.parentElement.style.borderColor = '#1a3a2a'}
                onBlur={e => e.target.parentElement.style.borderColor = '#e2e8f0'}
                style={{ border: 'none', padding: '14px 10px', width: '100%', outline: 'none', fontSize: '15px', color: '#213128' }} />
            </div>
            
            <button disabled={status === 'loading'} style={{ width: '100%', padding: '16px', backgroundColor: c.forest, color: c.white, border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '16px', cursor: status === 'loading' ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', transition: '0.2s', opacity: status === 'loading' ? 0.7 : 1 }}>
              {status === 'loading' ? <Loader size={20} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
        
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '24px', color: c.forest, textDecoration: 'none', fontWeight: '800', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;