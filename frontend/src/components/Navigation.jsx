import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Navigation Component
 * Premium navigation bar for admin and employee views
 */
const Navigation = ({ isAdmin = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('adminToken');
      navigate('/');
    } else {
      localStorage.removeItem('employeeId');
      localStorage.removeItem('employeeName');
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  if (isAdmin) {
    return (
      <nav style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
        boxShadow: '0 4px 24px rgba(30,27,75,0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>🏠</div>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '18px', letterSpacing: '-0.3px' }}>
                CabinSpace <span style={{ color: '#a5b4fc', fontWeight: '400', fontSize: '13px' }}>Admin</span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { path: '/admin/dashboard', label: '📊 Dashboard' },
                { path: '/admin/cabins', label: '🏘️ Cabin Management' },
                { path: '/admin/bookings', label: '📋 Booking Overview' },
              ].map(({ path, label }) => (
                <Link key={path} to={path} style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: isActive(path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: isActive(path) ? 'white' : 'rgba(255,255,255,0.7)',
                  backdropFilter: isActive(path) ? 'blur(8px)' : 'none',
                  border: isActive(path) ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                }}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: '14px', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
            >
              <span>↩</span> Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Employee Navigation
  const employeeName = localStorage.getItem('employeeName') || 'Employee';

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
      boxShadow: '0 4px 24px rgba(6,78,59,0.4)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #34d399, #6ee7b7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>🏕️</div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '18px', letterSpacing: '-0.3px' }}>
              CabinSpace <span style={{ color: '#6ee7b7', fontWeight: '400', fontSize: '13px' }}>Employee</span>
            </span>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { path: '/employee/cabins', label: '🏘️ Available Cabins' },
              { path: '/employee/bookings', label: '📅 My Bookings' },
            ].map(({ path, label }) => (
              <Link key={path} to={path} style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.2s',
                background: isActive(path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: isActive(path) ? 'white' : 'rgba(255,255,255,0.75)',
                backdropFilter: isActive(path) ? 'blur(8px)' : 'none',
                border: isActive(path) ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* User + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #34d399, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', color: 'white',
              }}>
                {employeeName.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500' }}>
                {employeeName}
              </span>
            </div>

            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: '14px', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
            >
              <span>↩</span> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
