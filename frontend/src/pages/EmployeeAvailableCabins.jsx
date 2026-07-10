import React, { useState, useEffect } from 'react';
import { getAvailableCabins } from '../services/cabinService';
import CabinCard from '../components/CabinCard';
import CabinDayView from '../components/CabinDayView';
import { useNavigate } from 'react-router-dom';

/**
 * Employee Available Cabins Page — Premium redesign
 */
const EmployeeAvailableCabins = () => {
  const navigate = useNavigate();
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCabinForBooking, setSelectedCabinForBooking] = useState(null);

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
  }, []);

  const fetchCabins = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await getAvailableCabins();
      setCabins(response.data.cabins || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch available cabins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchCabins();
  }, [employeeId]);

  // Auto-dismiss success message
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3500);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleBook = (cabinId) => {
    if (!employeeId) { setError('Please log in first'); return; }
    const cabin = cabins.find(c => c._id === cabinId);
    setSelectedCabinForBooking(cabin);
  };

  const filteredCabins = cabins.filter(c => {
    if (filter === 'work') return c.type === 'work';
    if (filter === 'conference') return c.type === 'conference';
    return true;
  });

  const workCount = cabins.filter(c => c.type === 'work').length;
  const confCount = cabins.filter(c => c.type === 'conference').length;

  if (!employeeId) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%)' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
        padding: '40px 24px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(52,211,153,0.15)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', left: '10%',
          width: '140px', height: '140px', borderRadius: '50%',
          background: 'rgba(167,243,208,0.1)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ color: '#6ee7b7', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Employee Portal
              </p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                Available Cabins
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', marginTop: '8px', margin: '8px 0 0' }}>
                Browse and reserve your workspace for the day
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Total', value: cabins.length, icon: '🏘️', color: '#a7f3d0' },
                { label: 'Work', value: workCount, icon: '💼', color: '#bfdbfe' },
                { label: 'Conference', value: confCount, icon: '🏛️', color: '#ddd6fe' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  minWidth: '70px',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>{stat.icon}</div>
                  <div style={{ color: stat.color, fontSize: '22px', fontWeight: '800' }}>{stat.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '500' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Alerts */}
        {success && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            border: '1px solid #6ee7b7', color: '#065f46',
            fontSize: '14px', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
          }}>
            <span style={{ fontSize: '18px' }}>✅</span> {success}
          </div>
        )}
        {error && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '1px solid #fca5a5', color: '#991b1b',
            fontSize: '14px', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 2px 8px rgba(239,68,68,0.15)',
          }}>
            <span style={{ fontSize: '18px' }}>❌</span> {error}
          </div>
        )}

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: '🏘️ All Cabins', count: cabins.length },
            { key: 'work', label: '💼 Work', count: workCount },
            { key: 'conference', label: '🏛️ Conference', count: confCount },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '8px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: '600',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: filter === f.key
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'white',
              color: filter === f.key ? 'white' : '#4b5563',
              boxShadow: filter === f.key
                ? '0 2px 10px rgba(16,185,129,0.35)'
                : '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              {f.label} <span style={{
                marginLeft: '4px', fontSize: '11px',
                background: filter === f.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                color: filter === f.key ? 'white' : '#6b7280',
                borderRadius: '10px', padding: '1px 6px',
              }}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid #d1fae5', borderTopColor: '#10b981',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Loading available cabins...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredCabins.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'white', borderRadius: '20px',
            border: '2px dashed #d1fae5',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏕️</div>
            <h3 style={{ color: '#374151', fontSize: '20px', fontWeight: '700', margin: '0 0 8px' }}>
              No cabins available
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
              Check back later or try a different filter
            </p>
          </div>
        )}

        {/* Cabin Grid */}
        {!loading && filteredCabins.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {filteredCabins.map(cabin => (
              <CabinCard
                key={cabin._id}
                cabin={cabin}
                onBook={handleBook}
                isAdmin={false}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Cabin Day View Modal */}
        {selectedCabinForBooking && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,15,35,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
          }}>
            <CabinDayView
              cabin={selectedCabinForBooking}
              employeeId={employeeId}
              onBookingSuccess={() => {
                setSelectedCabinForBooking(null);
                setSuccess('🎉 Cabin booked successfully! Check "My Bookings" to view it.');
                fetchCabins();
              }}
              onClose={() => setSelectedCabinForBooking(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAvailableCabins;
