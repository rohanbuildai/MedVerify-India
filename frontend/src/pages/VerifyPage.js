import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { FiSearch, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiInfo, FiShield, FiPackage, FiActivity } from 'react-icons/fi';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './VerifyPage.css';

const RISK_CONFIG = {
  low:      { color: '#22c55e', bg: '#f0fdf4', label: 'Low Risk',      icon: <FiCheckCircle size={22} /> },
  medium:   { color: '#f59e0b', bg: '#fffbeb', label: 'Medium Risk',   icon: <FiAlertCircle size={22} /> },
  high:     { color: '#f97316', bg: '#fff7ed', label: 'High Risk',     icon: <FiAlertTriangle size={22} /> },
  critical: { color: '#ef4444', bg: '#fef2f2', label: 'Critical Risk', icon: <FiAlertTriangle size={22} /> },
};

const DetailRow = ({ label, value }) => value ? (
  <div className="detail-row">
    <span className="detail-row__label">{label}</span>
    <span className="detail-row__value">{value}</span>
  </div>
) : null;

const VerifyPage = () => {
  const { id: medicineId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load medicine by ID if accessed via QR code
  useEffect(() => {
    if (medicineId) {
      loadMedicineById(medicineId);
    }
  }, [medicineId]);

  const loadMedicineById = async (id) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/medicines/${id}`);
      setSelected(data.data);
      setSearched(true);
    } catch (err) {
      toast.error('Medicine not found');
    } finally {
      setDetailLoading(false);
    }
  };

  // Auto-search if query param exists
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !medicineId) { setQuery(q); doSearch(q); }
  }, []); // eslint-disable-line

  const doSearch = async (q) => {
    if (!q?.trim() || q.trim().length < 2) return;
    setLoading(true);
    setResults([]);
    setSelected(null);
    setSearched(true);
    try {
      const { data } = await api.get(`/medicines/search?q=${encodeURIComponent(q.trim())}`);
      setResults(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    doSearch(query);
  };

  const handleSelect = async (med) => {
    setDetailLoading(true);
    setSelected(null);
    try {
      const { data } = await api.get(`/medicines/${med._id}`);
      setSelected(data.data);
    } catch (err) {
      // Show basic info if detail fails
      setSelected(med);
      toast.error('Could not load full details');
    } finally {
      setDetailLoading(false);
    }
  };

  const risk = selected?.riskLevel ? RISK_CONFIG[selected.riskLevel] : RISK_CONFIG.low;

  return (
    <div className="verify-page page-enter">
      <div className="verify-page__header">
        <div className="container">
          <h1><FiSearch size={28} /> Verify Medicine Authenticity</h1>
          <p>Search our database of {' '}<strong>verified medicines</strong> to check authenticity and safety</p>
          <form className="verify-search" onSubmit={handleSearch}>
            <div className="verify-search__inner">
              <FiSearch size={18} className="verify-search__icon" />
              <input
                type="text"
                className="verify-search__input"
                placeholder="Enter medicine name, brand (e.g. Crocin, Augmentin, Paracetamol)..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" />Searching...</> : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container verify-body">
        <div className={`verify-layout ${selected ? 'verify-layout--split' : ''}`}>
          {/* ── Results List ────────────────────────── */}
          <div className="verify-results">
            {loading && (
              <div className="verify-loading">
                <span className="spinner spinner-dark" />
                <p>Searching database...</p>
              </div>
            )}
            {!loading && searched && results.length === 0 && (
              <div className="verify-empty">
                <FiAlertCircle size={40} />
                <h3>No medicines found</h3>
                <p>We couldn't find <strong>"{query}"</strong> in our database.</p>
                <p className="verify-empty__note">
                  This may mean the medicine is not yet in our database, or it could be suspicious.
                  Consider reporting it.
                </p>
                <Link to="/report" className="btn btn-danger btn-sm" style={{ marginTop: 16 }}>
                  <FiAlertTriangle size={14} /> Report This Medicine
                </Link>
              </div>
            )}
            {!loading && !searched && (
              <div className="verify-hint">
                <FiInfo size={40} />
                <h3>How to verify your medicine</h3>
                <ol>
                  <li>Enter the medicine brand name or generic name above</li>
                  <li>Select the matching medicine from results</li>
                  <li>Compare physical features with our verified records</li>
                  <li>If something looks wrong, report it immediately</li>
                </ol>
                <div className="verify-hint__tip">
                  <strong>💡 Tip:</strong> Always check the hologram, batch number, and expiry date on the packaging.
                </div>
              </div>
            )}
            {!loading && results.length > 0 && (
              <>
                <div className="verify-results__count">{results.length} result(s) found</div>
                {results.map(med => (
                  <div
                    key={med._id}
                    className={`med-result-card ${selected?._id === med._id ? 'med-result-card--active' : ''}`}
                    onClick={() => handleSelect(med)}
                  >
                    <div className="med-result-card__left">
                      <div className="med-result-card__icon">
                        <FiPackage size={18} />
                      </div>
                      <div>
                        <div className="med-result-card__name">{med.name}</div>
                        <div className="med-result-card__brand">{med.brand} · {med.manufacturer}</div>
                        <div className="med-result-card__meta">
                          <span className="badge badge-slate">{med.dosageForm}</span>
                          <span className="badge badge-slate">{med.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="med-result-card__right">
                      {med.isFlaggedAsFake && (
                        <span className="badge badge-red">⚠ Flagged</span>
                      )}
                      <span className={`badge badge-${med.riskLevel === 'low' ? 'green' : med.riskLevel === 'medium' ? 'amber' : 'red'}`}>
                        {med.riskLevel} risk
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* ── Medicine Detail ──────────────────────── */}
          {(selected || detailLoading) && (
            <div className="verify-detail">
              {detailLoading ? (
                <div className="verify-loading"><span className="spinner spinner-dark" /><p>Loading details...</p></div>
              ) : selected && (
                <>
                  {/* Status Banner */}
                  <div className="detail-status-banner" style={{ background: risk.bg, borderColor: risk.color + '40' }}>
                    <div className="detail-status-icon" style={{ color: risk.color }}>{risk.icon}</div>
                    <div>
                      <div className="detail-status-label" style={{ color: risk.color }}>
                        {selected.isFlaggedAsFake ? '⚠ FLAGGED AS FAKE/SUSPICIOUS' : `✓ In Database — ${risk.label}`}
                      </div>
                      <div className="detail-status-sub">
                        {selected.isFlaggedAsFake
                          ? `This medicine has ${selected.reportCount} community reports. Do NOT use until verified.`
                          : 'Found in our verified medicine database. Compare details below carefully.'}
                      </div>
                    </div>
                  </div>

                  {/* Alert if flagged */}
                  {selected.isFlaggedAsFake && (
                    <div className="alert alert-error" style={{ marginBottom: 20 }}>
                      <FiAlertTriangle size={18} />
                      <div>
                        <strong>Warning:</strong> This medicine has been reported as suspicious by {selected.reportCount} users. Counterfeit versions are known to circulate. Contact your doctor and report to CDSCO helpline: <strong>1800-11-4430</strong>.
                      </div>
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className="detail-section">
                    <h3><FiInfo size={16} /> Basic Information</h3>
                    <DetailRow label="Medicine Name" value={selected.name} />
                    <DetailRow label="Generic Name" value={selected.genericName} />
                    <DetailRow label="Brand" value={selected.brand} />
                    <DetailRow label="Manufacturer" value={selected.manufacturer} />
                    <DetailRow label="Category" value={selected.category} />
                    <DetailRow label="Composition" value={selected.composition} />
                    <DetailRow label="Dosage Form" value={selected.dosageForm} />
                    <DetailRow label="Strength" value={selected.strength} />
                    <DetailRow label="Package Size" value={selected.packageSize} />
                    <DetailRow label="Schedule" value={selected.scheduleType} />
                  </div>

                  {/* Physical Features */}
                  {selected.physicalFeatures && (
                    <div className="detail-section">
                      <h3><FiShield size={16} /> Authentic Physical Features</h3>
                      <p className="detail-section__note">Compare these with what you have in hand</p>
                      <DetailRow label="Color" value={selected.physicalFeatures.color} />
                      <DetailRow label="Shape" value={selected.physicalFeatures.shape} />
                      <DetailRow label="Imprint/Marking" value={selected.physicalFeatures.imprint} />
                      <DetailRow label="Coating" value={selected.physicalFeatures.coating} />
                      <DetailRow label="Special Marking" value={selected.physicalFeatures.specialMarking} />
                    </div>
                  )}

                  {/* Packaging Features */}
                  {selected.packagingFeatures && (
                    <div className="detail-section">
                      <h3><FiPackage size={16} /> Authentic Packaging Features</h3>
                      <div className="packaging-checks">
                        <div className={`pack-check ${selected.packagingFeatures.hologramPresent ? 'pack-check--yes' : 'pack-check--no'}`}>
                          {selected.packagingFeatures.hologramPresent ? '✓' : '✗'} Hologram
                        </div>
                        <div className={`pack-check ${selected.packagingFeatures.barcodePresent ? 'pack-check--yes' : 'pack-check--no'}`}>
                          {selected.packagingFeatures.barcodePresent ? '✓' : '✗'} Barcode
                        </div>
                        <div className={`pack-check ${selected.packagingFeatures.securitySealPresent ? 'pack-check--yes' : 'pack-check--no'}`}>
                          {selected.packagingFeatures.securitySealPresent ? '✓' : '✗'} Security Seal
                        </div>
                      </div>
                      <DetailRow label="Packaging Color" value={selected.packagingFeatures.colorDescription} />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="detail-section">
                    <h3><FiActivity size={16} /> Community Data</h3>
                    <div className="detail-stats">
                      <div className="detail-stat">
                        <span className="detail-stat__val">{selected.verificationCount || 0}</span>
                        <span className="detail-stat__lbl">Verifications</span>
                      </div>
                      <div className="detail-stat">
                        <span className="detail-stat__val" style={{ color: selected.reportCount > 0 ? 'var(--red-600)' : 'inherit' }}>
                          {selected.reportCount || 0}
                        </span>
                        <span className="detail-stat__lbl">Reports</span>
                      </div>
                      <div className="detail-stat">
                        <span className={`detail-stat__val risk-${selected.riskLevel}`}>
                          {selected.riskLevel?.toUpperCase()}
                        </span>
                        <span className="detail-stat__lbl">Risk Level</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {selected.qrCode && (
                    <div className="detail-section detail-qr">
                      <h3>Verification QR Code</h3>
                      <img src={selected.qrCode} alt="Verification QR" />
                      <p>Scan to verify this medicine ID: <code>{selected.medicineId}</code></p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="detail-actions">
                    <Link to={`/report?medicine=${selected._id}&name=${encodeURIComponent(selected.name)}`} className="btn btn-danger btn-block">
                      <FiAlertTriangle size={15} /> Report Suspicious Copy
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
