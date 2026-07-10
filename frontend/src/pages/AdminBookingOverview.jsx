import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, cancelBooking, createBooking } from '../services/bookingService';
import { getAllEmployees } from '../services/employeeService';
import { getAllCabins } from '../services/adminService';

/**
 * Admin Booking Overview Page
 * Detailed filterable list of bookings, force-cancel with reasons, and booking creation on behalf of employees
 */
const AdminBookingOverview = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [cabinFilter, setCabinFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Booking Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [targetCabinId, setTargetCabinId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetStartTime, setTargetStartTime] = useState('09:00');
  const [targetEndTime, setTargetEndTime] = useState('10:00');
  const [targetPurpose, setTargetPurpose] = useState('');
  const [targetNotes, setTargetNotes] = useState('');
  const [createError, setCreateError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsResp, employeesResp, cabinsResp] = await Promise.all([
        getBookings(),
        getAllEmployees(),
        getAllCabins()
      ]);
      setBookings(bookingsResp.data.bookings || []);
      setEmployees(employeesResp.data.employees || []);
      setCabins(cabinsResp.data.cabins || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // IST details converter
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

  const handleForceCancel = async (bookingId) => {
    const reason = window.prompt('Enter reason for cancellation (required):');
    if (reason === null) return; // cancel clicked
    if (!reason.trim()) {
      alert('You must provide a reason to cancel this booking.');
      return;
    }

    try {
      setError(null);
      await cancelBooking(bookingId, null, 'admin', reason.trim());
      alert('Booking force-cancelled successfully!');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleOpenCreateModal = () => {
    setTargetEmployeeId(employees[0]?._id || '');
    setTargetCabinId(cabins[0]?._id || '');
    setTargetDate(new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]); // today IST
    setTargetStartTime('09:00');
    setTargetEndTime('10:00');
    setTargetPurpose('');
    setTargetNotes('');
    setCreateError(null);
    setShowCreateModal(true);
  };

  const convertTimeToUTCString = (dateStr, timeStr) => {
    const localDate = new Date(`${dateStr}T${timeStr}:00+05:30`);
    return localDate.toISOString();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);

    const parseTimeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    if (parseTimeToMinutes(targetStartTime) >= parseTimeToMinutes(targetEndTime)) {
      setCreateError('Start time must be before end time');
      return;
    }

    setCreateLoading(true);

    try {
      const utcStart = convertTimeToUTCString(targetDate, targetStartTime);
      const utcEnd = convertTimeToUTCString(targetDate, targetEndTime);

      await createBooking({
        cabinId: targetCabinId,
        employeeId: targetEmployeeId,
        startTime: utcStart,
        endTime: utcEnd,
        purpose: targetPurpose,
        notes: targetNotes,
        createdByRole: 'admin'
      });

      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      setCreateError(err.message || 'Failed to create booking on behalf of employee');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'confirmed' ? b.status === 'confirmed' :
      statusFilter === 'cancelled' ? b.status === 'cancelled' : true;

    const matchesCabin =
      cabinFilter === 'all' ? true :
      b.cabinId?._id === cabinFilter;

    const matchesSearch =
      searchQuery === '' ? true :
      b.employeeId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.employeeId?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCabin && matchesSearch;
  });

  const selectTimeOptions = [];
  for (let min = 0; min <= 1440; min += 30) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    selectTimeOptions.push(timeStr);
  }

  const avatarColors = [
    ['#d1fae5', '#065f46'], ['#dbeafe', '#1e40af'], ['#ede9fe', '#6d28d9'],
    ['#fce7f3', '#9d174d'], ['#fef3c7', '#92400e'],
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 30%, #f5f3ff 60%, #faf5ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid #e0e7ff', borderTopColor: '#4f46e5',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading bookings list...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 30%, #f5f3ff 60%, #faf5ff 100%)' }}>
      
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
        padding: '40px 24px 48px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(129,140,248,0.15)', pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ color: '#a5b4fc', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Admin Portal
              </p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                Booking Overview
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', margin: '8px 0 0' }}>
                Monitor, filter, and schedule bookings on behalf of employees
              </p>
            </div>
            
            <button
              onClick={handleOpenCreateModal}
              style={{
                padding: '11px 22px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white', fontSize: '14px', fontWeight: '700',
                border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                transition: 'all 0.2s'
              }}
            >
              ＋ Create Booking
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        
        {error && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b',
            fontSize: '14px', fontWeight: '500'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px', marginBottom: '24px'
        }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            
            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0e7ff', outline: 'none', fontSize: '13px' }}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Cabin Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>Cabin</label>
              <select
                value={cabinFilter}
                onChange={(e) => setCabinFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0e7ff', outline: 'none', fontSize: '13px' }}
              >
                <option value="all">All Cabins</option>
                {cabins.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>Search Staff</label>
            <input
              type="text"
              placeholder="Search by name/email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0e7ff',
                outline: 'none', fontSize: '13px', minWidth: '220px'
              }}
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div style={{
          background: 'white', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(79,70,229,0.08)',
          border: '1px solid rgba(79,70,229,0.08)',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2.2fr 2fr 2fr 1fr 1.5fr',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)',
            borderBottom: '1px solid #e0e7ff',
            gap: '12px',
          }}>
            {['Cabin', 'Staff Member', 'Time Range (IST)', 'Status', 'Actions'].map(h => (
              <div key={h} style={{
                fontSize: '11px', fontWeight: '700', color: '#6b7280',
                textTransform: 'uppercase', letterSpacing: '0.8px',
              }}>{h}</div>
            ))}
          </div>

          {/* Table Rows */}
          {filteredBookings.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>No bookings found matching filters</p>
            </div>
          ) : (
            filteredBookings.map((b, i) => {
              const startIST = getISTDetails(b.startTime);
              const endIST = getISTDetails(b.endTime);
              const isConf = b.cabinId?.type === 'conference';
              const isCancelled = b.status === 'cancelled';
              const [avatarBg, avatarColor] = avatarColors[i % avatarColors.length];

              let statusBg = '#d1fae5';
              let statusColor = '#065f46';
              let statusText = 'Confirmed';

              if (isCancelled) {
                statusBg = '#fee2e2';
                statusColor = '#991b1b';
                statusText = 'Cancelled';
              } else if (b.status === 'completed') {
                statusBg = '#e0f2fe';
                statusColor = '#0369a1';
                statusText = 'Completed';
              }

              const getInitials = (name = '') =>
                name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

              return (
                <div key={b._id} style={{
                  display: 'grid',
                  gridTemplateColumns: '2.2fr 2fr 2fr 1fr 1.5fr',
                  padding: '16px 24px',
                  borderBottom: i < filteredBookings.length - 1 ? '1px solid #f5f3ff' : 'none',
                  gap: '12px', alignItems: 'center',
                  transition: 'background 0.15s',
                  background: 'white'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  {/* Cabin */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                      background: isConf ? '#f3e8ff' : '#eef2ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                    }}>
                      {isConf ? '🏛️' : '🪑'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#111827' }}>{b.cabinId?.name || 'Deleted Cabin'}</p>
                      <span style={{
                        fontSize: '10px', color: isConf ? '#7c3aed' : '#4f46e5', fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>{b.cabinId?.type || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Staff Member */}
                  {b.employeeId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: avatarBg, color: avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '800', flexShrink: 0,
                      }}>
                        {getInitials(b.employeeId.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.employeeId.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.employeeId.email}</p>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Deleted Employee</span>
                  )}

                  {/* Time Range */}
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: '#374151' }}>{startIST.dateString}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{startIST.timeString} - {endIST.timeString}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      padding: '3px 8px', borderRadius: '10px', fontSize: '11px',
                      fontWeight: '700', background: statusBg, color: statusColor,
                      display: 'inline-block'
                    }}>{statusText}</span>
                  </div>

                  {/* Actions */}
                  <div>
                    {b.status === 'confirmed' ? (
                      <button
                        onClick={() => handleForceCancel(b._id)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px',
                          background: '#fee2e2', color: '#991b1b', border: 'none',
                          fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                      >
                        🚫 Cancel Booking
                      </button>
                    ) : (
                      <span style={{ color: '#d1d5db', fontSize: '12px', fontStyle: 'italic' }}>
                        {isCancelled ? 'Cancelled' : 'Completed'}
                      </span>
                    )}
                  </div>

                </div>
              );
            })
          )}

          {/* Footer */}
          <div style={{
            padding: '12px 24px', background: '#fafaf9', borderTop: '1px solid #f5f3ff',
            fontSize: '12px', color: '#9ca3af',
          }}>
            Showing {filteredBookings.length} bookings
          </div>
        </div>

      </div>

      {/* Admin booking creation Modal */}
      {showCreateModal && (
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
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              padding: '20px 24px', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800' }}>＋ Create Booking</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#a5b4fc' }}>Book a cabin on behalf of an employee</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}
              >✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {createError && (
                <div style={{
                  padding: '10px 12px', borderRadius: '8px',
                  background: '#fee2e2', border: '1px solid #fca5a5',
                  color: '#991b1b', fontSize: '13px', fontWeight: '500'
                }}>
                  {createError}
                </div>
              )}

              {/* Select Employee */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Select Employee *
                </label>
                <select
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid #e0e7ff', fontSize: '13px', outline: 'none'
                  }}
                >
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>{e.name} ({e.email})</option>
                  ))}
                </select>
              </div>

              {/* Select Cabin */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Select Cabin *
                </label>
                <select
                  value={targetCabinId}
                  onChange={(e) => setTargetCabinId(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid #e0e7ff', fontSize: '13px', outline: 'none'
                  }}
                >
                  {cabins.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid #e0e7ff', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
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
                    value={targetStartTime}
                    onChange={(e) => setTargetStartTime(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1.5px solid #e0e7ff', fontSize: '13px', outline: 'none'
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
                    value={targetEndTime}
                    onChange={(e) => setTargetEndTime(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1.5px solid #e0e7ff', fontSize: '13px', outline: 'none'
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
                  placeholder="e.g. Project briefing"
                  value={targetPurpose}
                  onChange={(e) => setTargetPurpose(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid #e0e7ff', borderRadius: '10px',
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
                  value={targetNotes}
                  onChange={(e) => setTargetNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid #e0e7ff', borderRadius: '10px',
                    fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  disabled={createLoading}
                  style={{
                    flex: 2, padding: '11px', borderRadius: '10px',
                    background: createLoading ? '#cbd5e1' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: 'white', border: 'none', cursor: createLoading ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: '700'
                  }}
                >
                  {createLoading ? '⏳ Booking...' : 'Create Booking'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBookingOverview;
