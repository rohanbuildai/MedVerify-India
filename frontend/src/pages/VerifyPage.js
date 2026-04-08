import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { FiSearch, FiAlertTriangle, FiAlertCircle, FiInfo, FiMaximize, FiCamera, FiBox, FiShield } from 'react-icons/fi';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';
import QRScanner from '../components/QRScanner';
import MedicineInfoCard from '../components/MedicineInfoCard';
import AIAnalysisModal from '../components/AIAnalysisModal';
import './VerifyPage.css';

const VerifyPage = () => {
  const { id: medicineId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // New features state
  const [showScanner, setShowScanner] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const fileInputRef = useRef(null);

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
      setShowScanner(false);
    } catch (err) {
      toast.error('Medicine not found or invalid QR code');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    // Assuming decodedText is either a full URL with /verify/ID or just the ID
    let id = decodedText;
    if (decodedText.includes('/verify/')) {
      id = decodedText.split('/verify/')[1];
    }
    loadMedicineById(id);
  };

  const handleAIScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiAnalyzing(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/medicines/ai-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (data.success) {
        toast.success('AI Analysis Complete');
        setAiResults(data.analysis);
        if (data.medicine) setSelected(data.medicine); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI Analysis failed');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Auto-search if query param exists
  useEffect(() => {
    const q = searchParams.get('q');
    const action = searchParams.get('action');
    
    if (q && !medicineId) { setQuery(q); doSearch(q); }
    if (action === 'scan') setShowScanner(true);
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
      setSelected(med);
      toast.error('Could not load full details');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="verify-page page-enter">
      {showScanner && (
        <QRScanner 
          onScanSuccess={handleScanSuccess} 
          onScanError={(err) => console.log(err)} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {aiResults && (
        <AIAnalysisModal 
          results={aiResults} 
          medicine={selected} 
          onClose={() => setAiResults(null)} 
        />
      )}

      <div className="verify-page__header">
        <div className="container">
          <div className="hero__badge">
            <FiShield size={13} /> Active Clinical Vigilance
          </div>
          <h1>Verify Product Content</h1>
          <p>Utilize QR scanning, AI packaging analysis, or manual lookup to authenticate pharmaceutical products.</p>
          
          <div className="verify-hub verify-hub--compact">
            <div className="verify-hub__options">
              <button className="verify-hub__btn" onClick={() => setShowScanner(true)}>
                <div className="verify-hub__btn-icon"><FiMaximize size={24} /></div>
                <div className="verify-hub__btn-text">
                  <strong>Open QR Scanner</strong>
                  <span>Scan strip/box code</span>
                </div>
              </button>
              <button className="verify-hub__btn verify-hub__btn--accent" onClick={() => fileInputRef.current.click()} disabled={aiAnalyzing}>
                <div className="verify-hub__btn-icon">
                  {aiAnalyzing ? <span className="spinner" /> : <FiBox size={24} />}
                </div>
                <div className="verify-hub__btn-text">
                  <strong>{aiAnalyzing ? 'Analyzing...' : 'AI Packaging Scan'}</strong>
                  <span>Detect counterfeit strips</span>
                </div>
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              capture="environment"
              onChange={handleAIScan}
            />

            <form className="verify-search" onSubmit={handleSearch}>
              <div className="verify-search__inner">
                <FiSearch size={18} className="verify-search__icon" />
                <input
                  type="text"
                  className="verify-search__input"
                  placeholder="Enter Brand Name, Batch Number, or Active Ingredient..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Verify Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container verify-body">
        <div className={`verify-layout ${selected ? 'verify-layout--split' : ''}`}>
          <div className="verify-results">
            {loading && (
              <div className="verify-loading"><span className="spinner spinner-dark" /><p>Searching...</p></div>
            )}
            
            {!loading && searched && results.length === 0 && (
              <div className="verify-empty">
                <FiAlertCircle size={40} />
                <h3>No medicines found</h3>
                <p>We couldn't find <strong>"{query}"</strong>. It might be suspicious.</p>
                <Link to="/report" className="btn btn-danger btn-sm" style={{ marginTop: 16 }}>
                  <FiAlertTriangle size={14} /> Report This Medicine
                </Link>
              </div>
            )}

            {!loading && !searched && (
              <div className="verify-hint">
                <FiInfo size={40} />
                <h3>How to verify</h3>
                <ol>
                  <li>Scan the QR code on the packaging</li>
                  <li>Or use <strong>AI Packaging Scan</strong> to detect fakes</li>
                  <li>Or search by name and compare details</li>
                </ol>
              </div>
            )}

            {!loading && results.length > 0 && (
              <>
                <div className="verify-results__count">
                  Found {results.length} registered pharmaceutical product(s)
                </div>
                {results.map(med => (
                  <div
                    key={med._id}
                    className={`med-result-card card-clinical ${selected?._id === med._id ? 'med-result-card--active' : ''}`}
                    onClick={() => handleSelect(med)}
                  >
                    <div className="med-result-card__left">
                      <div className="med-result-card__icon">
                        <FiBox size={20} />
                      </div>
                      <div>
                        <div className="med-result-card__name">{med.name}</div>
                        <div className="med-result-card__brand">
                          {med.brand} • {med.manufacturer || 'Authorized Manufacturer'}
                        </div>
                      </div>
                    </div>
                    {med.riskLevel === 'high' || med.riskLevel === 'critical' ? (
                      <div className="badge badge-red">Alert</div>
                    ) : (
                      <div className="badge badge-green">Registered</div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {(selected || detailLoading) && (
            <div className="verify-detail">
              {detailLoading ? (
                <div className="verify-loading"><span className="spinner spinner-dark" /><p>Loading details...</p></div>
              ) : (
                <MedicineInfoCard selected={selected} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
