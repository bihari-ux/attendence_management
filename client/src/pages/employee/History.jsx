import React, { useEffect, useState, useMemo } from 'react'
import {
  History, Clock, CheckCircle2, CalendarOff, ListChecks,
  ChevronDown, RefreshCw, Activity, Calendar, TrendingUp,
  Flame, Award, AlertCircle, Coffee,
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Badge from '../../components/common/Badge'
import { auditApi } from '../../api/auditApi'

// ── Type configs ────────────────────────────────────
const typeConfig = {
  attendance: { icon: Clock,        color: 'text-indigo-600',  bg: 'bg-indigo-50',  ring: 'ring-indigo-200',  label: 'Attendance' },
  task:       { icon: ListChecks,   color: 'text-violet-600',  bg: 'bg-violet-50',  ring: 'ring-violet-200',  label: 'Task'       },
  leave:      { icon: CalendarOff,  color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   label: 'Leave'      },
}

const FILTERS = ['all', 'attendance', 'task', 'leave']

// ── Timeline Item ───────────────────────────────────
function TimelineItem({ item }) {
  const tc = typeConfig[item.type] || typeConfig.attendance
  const Icon = tc.icon

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  const formatTime = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex gap-4 group">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={`rounded-full p-2 ${tc.bg} ring-2 ${tc.ring} shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={14} className={tc.color} />
        </div>
        <div className="w-0.5 flex-1 bg-slate-100 mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5 min-w-0">
        <div className="card !p-4 hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Type label */}
              <span className={`text-[10px] font-bold uppercase tracking-widest ${tc.color}`}>{tc.label}</span>

              {/* Attendance */}
              {item.type === 'attendance' && (
                <div className="mt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-700">{formatDate(item.date)}</p>
                    {item.isLate && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <AlertCircle size={9} /> Late
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" />
                      {formatTime(item.startTime)} – {item.endTime ? formatTime(item.endTime) : 'ongoing'}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={11} className="text-emerald-400" />
                      {item.workingHours}h worked
                    </span>
                  </div>
                </div>
              )}

              {/* Task */}
              {item.type === 'task' && (
                <div className="mt-1">
                  <p className="text-sm font-bold text-slate-700">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold capitalize rounded-full px-2 py-0.5 ${
                      item.priority === 'urgent' ? 'bg-red-50 text-red-600'
                      : item.priority === 'high' ? 'bg-amber-50 text-amber-600'
                      : item.priority === 'medium' ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.priority} priority
                    </span>
                    {item.completedAt && (
                      <span className="text-[10px] text-slate-400">
                        Completed {formatDate(item.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Leave */}
              {item.type === 'leave' && (
                <div className="mt-1">
                  <p className="text-sm font-bold text-slate-700 capitalize">{item.leaveType?.replace('_', ' ')} Leave</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(item.startDate)} – {formatDate(item.endDate)}
                    <span className="ml-2 font-semibold text-slate-700">{item.days} day{item.days > 1 ? 's' : ''}</span>
                  </p>
                  {item.reason && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">"{item.reason}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="shrink-0">
              <Badge status={item.status || item.currentState} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stats Summary Bar ───────────────────────────────
function SummaryBar({ timeline }) {
  const attendance = timeline.filter((t) => t.type === 'attendance')
  const tasks      = timeline.filter((t) => t.type === 'task')
  const leaves     = timeline.filter((t) => t.type === 'leave')

  const presentDays  = attendance.filter((a) => ['present', 'working', 'completed'].includes(a.status)).length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const totalHours   = attendance.reduce((s, a) => s + parseFloat(a.workingHours || 0), 0)
  const lateCount    = attendance.filter((a) => a.isLate).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { icon: Calendar,    label: 'Days Present',      val: presentDays,          color: 'text-indigo-600 bg-indigo-50'  },
        { icon: Clock,       label: 'Total Hours',        val: `${totalHours.toFixed(1)}h`, color: 'text-emerald-600 bg-emerald-50'},
        { icon: CheckCircle2,label: 'Tasks Completed',   val: completedTasks,       color: 'text-violet-600 bg-violet-50'  },
        { icon: AlertCircle, label: 'Late Arrivals',     val: lateCount,            color: 'text-amber-600 bg-amber-50'    },
      ].map((s, i) => (
        <div key={i} className="card flex items-center gap-3 hover:shadow-soft transition-shadow">
          <div className={`rounded-xl p-2.5 ${s.color}`}>
            <s.icon size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-lg font-black text-slate-800">{s.val}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main History Page ───────────────────────────────
export default function EmployeeHistory() {
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await auditApi.myHistory({ limit: 100 })
      setTimeline(res.data.timeline)
    } catch (e) {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = timeline
    if (filter !== 'all') list = list.filter((t) => t.type === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((t) =>
        t.title?.toLowerCase().includes(q) ||
        t.leaveType?.toLowerCase().includes(q) ||
        t.date?.includes(q) ||
        t.status?.includes(q)
      )
    }
    return list
  }, [timeline, filter, search])

  // Group by month
  const grouped = useMemo(() => {
    const groups = {}
    for (const item of filtered) {
      const key = item.date
        ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown'
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }, [filtered])

  return (
    <DashboardLayout title="My History">

      {/* Summary */}
      {!loading && timeline.length > 0 && <SummaryBar timeline={timeline} />}

      {/* Filters */}
      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? '📋 All' : f === 'attendance' ? '🕐 Attendance' : f === 'task' ? '✅ Tasks' : '🏖️ Leaves'}
                {f !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({timeline.filter((t) => t.type === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="btn-secondary flex items-center gap-1.5 text-xs shrink-0"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 card !p-4 space-y-2">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="h-3 w-36 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-3">
          <div className="rounded-full bg-slate-100 p-5"><History size={32} className="text-slate-300" /></div>
          <p className="text-base font-semibold text-slate-500">No history found</p>
          <p className="text-sm text-slate-400">
            {filter !== 'all' ? 'Try a different filter.' : 'Your activity will appear here once you start working.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-1.5">
                  <Calendar size={13} className="text-indigo-200" />
                  <span className="text-xs font-bold text-white">{month}</span>
                </div>
                <span className="text-xs text-slate-400">{items.length} record{items.length > 1 ? 's' : ''}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Items */}
              <div>
                {items.map((item) => (
                  <TimelineItem key={`${item.type}-${item._id}`} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
