import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiAlertTriangle, FiUpload, FiX, FiCheckCircle } from 'react-icons/fi';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ReportPage.css';

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Jammu & Kashmir','Karnataka',
  'Kerala','Ladakh','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
];

const SUSPICION_TYPES = [
  { value: 'wrong_color', label: 'Wrong Color / Appearance' },
  { value: 'wrong_shape', label: 'Wrong Shape / Size / Texture' },
  { value: 'unusual_smell', label: 'Unusual Smell or Taste' },
  { value: 'packaging_quality', label: 'Poor Packaging Quality' },
  { value: 'missing_hologram', label: 'Missing Hologram / Security Features' },
  { value: 'price_too_low', label: 'Suspiciously Low Price' },
  { value: 'no_effect', label: 'No Therapeutic Effect' },
  { value: 'adverse_reaction', label: 'Unexpected Adverse Reaction' },
  { value: 'seal_tampered', label: 'Seal / Packaging Tampered' },
  { value: 'wrong_imprint', label: 'Wrong or Missing Imprint' },
  { value: 'other', label: 'Other Concern' },
];

const ReportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    medicineName: searchParams.get('name') || '',
    brandName: '',
    batchNumber: '',
    expiryDate: '',
    suspicionType: '',
    description: '',
    shopName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isAnonymous: false,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [errors, setErrors] = useState({});

  if (!user) {
    return (
      <div className="report-page page-enter">
        <div className="container-sm">
          <div className="report-login-prompt">
            <FiAlertTriangle size={48} style={{ color: 'var(--amber-500)' }} />
            <h2>Login Required</h2>
            <p>You must be logged in to submit a report. Your reports are tracked and you'll receive updates.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Register Free</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.medicineName.trim()) e.medicineName = 'Medicine name is required';
    if (!form.suspicionType) e.suspicionType = 'Please select a reason';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Description must be at least 20 characters';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state) e.state = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - images.length);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'isAnonymous') formData.append(k, v);
        else if (v) formData.append(k, v);
      });
      formData.append('purchaseLocation[shopName]', form.shopName);
      formData.append('purchaseLocation[address]', form.address);
      formData.append('purchaseLocation[city]', form.city);
      formData.append('purchaseLocation[state]', form.state);
      formData.append('purchaseLocation[pincode]', form.pincode);
      images.forEach(img => formData.append('images', img));

      const { data } = await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(data.data);
      toast.success('Report submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="report-page page-enter">
        <div className="container-sm">
          <div className="report-success">
            <div className="report-success__icon"><FiCheckCircle size={52} /></div>
            <h2>Report Submitted!</h2>
            <p>Thank you for helping protect millions of Indians from fake medicines.</p>
            <div className="report-success__details">
              <div className="report-success__row">
                <span>Report ID</span>
                <strong>{submitted.reportId}</strong>
              </div>
              <div className="report-success__row">
                <span>Status</span>
                <span className="badge badge-amber">Under Review</span>
              </div>
              <div className="report-success__row">
                <span>Priority</span>
                <span className={`badge badge-${submitted.priority === 'urgent' || submitted.priority === 'high' ? 'red' : 'amber'}`}>
                  {submitted.priority?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="report-success__note">
              📧 A confirmation email has been sent. You'll be notified when your report is reviewed.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-primary">View My Reports</Link>
              <button onClick={() => { setSubmitted(null); setForm({ medicineName: '', brandName: '', batchNumber: '', expiryDate: '', suspicionType: '', description: '', shopName: '', address: '', city: '', state: '', pincode: '', isAnonymous: false }); setImages([]); setPreviews([]); }} className="btn btn-outline">
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page page-enter">
      <div className="report-page__header">
        <div className="container-sm">
          <h1><FiAlertTriangle size={28} /> Report Suspicious Medicine</h1>
          <p>Your report helps protect others. All reports are reviewed by our team and forwarded to CDSCO.</p>
        </div>
      </div>

      <div className="container-sm" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <FiAlertTriangle size={18} />
          <div>
            <strong>Medical Emergency?</strong> If you or someone you know has consumed a fake medicine and is experiencing health issues, call <strong>112</strong> immediately. CDSCO helpline: <strong>1800-11-4430</strong>.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="report-form card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: 16 }}>Medicine Information</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Medicine Name *</label>
                <input name="medicineName" className={`form-input ${errors.medicineName ? 'error' : ''}`} value={form.medicineName} onChange={handleChange} placeholder="e.g. Crocin 500" />
                {errors.medicineName && <span className="form-error">{errors.medicineName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Brand Name</label>
                <input name="brandName" className="form-input" value={form.brandName} onChange={handleChange} placeholder="e.g. GSK" />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input name="batchNumber" className="form-input" value={form.batchNumber} onChange={handleChange} placeholder="Found on packaging" />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input type="month" name="expiryDate" className="form-input" value={form.expiryDate} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Reason for Suspicion *</label>
              <select name="suspicionType" className={`form-select ${errors.suspicionType ? 'error' : ''}`} value={form.suspicionType} onChange={handleChange}>
                <option value="">Select reason...</option>
                {SUSPICION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.suspicionType && <span className="form-error">{errors.suspicionType}</span>}
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Detailed Description * <span style={{ fontWeight: 400, color: 'var(--slate-400)' }}>({form.description.length}/2000)</span></label>
              <textarea
                name="description"
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what made you suspicious. Include color, smell, texture, packaging issues, health effects, etc. The more detail, the better."
                rows={5}
                maxLength={2000}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>
          </div>

          <div className="card-header" style={{ borderTop: '1px solid var(--slate-100)' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Purchase Location</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Shop / Pharmacy Name</label>
                <input name="shopName" className="form-input" value={form.shopName} onChange={handleChange} placeholder="Name of pharmacy/shop" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input name="address" className="form-input" value={form.address} onChange={handleChange} placeholder="Street address" />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input name="city" className={`form-input ${errors.city ? 'error' : ''}`} value={form.city} onChange={handleChange} placeholder="City" />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <select name="state" className={`form-select ${errors.state ? 'error' : ''}`} value={form.state} onChange={handleChange}>
                  <option value="">Select State</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <span className="form-error">{errors.state}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input name="pincode" className="form-input" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} />
              </div>
            </div>
          </div>

          <div className="card-header" style={{ borderTop: '1px solid var(--slate-100)' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Evidence Photos (Optional)</h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: 'var(--slate-500)', marginBottom: 16 }}>Upload up to 3 photos of the suspicious medicine or packaging. Max 5MB each.</p>
            <div className="image-upload">
              {previews.map((src, i) => (
                <div key={i} className="image-preview">
                  <img src={src} alt={`Evidence ${i + 1}`} />
                  <button type="button" className="image-preview__remove" onClick={() => removeImage(i)}>
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="image-upload__btn">
                  <FiUpload size={20} />
                  <span>Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleImages} hidden />
                </label>
              )}
            </div>
          </div>

          <div className="card-body" style={{ borderTop: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange} style={{ width: 16, height: 16 }} />
              <span><strong>Submit anonymously</strong> (your name won't appear publicly)</span>
            </label>
            <button type="submit" className="btn btn-danger btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Submitting...</> : <><FiAlertTriangle size={16} /> Submit Report</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportPage;
