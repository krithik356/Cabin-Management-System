import React, { useState } from 'react';

/**
 * CabinCard Component — Premium redesign
 */
const CabinCard = ({ cabin, onBook, onEdit, onDelete, isAdmin = false, showActions = true }) => {
  const [booking, setBooking] = useState(false);

  const isConference = cabin.type === 'conference';
  const isAvailable = cabin.status === 'available' && !cabin.isBooked;

  const statusConfig = {
    available: { bg: '#d1fae5', color: '#065f46', dot: '#10b981', label: 'Available' },
    booked: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', label: 'Booked' },
    maintenance: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Maintenance' },
  };
  const status = statusConfig[cabin.status] || statusConfig.available;

  const handleBook = async () => {
    setBooking(true);
    await onBook(cabin._id);
    setBooking(false);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.06)',
      transition: 'all 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Colored top band */}
      <div style={{
        height: '6px',
        background: isConference
          ? 'linear-gradient(90deg, #7c3aed, #a78bfa)'
          : 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
      }} />

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '20px' }}>{isConference ? '🏛️' : '🪑'}</span>
              <h3 style={{
                fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0,
                letterSpacing: '-0.2px',
              }}>{cabin.name}</h3>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              background: isConference ? '#f3e8ff' : '#e0f2fe',
              color: isConference ? '#7c3aed' : '#0369a1',
            }}>
              {isConference ? '🏛️ Conference' : '💼 Work Cabin'}
            </span>
          </div>

          {/* Status badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            background: status.bg, color: status.color,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: status.dot, display: 'inline-block',
            }} />
            {status.label}
          </span>
        </div>

        {/* Details */}
        <div style={{
          background: '#f8fafc', borderRadius: '10px', padding: '12px',
          marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          {cabin.type === 'work' && cabin.capacity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563' }}>
              <span>👥</span>
              <span><strong>Capacity:</strong> {cabin.capacity} people</span>
            </div>
          )}
          {cabin.bookedBy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563' }}>
              <span>👤</span>
              <span><strong>Booked by:</strong> {cabin.bookedBy.name || cabin.bookedBy.email || cabin.bookedBy}</span>
            </div>
          )}
          {!cabin.bookedBy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
              <span>{isAvailable ? '✅' : '🔒'}</span>
              <span>{isAvailable ? 'Ready to book' : 'Not available'}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
            {!isAdmin && isAvailable && (
              <button
                onClick={handleBook}
                disabled={booking}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: '10px',
                  background: booking ? '#d1d5db' : 'linear-gradient(135deg, #059669, #10b981)',
                  color: 'white', fontSize: '14px', fontWeight: '600',
                  border: 'none', cursor: booking ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px',
                  boxShadow: booking ? 'none' : '0 2px 8px rgba(16,185,129,0.35)',
                }}
                onMouseEnter={e => { if (!booking) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {booking ? '⏳ Booking...' : '⚡ Book Now'}
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() => onEdit(cabin)}
                  style={{
                    flex: 1, padding: '9px 14px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                    color: 'white', fontSize: '13px', fontWeight: '600',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(cabin._id)}
                  style={{
                    flex: 1, padding: '9px 14px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    color: 'white', fontSize: '13px', fontWeight: '600',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CabinCard;
