import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiSearch, FiCheckCircle, FiClock, FiPlus, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import './DashboardPage.css';

const STATUS_BADGE = {
  pending:      { class: 'badge-amber',  label: 'Pending' },
  under_review: { class: 'badge-slate',  label: 'Under Review' },
  verified:     { class: 'badge-green',  label: 'Verified' },
  rejected:     { class: 'badge-slate',  label: 'Rejected' },
  action_taken: { class: 'badge-green',  label: 'Action Taken' },
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/reports/my?page=${page}&limit=10`);
        setReports(data.data || []);
        setTotalPages(data.pages || 1);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [page]);

  return (
    <div className="dashboard page-enter">
      <div className="dashboard__header">
        <div className="container">
          <div className="dashboard__header-inner">
            <div>
              <div className="hero__badge">
                <FiShield size={13} /> Secure Citizen Account
              </div>
              <h1>My Health Vigilance</h1>
              <p>Welcome back, <strong>{user?.name}</strong> • Account Status: <span className="badge badge-green">Verified</span></p>
            </div>
            <Link to="/report" className="btn btn-danger btn-lg">
              <FiAlertTriangle size={15} /> Report Fake Medicine
            </Link>
          </div>
        </div>
      </div>

      <div className="container dashboard__body">
        {/* Stats Row */}
        <div className="dashboard__stats">
          <div className="dash-stat card-clinical">
            <div className="dash-stat__icon" style={{ background: 'var(--red-100)', color: 'var(--red-600)' }}>
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <div className="dash-stat__val">{user?.reportsCount || 0}</div>
              <div className="dash-stat__lbl">Reports Filed</div>
            </div>
          </div>
          <div className="dash-stat card-clinical">
            <div className="dash-stat__icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
              <FiSearch size={20} />
            </div>
            <div>
              <div className="dash-stat__val">{user?.verificationCount || 0}</div>
              <div className="dash-stat__lbl">Verifications</div>
            </div>
          </div>
          <div className="dash-stat card-clinical">
            <div className="dash-stat__icon" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}>
              <FiCheckCircle size={20} />
            </div>
            <div>
              <div className="dash-stat__val">{reports.filter(r => r.status === 'action_taken').length}</div>
              <div className="dash-stat__lbl">Actions Taken</div>
            </div>
          </div>
          <div className="dash-stat card-clinical">
            <div className="dash-stat__icon" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}>
              <FiClock size={20} />
            </div>
            <div>
              <div className="dash-stat__val">{reports.filter(r => r.status === 'pending').length}</div>
              <div className="dash-stat__lbl">Pending Review</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/verify" className="quick-action card-clinical">
            <FiSearch size={24} />
            <strong>Verify Medicine</strong>
            <span>Check authenticity</span>
          </Link>
          <Link to="/report" className="quick-action quick-action--red card-clinical">
            <FiAlertTriangle size={24} />
            <strong>File Report</strong>
            <span>Found a counterfeit?</span>
          </Link>
          <Link to="/reports/public" className="quick-action card-clinical">
            <FiCheckCircle size={24} />
            <strong>Public Feed</strong>
            <span>Community reports</span>
          </Link>
          <Link to="/flagged" className="quick-action card-clinical">
            <FiAlertTriangle size={24} />
            <strong>Flagged Drugs</strong>
            <span>Current high-risk list</span>
          </Link>
        </div>

        {/* Reports Table */}
        <div className="card card-clinical" style={{ marginTop: 32 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 800 }}>Recent Activity Log</h3>
            <Link to="/report" className="btn btn-primary btn-sm"><FiPlus size={14} /> New Submission</Link>
          </div>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <span className="spinner spinner-dark" style={{ width: 28, height: 28, margin: '0 auto' }} />
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--slate-500)' }}>
              <FiAlertTriangle size={36} style={{ marginBottom: 12, opacity: .3 }} />
              <p>No reports yet.</p>
              <Link to="/report" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Submit Your First Report</Link>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Medicine</th>
                      <th>Location</th>
                      <th>Suspicion</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => {
                      const s = STATUS_BADGE[r.status] || { class: 'badge-slate', label: r.status };
                      return (
                        <tr key={r._id}>
                          <td><code style={{ fontSize: 12 }}>{r.reportId}</code></td>
                          <td><strong>{r.medicineName}</strong>{r.brandName && <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{r.brandName}</div>}</td>
                          <td>{r.purchaseLocation?.city}, {r.purchaseLocation?.state}</td>
                          <td style={{ fontSize: 13 }}>{r.suspicionType?.replace(/_/g, ' ')}</td>
                          <td style={{ fontSize: 13 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                          <td><span className={`badge ${s.class}`}>{s.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{ padding: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                  <span style={{ padding: '7px 14px', fontSize: 13 }}>Page {page} of {totalPages}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
