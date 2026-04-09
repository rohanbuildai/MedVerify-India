import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiAlertTriangle, FiShield, FiCheckCircle, FiArrowRight, FiAlertCircle, FiMaximize, FiBox } from 'react-icons/fi';
import { api } from '../context/AuthContext';
import './HomePage.css';

const SUSPICION_LABELS = {
  wrong_color: 'Wrong Color/Appearance',
  wrong_shape: 'Wrong Shape/Size',
  unusual_smell: 'Unusual Smell/Taste',
  packaging_quality: 'Poor Packaging Quality',
  missing_hologram: 'Missing Hologram/Seal',
  price_too_low: 'Suspiciously Low Price',
  no_effect: 'No Therapeutic Effect',
  adverse_reaction: 'Adverse Reaction',
  seal_tampered: 'Seal Tampered',
  wrong_imprint: 'Wrong/Missing Imprint',
  other: 'Other Concern'
};

const StatCard = ({ icon, value, label, color }) => (
  <div className="stat-card">
    <div className="stat-card__icon" style={{ background: color + '15', color }}>
      {icon}
    </div>
    <div>
      <div className="stat-card__value">{value?.toLocaleString('en-IN') || '—'}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [flaggedMeds, setFlaggedMeds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reportsRes, flaggedRes] = await Promise.all([
          api.get('/dashboard/public-stats'),
          api.get('/reports/public?limit=5'),
          api.get('/medicines/flagged')
        ]);
        setStats(statsRes.data.data);
        setRecentReports(reportsRes.data.data || []);
        setFlaggedMeds(flaggedRes.data.data?.slice(0, 6) || []);
      } catch {}
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/verify?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="home page-enter">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg-pattern" />
        <div className="container hero__content">
          <div className="hero__badge">
            <FiShield size={13} /> Verification Portal
          </div>
          <h1 className="hero__title">
            Check Your Medicine Authenticity.<br />
            <span className="hero__title-accent">Protect Your Health.</span>
          </h1>
          <p className="hero__subtitle">
            Verify <strong>strips, tablets, and syrups</strong> against our community-driven database. 
            Help identify and report suspicious medicines in India.
          </p>

          {/* Verification Hub */}
          <div className="verify-hub">
            <div className="verify-hub__options">
              <button onClick={() => navigate('/verify?action=scan')} className="verify-hub__btn">
                <div className="verify-hub__btn-icon"><FiMaximize size={24} /></div>
                <div className="verify-hub__btn-text">
                  <strong>Scan QR Code</strong>
                  <span>Instant verification</span>
                </div>
              </button>
              <button onClick={() => navigate('/verify?action=ai')} className="verify-hub__btn verify-hub__btn--accent">
                <div className="verify-hub__btn-icon"><FiBox size={24} /></div>
                <div className="verify-hub__btn-text">
                  <strong>AI Packaging Scan</strong>
                  <span>Detect fake strips</span>
                </div>
              </button>
            </div>

            <form className="hero__search" onSubmit={handleSearch}>
              <div className="hero__search-inner">
                <FiSearch size={18} className="hero__search-icon" />
                <input
                  type="text"
                  className="hero__search-input"
                  placeholder="Or search by Brand or Generic name (e.g. Paracetamol)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary hero__search-btn">
                  Verify Now
                </button>
              </div>
            </form>
          </div>

          <div className="hero__trust-bar">
            <span>Platform Features:</span>
            <div className="hero__trust-logos">
              <span className="trust-logo">Community Reports</span>
              <span className="trust-logo">AI Packaging Scan</span>
              <span className="trust-logo">QR Verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <StatCard icon={<FiAlertTriangle size={22} />} value={stats?.totalReports} label="Total Reports Filed" color="#ef4444" />
            <StatCard icon={<FiCheckCircle size={22} />} value={stats?.actionTaken} label="Actions Taken" color="#22c55e" />
            <StatCard icon={<FiAlertCircle size={22} />} value={stats?.flaggedMedicines} label="Flagged Medicines" color="#f59e0b" />
            <StatCard icon={<FiSearch size={22} />} value={stats?.totalVerifications} label="Verifications Done" color="#3b82f6" />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Verification Framework</h2>
              <p>How we ensure your medicine is safe and authentic</p>
            </div>
          </div>
          <div className="how-grid">
            {[
              { step: '01', icon: <FiSearch size={28} />, title: 'Search & Lookup', desc: 'Search our database for medicine details including brand, batch, and manufacturer info.' },
              { step: '02', icon: <FiShield size={28} />, title: 'Visual Comparison', desc: 'Compare packaging details like hologram, color, and imprints against known product info.' },
              { step: '03', icon: <FiAlertTriangle size={28} />, title: 'AI Packaging Scan', desc: 'Upload a photo and let AI analyze packaging for potential inconsistencies.' },
              { step: '04', icon: <FiCheckCircle size={28} />, title: 'Community Report', desc: 'Report suspicious medicines to alert the community and help build a safer database.' },
            ].map(item => (
              <div key={item.step} className="how-card card-clinical">
                <div className="how-card__step">{item.step}</div>
                <div className="how-card__icon">{item.icon}</div>
                <h3 className="how-card__title">{item.title}</h3>
                <p className="how-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flagged Medicines ────────────────────────────────────── */}
      {flaggedMeds.length > 0 && (
        <section className="flagged-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2>⚠️ Currently Flagged Medicines</h2>
                <p>High-risk medicines with multiple community reports</p>
              </div>
              <Link to="/flagged" className="btn btn-outline btn-sm">View All <FiArrowRight size={13} /></Link>
            </div>
            <div className="flagged-grid">
              {flaggedMeds.map(med => (
                <Link to={`/medicines/${med._id}`} key={med._id} className="flagged-card">
                  <div className="flagged-card__header">
                    <span className={`badge badge-${med.riskLevel === 'critical' ? 'red' : 'amber'}`}>
                      {med.riskLevel?.toUpperCase()} RISK
                    </span>
                    <span className="flagged-card__reports">{med.reportCount} reports</span>
                  </div>
                  <h4 className="flagged-card__name">{med.name}</h4>
                  <p className="flagged-card__brand">{med.brand} · {med.category}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recent Reports ───────────────────────────────────────── */}
      {recentReports.length > 0 && (
        <section className="reports-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2>Recent Community Reports</h2>
                <p>Latest suspicious medicine reports from across India</p>
              </div>
              <Link to="/reports/public" className="btn btn-outline btn-sm">View All <FiArrowRight size={13} /></Link>
            </div>
            <div className="reports-list">
              {recentReports.map(report => (
                <div key={report._id} className="report-item">
                  <div className="report-item__left">
                    <div className="report-item__icon">
                      <FiAlertTriangle size={16} />
                    </div>
                    <div>
                      <div className="report-item__name">{report.medicineName}</div>
                      <div className="report-item__meta">
                        {SUSPICION_LABELS[report.suspicionType] || report.suspicionType}
                        · {report.purchaseLocation?.city}, {report.purchaseLocation?.state}
                        · {new Date(report.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className="report-item__right">
                    <span className={`badge badge-${report.status === 'action_taken' ? 'green' : report.status === 'verified' ? 'green' : 'amber'}`}>
                      {report.status?.replace('_', ' ')}
                    </span>
                    {report.upvoteCount > 0 && (
                      <span className="report-item__upvotes">▲ {report.upvoteCount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-banner card-clinical">
            <div className="cta-banner__left">
              <h2>Join the Community</h2>
              <p>Every report you file helps build a safer pharmaceutical environment in India. Together, we can identify and flag suspicious medicines.</p>
              <div className="cta-banner__actions">
                <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
                <Link to="/report" className="btn btn-outline btn-lg">File a Report</Link>
              </div>
            </div>
            <div className="cta-banner__right">
              <div className="cta-stat">
                <div className="cta-stat__number">Open</div>
                <div className="cta-stat__label">Community Platform</div>
              </div>
              <div className="cta-stat">
                <div className="cta-stat__number">Free</div>
                <div className="cta-stat__label">Medicine Verification</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <div className="navbar__logo-icon" style={{ width: 32, height: 32, background: 'var(--green-700)', color: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShield size={16} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>MedVerify India</span>
          </div>
          <div className="footer__links">
            <Link to="/verify">Verify Medicine</Link>
            <Link to="/reports/public">Reports</Link>
            <Link to="/flagged">Flagged Drugs</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer__emergency">
            <span>🚨 CDSCO Helpline:</span>
            <strong>1800-11-4430</strong>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="container">
            <p>© 2026 MedVerify India. A community platform to help identify suspicious medicines.</p>
            <p>In case of medical emergency, call <strong>112</strong></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
