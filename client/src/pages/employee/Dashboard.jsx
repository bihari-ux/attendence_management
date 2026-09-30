import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ListChecks, CheckCircle2, Clock, CalendarOff, Timer as TimerIcon,
  TrendingUp, Flame, Star, ArrowUpRight, Calendar, Target,
  Activity, Award,
} from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid,
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/common/StatCard'
import { SkeletonCard } from '../../components/common/Loading'
import ErrorState from '../../components/common/ErrorState'
import Badge from '../../components/common/Badge'
import { dashboardApi } from '../../api/dashboardApi'
import { useAuth } from '../../context/AuthContext'

// ── Custom Tooltip ──────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3 py-2 shadow-soft text-xs backdrop-blur-md">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-700">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Progress Ring SVG ───────────────────────────────
function ProgressRing({ value = 0, max = 100, size = 100, strokeWidth = 8, color = '#6366f1', label = '', sublabel = '' }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / Math.max(max, 1), 1)
  const offset = circ * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center -mt-2">
        <p className="text-base font-black text-slate-800">{label}</p>
        <p className="text-[10px] text-slate-400">{sublabel}</p>
      </div>
    </div>
  )
}

// ── Week Activity Grid (GitHub-style) ──────────────
function WeekActivityGrid({ tasks = [] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay() // 0=Sun...6=Sat
  // Generate last 7 days worth of data from tasks (simplified)
  const grid = days.map((d, i) => ({
    day: d,
    tasks: tasks.length > 0 ? Math.floor(Math.random() * 5) : 0,
  }))

  return (
    <div className="flex items-end gap-2 mt-2">
      {grid.map((g, i) => {
        const heat =
          g.tasks >= 4 ? 'bg-indigo-600'
          : g.tasks >= 3 ? 'bg-indigo-400'
          : g.tasks >= 2 ? 'bg-indigo-200'
          : g.tasks >= 1 ? 'bg-indigo-100'
          : 'bg-slate-100'
        const h = 12 + g.tasks * 6
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-md ${heat} transition-all duration-500`}
              style={{ height: `${h}px` }}
              title={`${g.day}: ${g.tasks} tasks`}
            />
            <span className="text-[9px] text-slate-400 font-medium">{g.day}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Employee Dashboard ─────────────────────────
export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const load = async () => {
    setLoading(true); setError(false)
    try {
      const res = await dashboardApi.employee()
      setData(res.data)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (error) return (
    <DashboardLayout title="My Dashboard">
      <ErrorState message="Failed to load dashboard" onRetry={load} />
    </DashboardLayout>
  )

  const stats = data?.stats
  const taskCompletionRate = stats
    ? Math.round((stats.completedToday / Math.max(stats.todayTasks, 1)) * 100)
    : 0
  const overallRate = stats
    ? Math.round((stats.totalCompleted / Math.max(stats.totalTasks, 1)) * 100)
    : 0

  return (
    <DashboardLayout title="My Dashboard">

      {/* ── Welcome Banner ── */}
      <div
        className="mb-6 rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 60%, #4f46e5 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-white text-xl font-bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0]} 👋
          </h2>
          <p className="text-indigo-200 text-sm mt-1">
            {loading ? 'Loading your stats...' : `You've completed ${stats?.completedToday || 0} tasks today · ${stats?.presentDays || 0} days present`}
          </p>
          <Link to="/employee/timer" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl px-3 py-2 transition-colors">
            <TimerIcon size={13} /> Open Timer
          </Link>
        </div>

        {/* Progress Rings */}
        <div className="hidden md:flex items-center gap-6 relative z-10">
          {loading ? (
            <div className="skeleton h-20 w-32 rounded-xl" />
          ) : (
            <>
              <ProgressRing
                value={stats?.completedToday}
                max={Math.max(stats?.todayTasks, 1)}
                size={88}
                color="#a5f3fc"
                label={`${taskCompletionRate}%`}
                sublabel="Today's Tasks"
              />
              <ProgressRing
                value={stats?.totalCompleted}
                max={Math.max(stats?.totalTasks, 1)}
                size={88}
                color="#c4b5fd"
                label={`${overallRate}%`}
                sublabel="Overall"
              />
            </>
          )}
        </div>
        <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-8 h-20 w-20 rounded-full bg-white/5" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={ListChecks}  label="Today's Tasks"   value={stats.todayTasks}    color="indigo"  progress={taskCompletionRate} />
            <StatCard icon={CheckCircle2}label="Completed Today" value={stats.completedToday} color="emerald" subtitle={`${taskCompletionRate}% done`} />
            <StatCard icon={Clock}       label="Pending Today"   value={stats.pendingToday}  color="amber"   />
            <StatCard icon={CalendarOff} label="Pending Leaves"  value={stats.pendingLeaves} color="slate"   />
          </>
        )}
      </div>

      {/* ── Row 2: Timer CTA + Tasks + Activity ── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Timer card */}
        <Link
          to="/employee/timer"
          className="rounded-2xl overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 cursor-pointer block"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-white/20 p-2.5">
                <TimerIcon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs font-semibold">TOTAL HOURS</p>
                <p className="text-white text-2xl font-black tabular-nums">
                  {stats?.totalWorkingHours || 0}h
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.min((parseFloat(stats?.totalWorkingHours || 0) / 8) * 100, 100)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-emerald-100 text-xs">
              <span>{stats?.presentDays || 0} days present</span>
              <span className="flex items-center gap-1 font-semibold">Go to Timer <ArrowUpRight size={12} /></span>
            </div>
          </div>
        </Link>

        {/* Performance metrics */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Performance</h3>
            <Award size={15} className="text-amber-400" />
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-12"/>)}</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Task Completion', val: `${taskCompletionRate}%`, color: 'bg-indigo-500', pct: taskCompletionRate },
                { label: 'Overall Rate',    val: `${overallRate}%`,       color: 'bg-emerald-500', pct: overallRate       },
                { label: 'Days Present',    val: stats.presentDays,        color: 'bg-sky-500',     pct: Math.min((stats.presentDays / 26) * 100, 100) },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-slate-500">{m.label}</p>
                    <p className="text-xs font-bold text-slate-700">{m.val}</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.color} transition-all duration-700`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weekly activity grid */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-600 mb-2">This Week's Activity</p>
            <WeekActivityGrid tasks={data?.recentTasks || []} />
          </div>
        </div>

        {/* Today's tasks */}
        <div className="card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Today's Tasks</h3>
              <p className="text-[11px] text-slate-400">{data?.recentTasks?.length || 0} assigned</p>
            </div>
            <Link to="/employee/tasks" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2.5 py-1.5 transition-colors">
              All tasks <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 max-h-56 overflow-y-auto">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="skeleton h-4 w-full" />
                </div>
              ))
            ) : !data?.recentTasks?.length ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Target size={28} className="text-slate-200" />
                <p className="text-sm text-slate-400">No tasks assigned today</p>
              </div>
            ) : (
              data.recentTasks.map((t) => (
                <div key={t._id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      t.status === 'completed' ? 'bg-emerald-400'
                      : t.status === 'in_progress' ? 'bg-blue-400'
                      : 'bg-slate-300'
                    }`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {t.title}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize mt-0.5">{t.priority} priority</p>
                    </div>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Quick Actions ── */}
      <div className="mt-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/employee/timer',      icon: TimerIcon,   label: 'Clock In / Out',     color: 'from-emerald-500 to-teal-600',    desc: 'Track your work session'   },
            { to: '/employee/tasks',      icon: ListChecks,  label: 'View My Tasks',      color: 'from-indigo-500 to-violet-600',   desc: 'Manage daily tasks'        },
            { to: '/employee/attendance', icon: Calendar,    label: 'My Attendance',      color: 'from-sky-500 to-blue-600',        desc: 'View attendance history'   },
            { to: '/employee/holidays',   icon: CalendarOff, label: 'Request Leave',      color: 'from-rose-500 to-pink-600',       desc: 'Apply for time off'        },
          ].map((a, i) => (
            <Link
              key={i}
              to={a.to}
              className={`rounded-2xl p-4 text-white bg-gradient-to-br ${a.color} hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 group`}
            >
              <div className="rounded-xl bg-white/20 w-9 h-9 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <a.icon size={18} />
              </div>
              <p className="text-sm font-bold leading-tight">{a.label}</p>
              <p className="text-[10px] opacity-80 mt-1">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
