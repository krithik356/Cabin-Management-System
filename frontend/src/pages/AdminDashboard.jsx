import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, createMaintenanceBlock, getAllCabins } from '../services/adminService';

/**
 * Admin Dashboard Page
 * Visualizes occupancy rates, statistics, recent actions, and maintenance scheduling
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [cabinsList, setCabinsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Maintenance Modal state
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintCabinId, setMaintCabinId] = useState('');
  const [maintDate, setMaintDate] = useState('');
  const [maintStartTime, setMaintStartTime] = useState('');
  const [maintEndTime, setMaintEndTime] = useState('');
  const [maintReason, setMaintReason] = useState('');
  const [maintError, setMaintError] = useState(null);
  const [maintLoading, setMaintLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashResp, cabinsResp] = await Promise.all([
        getDashboard(),
        getAllCabins()
      ]);
      setDashboardData(dashResp.data);
      setCabinsList(cabinsResp.data.cabins || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMaintenanceClick = () => {
    setMaintCabinId(cabinsList[0]?._id || '');
    setMaintDate(new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]); // today IST
    setMaintStartTime('09:00');
    setMaintEndTime('13:00');
    setMaintReason('');
    setMaintError(null);
    setShowMaintModal(true);
  };

  const convertTimeToUTCString = (dateStr, timeStr) => {
    const localDate = new Date(`${dateStr}T${timeStr}:00+05:30`);
    return localDate.toISOString();
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setMaintError(null);

    const parseTimeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    if (parseTimeToMinutes(maintStartTime) >= parseTimeToMinutes(maintEndTime)) {
      setMaintError('Start time must be before end time');
      return;
    }

    setMaintLoading(true);

    try {
      const utcStart = convertTimeToUTCString(maintDate, maintStartTime);
      const utcEnd = convertTimeToUTCString(maintDate, maintEndTime);

      await createMaintenanceBlock(maintCabinId, {
        startTime: utcStart,
        endTime: utcEnd,
        reason: maintReason
      });

      setShowMaintModal(false);
      fetchDashboard();
    } catch (err) {
      setMaintError(err.message || 'Failed to create maintenance block');
    } finally {
      setMaintLoading(false);
    }
  };

  // Format timestamp helper
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

  const selectTimeOptions = [];
  for (let min = 0; min <= 1440; min += 30) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    selectTimeOptions.push(timeStr);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 30%, #f5f3ff 60%, #faf5ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid #e0e7ff', borderTopColor: '#4f46e5',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading dashboard stats...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const { stats = {}, occupancy = [], recentActivity = [] } = dashboardData || {};

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
                Admin Dashboard
              </p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                Utilization Overview
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', margin: '8px 0 0' }}>
                Real-time tracking of space utilization, bookings, and operations
              </p>
            </div>
            
            <button
              onClick={handleMaintenanceClick}
              style={{
                padding: '11px 22px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white', fontSize: '14px', fontWeight: '700',
                border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                transition: 'all 0.2s'
              }}
            >
              🔧 Schedule Maintenance
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        
        {error && (
          <div style={{
            marginBottom: '24px', padding: '14px 18px', borderRadius: '12px',
            background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b',
            fontSize: '14px', fontWeight: '500'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px', marginBottom: '32px'
        }}>
          {[
            { label: 'Today\'s Bookings', value: stats.totalBookingsToday, icon: '📅', color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Upcoming Week', value: stats.upcomingWeekBookings, icon: '⚡', color: '#8b5cf6', bg: '#f5f3ff' },
            { label: 'Under Maintenance', value: stats.cabinsUnderMaintenance, icon: '🔧', color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Total Registered Staff', value: stats.totalEmployees, icon: '👥', color: '#10b981', bg: '#ecfdf5' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', gap: '16px'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px'
              }}>{s.icon}</div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#111827' }}>{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic section grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px'
        }}>
          {/* Left panel: Utilization Occupancy Map */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '24px',
            border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', margin: '0 0 16px' }}>
              📊 Today's Cabin Utilization IST
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {occupancy.map((occ) => {
                let barColor = '#10b981'; // Green
                if (occ.utilization > 70) barColor = '#ef4444'; // Red
                else if (occ.utilization > 30) barColor = '#f59e0b'; // Yellow

                return (
                  <div key={occ.cabinId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                      <span style={{ color: '#374151' }}>{occ.name}</span>
                      <span style={{ color: barColor }}>{occ.utilization}% ({occ.bookingsCount} bookings)</span>
                    </div>
                    {/* Utilization Bar */}
                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${occ.utilization}%`, height: '100%', background: barColor, borderRadius: '5px', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Recent booking activity log */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '24px',
            border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex', flexDirection: 'column'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', margin: '0 0 16px' }}>
              🕒 Recent Activity Feed
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '380px', overflowY: 'auto' }}>
              {recentActivity.length === 0 ? (
                <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>No recent activity logged.</p>
              ) : (
                recentActivity.map((activity) => {
                  const updatedIST = getISTDetails(activity.updatedAt);
                  const isCancelled = activity.status === 'cancelled';
                  
                  let badgeBg = '#d1fae5';
                  let badgeColor = '#065f46';
                  let badgeText = 'Booked';

                  if (isCancelled) {
                    badgeBg = '#fee2e2';
                    badgeColor = '#991b1b';
                    badgeText = 'Cancelled';
                  }

                  return (
                    <div
                      key={activity._id}
                      style={{
                        padding: '12px', borderRadius: '12px', background: '#f8fafc',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>
                          {activity.employeeId?.name || 'Staff member'} reserved {activity.cabinId?.name || 'Deleted Cabin'}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                          Updated: {updatedIST.dateString} {updatedIST.timeString}
                        </p>
                      </div>
                      
                      <span style={{
                        padding: '3px 8px', borderRadius: '10px', fontSize: '11px',
                        fontWeight: '700', background: badgeBg, color: badgeColor, flexShrink: 0
                      }}>{badgeText}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Maintenance Scheduling Modal */}
      {showMaintModal && (
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
                <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800' }}>🔧 Block Cabin for Maintenance</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#a5b4fc' }}>Prevent bookings during scheduled upkeep</p>
              </div>
              <button
                onClick={() => setShowMaintModal(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}
              >✕</button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {maintError && (
                <div style={{
                  padding: '10px 12px', borderRadius: '8px',
                  background: '#fee2e2', border: '1px solid #fca5a5',
                  color: '#991b1b', fontSize: '13px', fontWeight: '500'
                }}>
                  {maintError}
                </div>
              )}

              {/* Select Cabin */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Select Cabin *
                </label>
                <select
                  value={maintCabinId}
                  onChange={(e) => setMaintCabinId(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid #e0e7ff', fontSize: '13px', outline: 'none'
                  }}
                >
                  {cabinsList.map(c => (
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
                  value={maintDate}
                  onChange={(e) => setMaintDate(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid #e0e7ff', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Start & End Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                    Start Time *
                  </label>
                  <select
                    value={maintStartTime}
                    onChange={(e) => setMaintStartTime(e.target.value)}
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
                    value={maintEndTime}
                    onChange={(e) => setMaintEndTime(e.target.value)}
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

              {/* Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep cleaning / router fix"
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid #e0e7ff', borderRadius: '10px',
                    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
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
                  disabled={maintLoading}
                  style={{
                    flex: 2, padding: '11px', borderRadius: '10px',
                    background: maintLoading ? '#cbd5e1' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: 'white', border: 'none', cursor: maintLoading ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: '700'
                  }}
                >
                  {maintLoading ? '⏳ Blocking...' : 'Create Block'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
