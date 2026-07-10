import React, { useState, useEffect } from 'react';

/**
 * CabinForm Component — Premium redesign (modal style)
 * Supports configuring business hours, buffer times, min/max booking limits.
 */
const CabinForm = ({ cabin = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'work',
    capacity: '',
    status: 'available',
    businessHoursStart: '09:00',
    businessHoursEnd: '19:00',
    bufferMinutes: 0,
    minBookingMinutes: 30,
    maxBookingMinutes: 240, // 4 hours
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cabin) {
      setFormData({
        name: cabin.name || '',
        type: cabin.type || 'work',
        capacity: cabin.capacity || '',
        status: cabin.status || 'available',
        businessHoursStart: cabin.businessHoursStart || '09:00',
        businessHoursEnd: cabin.businessHoursEnd || '19:00',
        bufferMinutes: cabin.bufferMinutes !== undefined ? cabin.bufferMinutes : 0,
        minBookingMinutes: cabin.minBookingMinutes !== undefined ? cabin.minBookingMinutes : 30,
        maxBookingMinutes: cabin.maxBookingMinutes !== undefined ? cabin.maxBookingMinutes : 240,
      });
    }
  }, [cabin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (['capacity', 'bufferMinutes', 'minBookingMinutes', 'maxBookingMinutes'].includes(name)) {
      processedValue = value === '' ? '' : parseInt(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Cabin name is required';
    if (formData.type === 'work' && !formData.capacity) newErrors.capacity = 'Capacity is required for work cabins';
    if (formData.type === 'work' && formData.capacity && formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';

    // Time validation
    const parseTime = (str) => {
      const [h, m] = str.split(':').map(Number);
      return h * 60 + m;
    };

    if (parseTime(formData.businessHoursStart) >= parseTime(formData.businessHoursEnd)) {
      newErrors.businessHoursEnd = 'End time must be after start time';
    }

    if (formData.bufferMinutes < 0) newErrors.bufferMinutes = 'Buffer minutes cannot be negative';
    if (formData.minBookingMinutes < 1) newErrors.minBookingMinutes = 'Min booking must be at least 1 min';
    if (formData.maxBookingMinutes < formData.minBookingMinutes) {
      newErrors.maxBookingMinutes = 'Max booking must be greater than min booking';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        name: formData.name.trim(),
        type: formData.type,
        status: formData.status,
        businessHoursStart: formData.businessHoursStart,
        businessHoursEnd: formData.businessHoursEnd,
        bufferMinutes: parseInt(formData.bufferMinutes),
        minBookingMinutes: parseInt(formData.minBookingMinutes),
        maxBookingMinutes: parseInt(formData.maxBookingMinutes),
      };
      if (formData.type === 'work') {
        submitData.capacity = parseInt(formData.capacity);
      }
      onSubmit(submitData);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '9px 12px',
    border: `1.5px solid ${hasError ? '#fca5a5' : '#e0e7ff'}`,
    borderRadius: '10px', fontSize: '13px', color: '#111827',
    outline: 'none', boxSizing: 'border-box',
    background: hasError ? '#fff5f5' : '#fafaf9',
    transition: 'border-color 0.2s',
  });

  const selectStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #e0e7ff',
    borderRadius: '10px', fontSize: '13px', color: '#111827',
    outline: 'none', boxSizing: 'border-box',
    background: '#fafaf9', cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
  };

  const typeConfig = {
    work: { icon: '💼', desc: 'Individual / Team workspace' },
    conference: { icon: '🏛️', desc: 'Meeting & presentation room' },
  };

  const selectTimeOptions = [];
  for (let min = 0; min <= 1440; min += 30) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    selectTimeOptions.push(timeStr);
  }

  return (
    <div style={{
      background: 'white', borderRadius: '20px', overflow: 'hidden',
      width: '100%', maxWidth: '480px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      border: '1px solid rgba(79,70,229,0.1)',
      maxHeight: '90vh', display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: '0 0 2px' }}>
            {cabin ? '✏️ Edit Cabin Settings' : '＋ Create New Cabin'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>
            {cabin ? 'Update configuration and parameters' : 'Define new workspace cabin'}
          </p>
        </div>
        <button onClick={onCancel} style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'white', fontSize: '16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      <form onSubmit={handleSubmit} style={{
        padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px',
        overflowY: 'auto', flex: 1
      }}>

        {/* Cabin Name */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
            Cabin Name *
          </label>
          <input
            type="text" name="name" id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Conference Room A / Cabin 5"
            style={inputStyle(!!errors.name)}
          />
          {errors.name && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>⚠ {errors.name}</p>}
        </div>

        {/* Type Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            Cabin Type *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {['work', 'conference'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(p => ({ ...p, type }))}
                style={{
                  padding: '10px', borderRadius: '10px', cursor: 'pointer',
                  border: `2px solid ${formData.type === type ? '#4f46e5' : '#e0e7ff'}`,
                  background: formData.type === type ? '#eef2ff' : 'white',
                  transition: 'all 0.2s', textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '2px' }}>{typeConfig[type].icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: formData.type === type ? '#4f46e5' : '#374151', textTransform: 'capitalize' }}>{type}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>{typeConfig[type].desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Capacity & Status side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: formData.type === 'work' ? '1fr 1fr' : '1fr', gap: '12px' }}>
          {formData.type === 'work' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                Capacity (people) *
              </label>
              <input
                type="number" name="capacity" id="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 4"
                style={inputStyle(!!errors.capacity)}
              />
              {errors.capacity && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>⚠ {errors.capacity}</p>}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Status *
            </label>
            <select name="status" id="status" value={formData.status} onChange={handleChange} style={selectStyle}>
              <option value="available">✅ Available</option>
              <option value="booked">🔒 Booked</option>
              <option value="maintenance">🔧 Maintenance</option>
            </select>
          </div>
        </div>

        {/* Business Hours */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Business Start *
            </label>
            <select
              name="businessHoursStart"
              value={formData.businessHoursStart}
              onChange={handleChange}
              style={selectStyle}
            >
              {selectTimeOptions.slice(0, -1).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Business End *
            </label>
            <select
              name="businessHoursEnd"
              value={formData.businessHoursEnd}
              onChange={handleChange}
              style={selectStyle}
            >
              {selectTimeOptions.slice(1).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.businessHoursEnd && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>⚠ {errors.businessHoursEnd}</p>}
          </div>
        </div>

        {/* Constraints: Min/Max Duration & Buffer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Min Duration (min) *
            </label>
            <input
              type="number" name="minBookingMinutes" id="minBookingMinutes"
              value={formData.minBookingMinutes}
              onChange={handleChange}
              min="1"
              style={inputStyle(!!errors.minBookingMinutes)}
            />
            {errors.minBookingMinutes && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>⚠ {errors.minBookingMinutes}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Max Duration (min) *
            </label>
            <input
              type="number" name="maxBookingMinutes" id="maxBookingMinutes"
              value={formData.maxBookingMinutes}
              onChange={handleChange}
              min="1"
              style={inputStyle(!!errors.maxBookingMinutes)}
            />
            {errors.maxBookingMinutes && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>⚠ {errors.maxBookingMinutes}</p>}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
            Buffer Between Bookings (minutes) *
          </label>
          <input
            type="number" name="bufferMinutes" id="bufferMinutes"
            value={formData.bufferMinutes}
            onChange={handleChange}
            min="0"
            style={inputStyle(!!errors.bufferMinutes)}
          />
          {errors.bufferMinutes && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>⚠ {errors.bufferMinutes}</p>}
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', marginTop: 'auto' }}>
          <button
            type="button" onClick={onCancel}
            style={{
              flex: 1, padding: '11px', borderRadius: '12px',
              background: '#f3f4f6', color: '#4b5563',
              fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              flex: 2, padding: '11px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', fontSize: '13px', fontWeight: '700',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
            }}
          >
            {cabin ? '💾 Save Cabin Settings' : '＋ Create Cabin'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CabinForm;
