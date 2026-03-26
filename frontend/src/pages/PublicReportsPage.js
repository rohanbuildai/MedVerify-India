import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiMapPin, FiCalendar, FiUser, FiThumbsUp, FiFilter } from 'react-icons/fi';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminPage.css';

const INDIA_STATES = [
  'All States','Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana',
  'Uttar Pradesh','Uttarakhand','West Bengal'
];

const SUSPICION_LABELS = {
  wrong_color: 'Wrong Color', wrong_shape: 'Wrong Shape', unusual_smell: 'Unusual Smell',
  packaging_quality: 'Poor Packaging', missing_hologram: 'No Hologram',
  price_too_low: 'Too Cheap', no_effect: 'No Effect', adverse_reaction: 'Adverse Reaction',
  seal_tampered: 'Tampered Seal', wrong_imprint: 'Wrong Imprint', other: 'Other'
};

const STATUS_BADGE = {
  pending: 'badge-amber', under_review: 'badge-slate',
  verified: 'badge-green', action_taken: 'badge-green', rejected: 'badge-slate'
};

const PublicReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState('');
  const [upvoting, setUpvoting] = useState(null);

  useEffect(() => {
    loadReports();
  }, [page, state]); // eslint-disable-line

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (state && state !== 'All States') params.append('state', state);
      const { data } = await api.get(`/reports/public?${params}`);
      setReports(data.data || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load reports'); }
    setLoading(false);
  };

  const handleUpvote = async (reportId) => {
    if (!user) { toast.error('Please login to upvote'); return; }
    setUpvoting(reportId);
    try {
      const { data } = await api.post(`/reports/${reportId}/upvote`);
      setReports(prev => prev.map(r =>
        r._id === reportId ? { ...r, upvoteCount: data.upvoteCount } : r
      ));
    } catch { toast.error('Failed to upvote'); }
    setUpvoting(null);
  };

  return (
    <div className="page-enter">
      <div className="public-page__header">
        <div className="container">
          <h1><FiAlertTriangle size={26} /> Community Reports Feed</h1>
          <p>Real-time reports of suspicious medicines from across India — submitted by citizens, pharmacists and healthcare workers</p>
        </div>
      </div>

      <div className="container public-body">
        {/* Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 14, color: 'var(--slate-500)' }}>
            Showing <strong>{reports.length}</strong> of <strong>{total}</strong> reports
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <FiFilter size={15} style={{ color: 'var(--slate-500)' }} />
            <select
              className="form-select"
              style={{ width: 200, fontSize: 14 }}
              value={state}
              onChange={e => { setState(e.target.value); setPage(1); }}
            >
              {INDIA_STATES.map(s => <option key={s} value={s === 'All States' ? '' : s}>{s}</option>)}
            </select>
            <Link to="/report" className="btn btn-danger btn-sm">
              <FiAlertTriangle size={13} /> Submit Report
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
            <p style={{ marginTop: 16, color: 'var(--slate-500)' }}>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--slate-500)' }}>
            <FiAlertTriangle size={40} style={{ opacity: .3, marginBottom: 12 }} />
            <p>No reports found for this filter.</p>
          </div>
        ) : (
          <div className="reports-feed">
            {reports.map(report => (
              <div key={report._id} className="report-feed-card">
                <div className="report-feed-card__header">
                  <div>
                    <div className="report-feed-card__name">
                      {report.medicineName}
                      {report.brandName && <span style={{ fontWeight: 400, color: 'var(--slate-500)', fontSize: 14 }}> by {report.brandName}</span>}
                    </div>
                  </div>
                  <div className="report-feed-card__badges">
                    <span className={`badge ${STATUS_BADGE[report.status] || 'badge-slate'}`}>
                      {report.status?.replace('_', ' ')}
                    </span>
                    {report.suspicionType && (
                      <span className="badge badge-amber">
                        {SUSPICION_LABELS[report.suspicionType] || report.suspicionType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="report-feed-card__meta">
                  <span><FiMapPin size={12} /> {report.purchaseLocation?.city}, {report.purchaseLocation?.state}</span>
                  <span><FiCalendar size={12} /> {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span><FiUser size={12} /> {report.isAnonymous ? 'Anonymous' : report.reportedBy?.name || 'User'}</span>
                </div>

                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <button
                    className={`btn btn-ghost btn-sm`}
                    style={{ gap: 6 }}
                    onClick={() => handleUpvote(report._id)}
                    disabled={upvoting === report._id}
                  >
                    <FiThumbsUp size={14} />
                    <span>Also experienced this</span>
                    {report.upvoteCount > 0 && (
                      <span className="badge badge-slate" style={{ marginLeft: 2 }}>{report.upvoteCount}</span>
                    )}
                  </button>
                  <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>#{report.reportId}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              ← Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page - 2 + i;
              if (pg > totalPages) return null;
              return (
                <button
                  key={pg}
                  className={`btn btn-sm ${pg === page ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </button>
              );
            })}
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicReportsPage;
