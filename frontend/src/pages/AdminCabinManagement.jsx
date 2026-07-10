import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCabins, createCabin, updateCabin, deleteCabin } from '../services/adminService';
import CabinCard from '../components/CabinCard';
import CabinForm from '../components/CabinForm';

/**
 * Admin Cabin Management Page — Premium redesign
 */
const AdminCabinManagement = () => {
  const navigate = useNavigate();
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCabin, setEditingCabin] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const fetchCabins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCabins();
      setCabins(response.data.cabins || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch cabins');
      if (err.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCabins(); }, []);

  const handleCreate = async (cabinData) => {
    try {
      await createCabin(cabinData);
      setShowForm(false);
      fetchCabins();
    } catch (err) {
      setError(err.message || 'Failed to create cabin');
    }
  };

  const handleUpdate = async (cabinData) => {
    try {
      await updateCabin(editingCabin._id, cabinData);
      setEditingCabin(null);
      setShowForm(false);
      fetchCabins();
    } catch (err) {
      setError(err.message || 'Failed to update cabin');
    }
  };

  const handleDelete = async (cabinId) => {
    if (!window.confirm('Are you sure you want to delete this cabin?')) return;
    try {
      await deleteCabin(cabinId);
      fetchCabins();
    } catch (err) {
      setError(err.message || 'Failed to delete cabin');
    }
  };

  const handleEdit = (cabin) => { setEditingCabin(cabin); setShowForm(true); };
  const handleCancel = () => { setShowForm(false); setEditingCabin(null); };
  const handleSubmit = (cabinData) => editingCabin ? handleUpdate(cabinData) : handleCreate(cabinData);

  const filteredCabins = cabins.filter(c => {
    if (filter === 'work') return c.type === 'work';
    if (filter === 'conference') return c.type === 'conference';
    if (filter === 'available') return c.status === 'available';
    if (filter === 'booked') return c.status === 'booked';
    return true;
  });

  const stats = {
    total: cabins.length,
    available: cabins.filter(c => c.status === 'available').length,
    booked: cabins.filter(c => c.status === 'booked').length,
    conference: cabins.filter(c => c.type === 'conference').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 30%, #f5f3ff 60%, #faf5ff 100%)' }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
        padding: '40px 24px 48px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(129,140,248,0.15)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', left: '10%',
          width: '140px', height: '140px', borderRadius: '50%',
          background: 'rgba(167,139,250,0.1)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ color: '#a5b4fc', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Admin Portal
              </p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                Cabin Management
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', margin: '8px 0 0' }}>
                Create, edit and manage all cabins
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total', value: stats.total, icon: '🏘️', color: '#c7d2fe' },
                { label: 'Available', value: stats.available, icon: '✅', color: '#a7f3d0' },
                { label: 'Booked', value: stats.booked, icon: '🔒', color: '#fecaca' },
                { label: 'Conference', value: stats.conference, icon: '🏛️', color: '#ddd6fe' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', padding: '12px 16px',
                  textAlign: 'center', minWidth: '70px',
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '2px' }}>{stat.icon}</div>
                  <div style={{ color: stat.color, fontSize: '22px', fontWeight: '800' }}>{stat.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '500' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '1px solid #fca5a5', color: '#991b1b',
            fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span>❌</span> {error}
          </div>
        )}

        {/* Cabin Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,15,35,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}>
            <CabinForm cabin={editingCabin} onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: '🏘️ All', count: cabins.length },
              { key: 'available', label: '✅ Available', count: stats.available },
              { key: 'booked', label: '🔒 Booked', count: stats.booked },
              { key: 'conference', label: '🏛️ Conference', count: stats.conference },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '600',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: filter === f.key ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'white',
                color: filter === f.key ? 'white' : '#4b5563',
                boxShadow: filter === f.key ? '0 2px 10px rgba(79,70,229,0.35)' : '0 1px 3px rgba(0,0,0,0.08)',
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

          {/* Add button */}
          <button
            onClick={() => { setEditingCabin(null); setShowForm(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', fontSize: '14px', fontWeight: '700',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ＋ Create Cabin
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid #e0e7ff', borderTopColor: '#4f46e5',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Loading cabins...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredCabins.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'white', borderRadius: '20px',
            border: '2px dashed #c7d2fe',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏠</div>
            <h3 style={{ color: '#374151', fontSize: '20px', fontWeight: '700', margin: '0 0 8px' }}>No cabins found</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 24px' }}>
              {filter === 'all' ? 'Create your first cabin to get started' : 'No cabins match this filter'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: '12px 24px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: 'white', fontSize: '14px', fontWeight: '700',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                }}
              >
                ＋ Create First Cabin
              </button>
            )}
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
                isAdmin={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCabinManagement;
