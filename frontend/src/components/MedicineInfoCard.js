import React, { useState } from 'react';
import { FiInfo, FiShield, FiPackage, FiActivity, FiAlertTriangle, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

const MedicineInfoCard = ({ selected }) => {
  const [batchNo, setBatchNo] = useState('');
  const [cdscoData, setCdscoData] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!selected) return null;

  const risk = selected.riskLevel ? RISK_CONFIG[selected.riskLevel] : RISK_CONFIG.low;

  const handleBatchLookup = async () => {
    if (!batchNo) return toast.error('Enter batch number');
    setLoading(true);
    try {
      const { data } = await api.get(`/medicines/cdsco-lookup/${batchNo}`);
      setCdscoData(data.data);
    } catch (err) {
      toast.error('CDSCO database error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-info-card">
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

      {selected.isFlaggedAsFake && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <FiAlertTriangle size={18} />
          <div>
            <strong>Warning:</strong> This medicine has been reported as suspicious by {selected.reportCount} users. Counterfeit versions are known to circulate. Contact your doctor and report to CDSCO helpline: <strong>1800-11-4430</strong>.
          </div>
        </div>
      )}

      {/* NEW: CDSCO Batch Lookup */}
      <div className="detail-section cdsco-section" style={{ background: '#f8fafc' }}>
        <h3>🔍 CDSCO Official Batch Lookup</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input 
            type="text" 
            placeholder="Enter batch number (e.g. B99)..."
            value={batchNo}
            onChange={e => setBatchNo(e.target.value)}
            className="input-sm"
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
          <button className="btn btn-primary btn-sm" onClick={handleBatchLookup} disabled={loading}>
            {loading ? '...' : 'Verify Batch'}
          </button>
        </div>
        
        {cdscoData && (
          <div className={`cdsco-alert ${cdscoData.status}`} style={{
            padding: '12px', borderRadius: '8px', fontSize: '13px',
            background: cdscoData.status === 'recalled' ? '#fee2e2' : '#f0f9ff',
            border: `1px solid ${cdscoData.status === 'recalled' ? '#ef4444' : '#bae6fd'}`
          }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: cdscoData.status === 'recalled' ? '#991b1b' : '#0369a1' }}>
              {cdscoData.status === 'recalled' ? '⚠ RECALL ALERT' : 'ℹ Batch Status'}
            </p>
            <p style={{ margin: 0 }}>{cdscoData.alertMessage}</p>
          </div>
        )}
      </div>

      <div className="detail-section">
        <h3><FiInfo size={16} /> Basic Information</h3>
        <DetailRow label="Medicine Name" value={selected.name} />
        <DetailRow label="Brand" value={selected.brand} />
        <DetailRow label="Manufacturer" value={selected.manufacturer} />
        <DetailRow label="Category" value={selected.category} />
        <DetailRow label="Composition" value={selected.composition} />
        <DetailRow label="Dosage Form" value={selected.dosageForm} />
        <DetailRow label="Strength" value={selected.strength} />
      </div>

      {selected.physicalFeatures && (
        <div className="detail-section">
          <h3><FiShield size={16} /> Authentic Physical Features</h3>
          <p className="detail-section__note">Compare these with what you have in hand</p>
          <DetailRow label="Color" value={selected.physicalFeatures.color} />
          <DetailRow label="Shape" value={selected.physicalFeatures.shape} />
          <DetailRow label="Imprint/Marking" value={selected.physicalFeatures.imprint} />
        </div>
      )}

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
          </div>
          <DetailRow label="Packaging Color" value={selected.packagingFeatures.colorDescription} />
        </div>
      )}

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
        </div>
      </div>

      <div className="detail-actions">
        <Link to={`/report?medicine=${selected._id}&name=${encodeURIComponent(selected.name)}`} className="btn btn-danger btn-block">
          <FiAlertTriangle size={15} /> Report Suspicious Copy
        </Link>
      </div>
    </div>
  );
};

export default MedicineInfoCard;
