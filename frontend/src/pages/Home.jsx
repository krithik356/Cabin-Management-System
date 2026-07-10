import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Home Page — Premium landing page with role selection
 */
const Home = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 30%, #f5f3ff 60%, #faf5ff 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', margin: '0 auto 20px',
          boxShadow: '0 12px 32px rgba(79,70,229,0.35)',
        }}>🏠</div>
        <h1 style={{
          fontSize: '42px', fontWeight: '800', color: '#1e1b4b',
          margin: '0 0 12px', letterSpacing: '-1px', lineHeight: 1.1,
        }}>
          CabinSpace
        </h1>
        <p style={{
          fontSize: '17px', color: '#6b7280', margin: 0, maxWidth: '380px',
          lineHeight: '1.6',
        }}>
          Smart cabin booking & management for your workplace
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px', width: '100%', maxWidth: '660px',
      }}>
        {/* Admin Portal */}
        <Link to="/admin/login" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '36px 28px',
            border: '1px solid rgba(79,70,229,0.12)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(79,70,229,0.08)',
            transition: 'all 0.25s ease', cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.06), 0 24px 48px rgba(79,70,229,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(79,70,229,0.08)';
            }}
          >
            {/* Top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
            }} />

            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', marginBottom: '20px',
            }}>👨‍💼</div>

            <h2 style={{
              fontSize: '22px', fontWeight: '700', color: '#1e1b4b',
              margin: '0 0 10px', letterSpacing: '-0.3px',
            }}>Admin Portal</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
              Manage cabins, view all bookings, and oversee the entire system
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#4f46e5', fontSize: '14px', fontWeight: '700',
            }}>
              Enter as Admin
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '22px', height: '22px', borderRadius: '50%',
                background: '#eef2ff', fontSize: '12px',
              }}>→</span>
            </div>
          </div>
        </Link>

        {/* Employee Portal */}
        <Link to="/employee/login" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '36px 28px',
            border: '1px solid rgba(5,150,105,0.12)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(5,150,105,0.08)',
            transition: 'all 0.25s ease', cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.06), 0 24px 48px rgba(5,150,105,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(5,150,105,0.08)';
            }}
          >
            {/* Top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, #059669, #10b981)',
            }} />

            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', marginBottom: '20px',
            }}>🏕️</div>

            <h2 style={{
              fontSize: '22px', fontWeight: '700', color: '#064e3b',
              margin: '0 0 10px', letterSpacing: '-0.3px',
            }}>Employee Portal</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
              Browse available cabins and manage your workspace booking
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#059669', fontSize: '14px', fontWeight: '700',
            }}>
              Enter as Employee
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '22px', height: '22px', borderRadius: '50%',
                background: '#f0fdf4', fontSize: '12px',
              }}>→</span>
            </div>
          </div>
        </Link>
      </div>

      <p style={{ color: '#d1d5db', fontSize: '12px', marginTop: '40px' }}>
        CabinSpace • Workspace Booking System
      </p>
    </div>
  );
};

export default Home;
