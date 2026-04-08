import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiAlertCircle, FiShield } from 'react-icons/fi';
import { api } from '../context/AuthContext';
import './AdminPage.css';

const RISK_COLOR = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e'
};

const FlaggedPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [flagRes, statsRes] = await Promise.all([
          api.get(`/medicines/flagged?page=${page}&limit=12`),
          api.get(`/medicines/stats`)
        ]);
        setMedicines(flagRes.data.data || []);
        setTotalPages(flagRes.data.pages || 1);
        setTotal(flagRes.data.total || flagRes.data.data?.length || 0);
        setStats(statsRes.data.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [page]);

  const maxReports = medicines.length > 0 ? Math.max(...medicines.map(m => m.reportCount || 0)) : 1;

  return (
    <div className="page-enter">
      <div className="public-page__header" style={{ background: 'radial-gradient(circle at 0% 0%, #450a0a 0%, #7f1d1d 100%)' }}>
        <div className="container">
          <div className="hero__badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--red-400)' }}>
            <FiShield size={13} /> Official Safety Alert
          </div>
          <h1>Public Health Warnings</h1>
          <p>Verified pharmaceutical products with confirmed clinical risks or counterfeiting reports. These items are strictly under investigative review by CDSCO oversight.</p>
        </div>
      </div>

      <div className="container public-body">
        {/* Warning Banner */}
        <div className="alert alert-error" style={{ marginBottom: 28 }}>
          <FiAlertTriangle size={20} />
          <div>
            <strong>Important:</strong> If you have purchased any of these medicines, do NOT consume them without first verifying authenticity with your pharmacist or doctor. For immediate concerns, call CDSCO helpline: <strong>1800-11-4430</strong>.
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Clinical Database', val: stats.total, color: 'var(--slate-400)' },
              { label: 'Confirmed Risk', val: stats.flagged, color: 'var(--red-500)' },
              { label: 'Critical Alert', val: stats.highRisk, color: 'var(--red-600)' },
            ].map((s, i) => (
              <div key={i} className="dash-stat card-clinical">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--slate-400)', fontWeight: 700, textTransform: 'uppercase', letterspacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
          </div>
        ) : medicines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--slate-500)' }}>
            <FiShield size={48} style={{ opacity: .3, marginBottom: 12 }} />
            <h3>No flagged medicines at this time</h3>
            <p>Good news! No medicines are currently flagged in our database.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--slate-500)', fontWeight: 600 }}>
              {medicines.length} flagged medicines — sorted by report count
            </div>
            <div className="flagged-list">
              {medicines.map(med => (
                <div key={med._id} className="flagged-detail-card card-clinical">
                  <div className="flagged-detail-card__risk" style={{ color: RISK_COLOR[med.riskLevel] || '#ef4444' }}>
                    ⚠ {med.riskLevel?.toUpperCase()} RISK
                  </div>
                  <div className="flagged-detail-card__name">{med.name}</div>
                  <div className="flagged-detail-card__brand">
                    {med.brand} · {med.manufacturer} · {med.category}
                  </div>
                  {/* Report bar */}
                  <div className="flagged-detail-card__bar">
                    <div
                      className="flagged-detail-card__bar-fill"
                      style={{
                        width: `${Math.min(100, ((med.reportCount || 0) / maxReports) * 100)}%`,
                        background: RISK_COLOR[med.riskLevel] || '#ef4444'
                      }}
                    />
                  </div>
                  <div className="flagged-detail-card__count">
                    {med.reportCount || 0} community reports
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    <Link to={`/verify?q=${encodeURIComponent(med.name)}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      View Details
                    </Link>
                    <Link to={`/report?name=${encodeURIComponent(med.name)}`} className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      <FiAlertTriangle size={13} /> Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: 40, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1 || loading}
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button
                    key={pg}
                    className={`btn btn-sm ${pg === page ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPage(pg)}
                    disabled={loading}
                  >
                    {pg}
                  </button>
                ))}
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages || loading}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 40, padding: 24, background: 'var(--amber-50)', border: '1px solid var(--amber-100)', borderRadius: 12 }}>
          <h3 style={{ marginBottom: 8, color: '#92400e' }}>What to do if you have a flagged medicine?</h3>
          <ol style={{ paddingLeft: 20, lineHeight: 2, fontSize: 14, color: '#78350f' }}>
            <li>Stop consuming the medicine immediately</li>
            <li>Keep the packaging for evidence (batch number, expiry date)</li>
            <li>Contact your doctor or pharmacist</li>
            <li>Report it here with photos of the packaging</li>
            <li>Call CDSCO helpline: <strong>1800-11-4430</strong> (Toll-free)</li>
            <li>If you've had adverse effects, call emergency services: <strong>112</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FlaggedPage;
