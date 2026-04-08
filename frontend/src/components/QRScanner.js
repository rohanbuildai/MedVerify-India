import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiX, FiShield } from 'react-icons/fi';

const QRScanner = ({ onScanSuccess, onScanError, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear().catch(error => {
        console.error('Failed to clear html5QrcodeScanner. ', error);
      });
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <div className="qr-header-title">
            <FiShield size={18} style={{ color: 'var(--green-500)' }} />
            <h3>Clinical QR Scanner</h3>
          </div>
          <button className="btn-close" onClick={onClose}><FiX size={20} /></button>
        </div>
        
        <div className="qr-scanner-viewport">
          <div id="reader"></div>
          <div className="scanner-beam"></div>
          <div className="scanner-corner corner-tl"></div>
          <div className="scanner-corner corner-tr"></div>
          <div className="scanner-corner corner-bl"></div>
          <div className="scanner-corner corner-br"></div>
        </div>

        <div className="qr-scanner-hint">
          <p>Align the medicine's QR code within the frame.</p>
          <span>For best results, avoid glare and ensure steady lighting.</span>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
