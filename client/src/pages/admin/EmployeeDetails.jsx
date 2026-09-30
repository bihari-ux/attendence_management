import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, Calendar, Briefcase, Clock, CheckCircle2,
  ListChecks, TrendingUp, KeyRound, Eye, EyeOff, Sparkles, Copy, Check, RefreshCw,
  ShieldCheck, Lock, AlertCircle, MapPin, Globe, Monitor, Smartphone, ExternalLink,
  Navigation
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageLoader } from '../../components/common/Loading'
import ErrorState from '../../components/common/ErrorState'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { employeeApi } from '../../api/employeeApi'
import { taskApi } from '../../api/taskApi'
import { attendanceApi } from '../../api/attendanceApi'

const generatePassword = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  let res = 'Emp@'
  for (let i = 0; i < 4; i++) {
    res += digits.charAt(Math.floor(Math.random() * digits.length))
  }
  for (let i = 0; i < 2; i++) {
    res += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  return res
}

export default function EmployeeDetails() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [tasks, setTasks] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Direct Password Reset State
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lastResetInfo, setLastResetInfo] = useState(null) // { password, time }

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const [empRes, taskRes, attRes] = await Promise.all([
        employeeApi.getOne(id),
        taskApi.getAll({ employee: id, limit: 5 }),
        attendanceApi.historyAdmin({ employee: id, limit: 7 }),
      ])
      setData(empRes.data)
      setTasks(taskRes.data.tasks)
      setAttendance(attRes.data.records)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  // Reset password for THIS specific employee only
  const handleResetPassword = async (passwordToSet) => {
    const pwd = passwordToSet || newPassword
    if (!pwd || pwd.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setSavingPassword(true)
    try {
      // Calls PATCH /api/employees/:id/reset-password for this specific employee
      await employeeApi.resetPassword(id, {
        password: pwd,
        mustChangePassword,
      })
      toast.success(`Password for ${data.employee.fullName} reset successfully! 🔑`)
      setLastResetInfo({
        password: pwd,
        employeeName: data.employee.fullName,
        time: new Date().toLocaleTimeString(),
      })
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Password copied to clipboard!')
  }

  if (loading) return <DashboardLayout title="Employee Details"><PageLoader /></DashboardLayout>
  if (error || !data) return <DashboardLayout title="Employee Details"><ErrorState message="Failed to load employee" onRetry={load} /></DashboardLayout>

  const { employee, stats } = data
  const lastLogin = employee.lastLoginInfo || {}
  const loginHistory = employee.loginHistory || []

  return (
    <DashboardLayout title="Employee Details">
      {/* Back button */}
      <Link to="/admin/employees" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-5">
        <ArrowLeft size={16} /> Back to Employees
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Profile Card + Location Info + Dedicated Password Reset Card */}
        <div className="lg:col-span-1 space-y-5">
          {/* Profile Card */}
          <div className="card">
            <div className="flex flex-col items-center text-center">
              <Avatar name={employee.fullName} size={72} />
              <h2 className="mt-3 text-lg font-bold text-slate-800">{employee.fullName}</h2>
              <p className="text-sm text-slate-400 font-mono font-medium">{employee.employeeId}</p>
              <div className="mt-2"><Badge status={employee.status} /></div>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-600 truncate">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone size={15} className="text-slate-400 shrink-0" />
                <span>{employee.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Briefcase size={15} className="text-slate-400 shrink-0" />
                <span>{employee.designation || 'Staff'} · {employee.department?.name || 'General'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Calendar size={15} className="text-slate-400 shrink-0" />
                <span>Joined {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>

          {/* ── LIVE LOGIN LOCATION CARD (ADMIN INSPECTION) ── */}
          <div className="card border-2 border-sky-100 bg-gradient-to-b from-sky-50/50 to-white shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Login Location Info</h3>
                  <p className="text-[11px] text-slate-500">Where this employee connects from</p>
                </div>
              </div>
              {lastLogin.latitude && lastLogin.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${lastLogin.latitude},${lastLogin.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-100/70 hover:bg-sky-200 px-2 py-1 rounded-md transition-colors"
                  title="View on Google Maps"
                >
                  <Navigation size={11} />
                  <span>Map</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-sky-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-slate-400 block text-[10px]">Location:</span>
                  <span className="font-semibold text-slate-800">
                    {lastLogin.city || lastLogin.country
                      ? `${lastLogin.city ? lastLogin.city + ', ' : ''}${lastLogin.country || ''}`
                      : employee.lastLogin
                      ? 'Network Connected'
                      : 'Never logged in yet'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Globe size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-slate-400 block text-[10px]">IP Address:</span>
                  <span className="font-mono text-slate-700 font-medium">
                    {lastLogin.ip || 'No IP recorded'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {lastLogin.device === 'Mobile' ? (
                  <Smartphone size={14} className="text-slate-400 shrink-0 mt-0.5" />
                ) : (
                  <Monitor size={14} className="text-slate-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="text-slate-400 block text-[10px]">Device & Browser:</span>
                  <span className="text-slate-700">
                    {lastLogin.browser || lastLogin.os
                      ? `${lastLogin.browser || 'Browser'} on ${lastLogin.os || 'OS'} (${lastLogin.device || 'Desktop'})`
                      : lastLogin.device || 'Standard Device'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-slate-400 block text-[10px]">Last Login Time:</span>
                  <span className="text-slate-700">
                    {employee.lastLogin
                      ? new Date(employee.lastLogin).toLocaleString()
                      : 'Never logged in'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── DEDICATED PASSWORD RESET FOR THIS USER ONLY ── */}
          <div className="card border-2 border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white shadow-sm">
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-indigo-100/70">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <KeyRound size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Reset User Password</h3>
                <p className="text-[11px] text-slate-500">
                  Resets password for <strong className="text-indigo-600">{employee.fullName}</strong> only
                </p>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="mb-3.5 px-3 py-2 rounded-lg bg-indigo-50/80 border border-indigo-100 text-[11px] text-indigo-700 flex items-center gap-1.5">
              <ShieldCheck size={14} className="shrink-0 text-indigo-500" />
              <span>Only this employee account is modified. No other users are touched.</span>
            </div>

            {/* Success Banner if just reset */}
            {lastResetInfo && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 animate-slide-up">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Password Reset Confirmed
                  </span>
                  <span className="text-[10px] text-emerald-600 font-normal">{lastResetInfo.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5 bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="font-mono text-xs font-bold text-slate-700">{lastResetInfo.password}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(lastResetInfo.password)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick 1-Click Reset to Welcome@123 */}
            <div className="mb-3">
              <button
                type="button"
                disabled={savingPassword}
                onClick={() => handleResetPassword('Welcome@123')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400" />
                    <span>1-Click Reset to Welcome@123</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative flex py-1 items-center mb-3">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase font-semibold">Or custom password</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Custom password form */}
            <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(newPassword); }} className="space-y-3">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input !py-2 !text-xs pr-16"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Helper buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewPassword(generatePassword())}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Sparkles size={12} />
                  <span>Generate Random</span>
                </button>
                {newPassword && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newPassword)}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={mustChangePassword}
                    onChange={(e) => setMustChangePassword(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Require change on next login</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingPassword || !newPassword}
                className="btn-primary w-full !py-2 !text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={13} />
                    <span>Update {employee.fullName.split(' ')[0]}'s Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Stats, Login Location History, Tasks & Attendance */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="card"><p className="text-xs text-slate-500">Total Working Hours</p><p className="mt-1 text-xl font-bold text-slate-800">{stats.totalWorkingHours}h</p></div>
            <div className="card"><p className="text-xs text-slate-500">Avg Daily Hours</p><p className="mt-1 text-xl font-bold text-slate-800">{stats.avgWorkingHours}h</p></div>
            <div className="card"><p className="text-xs text-slate-500">Present Days</p><p className="mt-1 text-xl font-bold text-slate-800">{stats.presentDays}</p></div>
            <div className="card"><p className="text-xs text-slate-500">Leave Days</p><p className="mt-1 text-xl font-bold text-slate-800">{stats.leaveDays}</p></div>
            <div className="card"><p className="text-xs text-slate-500">Completed Tasks</p><p className="mt-1 text-xl font-bold text-emerald-600">{stats.completedTasks}</p></div>
            <div className="card"><p className="text-xs text-slate-500">Pending Tasks</p><p className="mt-1 text-xl font-bold text-amber-600">{stats.pendingTasks}</p></div>
          </div>

          {/* ── RECENT LOGIN LOCATION HISTORY TABLE ── */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-sky-600" />
                <h3 className="text-sm font-semibold text-slate-700">Login Locations & History (Admin View)</h3>
              </div>
              <span className="text-xs text-slate-400">Latest login sessions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-left">
                    <th className="py-2.5 px-4 font-semibold">Login Time</th>
                    <th className="py-2.5 px-4 font-semibold">Location</th>
                    <th className="py-2.5 px-4 font-semibold">IP Address</th>
                    <th className="py-2.5 px-4 font-semibold">Device / Browser</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Map View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loginHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        {employee.lastLogin ? (
                          <div className="text-slate-600">
                            <span>Last logged in: {new Date(employee.lastLogin).toLocaleString()}</span>
                            <p className="text-[11px] text-slate-400 mt-1">Detailed GPS & IP coordinates are recorded on every subsequent login.</p>
                          </div>
                        ) : (
                          'No login history recorded yet for this employee.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    loginHistory.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">
                          {item.city || item.country ? (
                            <span className="inline-flex items-center gap-1 text-slate-800">
                              <MapPin size={12} className="text-sky-500 shrink-0" />
                              <span>{item.city ? `${item.city}, ` : ''}{item.country || ''}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Local / Office</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">
                          {item.ip || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {item.browser || item.os ? `${item.browser || 'Browser'} on ${item.os || 'OS'}` : item.device || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {item.latitude && item.longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-sky-600 hover:text-sky-800"
                            >
                              <span>View Map</span>
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <ListChecks size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">Recent Tasks assigned to {employee.fullName.split(' ')[0]}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {tasks.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No tasks assigned yet.</p>
              ) : tasks.map((t) => (
                <div key={t._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.title}</p>
                    <p className="text-xs text-slate-400">{t.taskDate}</p>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">Recent Attendance Records</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {attendance.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No attendance records yet.</p>
              ) : attendance.map((a) => (
                <div key={a._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{a.date}</p>
                    <p className="text-xs text-slate-400">
                      {(a.totalWorkingSeconds / 3600).toFixed(1)}h worked
                      {a.city ? ` · 📍 ${a.city}` : a.ip ? ` · 🌐 ${a.ip}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.latitude && a.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-sky-600 hover:underline flex items-center gap-0.5"
                        title="View punch-in location on Google Maps"
                      >
                        <MapPin size={12} />
                        <span>Map</span>
                      </a>
                    )}
                    <Badge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
