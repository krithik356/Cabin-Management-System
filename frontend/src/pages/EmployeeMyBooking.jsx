import React, { useState, useEffect } from 'react';
import { getMyBooking, cancelBooking } from '../services/cabinService';
import { useNavigate } from 'react-router-dom';

/**
 * Employee My Booking Page — Premium redesign
 */
const EmployeeMyBooking = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    if (storedEmployeeId) {
      if (/^[0-9a-fA-F]{24}$/.test(storedEmployeeId)) {
        setEmployeeId(storedEmployeeId);
      } else {
        localStorage.removeItem('employeeId');
        navigate('/employee/login');
      }
    } else {
      navigate('/employee/login');
    }
  }, [navigate]);

  const fetchBooking = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await getMyBooking(employeeId);
      setBooking(response.data.booking);
    } catch (err) {
      setError(err.message || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchBooking();
  }, [employeeId]);

  // Auto-dismiss success
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3500);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      setError(null);
      await cancelBooking(employeeId);
      setSuccess('✅ Booking cancelled successfully!');
      setBooking(null);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (!employeeId) return null;

  const isConference = booking?.type === 'conference';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%)' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
        padding: '40px 24px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(52,211,153,0.15)', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <p style={{ color: '#6ee7b7', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Employee Portal
          </p>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            My Booking
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', margin: '8px 0 0' }}>
            View and manage your current cabin reservation
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Alerts */}
        {success && (
          <div style={{
            marginBottom: '24px', padding: '14px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            border: '1px solid #6ee7b7', color: '#065f46',
            fontSize: '14px', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
          }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{
            marginBottom: '24px', padding: '14px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '1px solid #fca5a5', color: '#991b1b',
            fontSize: '14px', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span>❌</span> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid #d1fae5', borderTopColor: '#10b981',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6b7280' }}>Loading your booking...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* No Booking State */}
        {!loading && !booking && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px 32px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)',
            border: '2px dashed #a7f3d0',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 10px' }}>
              No Active Booking
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '15px', margin: '0 0 28px', lineHeight: '1.6' }}>
              You don't have any cabin booked right now.<br />
              Head over to Available Cabins to reserve your workspace.
            </p>
            <button
              onClick={() => navigate('/employee/cabins')}
              style={{
                padding: '12px 28px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white', fontSize: '15px', fontWeight: '600',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🏘️ Browse Cabins
            </button>
          </div>
        )}

        {/* Booking Card */}
        {!loading && booking && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.08)',
          }}>
            {/* Colored top band */}
            <div style={{
              height: '8px',
              background: isConference
                ? 'linear-gradient(90deg, #7c3aed, #a78bfa)'
                : 'linear-gradient(90deg, #059669, #34d399)',
            }} />

            <div style={{ padding: '32px' }}>
              {/* Title row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '28px' }}>{isConference ? '🏛️' : '🪑'}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 }}>
                      {booking.name}
                    </h2>
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                    background: isConference ? '#f3e8ff' : '#d1fae5',
                    color: isConference ? '#7c3aed' : '#065f46',
                  }}>
                    {isConference ? '🏛️ Conference Room' : '💼 Work Cabin'}
                  </span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                  background: '#fee2e2', color: '#991b1b',
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  Booked
                </span>
              </div>

              {/* Details */}
              <div style={{
                background: '#f8fafc', borderRadius: '14px', padding: '20px',
                marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '14px',
              }}>
                {booking.type === 'work' && booking.capacity && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                    }}>👥</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>CAPACITY</p>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>{booking.capacity} people</p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>📋</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>STATUS</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827', textTransform: 'capitalize' }}>{booking.status}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>🏷️</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>TYPE</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827', textTransform: 'capitalize' }}>{booking.type}</p>
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: cancelling ? '#d1d5db' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                  color: 'white', fontSize: '15px', fontWeight: '700',
                  border: 'none', cursor: cancelling ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px',
                  boxShadow: cancelling ? 'none' : '0 4px 14px rgba(239,68,68,0.35)',
                }}
                onMouseEnter={e => { if (!cancelling) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {cancelling ? '⏳ Cancelling...' : '🚫 Cancel Booking'}
              </button>

              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
                This action cannot be undone. Your cabin will be released for others.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeMyBooking;
