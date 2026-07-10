import React, { useState, useEffect } from 'react';
import { getBookings, cancelBooking, editBooking } from '../services/bookingService';
import { useNavigate } from 'react-router-dom';

/**
 * Employee Bookings Page
 * Shows upcoming and past bookings with cancellation and editing functionality
 */
const EmployeeBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [employeeId, setEmployeeId] = useState('');

  // Editing state
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    if (storedEmployeeId && /^[0-9a-fA-F]{24}$/.test(storedEmployeeId)) {
      setEmployeeId(storedEmployeeId);
    } else {
      localStorage.removeItem('employeeId');
      navigate('/employee/login');
    }
  }, [navigate]);

  const fetchBookings = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await getBookings({ employeeId });
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchBookings();
    }
  }, [employeeId]);

  // IST convert helpers
  const getISTDetails = (utcDateStr) => {
    const d = new Date(utcDateStr);
    const istMs = d.getTime() + 5.5 * 60 * 60 * 1000;
    const istDate = new Date(istMs);
    const hour = istDate.getUTCHours();
    const minute = istDate.getUTCMinutes();
    const dateStr = `${istDate.getUTCFullYear()}-${String(istDate.getUTCMonth() + 1).padStart(2, '0')}-${String(istDate.getUTCDate()).padStart(2, '0')}`;
    return {
      minutes: hour * 60 + minute,
      dateString: dateStr,
      timeString: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    };
  };

  const convertTimeToUTCString = (timeStr) => {
    const localDate = new Date(`${editDate}T${timeStr}:00+05:30`);
    return localDate.toISOString();
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setError(null);
      setSuccess(null);
      await cancelBooking(bookingId, employeeId, 'employee', 'Cancelled by employee');
      setSuccess('🎉 Booking cancelled successfully!');
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleEditClick = (booking) => {
    const startIST = getISTDetails(booking.startTime);
    const endIST = getISTDetails(booking.endTime);

    setEditingBooking(booking);
    setEditDate(startIST.dateString);
    setEditStartTime(startIST.timeString);
    setEditEndTime(endIST.timeString);
    setEditPurpose(booking.purpose || '');
    setEditNotes(booking.notes || '');
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    const parseTimeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const startMin = parseTimeToMinutes(editStartTime);
    const endMin = parseTimeToMinutes(editEndTime);

    if (startMin >= endMin) {
      setEditError('Start time must be before end time');
      setEditLoading(false);
      return;
    }

    try {
      const utcStart = convertTimeToUTCString(editStartTime);
      const utcEnd = convertTimeToUTCString(editEndTime);

      await editBooking(editingBooking._id, {
        startTime: utcStart,
        endTime: utcEnd,
        purpose: editPurpose,
        notes: editNotes
      });

      setSuccess('🎉 Booking updated successfully!');
      setEditingBooking(null);
      fetchBookings();
    } catch (err) {
      setEditError(err.message || 'Time conflict or edit validation error');
    } finally {
      setEditLoading(false);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.startTime) > now
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== 'confirmed' || new Date(b.startTime) <= now
  );

  // Time select options helper
  const selectTimeOptions = [];
  for (let min = 540; min <= 1140; min += 30) { // 9 AM to 7 PM
    const h = Math.floor(min / 60);
    const m = min % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    selectTimeOptions.push(timeStr);
  }

  if (!employeeId) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%)' }}>
      
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
        padding: '40px 24px 48px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(52,211,153,0.15)', pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <p style={{ color: '#6ee7b7', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Employee Portal
          </p>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            My Bookings
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', margin: '8px 0 0' }}>
            View and manage your current and past office cabin reservations
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Success/Error Alerts */}
        {success && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46',
            fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b',
            fontSize: '14px', fontWeight: '500'
          }}>
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid #d1fae5', borderTopColor: '#10b981',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: '#6b7280' }}>Loading your reservations...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            
            {/* Upcoming Reservations */}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
                📅 Upcoming Bookings ({upcomingBookings.length})
              </h2>

              {upcomingBookings.length === 0 ? (
                <div style={{
                  background: 'white', borderRadius: '20px', padding: '48px 24px',
                  textAlign: 'center', border: '2px dashed #a7f3d0'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 16px' }}>
                    You don't have any upcoming cabin bookings.
                  </p>
                  <button
                    onClick={() => navigate('/employee/cabins')}
                    style={{
                      padding: '10px 20px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      color: 'white', fontSize: '14px', fontWeight: '600',
                      border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.2)'
                    }}
                  >
                    🏘️ Book a Cabin
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                  gap: '20px'
                }}>
                  {upcomingBookings.map((b) => {
                    const startIST = getISTDetails(b.startTime);
                    const endIST = getISTDetails(b.endTime);
                    const isConf = b.cabinId?.type === 'conference';

                    return (
                      <div
                        key={b._id}
                        style={{
                          background: 'white', borderRadius: '16px', overflow: 'hidden',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)',
                          display: 'flex', flexDirection: 'column'
                        }}
                      >
                        <div style={{
                          height: '6px',
                          background: isConf ? 'linear-gradient(90deg, #7c3aed, #a78bfa)' : 'linear-gradient(90deg, #0ea5e9, #38bdf8)'
                        }} />
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                                {b.cabinId?.name || 'Deleted Cabin'}
                              </h3>
                              <span style={{
                                display: 'inline-flex', padding: '2px 8px', borderRadius: '10px',
                                fontSize: '11px', fontWeight: '600', marginTop: '4px',
                                background: isConf ? '#f3e8ff' : '#e0f2fe',
                                color: isConf ? '#7c3aed' : '#0369a1'
                              }}>
                                {isConf ? '🏛️ Conference' : '💼 Work Cabin'}
                              </span>
                            </div>
                            <span style={{
                              padding: '3px 8px', borderRadius: '10px', fontSize: '11px',
                              fontWeight: '700', background: '#d1fae5', color: '#065f46'
                            }}>Confirmed</span>
                          </div>

                          <div style={{
                            background: '#f8fafc', padding: '12px', borderRadius: '10px',
                            fontSize: '13px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '6px',
                            marginBottom: '16px'
                          }}>
                            <div>📅 <strong>Date:</strong> {startIST.dateString}</div>
                            <div>⏰ <strong>Time:</strong> {startIST.timeString} - {endIST.timeString}</div>
                            {b.purpose && <div>📝 <strong>Purpose:</strong> {b.purpose}</div>}
                          </div>

                          <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEditClick(b)}
                              style={{
                                flex: 1, padding: '8px 12px', borderRadius: '8px',
                                background: '#f3f4f6', color: '#4b5563',
                                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleCancel(b._id)}
                              style={{
                                flex: 1, padding: '8px 12px', borderRadius: '8px',
                                background: '#fee2e2', color: '#991b1b',
                                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                              }}
                            >
                              🚫 Cancel
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past & Cancelled History */}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
                🕒 Past & Cancelled Booking History ({pastBookings.length})
              </h2>

              {pastBookings.length === 0 ? (
                <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>No booking history found.</p>
              ) : (
                <div style={{
                  background: 'white', borderRadius: '16px', overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)'
                }}>
                  {/* Table headers */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr',
                    padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                    fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase'
                  }}>
                    <div>Cabin</div>
                    <div>Date & Time</div>
                    <div>Purpose</div>
                    <div>Status</div>
                  </div>

                  {/* Rows */}
                  {pastBookings.map((b, i) => {
                    const startIST = getISTDetails(b.startTime);
                    const endIST = getISTDetails(b.endTime);
                    const isCancelled = b.status === 'cancelled';
                    
                    let statusLabel = 'Past';
                    let statusBg = '#f1f5f9';
                    let statusColor = '#475569';

                    if (isCancelled) {
                      statusLabel = 'Cancelled';
                      statusBg = '#fee2e2';
                      statusColor = '#991b1b';
                    } else if (b.status === 'completed') {
                      statusLabel = 'Completed';
                      statusBg = '#d1fae5';
                      statusColor = '#065f46';
                    } else if (b.status === 'no_show') {
                      statusLabel = 'No Show';
                      statusBg = '#fef3c7';
                      statusColor = '#d97706';
                    }

                    return (
                      <div
                        key={b._id}
                        style={{
                          display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr',
                          padding: '14px 20px', borderBottom: i < pastBookings.length - 1 ? '1px solid #f1f5f9' : 'none',
                          fontSize: '13px', color: '#374151', alignItems: 'center'
                        }}
                      >
                        <div style={{ fontWeight: '600' }}>{b.cabinId?.name || 'Deleted Cabin'}</div>
                        <div>
                          <div>{startIST.dateString}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{startIST.timeString} - {endIST.timeString}</div>
                        </div>
                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.purpose || '—'}</div>
                        <div>
                          <span style={{
                            padding: '3px 8px', borderRadius: '10px', fontSize: '11px',
                            fontWeight: '700', background: statusBg, color: statusColor,
                            display: 'inline-block'
                          }}>{statusLabel}</span>
                          {isCancelled && b.cancelReason && (
                            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Reason: {b.cancelReason}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Editing Booking Modal */}
      {editingBooking && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,15,35,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', overflow: 'hidden',
            width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #064e3b, #065f46)',
              padding: '20px 24px', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800' }}>✏️ Reschedule Booking</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#a7f3d0' }}>{editingBooking.cabinId?.name}</p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}
              >✕</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {editError && (
                <div style={{
                  padding: '10px 12px', borderRadius: '8px',
                  background: '#fee2e2', border: '1px solid #fca5a5',
                  color: '#991b1b', fontSize: '13px', fontWeight: '500'
                }}>
                  {editError}
                </div>
              )}

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                  min={new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                    Start Time *
                  </label>
                  <select
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none'
                    }}
                  >
                    {selectTimeOptions.slice(0, -1).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                    End Time *
                  </label>
                  <select
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none'
                    }}
                  >
                    {selectTimeOptions.slice(1).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Purpose
                </label>
                <input
                  type="text"
                  value={editPurpose}
                  onChange={(e) => setEditPurpose(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid #d1d5db', borderRadius: '10px',
                    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid #d1d5db', borderRadius: '10px',
                    fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Form buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '10px',
                    background: '#f3f4f6', color: '#4b5563', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    flex: 2, padding: '11px', borderRadius: '10px',
                    background: editLoading ? '#cbd5e1' : 'linear-gradient(135deg, #059669, #10b981)',
                    color: 'white', border: 'none', cursor: editLoading ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: '700'
                  }}
                >
                  {editLoading ? '⏳ Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeBookings;
