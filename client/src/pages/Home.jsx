import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            SMART ATTENDANCE MANAGEMENT SYSTEM
          </div>
          <h1 className="hero-title">
            Track Attendance<br />
            <span className="text-blue">Simplify Workforce</span>
          </h1>
          <p className="hero-subtitle">
            A modern and easy-to-use attendance management system for your organisation. Track employee attendance, leave, working hours and more — all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-solid btn-large">
              Login to Continue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
            <a href="#demo" className="btn-outline btn-large play-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Learn More
            </a>
          </div>
        </div>
        
        <div className="hero-images">
          <div className="arrow-text">
            <span>Manage<br/>People Better</span>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5 Q 20 20 30 35 M 20 35 L 30 35 L 28 25" stroke="#1f2937" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800" 
            alt="Dashboard on laptop" 
            className="laptop-mockup" 
          />
          <img 
            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300" 
            alt="Mobile App" 
            className="mobile-mockup" 
          />
        </div>
      </section>

      {/* Features Row */}
      <section id="features" className="features-row">
        <div className="feature-item">
          <div className="feature-icon bg-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>Attendance Tracking</h3>
          <p>Easy check-in/check-out system</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon bg-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3>Employee Management</h3>
          <p>Manage all employee details</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon bg-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>Leave Management</h3>
          <p>Apply, approve and track leaves</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon bg-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <h3>Reports & Analytics</h3>
          <p>Get detailed attendance reports</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon bg-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <h3>Secure & Reliable</h3>
          <p>Your data is always safe</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon bg-lightblue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <h3>Multi-Device Access</h3>
          <p>Works on web, mobile and tablet</p>
        </div>
      </section>

      {/* Stats Banner (Benefits) */}
      <section id="benefits" className="stats-banner">
        <div className="stats-content">
          <div className="stat-item">
            <div className="stat-icon text-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-text">
              <h4>500+</h4>
              <p>Happy Users</p>
            </div>
          </div>
          
          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-icon text-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M12 6h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 10h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M8 14h.01"></path>
              </svg>
            </div>
            <div className="stat-text">
              <h4>50+</h4>
              <p>Organizations</p>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-icon text-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <div className="stat-text">
              <h4>99.9%</h4>
              <p>Uptime</p>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-icon text-orange">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div className="stat-text">
              <h4>4.8/5</h4>
              <p>User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="home-footer">
        <h2>A Smarter Way to Manage Your Workforce</h2>
        <p>Save time, increase productivity and maintain accurate attendance records with AttendPro.</p>
        <div className="wave-bg"></div>
      </footer>
    </div>
  );
}
