import React, { useState, useEffect } from 'react';
import { getAllEmployees, createEmployee } from '../services/employeeService';
import { useNavigate } from 'react-router-dom';

/**
 * Employee Login/Selection Page — Premium redesign
 */
const EmployeeLogin = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllEmployees();
      setEmployees(response.data.employees || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleSelectEmployee = (employee) => {
    localStorage.setItem('employeeId', employee._id);
    localStorage.setItem('employeeName', employee.name);
    navigate('/employee/cabins');
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      const response = await createEmployee(formData);
      const newEmployee = response.data.employee;
      localStorage.setItem('employeeId', newEmployee._id);
      localStorage.setItem('employeeName', newEmployee.name);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/employee/cabins'), 900);
    } catch (err) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = [
    ['#d1fae5', '#065f46'], ['#dbeafe', '#1e40af'], ['#ede9fe', '#6d28d9'],
    ['#fce7f3', '#9d174d'], ['#fef3c7', '#92400e'], ['#e0f2fe', '#0369a1'],
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f0fdf4 0%, #d1fae5 30%, #ecfdf5 60%, #f8fafc 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
          }}>🏕️</div>
          <h1 style={{
            fontSize: '28px', fontWeight: '800', color: '#064e3b',
            margin: '0 0 6px', letterSpacing: '-0.5px',
          }}>CabinSpace</h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
            Employee Portal — Select your account to continue
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 16px 48px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          {/* Tab bar */}
          {!showCreateForm && (
            <div style={{
              background: '#f8fafc', borderBottom: '1px solid #f0fdf4',
              padding: '16px 24px 0',
            }}>
              <div style={{ display: 'flex', gap: '4px', background: '#f0fdf4', padding: '4px', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{
                  flex: 1, textAlign: 'center', padding: '8px',
                  background: 'white', borderRadius: '8px', fontSize: '13px',
                  fontWeight: '600', color: '#065f46',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}>
                  🧑 Select Account
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  style={{
                    flex: 1, textAlign: 'center', padding: '8px',
                    background: 'transparent', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '600', color: '#6b7280', border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#065f46'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  ✨ New Account
                </button>
              </div>
            </div>
          )}

          <div style={{ padding: '24px' }}>
            {/* Alerts */}
            {success && (
              <div style={{
                marginBottom: '16px', padding: '12px 16px', borderRadius: '10px',
                background: '#d1fae5', border: '1px solid #6ee7b7',
                color: '#065f46', fontSize: '14px', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                ✅ {success}
              </div>
            )}
            {error && (
              <div style={{
                marginBottom: '16px', padding: '12px 16px', borderRadius: '10px',
                background: '#fee2e2', border: '1px solid #fca5a5',
                color: '#991b1b', fontSize: '14px', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                ❌ {error}
              </div>
            )}

            {/* Employee List */}
            {!showCreateForm && (
              <>
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px 10px 38px',
                      border: '1.5px solid #d1fae5', borderRadius: '10px',
                      fontSize: '14px', color: '#111827',
                      outline: 'none', boxSizing: 'border-box',
                      background: '#f8fafc',
                    }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#d1fae5'}
                  />
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      border: '3px solid #d1fae5', borderTopColor: '#10b981',
                      animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
                    }} />
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading employees...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
                    <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                      {search ? 'No matches found' : 'No employees yet. Create one!'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                    {filteredEmployees.map((employee, i) => {
                      const [bg, color] = avatarColors[i % avatarColors.length];
                      return (
                        <button
                          key={employee._id}
                          onClick={() => handleSelectEmployee(employee)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 14px', borderRadius: '12px',
                            background: '#f8fafc', border: '1.5px solid #f0fdf4',
                            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#f0fdf4';
                            e.currentTarget.style.borderColor = '#6ee7b7';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#f0fdf4';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: bg, color: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '15px', fontWeight: '800', flexShrink: 0,
                          }}>
                            {getInitials(employee.name)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#111827' }}>
                              {employee.name}
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {employee.email}
                            </p>
                          </div>
                          <span style={{ color: '#10b981', fontSize: '18px', fontWeight: '700' }}>→</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!loading && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    style={{
                      width: '100%', marginTop: '16px', padding: '12px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      color: 'white', fontSize: '14px', fontWeight: '700',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: '0 2px 10px rgba(16,185,129,0.3)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    ✨ Create New Account
                  </button>
                )}
              </>
            )}

            {/* Create Employee Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>✨</div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    Create Your Account
                  </h2>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>
                    Enter your details to get started
                  </p>
                </div>

                {[
                  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Jane Smith', key: 'name' },
                  { id: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. jane@company.com', key: 'email' },
                ].map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} style={{
                      display: 'block', fontSize: '13px', fontWeight: '600',
                      color: '#374151', marginBottom: '6px',
                    }}>
                      {field.label} *
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      value={formData[field.key]}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      required
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '11px 14px',
                        border: '1.5px solid #d1d5db', borderRadius: '10px',
                        fontSize: '14px', color: '#111827',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = '#10b981'}
                      onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setError(null); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px',
                      background: '#f3f4f6', color: '#4b5563',
                      fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer',
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    style={{
                      flex: 2, padding: '12px', borderRadius: '12px',
                      background: creating ? '#d1d5db' : 'linear-gradient(135deg, #059669, #10b981)',
                      color: 'white', fontSize: '14px', fontWeight: '700',
                      border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
                      boxShadow: creating ? 'none' : '0 2px 10px rgba(16,185,129,0.3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {creating ? '⏳ Creating...' : '✨ Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginTop: '20px' }}>
          CabinSpace Employee Portal • Cabin Booking System
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
