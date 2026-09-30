import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { authApi } from '../../api/authApi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="card">
          <div className="rounded-xl bg-primary-50 text-primary-600 p-3 w-fit mb-4">
            <Mail size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Forgot your password?</h2>
          <p className="mt-1.5 text-sm text-slate-500">Enter your email and we'll send you instructions to reset your password.</p>

          {submitted ? (
            <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
              If an account exists with that email, password reset instructions have been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
              )}
              <div>
                <label className="label">Email address</label>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
