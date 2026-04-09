import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiUsers, FiPackage, FiCheckCircle, FiClock, FiActivity, FiCheck, FiX, FiMapPin, FiUser, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { api } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import './AdminPage.css';

const CATEGORIES = [
  'Antibiotic', 'Antifungal', 'Antiviral', 'Analgesic', 'Antipyretic',
  'Antihypertensive', 'Antidiabetic', 'Antihistamine', 'Antacid',
  'Cardiovascular', 'Respiratory', 'Neurological', 'Oncology',
  'Vitamin/Supplement', 'Vaccine', 'Contraceptive', 'Other'
];

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Suppository', 'Other'];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('pending'); // pending, fixed, addMedicine, intelligence
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Add Medicine Form
  const [medicineForm, setMedicineForm] = useState({
    name: '', generic: '', brand: '', category: 'Antibiotic', 
    dosageForm: 'Tablet', strength: '', manufacturer: '',
    composition: '', description: '', isVerified: true, riskLevel: 'low'
  });
  const [savingMedicine, setSavingMedicine] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadReports();
  }, [activeTab]); // eslint-disable-line

  const loadStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch {}
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'pending' ? 'pending' : activeTab === 'fixed' ? 'action_taken' : '';
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', '50');
      const { data } = await api.get(`/reports?${params}`);
      setReports(data.data || []);
    } catch {}
    setLoading(false);
  };

  const handleStatusUpdate = async (reportId, status) => {
    setUpdatingId(reportId);
    try {
      await api.put(`/reports/${reportId}/status`, { status, reviewNotes: status === 'action_taken' ? 'Issue resolved - action taken' : '' });
      toast.success(status === 'action_taken' ? 'Marked as Fixed!' : 'Status updated');
      loadReports();
      loadStats();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setSavingMedicine(true);
    try {
      await api.post('/medicines', medicineForm);
      toast.success('Medicine added successfully!');
      setMedicineForm({
        name: '', generic: '', brand: '', category: 'Antibiotic',
        dosageForm: 'Tablet', strength: '', manufacturer: '',
        composition: '', description: '', isVerified: true, riskLevel: 'low'
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setSavingMedicine(false);
    }
  };

  const priorityBadge = (p) => ({
    low: 'badge-slate', medium: 'badge-amber', high: 'badge-red', urgent: 'badge-red'
  }[p] || 'badge-slate');

  return (
    <div className="admin-page page-enter">
      {/* Header */}
      <div className="admin-page__header" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="container">
          <h1 style={{ color: '#fff' }}>🛡️ Admin Panel</h1>
          <p style={{ color: '#94a3b8' }}>Manage reports, add medicines, and monitor platform</p>
        </div>
      </div>

      <div className="container admin-body">
        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#fee2e2', padding: 10, borderRadius: 8 }}>
                  <FiAlertTriangle size={20} color="#ef4444" />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{stats.pendingReports || 0}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Pending Reports</div>
                </div>
              </div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#dcfce7', padding: 10, borderRadius: 8 }}>
                  <FiCheckCircle size={20} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{stats.actionTakenReports || 0}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Fixed Reports</div>
                </div>
              </div>
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#dbeafe', padding: 10, borderRadius: 8 }}>
                  <FiPackage size={20} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{stats.totalMedicines || 0}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Medicines</div>
                </div>
              </div>
            </div>
            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#ede9fe', padding: 10, borderRadius: 8 }}>
                  <FiUsers size={20} color="#8b5cf6" />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{stats.totalUsers || 0}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Users</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e5e7eb', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: activeTab === 'pending' ? '#ef4444' : '#f3f4f6',
              color: activeTab === 'pending' ? '#fff' : '#374151'
            }}
          >
            <FiAlertCircle size={18} />
            Pending ({stats?.pendingReports || 0})
          </button>
          <button
            onClick={() => setActiveTab('fixed')}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: activeTab === 'fixed' ? '#16a34a' : '#f3f4f6',
              color: activeTab === 'fixed' ? '#fff' : '#374151'
            }}
          >
            <FiCheckCircle size={18} />
            Add Medicine
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: activeTab === 'intelligence' ? '#8b5cf6' : '#f3f4f6',
              color: activeTab === 'intelligence' ? '#fff' : '#374151'
            }}
          >
            <FiActivity size={18} />
            Counterfeit Intelligence
          </button>
        </div>

        {/* PENDING REPORTS TAB */}
        {activeTab === 'pending' && (
          <div>
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiAlertTriangle size={24} color="#d97706" />
              <div>
                <strong style={{ color: '#92400e' }}>{reports.length} pending reports need attention</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#b45309' }}>Review each report and mark as fixed when resolved</p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner spinner-dark" style={{ width: 28, height: 28 }} /></div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: '#f9fafb', borderRadius: 12 }}>
                <FiCheckCircle size={48} color="#9ca3af" />
                <h3 style={{ marginTop: 16, color: '#374151' }}>No pending reports!</h3>
                <p style={{ color: '#6b7280' }}>All reports have been resolved</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reports.map(report => (
                  <div key={report._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>NEW</span>
                          <h3 style={{ margin: 0, fontSize: 18 }}>{report.medicineName}</h3>
                        </div>
                        <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 13 }}>ID: {report.reportId}</p>
                      </div>
                      <span className={`badge ${priorityBadge(report.priority)}`}>{report.priority}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiMapPin size={16} color="#6b7280" />
                        <span style={{ fontSize: 13, color: '#374151' }}>
                          {report.purchaseLocation?.city}, {report.purchaseLocation?.state}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiUser size={16} color="#6b7280" />
                        <span style={{ fontSize: 13, color: '#374151' }}>
                          {report.isAnonymous ? 'Anonymous' : report.reportedBy?.name || 'Unknown'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiClock size={16} color="#6b7280" />
                        <span style={{ fontSize: 13, color: '#374151' }}>
                          {new Date(report.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: '#fef2f2', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                      <strong style={{ color: '#991b1b' }}>Issue: </strong>
                      <span style={{ color: '#7f1d1d' }}>{report.suspicionType?.replace(/_/g, ' ')}</span>
                      <p style={{ margin: '8px 0 0', color: '#7f1d1d', fontSize: 13 }}>{report.description}</p>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => handleStatusUpdate(report._id, 'action_taken')}
                        disabled={updatingId === report._id}
                        style={{
                          flex: 1,
                          padding: '12px 20px',
                          background: '#16a34a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          opacity: updatingId === report._id ? 0.7 : 1
                        }}
                      >
                        <FiCheck size={18} />
                        Mark as Fixed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report._id, 'rejected')}
                        disabled={updatingId === report._id}
                        style={{
                          padding: '12px 20px',
                          background: '#fff',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <FiX size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FIXED REPORTS TAB */}
        {activeTab === 'fixed' && (
          <div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner spinner-dark" style={{ width: 28, height: 28 }} /></div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: '#f9fafb', borderRadius: 12 }}>
                <FiAlertTriangle size={48} color="#9ca3af" />
                <h3 style={{ marginTop: 16, color: '#374151' }}>No fixed reports yet</h3>
                <p style={{ color: '#6b7280' }}>Resolved reports will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {reports.map(report => (
                  <div key={report._id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiCheckCircle size={18} color="#16a34a" />
                        <strong style={{ color: '#166534' }}>{report.medicineName}</strong>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>✓ Fixed</span>
                      </div>
                      <p style={{ margin: '4px 0 0 26px', fontSize: 12, color: '#15803d' }}>
                        {report.purchaseLocation?.city}, {report.purchaseLocation?.state} • {new Date(report.updatedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStatusUpdate(report._id, 'pending')}
                      style={{ padding: '6px 12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                    >
                      Revert
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD MEDICINE TAB */}
        {activeTab === 'addMedicine' && (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 8px', color: '#1e40af' }}>➕ Add New Medicine</h3>
              <p style={{ margin: 0, color: '#1e3a8a', fontSize: 14 }}>Add medicines to the database so users can verify them</p>
            </div>

            <form onSubmit={handleAddMedicine} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Medicine Name *</label>
                  <input
                    className="form-input"
                    value={medicineForm.name}
                    onChange={e => setMedicineForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Crocin 500"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Generic Name *</label>
                  <input
                    className="form-input"
                    value={medicineForm.generic}
                    onChange={e => setMedicineForm(f => ({ ...f, generic: e.target.value }))}
                    placeholder="e.g., Paracetamol"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Brand</label>
                  <input
                    className="form-input"
                    value={medicineForm.brand}
                    onChange={e => setMedicineForm(f => ({ ...f, brand: e.target.value }))}
                    placeholder="e.g., GSK"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Manufacturer</label>
                  <input
                    className="form-input"
                    value={medicineForm.manufacturer}
                    onChange={e => setMedicineForm(f => ({ ...f, manufacturer: e.target.value }))}
                    placeholder="e.g., Abbott"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Category *</label>
                  <select
                    className="form-select"
                    value={medicineForm.category}
                    onChange={e => setMedicineForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Dosage Form *</label>
                  <select
                    className="form-select"
                    value={medicineForm.dosageForm}
                    onChange={e => setMedicineForm(f => ({ ...f, dosageForm: e.target.value }))}
                    style={{ width: '100%' }}
                  >
                    {DOSAGE_FORMS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Strength *</label>
                  <input
                    className="form-input"
                    value={medicineForm.strength}
                    onChange={e => setMedicineForm(f => ({ ...f, strength: e.target.value }))}
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Risk Level</label>
                  <select
                    className="form-select"
                    value={medicineForm.riskLevel}
                    onChange={e => setMedicineForm(f => ({ ...f, riskLevel: e.target.value }))}
                    style={{ width: '100%' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Composition</label>
                <input
                  className="form-input"
                  value={medicineForm.composition}
                  onChange={e => setMedicineForm(f => ({ ...f, composition: e.target.value }))}
                  placeholder="e.g., Paracetamol 500mg"
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Description</label>
                <textarea
                  className="form-input"
                  value={medicineForm.description}
                  onChange={e => setMedicineForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the medicine..."
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={medicineForm.isVerified}
                    onChange={e => setMedicineForm(f => ({ ...f, isVerified: e.target.checked }))}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Mark as Verified</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingMedicine}
                style={{
                  width: '100%',
                  marginTop: 24,
                  padding: '14px 24px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: savingMedicine ? 'not-allowed' : 'pointer',
                  opacity: savingMedicine ? 0.7 : 1
                }}
              >
                {savingMedicine ? 'Adding Medicine...' : '➕ Add Medicine to Database'}
              </button>
            </form>
          </div>
        )}
        {/* INTELLIGENCE TAB */}
        {activeTab === 'intelligence' && (
          <div className="intelligence-dashboard">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div className="card" style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>📍 Top Counterfeit Hotspots (State-wise)</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.reportsByState || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="_id" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card" style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>📊 Risk Distribution</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.riskDistribution || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="_id" type="category" fontSize={12} width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;