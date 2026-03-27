import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiUsers, FiPackage, FiCheckCircle, FiClock, FiActivity, FiEdit } from 'react-icons/fi';
import { api } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import './AdminPage.css';

const STATUS_OPTIONS = ['pending','under_review','verified','rejected','action_taken'];
const STATUS_TABS = [
  { value: '', label: 'All Reports' },
  { value: 'pending', label: 'Pending' },
  { value: 'action_taken', label: 'Fixed' }
];

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, search: '' });
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadReports();
  }, [filters]); // eslint-disable-line

  const loadStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch {}
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', '15');
      const { data } = await api.get(`/reports?${params}`);
      setReports(data.data || []);
      setTotalPages(data.pages || 1);
    } catch {}
    setLoading(false);
  };

  const handleStatusUpdate = async (reportId, status) => {
    setUpdatingId(reportId);
    try {
      await api.put(`/reports/${reportId}/status`, { status });
      toast.success('Status updated');
      loadReports();
      loadStats();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const priorityBadge = (p) => ({
    low: 'badge-slate', medium: 'badge-amber', high: 'badge-red', urgent: 'badge-red'
  }[p] || 'badge-slate');

  return (
    <div className="admin-page page-enter">
      <div className="admin-page__header">
        <div className="container">
          <h1>Admin Panel</h1>
          <p>Manage reports, medicines, and platform analytics</p>
        </div>
      </div>

      <div className="container admin-body">
        {/* Stats */}
        {stats && (
          <div className="admin-stats">
            {[
              { icon: <FiAlertTriangle />, val: stats.totalReports, lbl: 'Total Reports', color: '#ef4444', bg: '#fef2f2' },
              { icon: <FiClock />, val: stats.pendingReports, lbl: 'Pending Review', color: '#f59e0b', bg: '#fffbeb' },
              { icon: <FiCheckCircle />, val: stats.actionTakenReports, lbl: 'Actions Taken', color: '#16a34a', bg: '#f0fdf4' },
              { icon: <FiPackage />, val: stats.flaggedMedicines, lbl: 'Flagged Medicines', color: '#f97316', bg: '#fff7ed' },
              { icon: <FiUsers />, val: stats.totalUsers, lbl: 'Registered Users', color: '#3b82f6', bg: '#eff6ff' },
              { icon: <FiActivity />, val: stats.totalVerifications, lbl: 'Verifications', color: '#8b5cf6', bg: '#f5f3ff' },
            ].map((s, i) => (
              <div key={i} className="admin-stat">
                <div className="admin-stat__icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div>
                  <div className="admin-stat__val">{s.val?.toLocaleString('en-IN')}</div>
                  <div className="admin-stat__lbl">{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {stats?.reportsByDay?.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 style={{ margin: 0, fontSize: 15 }}>Reports — Last 30 Days</h3></div>
            <div className="card-body" style={{ paddingTop: 12 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.reportsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip labelFormatter={v => `Date: ${v}`} />
                  <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top States */}
        {stats?.topStates?.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 style={{ margin: 0, fontSize: 15 }}>Top Reporting States</h3></div>
            <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {stats.topStates.map((s, i) => (
                <div key={i} style={{ background: 'var(--slate-50)', borderRadius: 8, padding: '8px 16px', fontSize: 13 }}>
                  <strong>{s._id || 'Unknown'}</strong> — {s.count} reports
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters + Reports Table */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, flex: 1 }}>Reports</h3>
              <div style={{ display: 'flex', gap: 4 }}>
                {STATUS_TABS.map(tab => (
                  <button
                    key={tab.value}
                    className={`btn btn-sm ${filters.status === tab.value ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilters(f => ({ ...f, status: tab.value, page: 1 }))}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <input
                className="form-input" style={{ width: 180, fontSize: 13 }}
                placeholder="Search medicine..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
              />
              <select className="form-select" style={{ width: 130, fontSize: 13 }} value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value, page: 1 }))}>
                <option value="">All Priority</option>
                {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner spinner-dark" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Medicine</th>
                      <th>Reporter</th>
                      <th>Location</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r._id}>
                        <td><code style={{ fontSize: 11 }}>{r.reportId}</code></td>
                        <td><strong style={{ fontSize: 13 }}>{r.medicineName}</strong></td>
                        <td style={{ fontSize: 13 }}>{r.isAnonymous ? 'Anonymous' : r.reportedBy?.name || '—'}</td>
                        <td style={{ fontSize: 13 }}>{r.purchaseLocation?.city}, {r.purchaseLocation?.state}</td>
                        <td><span className={`badge ${priorityBadge(r.priority)}`}>{r.priority}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <select
                            className="form-select" style={{ fontSize: 12, padding: '4px 8px', width: 140 }}
                            value={r.status}
                            onChange={e => handleStatusUpdate(r._id, e.target.value)}
                            disabled={updatingId === r._id}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'action_taken' ? '✓ Fixed' : s.replace('_', ' ')}</option>)}
                          </select>
                        </td>
                        <td>
                          <Link to={`/admin/reports/${r._id}`} className="btn btn-ghost btn-sm">
                            <FiEdit size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{ padding: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))} disabled={filters.page === 1}>Previous</button>
                  <span style={{ padding: '7px 14px', fontSize: 13 }}>Page {filters.page} of {totalPages}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))} disabled={filters.page === totalPages}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
