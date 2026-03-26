import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiShield, FiSearch, FiAlertTriangle, FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiChevronDown } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <FiShield size={20} />
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-main">MedVerify</span>
            <span className="navbar__logo-sub">India</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar__links">
          <li>
            <Link to="/verify" className={`navbar__link ${isActive('/verify') ? 'navbar__link--active' : ''}`}>
              <FiSearch size={15} /> Verify Medicine
            </Link>
          </li>
          <li>
            <Link to="/reports/public" className={`navbar__link ${isActive('/reports/public') ? 'navbar__link--active' : ''}`}>
              <FiAlertTriangle size={15} /> Reports Feed
            </Link>
          </li>
          <li>
            <Link to="/flagged" className={`navbar__link ${isActive('/flagged') ? 'navbar__link--active' : ''}`}>
              Flagged Drugs
            </Link>
          </li>
        </ul>

        {/* Auth Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/report" className="btn btn-primary btn-sm">
                <FiAlertTriangle size={14} /> Report Fake
              </Link>
              <div className="navbar__dropdown" ref={dropRef}>
                <button
                  className="navbar__user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="navbar__avatar">{user.name?.charAt(0).toUpperCase()}</div>
                  <span className="navbar__user-name">{user.name?.split(' ')[0]}</span>
                  <FiChevronDown size={14} className={dropdownOpen ? 'rotated' : ''} />
                </button>
                {dropdownOpen && (
                  <div className="navbar__dropdown-menu">
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{user.name}</p>
                      <p className="navbar__dropdown-email">{user.email}</p>
                      <span className={`badge badge-${user.role === 'admin' ? 'red' : 'green'}`}>{user.role}</span>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link to="/dashboard" className="navbar__dropdown-item">
                      <FiGrid size={14} /> Dashboard
                    </Link>
                    <Link to="/profile" className="navbar__dropdown-item">
                      <FiUser size={14} /> My Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="navbar__dropdown-item">
                        <FiShield size={14} /> Admin Panel
                      </Link>
                    )}
                    <div className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          <Link to="/verify" className="navbar__mobile-link"><FiSearch size={16} /> Verify Medicine</Link>
          <Link to="/reports/public" className="navbar__mobile-link"><FiAlertTriangle size={16} /> Reports Feed</Link>
          <Link to="/flagged" className="navbar__mobile-link">Flagged Drugs</Link>
          {user ? (
            <>
              <Link to="/report" className="navbar__mobile-link navbar__mobile-link--primary">Report Fake Medicine</Link>
              <Link to="/dashboard" className="navbar__mobile-link"><FiGrid size={16} /> Dashboard</Link>
              <button className="navbar__mobile-link navbar__mobile-link--danger" onClick={handleLogout}>
                <FiLogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__mobile-link">Login</Link>
              <Link to="/register" className="navbar__mobile-link navbar__mobile-link--primary">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
