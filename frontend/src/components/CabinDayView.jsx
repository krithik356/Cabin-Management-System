import React, { useState, useEffect } from 'react';
import { getCabinAvailability, createBooking } from '../services/bookingService';

/**
 * CabinDayView Component
 * Renders a date-picker and a visual timeline for booking a cabin.
 */
const CabinDayView = ({ cabin, employeeId, onBookingSuccess, onClose, isAdmin = false }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0] // today in IST
  );
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Form states
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  // Convert UTC Date to IST minutes/date/time details
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

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCabinAvailability(cabin._id, selectedDate);
      setAvailability(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cabin && selectedDate) {
      fetchAvailability();
    }
  }, [cabin, selectedDate]);

  if (!cabin) return null;

  const busStartMin = parseTimeToMinutes(cabin.businessHoursStart || '09:00');
  const busEndMin = parseTimeToMinutes(cabin.businessHoursEnd || '19:00');

  function parseTimeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  // Generate 30-minute intervals
  const timeSlots = [];
  for (let min = busStartMin; min < busEndMin; min += 30) {
    const h1 = Math.floor(min / 60);
    const m1 = min % 60;
    const h2 = Math.floor((min + 30) / 60);
    const m2 = (min + 30) % 60;

    const startStr = `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')}`;
    const endStr = `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`;

    timeSlots.push({
      startMin: min,
      endMin: min + 30,
      startStr,
      endStr,
      label: `${startStr} - ${endStr}`
    });
  }

  // Find slot status
  const getSlotStatus = (slot) => {
    if (!availability) return { status: 'loading' };

    const { bookings = [], maintenanceBlocks = [] } = availability;

    // Check IST past times
    const nowIST = getISTDetails(new Date().toISOString());
    const isToday = selectedDate === nowIST.dateString;
    const isPast = isToday && slot.startMin < nowIST.minutes;

    if (isPast) {
      return { status: 'past', label: 'Past Slot', color: '#e2e8f0', text: '#94a3b8' };
    }

    // Check maintenance blocks
    for (const mb of maintenanceBlocks) {
      const mbStart = getISTDetails(mb.startTime);
      const mbEnd = getISTDetails(mb.endTime);

      if (slot.startMin < mbEnd.minutes && mbStart.minutes < slot.endMin) {
        return { status: 'maintenance', label: `🔧 Maintenance: ${mb.reason}`, color: '#fef3c7', text: '#b45309' };
      }
    }

    // Check bookings
    for (const b of bookings) {
      const bStart = getISTDetails(b.startTime);
      const bEnd = getISTDetails(b.endTime);

      if (slot.startMin < bEnd.minutes && bStart.minutes < slot.endMin) {
        const isOwn = b.employeeId === employeeId;
        return {
          status: 'booked',
          label: isOwn ? '📌 Your Booking' : `🔒 Booked by ${b.employeeName}`,
          color: isOwn ? '#d1fae5' : '#fee2e2',
          text: isOwn ? '#065f46' : '#991b1b',
          isOwn
        };
      }
    }

    return { status: 'available', label: 'Available', color: '#f0fdf4', text: '#15803d' };
  };

  const convertTimeToUTCString = (timeStr) => {
    const localDate = new Date(`${selectedDate}T${timeStr}:00+05:30`);
    return localDate.toISOString();
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!startTimeStr || !endTimeStr) {
      setError('Please select start and end times');
      return;
    }

    const startMin = parseTimeToMinutes(startTimeStr);
    const endMin = parseTimeToMinutes(endTimeStr);

    if (startMin >= endMin) {
      setError('Start time must be before end time');
      return;
    }

    const duration = endMin - startMin;
    if (duration > (cabin.maxBookingMinutes || 240)) {
      setError(`Booking duration cannot exceed ${cabin.maxBookingMinutes || 240} minutes (4 hours)`);
      return;
    }
    if (duration < (cabin.minBookingMinutes || 30)) {
      setError(`Booking duration must be at least ${cabin.minBookingMinutes || 30} minutes`);
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const utcStart = convertTimeToUTCString(startTimeStr);
      const utcEnd = convertTimeToUTCString(endTimeStr);

      await createBooking({
        cabinId: cabin._id,
        employeeId,
        startTime: utcStart,
        endTime: utcEnd,
        purpose,
        notes,
        createdByRole: isAdmin ? 'admin' : 'employee'
      });

      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (err) {
      setError(err.message || 'Booking conflict or database error');
    } finally {
      setBookingLoading(false);
    }
  };

  const selectTimeOptions = [];
  for (let min = busStartMin; min <= busEndMin; min += 30) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    selectTimeOptions.push(timeStr);
  }

  // Pre-fill fields on clicking availability slot
  const handleSlotClick = (slot, status) => {
    if (status.status === 'available') {
      setStartTimeStr(slot.startStr);
      // Auto-set end time to 30 mins later or max 1 hour later
      setEndTimeStr(slot.endStr);
      setError(null);
    }
  };

  return (
    <div style={{
      background: 'white', borderRadius: '24px', overflow: 'hidden',
      width: '100%', maxWidth: '850px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b, #065f46)',
        padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'white'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>
            📅 Book {cabin.name}
          </h2>
          <p style={{ color: '#a7f3d0', fontSize: '13px', margin: 0 }}>
            {cabin.type === 'work' ? `💼 Work Cabin • Capacity: ${cabin.capacity} people` : '🏛️ Conference Room'}
          </p>
        </div>
        <button onClick={onClose} style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: 'white', fontSize: '16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>✕</button>
      </div>

      {/* Main split view */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        maxHeight: '75vh', overflow: 'hidden'
      }}>
        {/* Left Side: Timeline */}
        <div style={{
          padding: '24px', borderRight: '1px solid #e2e8f0',
          overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px' }}>
            Select Date & Check Availability
          </h3>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            min={new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]}
            style={{
              padding: '10px 14px', borderRadius: '10px',
              border: '1.5px solid #d1fae5', outline: 'none',
              fontSize: '14px', fontWeight: '600', color: '#065f46',
              background: '#f0fdf4', marginBottom: '12px'
            }}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '3px solid #d1fae5', borderTopColor: '#059669',
                animation: 'spin 0.8s linear infinite', margin: '0 auto'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {timeSlots.map(slot => {
                const status = getSlotStatus(slot);
                const isSelected = startTimeStr === slot.startStr || (startTimeStr && endTimeStr &&
                  parseTimeToMinutes(slot.startStr) >= parseTimeToMinutes(startTimeStr) &&
                  parseTimeToMinutes(slot.endStr) <= parseTimeToMinutes(endTimeStr)
                );
                return (
                  <div
                    key={slot.startMin}
                    onClick={() => handleSlotClick(slot, status)}
                    style={{
                      padding: '10px 14px', borderRadius: '10px',
                      background: status.color, color: status.text,
                      fontSize: '13px', fontWeight: '600',
                      border: isSelected ? '2px solid #059669' : '1px solid rgba(0,0,0,0.04)',
                      cursor: status.status === 'available' ? 'pointer' : 'not-allowed',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                      if (status.status === 'available') e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span>{slot.label}</span>
                    <span style={{ fontSize: '11px', opacity: 0.85 }}>{status.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Form */}
        <div style={{ padding: '24px', overflowY: 'auto', background: '#f8fafc' }}>
          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              Reserve Your Time
            </h3>

            {error && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                background: '#fee2e2', border: '1px solid #fca5a5',
                color: '#991b1b', fontSize: '13px', fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            {/* Time Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                  Start Time *
                </label>
                <select
                  value={startTimeStr}
                  onChange={e => setStartTimeStr(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none'
                  }}
                >
                  <option value="">Select</option>
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
                  value={endTimeStr}
                  onChange={e => setEndTimeStr(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none'
                  }}
                >
                  <option value="">Select</option>
                  {selectTimeOptions.slice(1).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration info */}
            {startTimeStr && endTimeStr && (
              <div style={{
                background: '#e0f2fe', color: '#0369a1',
                padding: '10px 14px', borderRadius: '10px',
                fontSize: '12px', fontWeight: '600'
              }}>
                ⏰ Duration: {
                  (parseTimeToMinutes(endTimeStr) - parseTimeToMinutes(startTimeStr))
                } minutes (max {cabin.maxBookingMinutes || 240} min)
              </div>
            )}

            {/* Purpose */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                Booking Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Design review meeting"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #d1d5db', borderRadius: '10px',
                  fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                Additional Notes
              </label>
              <textarea
                placeholder="Any additional details..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #d1d5db', borderRadius: '10px',
                  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                  resize: 'none'
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={bookingLoading}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: bookingLoading ? '#cbd5e1' : 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white', fontSize: '14px', fontWeight: '700',
                border: 'none', cursor: bookingLoading ? 'not-allowed' : 'pointer',
                boxShadow: bookingLoading ? 'none' : '0 4px 14px rgba(5,150,105,0.3)',
                transition: 'all 0.2s',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
              }}
            >
              {bookingLoading ? '⏳ Booking...' : '⚡ Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CabinDayView;
