import React, { useEffect, useState, useMemo } from 'react'
import {
  Users, UserCheck, UserX, CalendarOff, Activity, ListChecks,
  CheckCircle2, Clock, TrendingUp, Coffee, Award, ArrowUpRight,
  BarChart2, Calendar, Zap, MapPin, ExternalLink,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  AreaChart, Area, LineChart, Line,
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/common/StatCard'
import { SkeletonCard } from '../../components/common/Loading'
import ErrorState from '../../components/common/ErrorState'
import { dashboardApi } from '../../api/dashboardApi'
import { attendanceApi } from '../../api/attendanceApi'
import { Link } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'

// ── Custom Tooltip ──────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3 py-2.5 shadow-soft text-xs backdrop-blur-md">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5 mt-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-700">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Day-by-Day Hierarchy Chart (main feature) ──────
function DailyStatusHierarchy({ data = [], loading }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const formatted = useMemo(() => {
    if (!data.length) return []
    return data.map((d, i) => ({
      day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.date?.slice(5) || '',
      present: d.present || 0,
      absent: d.absent || 0,
      onLeave: d.onLeave || 0,
      attendance: d.present + d.absent + d.onLeave > 0
        ? Math.round((d.present / Math.max(d.present + d.absent + d.onLeave, 1)) * 100)
        : 0,
    }))
  }, [data])

  if (loading) return <div className="skeleton h-64" />

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={formatted} barSize={14} barGap={3}>
          <defs>
            <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="leaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)', radius: 8 }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
          />
          <Bar dataKey="present" name="Present" fill="url(#presentGrad)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="absent"  name="Absent"  fill="url(#absentGrad)"  radius={[6, 6, 0, 0]} />
          <Bar dataKey="onLeave" name="On Leave" fill="url(#leaveGrad)"  radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Day-by-day status tiles */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {formatted.map((d, i) => {
          const pct = d.attendance
          const heat =
            pct >= 80 ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-200'
            : pct >= 50 ? 'bg-indigo-200 text-indigo-800'
            : pct > 0  ? 'bg-indigo-100 text-indigo-700'
            : 'bg-slate-100 text-slate-400'
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-full flex flex-col items-center justify-center rounded-lg py-1.5 text-center transition-transform hover:scale-105 cursor-default ${heat}`}>
                <span className="text-[10px] font-bold">{d.day}</span>
                <span className="text-[11px] font-extrabold mt-0.5">{pct}%</span>
              </div>
              <span className="text-[9px] text-slate-400">{d.date}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Attendance Rate Line ────────────────────────────
function AttendanceTrendLine({ data = [], loading }) {
  const formatted = useMemo(() => {
    return data.map((d) => ({
      day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      rate: d.present + d.absent + d.onLeave > 0
        ? Math.round((d.present / Math.max(d.present + d.absent + d.onLeave, 1)) * 100)
        : 0,
    }))
  }, [data])

  if (loading) return <div className="skeleton h-40" />

  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="rate"
          name="Attendance Rate"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#rateGrad)"
          dot={{ fill: '#6366f1', r: 3 }}
          activeDot={{ r: 5, fill: '#4f46e5' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Donut chart ─────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#f43f5e', '#f59e0b']
const PIE_LABELS = ['Present', 'Absent', 'On Leave']

function AttendanceDonut({ stats, loading }) {
  const pieData = stats
    ? [
        { name: 'Present', value: stats.presentToday },
        { name: 'Absent',  value: stats.absentToday  },
        { name: 'On Leave',value: stats.onLeave       },
      ]
    : []

  const total = pieData.reduce((s, d) => s + d.value, 0)

  if (loading) return <div className="skeleton h-52" />

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={80}
            paddingAngle={4}
            startAngle={90}
            endAngle={-270}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-slate-800">{total}</span>
        <span className="text-[10px] text-slate-400 font-medium">Total</span>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        {pieData.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
            <span className="text-[10px] text-slate-500 font-medium">{d.name}: <strong className="text-slate-700">{d.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Admin Dashboard ────────────────────────────
export default function AdminDashboard() {
  const [data, setData]     = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  const load = async () => {
    setLoading(true); setError(false)
    try {
      const [dashRes, actRes] = await Promise.all([
        dashboardApi.admin(),
        attendanceApi.allToday(),
      ])
      setData(dashRes.data)
      setActivity(actRes.data.records)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (error) return (
    <DashboardLayout title="Dashboard">
      <ErrorState message="Failed to load dashboard data" onRetry={load} />
    </DashboardLayout>
  )

  const stats = data?.stats
  const attendancePct = stats
    ? Math.round((stats.presentToday / Math.max(stats.totalEmployees, 1)) * 100)
    : 0
  const taskCompletionPct = stats
    ? Math.round((stats.tasksCompleted / Math.max(stats.tasksAssigned, 1)) * 100)
    : 0

  return (
    <DashboardLayout title="Admin Dashboard">

      {/* ── Welcome Banner ── */}
      <div
        className="mb-6 rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #4338ca 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-white text-xl font-bold">Welcome back, Admin 👋</h2>
          <p className="text-indigo-200 text-sm mt-1">
            {loading ? 'Loading...' : `${stats?.presentToday || 0} employees are present today · ${attendancePct}% attendance rate`}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="skeleton h-14 w-24 rounded-xl" />
          ) : (
            <div className="text-right">
              <p className="text-indigo-200 text-xs">Attendance Rate</p>
              <p className="text-white text-4xl font-black">{attendancePct}%</p>
            </div>
          )}
        </div>
        {/* decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 top-4 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={Users}       label="Total Employees"   value={stats.totalEmployees}    color="indigo"  progress={100} />
            <StatCard icon={UserCheck}   label="Present Today"     value={stats.presentToday}      color="emerald" progress={attendancePct} />
            <StatCard icon={UserX}       label="Absent Today"      value={stats.absentToday}       color="red"     />
            <StatCard icon={CalendarOff} label="On Leave"          value={stats.onLeave}           color="amber"   />
            <StatCard icon={Activity}    label="Currently Working" value={stats.currentlyWorking}  color="blue"    subtitle="Active sessions" />
            <StatCard icon={ListChecks}  label="Tasks Assigned"    value={stats.tasksAssigned}     color="purple"  />
            <StatCard icon={CheckCircle2}label="Tasks Completed"   value={stats.tasksCompleted}    color="teal"    progress={taskCompletionPct} />
            <StatCard icon={Clock}       label="Pending Tasks"     value={stats.pendingTasks}      color="slate"   />
          </>
        )}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Donut */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Today's Overview</h3>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2 py-1">Live</span>
          </div>
          <AttendanceDonut stats={stats} loading={loading} />
        </div>

        {/* Day-by-day hierarchy */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Weekly Attendance Hierarchy</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Day-by-day working status breakdown</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1.5">
              <BarChart2 size={12} />
              7-day view
            </div>
          </div>
          <DailyStatusHierarchy data={data?.weeklyAttendance || []} loading={loading} />
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Attendance Rate trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">Attendance Rate Trend</h3>
            <TrendingUp size={15} className="text-indigo-400" />
          </div>
          <AttendanceTrendLine data={data?.weeklyAttendance || []} loading={loading} />
          {!loading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-1 w-4 rounded bg-indigo-500 inline-block" />
              Attendance % over the week
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Quick Insights</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({length: 4}).map((_,i) => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Attendance Rate', val: `${attendancePct}%`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Task Completion', val: `${taskCompletionPct}%`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'On Break Now', val: stats.onBreak ?? 0, icon: Coffee, color: 'text-amber-600 bg-amber-50' },
                { label: 'Pending Leaves', val: stats.pendingLeaves ?? 0, icon: CalendarOff, color: 'text-rose-600 bg-rose-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`rounded-lg p-2 ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{item.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top employees or performance */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Today's Highlights</h3>
            <Award size={15} className="text-amber-400" />
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-10 w-full"/>)}</div>
          ) : activity.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No activity yet today.</p>
          ) : (
            <div className="space-y-2">
              {activity.slice(0, 5).map((a, i) => (
                <div key={a._id} className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400 w-4">#{i+1}</span>
                  <Avatar name={a.employee?.fullName} size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{a.employee?.fullName}</p>
                    <p className="text-[10px] text-slate-400">{(a.totalWorkingSeconds / 3600).toFixed(1)}h worked</p>
                  </div>
                  <Badge status={a.currentState} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Today's Activity Table ── */}
      <div className="mt-5 card !p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-700">Today's Employee Activity</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{activity.length} records found</p>
          </div>
          <Link
            to="/admin/attendance"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
          >
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Employee</th>
                <th className="table-th">Department</th>
                <th className="table-th">Work / Login Location</th>
                <th className="table-th">Start Time</th>
                <th className="table-th">Working Hours</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="table-td">
                      <div className="skeleton h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : activity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-td text-center text-slate-400 py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar size={28} className="text-slate-200" />
                      <span>No attendance records for today yet.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                activity.slice(0, 10).map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.employee?.fullName} size={32} />
                        <div>
                          <p className="font-semibold text-slate-700 text-sm">{a.employee?.fullName}</p>
                          <p className="text-[11px] text-slate-400">{a.employee?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-1">
                        {a.employee?.department?.name || '—'}
                      </span>
                    </td>
                    <td className="table-td">
                      {(a.city || a.locationAddress || a.employee?.lastLoginInfo?.city) ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md">
                            <MapPin size={11} className="text-sky-600 shrink-0" />
                            <span>{a.city || a.locationAddress || a.employee?.lastLoginInfo?.city}</span>
                          </span>
                          {(a.latitude || a.employee?.lastLoginInfo?.latitude) && (
                            <a
                              href={`https://www.google.com/maps?q=${a.latitude || a.employee?.lastLoginInfo?.latitude},${a.longitude || a.employee?.lastLoginInfo?.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 px-1.5 py-0.5 rounded transition-colors"
                              title="Open on Google Maps"
                            >
                              <span>Map</span>
                              <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="table-td text-slate-600">
                      {a.startTime
                        ? new Date(a.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="table-td font-semibold text-slate-700">
                      {(a.totalWorkingSeconds / 3600).toFixed(1)}h
                    </td>
                    <td className="table-td">
                      <Badge status={a.currentState} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
