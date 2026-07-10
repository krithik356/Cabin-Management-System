import React, { useState, useEffect } from 'react';
import { adminLogin, adminSignup } from '../services/authService';
import { useNavigate } from 'react-router-dom';

/**
 * Admin Login / Signup Page — Premium redesign
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) navigate('/admin/cabins');
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
      if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await adminLogin({ email: formData.email, password: formData.password });
        localStorage.setItem('adminToken', response.token);
      } else {
        const response = await adminSignup({ email: formData.email, password: formData.password });
        localStorage.setItem('adminToken', response.token);
      }
      navigate('/admin/cabins');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 30%, #f5f3ff 60%, #faf5ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
          }}>🏠</div>
          <h1 style={{
            fontSize: '28px', fontWeight: '800', color: '#1e1b4b',
            margin: '0 0 6px', letterSpacing: '-0.5px',
          }}>CabinSpace</h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
            Admin Portal — {mode === 'login' ? 'Sign in to continue' : 'Create admin account'}
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 16px 48px rgba(79,70,229,0.1)',
          border: '1px solid rgba(79,70,229,0.08)',
        }}>
          {/* Tab Toggle */}
          <div style={{ padding: '16px 24px 0', background: '#fafaf9', borderBottom: '1px solid #f5f3ff' }}>
            <div style={{
              display: 'flex', gap: '4px',
              background: '#f0f0ff', padding: '4px', borderRadius: '10px', marginBottom: '16px',
            }}>
              {['login', 'signup'].map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: mode === m ? 'white' : 'transparent',
                    color: mode === m ? '#4f46e5' : '#6b7280',
                    boxShadow: mode === m ? '0 1px 3px rgba(79,70,229,0.15)' : 'none',
                  }}
                >
                  {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Error */}
            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px',
                background: '#fee2e2', border: '1px solid #fca5a5',
                color: '#991b1b', fontSize: '13px', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                ❌ {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                id="email" name="email" type="email"
                autoComplete="email" required
                value={formData.email} onChange={handleChange}
                placeholder="admin@example.com"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #e0e7ff', borderRadius: '10px',
                  fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box',
                  background: '#fafaf9',
                }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e0e7ff'}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Password
              </label>
              <input
                id="password" name="password" type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required value={formData.password} onChange={handleChange}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #e0e7ff', borderRadius: '10px',
                  fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box',
                  background: '#fafaf9',
                }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e0e7ff'}
              />
            </div>

            {/* Confirm Password */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password"
                  autoComplete="new-password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter your password"
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: '1.5px solid #e0e7ff', borderRadius: '10px',
                    fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box',
                    background: '#fafaf9',
                  }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'}
                  onBlur={e => e.target.style.borderColor = '#e0e7ff'}
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: loading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white', fontSize: '14px', fontWeight: '700',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
                transition: 'transform 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '4px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 0.8s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? '🔑 Sign In' : '✨ Create Account'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: '12px', marginTop: '20px' }}>
          CabinSpace Admin Portal • Secure Access
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
