import React from 'react';
import { FiX, FiAlertTriangle, FiCheckCircle, FiShield } from 'react-icons/fi';

const AIAnalysisModal = ({ results, onClose, medicine }) => {
  if (!results) return null;

  const { isSuspicious, confidenceScore, findings, recommendation } = results;

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container ai-results-container">
        <div className="qr-scanner-header">
          <h3>AI Packaging Analysis</h3>
          <button className="btn-close" onClick={onClose}><FiX size={20} /></button>
        </div>
        
        <div className="ai-results-body" style={{ padding: '24px' }}>
          <div className={`ai-status-banner ${isSuspicious ? 'suspicious' : 'authentic'}`} style={{
            display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px',
            padding: '16px', borderRadius: '12px',
            background: isSuspicious ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${isSuspicious ? '#ef4444' : '#22c55e'}`
          }}>
            {isSuspicious ? <FiAlertTriangle size={32} color="#ef4444" /> : <FiCheckCircle size={32} color="#22c55e" />}
            <div>
              <h4 style={{ margin: 0, color: isSuspicious ? '#991b1b' : '#166534' }}>
                {isSuspicious ? 'Potentially Suspicious Packaging' : 'Authentic Packaging Features'}
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: isSuspicious ? '#ef4444' : '#22c55e' }}>
                Confidence Score: {confidenceScore}%
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '14px' }}>
              <FiShield size={16} /> Key Findings:
            </h5>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              {findings.map((f, i) => (
                <li key={i} style={{ marginBottom: '6px' }}>{f}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Recommendation:</h5>
            <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>{recommendation}</p>
          </div>
        </div>

        <div className="qr-scanner-hint">
          {isSuspicious ? 'Consider reporting this medicine immediately.' : 'Always perform a physical check of the medicine itself.'}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
