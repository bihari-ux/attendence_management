import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, ShieldCheck, Eye, EyeOff, LogIn, ArrowRight, UserPlus, AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/authApi'

export default function AdminPortal({ defaultTab = 'login' }) {
  const { user, login, signupAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = searchParams.get('tab') === 'signup' || defaultTab === 'signup' ? 'signup' : 'login'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      }
    }
  }, [user, navigate])

  // Admin status check (whether admin account already exists)
  const [adminStatus, setAdminStatus] = useState({ checked: false, adminExists: false, adminEmail: null })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await authApi.getAdminStatus()
        setAdminStatus({
          checked: true,
          adminExists: res.data.adminExists,
          adminEmail: res.data.adminEmail,
        })
      } catch (e) {
        setAdminStatus({ checked: true, adminExists: false, adminEmail: null })
      }
    }
    checkStatus()
  }, [])

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'signup' ? { tab: 'signup' } : {})
    setError('')
  }

  // Login form state
  const [loginForm, setLoginForm] = useState({ emailOrId: '', password: '' })
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)

  const [error, setError] = useState('')

  // 1-Click Fast Admin Login
  const handleFastAdminLogin = async (email = 'biharikumarrawat@gmail.com', pass = '123456') => {
    setLoginForm({ emailOrId: email, password: pass })
    setError('')
    setLoginLoading(true)
    try {
      const loggedUser = await login(email, pass, true)
      toast.success(`Welcome back, Admin ${loggedUser.fullName}! 🛡️`)
      navigate('/admin/dashboard')
    } catch (err) {
      // Fallback try Admin@123 or admin@company.com
      try {
        const fallback = await login(email, 'Admin@123', true)
        toast.success(`Welcome back, Admin ${fallback.fullName}! 🛡️`)
        navigate('/admin/dashboard')
      } catch (err2) {
        try {
          const fallback2 = await login('admin@company.com', 'Admin@123', true)
          toast.success(`Welcome back, Admin ${fallback2.fullName}! 🛡️`)
          navigate('/admin/dashboard')
        } catch (err3) {
          setError(err.response?.data?.message || 'Login failed. Please enter admin credentials.')
        }
      }
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle Admin Sign In
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!loginForm.emailOrId || !loginForm.password) {
      setError('Please enter your admin email/ID and password')
      return
    }

    setLoginLoading(true)
    try {
      const loggedUser = await login(loginForm.emailOrId, loginForm.password, rememberMe)
      if (loggedUser.role !== 'admin') {
        toast.success(`Welcome ${loggedUser.fullName}! Redirecting to Employee Workspace...`)
        navigate('/employee/dashboard')
      } else {
        toast.success(`Welcome back, Administrator ${loggedUser.fullName.split(' ')[0]}! 🛡️`)
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle Admin Creation / Signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!signupForm.fullName || !signupForm.email || !signupForm.password) {
      setError('Please fill in all required fields')
      return
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSignupLoading(true)
    try {
      const newUser = await signupAdmin({
        fullName: signupForm.fullName,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
      })
      toast.success('🎉 Admin account created successfully!')
      navigate('/admin/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create admin account.'
      setError(msg)
      if (msg.toLowerCase().includes('already exists')) {
        setAdminStatus((prev) => ({ ...prev, adminExists: true }))
      }
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-4 sm:p-8"
      style={{
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 40%, #1e1b4b 80%, #090d16 100%)',
      }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pt-2 pb-6">
        <Link to="/login" className="flex items-center gap-3 group">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-xl text-white shadow-lg transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
          >
            N
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">Nexora</span>
            <span className="text-xs text-indigo-400 font-semibold block -mt-1 tracking-wider uppercase">Command Portal</span>
          </div>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2 text-xs font-semibold text-indigo-200 transition-all"
        >
          <ArrowRight size={13} className="rotate-180" />
          <span>Switch to Employee Login</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div
            className="rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl"
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.15)',
            }}
          >
            {/* Header with Admin Badge */}
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                  boxShadow: '0 0 24px rgba(99, 102, 241, 0.45)',
                }}
              >
                <Shield size={28} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-2 uppercase tracking-wider">
                <Lock size={11} /> Admin Authority
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {activeTab === 'login' ? 'Administrator Login' : 'Create Admin Account'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xs">
                {activeTab === 'login'
                  ? 'Access administrative controls, workforce tracking & settings'
                  : 'Register system administrator for organization management'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <LogIn size={14} />
                Admin Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <UserPlus size={14} />
                Create Admin
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-950/40 border border-red-500/30 px-4 py-3 text-xs sm:text-sm text-red-300">
                <AlertCircle size={17} className="text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── TAB 1: ADMIN LOGIN ── */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Email or ID
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="admin@company.com or ADM001"
                    value={loginForm.emailOrId}
                    onChange={(e) => setLoginForm({ ...loginForm, emailOrId: e.target.value })}
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      className="w-full rounded-xl bg-slate-900/70 border border-slate-700/80 px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    Remember admin session
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {loginLoading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Authenticating Admin...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} />
                      Sign In as Admin
                      <ArrowRight size={15} className="ml-auto opacity-70" />
                    </>
                  )}
                </button>

                {/* 1-Click Fast Admin Login */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleFastAdminLogin('biharikumarrawat@gmail.com', 'Admin@123')}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>⚡ Quick 1-Click Admin Login (Demo)</span>
                  </button>
                </div>
              </form>
            )}

            {/* ── TAB 2: CREATE ADMIN ── */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {adminStatus.adminExists && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300 flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <p className="font-semibold">Admin account already configured</p>
                      <p className="text-amber-300/80 mt-0.5">
                        A primary admin ({adminStatus.adminEmail || 'admin'}) is already registered. You can sign in using existing admin credentials.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleTabChange('login')}
                        className="mt-2 text-xs font-bold text-amber-200 underline hover:text-white"
                      >
                        Switch to Admin Sign In →
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="e.g. Bihari Kumar Rawat"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-xl bg-slate-900/70 border border-slate-700/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="admin@company.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-xl bg-slate-900/70 border border-slate-700/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="+91 98765 43210"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      className="w-full rounded-xl bg-slate-900/70 border border-slate-700/80 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="At least 6 characters"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="Re-enter password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {signupLoading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating Administrator...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Create Admin Account
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer switcher */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <Link
                to="/login"
                className="text-xs text-indigo-300/80 hover:text-indigo-200 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Are you an employee?</span>
                <span className="font-semibold underline">Go to Employee Login (/login)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center text-xs text-slate-600 py-2">
        Nexora Secure Management Portal · Protected by Enterprise JWT & Role Access Control
      </div>
    </div>
  )
}
