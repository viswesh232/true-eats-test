import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Lock, Loader, CheckCircle } from 'lucide-react';

const c = { forest: '#1a3a2a', white: '#ffffff', slate: '#66756d', light: '#f7f4ee' };

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // NEW STATE
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // NEW CHECK: Prevent submission if passwords don't match
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match!');
      return;
    }

    setStatus('loading');
    try {
      const res = await API.put(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid or expired token');
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

        <h2 style={{ color: c.forest, margin: '0 0 24px 0', textAlign: 'center', fontWeight: '900', fontSize: '24px', letterSpacing: '-0.02em' }}>Create New Password</h2>
        
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 15px' }} />
            <div style={{ color: '#065f46', backgroundColor: '#d1fae5', padding: '12px', borderRadius: '12px', fontWeight: 'bold', marginBottom: '15px' }}>{message}</div>
            <p style={{ color: c.slate, fontSize: '14px' }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>{message}</div>}
            
            {/* FIRST PASSWORD INPUT */}
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', marginBottom: '16px', backgroundColor: '#fff', transition: '0.2s' }}>
              <Lock size={18} color="#94a3b8" />
              <input type="password" placeholder="New Password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} 
                onFocus={e => e.target.parentElement.style.borderColor = '#1a3a2a'}
                onBlur={e => e.target.parentElement.style.borderColor = '#e2e8f0'}
                style={{ border: 'none', padding: '14px 10px', width: '100%', outline: 'none', fontSize: '15px', color: '#213128' }} />
            </div>

            {/* CONFIRM PASSWORD INPUT */}
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', marginBottom: '24px', backgroundColor: '#fff', transition: '0.2s' }}>
              <Lock size={18} color="#94a3b8" />
              <input type="password" placeholder="Confirm Password" required minLength="6" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                onFocus={e => e.target.parentElement.style.borderColor = '#1a3a2a'}
                onBlur={e => e.target.parentElement.style.borderColor = '#e2e8f0'}
                style={{ border: 'none', padding: '14px 10px', width: '100%', outline: 'none', fontSize: '15px', color: '#213128' }} />
            </div>
            
            <button disabled={status === 'loading'} style={{ width: '100%', padding: '16px', backgroundColor: c.forest, color: c.white, border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '16px', cursor: status === 'loading' ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', transition: '0.2s', opacity: status === 'loading' ? 0.7 : 1 }}>
              {status === 'loading' ? <Loader size={20} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;