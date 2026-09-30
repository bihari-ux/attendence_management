import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Shield, Zap, Clock, Users, ArrowRight, Sparkles, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { captureLocationInfo } from '../../utils/locationHelper'

const features = [
  { icon: Clock,   title: 'Smart Attendance',  desc: 'Server-calculated work timer' },
  { icon: Zap,     title: 'Task Management',   desc: 'Daily task tracking & logs' },
  { icon: Users,   title: 'Team Presence',     desc: 'Real-time work status updates' },
  { icon: Shield,  title: 'Secure Session',    desc: 'Encrypted employee access' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ emailOrId: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Pre-warm location capture so it's instant upon login
    captureLocationInfo().catch(() => {})
  }, [])

  const handleLogin = async (emailOrId, password) => {
    setError('')
    if (!emailOrId || !password) {
      setError('Please enter your Employee ID or email and password')
      return
    }
    setLoading(true)
    try {
      const user = await login(emailOrId, password, rememberMe)
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}! 👋`)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleLogin(form.emailOrId, form.password)
  }

  // 1-Click Fast Employee Login for testing & instant access
  const handleFastLogin = (empId = 'neeraj123@gmail.com', pwd = 'Employee@123') => {
    setForm({ emailOrId: empId, password: pwd })
    handleLogin(empId, pwd)
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Branding Panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #1e1b4b 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute top-1/2 -right-20 h-48 w-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-xl text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 20px rgba(99,102,241,0.6)' }}
          >
            N
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Nexora</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-400/20">
            Employee Workspace
          </span>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 mb-6">
            <span className="live-dot" />
            <span className="text-xs font-semibold text-indigo-300">Live Employee Portal · Fast & Seamless</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black leading-tight text-white">
            Your daily work,<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a5b4fc, #6366f1)' }}>
              tracked perfectly.
            </span>
          </h1>
          <p className="mt-5 text-indigo-200/80 text-lg leading-relaxed max-w-md">
            Punch in with a single tap, track active projects, request leaves, and review your personal attendance logs.
          </p>

          {/* Features grid */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="rounded-lg bg-indigo-500/20 w-8 h-8 flex items-center justify-center mb-2.5">
                  <f.icon size={15} className="text-indigo-300" />
                </div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-[11px] text-indigo-300/70 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick info row */}
          <div className="mt-8 flex gap-8">
            {[['Live', 'Real-time sync'], ['1-Click', 'Fast Timer'], ['100%', 'Attendance accuracy']].map(([val, lbl], i) => (
              <div key={i}>
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-indigo-300 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-indigo-400/60">
          © {new Date().getFullYear()} Nexora Technologies. Employee Portal.
        </p>
      </div>

      {/* ── Right Employee Login Form ── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-black text-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              N
            </div>
            <span className="text-xl font-bold text-slate-800">Nexora</span>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
              <Building2 size={13} /> Employee Portal
            </div>
            <h2 className="text-2xl font-black text-slate-800">Employee Login 👋</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to record your attendance & manage tasks</p>
          </div>

          {/* 1-Click Fast Employee Login Button */}
          <button
            type="button"
            onClick={() => handleFastLogin('neeraj123@gmail.com', 'Employee@123')}
            className="w-full mb-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Sparkles size={14} />
            <span>⚡ 1-Click Fast Employee Login (Demo)</span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 animate-slide-up">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Employee ID or Email</label>
              <input
                type="text"
                autoFocus
                required
                className="input"
                placeholder="EMP2001 or you@company.com"
                value={form.emailOrId}
                onChange={(e) => setForm({ ...form, emailOrId: e.target.value })}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 mt-2 text-base shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In to Workspace
                  <ArrowRight size={15} className="ml-auto opacity-70" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials Chips */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-500 shadow-sm">
            <p className="font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>Quick Test Accounts</span>
              <span className="text-[10px] text-slate-400 font-normal">Click to fill</span>
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setForm({ emailOrId: 'neeraj123@gmail.com', password: 'Employee@123' })}
                className="w-full text-left flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 text-emerald-600 px-2 py-0.5 font-bold text-[10px]">Neeraj</span>
                  <span className="font-medium text-slate-600">neeraj123@gmail.com</span>
                </div>
                <span className="text-[10px] text-slate-400">Employee@123</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ emailOrId: 'bewda@company.com', password: 'Employee@123' })}
                className="w-full text-left flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 text-emerald-600 px-2 py-0.5 font-bold text-[10px]">Bewda</span>
                  <span className="font-medium text-slate-600">EMP2001</span>
                </div>
                <span className="text-[10px] text-slate-400">Employee@123</span>
              </button>
            </div>
          </div>

          {/* Admin Portal Gateway Link */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              System Administrator?{' '}
              <Link to="/admin" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1">
                <span>Access Admin Portal (/admin)</span>
                <ArrowRight size={12} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
