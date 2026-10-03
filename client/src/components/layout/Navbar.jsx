import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../pages/Home.css'; // Reuse the nav styles if any are still in Home.css, though we should migrate them or just keep using them

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/signup');

  return (
    <nav className="home-navbar">
      <div className="nav-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M9 16l2 2 4-4"></path>
            </svg>
          </div>
          <div className="logo-text">
            <strong>AttendPro</strong>
            <span>Attendance Management</span>
          </div>
        </Link>
      </div>

      {!isAuthPage && (
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#benefits">Benefits</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      )}

      {!isAuthPage && (
        <div className="nav-actions">
          <Link to="/login" className="btn-outline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Login
          </Link>
          <Link to="/login?tab=signup" className="btn-solid">Get Started</Link>
        </div>
      )}
    </nav>
  );
}
