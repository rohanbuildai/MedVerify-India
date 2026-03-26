import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

const INDIA_STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana',
  'Uttar Pradesh','Uttarakhand','West Bengal','Other'
];

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-logo-icon"><FiShield size={24} /></div>
          <span className="auth-logo-text">MedVerify India</span>
        </div>
        <h2 className="auth-card__title">Welcome Back</h2>
        <p className="auth-card__sub">Login to report and track suspicious medicines</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <FiMail size={16} className="input-icon" />
              <input type="email" className="form-input input-with-icon" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" autoComplete="email" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <FiLock size={16} className="input-icon" />
              <input type={showPass ? 'text' : 'password'} className="form-input input-with-icon input-with-right" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Your password" autoComplete="current-password" />
              <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div className="auth-form__forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Logging in...</> : 'Login'}
          </button>
        </form>

        <div className="auth-card__footer">
          Don't have an account? <Link to="/register">Register free</Link>
        </div>

        <div className="auth-demo-box">
          <p><strong>Demo Admin:</strong> admin@medverify.in / Admin@MedVerify2024</p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', state: '', city: '', role: 'user'
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) e.password = 'Must contain uppercase letter and number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Invalid Indian mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to MedVerify.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--wide page-enter">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__logo">
          <div className="auth-logo-icon"><FiShield size={24} /></div>
          <span className="auth-logo-text">MedVerify India</span>
        </div>
        <h2 className="auth-card__title">Create Account</h2>
        <p className="auth-card__sub">Join thousands fighting fake medicines in India</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-icon-wrap">
                <FiUser size={16} className="input-icon" />
                <input name="name" className={`form-input input-with-icon ${errors.name ? 'error' : ''}`} value={form.name} onChange={handleChange} placeholder="Your full name" />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <div className="input-icon-wrap">
                <FiMail size={16} className="input-icon" />
                <input name="email" type="email" className={`form-input input-with-icon ${errors.email ? 'error' : ''}`} value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-icon-wrap">
                <FiLock size={16} className="input-icon" />
                <input name="password" type={showPass ? 'text' : 'password'} className={`form-input input-with-icon input-with-right ${errors.password ? 'error' : ''}`} value={form.password} onChange={handleChange} placeholder="Min 8 chars, uppercase + number" />
                <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-icon-wrap">
                <FiLock size={16} className="input-icon" />
                <input name="confirmPassword" type="password" className={`form-input input-with-icon ${errors.confirmPassword ? 'error' : ''}`} value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div className="input-icon-wrap">
                <FiPhone size={16} className="input-icon" />
                <input name="phone" className={`form-input input-with-icon ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
              </div>
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">I am a</label>
              <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                <option value="user">General Public</option>
                <option value="pharmacist">Pharmacist / Healthcare Worker</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <select name="state" className="form-select" value={form.state} onChange={handleChange}>
                <option value="">Select State</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input name="city" className="form-input" value={form.city} onChange={handleChange} placeholder="Your city" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating Account...</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-card__footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};
