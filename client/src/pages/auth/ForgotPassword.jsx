import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import './AuthCyber.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Please enter your work email address')
      return
    }
    setLoading(true)
    try {
      await authApi.forgotPassword({ email: email.trim() })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cyber-auth-root">
      {/* Background SVG with golden curves */}
      <div className="cyber-bg">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffc61a" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffc61a" />
              <stop offset="1" stopColor="#8a5a00" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#g)" strokeWidth="3">
            <path d="M-50 700C250 500 400 650 700 380S1000 200 1300 80" />
            <path d="M-50 740C260 560 420 690 720 430S1020 260 1300 140" opacity="0.6" />
            <path d="M-50 780C270 620 440 730 740 480S1040 320 1300 200" opacity="0.35" />
          </g>
        </svg>
      </div>

      <div className="cyber-wrap">
        <i className="cyber-tri tl" />
        <i className="cyber-tri br" />

        <main className="cyber-card">
          <div className="cyber-brand">
            <div className="cyber-logo-badge">
              <div className="cyber-logo-icon">A</div>
              <span className="cyber-brand-name">AttendPro</span>
            </div>
            <Link to="/login" className="cyber-link" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ← Back to Sign In
            </Link>
          </div>

          <h1 className="cyber-title" style={{ marginTop: '10px' }}>
            Recover <span>Password</span>
          </h1>
          <p className="cyber-sub">
            Enter your verified email and we'll dispatch password recovery instructions.
          </p>

          {submitted ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '12px', padding: '16px', margin: '20px 0', textAlign: 'center', color: '#34d399', fontSize: '13px' }}>
              ✓ If an account exists with that email, password reset instructions have been sent. Check your inbox!
              <div style={{ marginTop: '16px' }}>
                <Link to="/login" className="cyber-primary" style={{ textDecoration: 'none', height: '42px', fontSize: '13px' }}>
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="cyber-enter">
              <label className="cyber-label">
                <span>Registered Email Address</span>
              </label>
              <div className={`cyber-field highlighted ${error ? 'has-error' : ''}`}>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <input
                  type="email"
                  placeholder="name@company.com"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && <div className="cyber-msg bad">✕ {error}</div>}

              <button className="cyber-primary" type="submit" disabled={loading} style={{ marginTop: '18px' }}>
                {loading ? 'Transmitting Request...' : 'Send Recovery Link →'}
              </button>
            </form>
          )}

          <p className="cyber-sw" style={{ marginTop: '20px' }}>
            Remembered your credentials? <Link to="/login" className="cyber-link">Sign In</Link>
          </p>
        </main>
      </div>
    </div>
  )
}
