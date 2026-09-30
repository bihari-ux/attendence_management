import React, { useEffect, useState, useMemo } from 'react'
import {
  ClipboardList, Search, Filter, User, UserCheck, UserX, Settings,
  Key, Trash2, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, Download, Activity,
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Avatar from '../../components/common/Avatar'
import { auditApi } from '../../api/auditApi'

// ── Action config ───────────────────────────────────
const actionConfig = {
  employee_created:     { label: 'Employee Created',     icon: UserCheck, color: 'bg-emerald-100 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-400' },
  employee_updated:     { label: 'Employee Updated',     icon: User,      color: 'bg-blue-100 text-blue-700 ring-blue-200',           dot: 'bg-blue-400'    },
  employee_deleted:     { label: 'Employee Deleted',     icon: Trash2,    color: 'bg-red-100 text-red-700 ring-red-200',              dot: 'bg-red-400'     },
  employee_activated:   { label: 'Employee Activated',   icon: UserCheck, color: 'bg-emerald-100 text-emerald-700 ring-emerald-200',  dot: 'bg-emerald-400' },
  employee_deactivated: { label: 'Employee Deactivated', icon: UserX,     color: 'bg-amber-100 text-amber-700 ring-amber-200',        dot: 'bg-amber-400'   },
  password_reset:       { label: 'Password Reset',       icon: Key,       color: 'bg-violet-100 text-violet-700 ring-violet-200',     dot: 'bg-violet-400'  },
  settings_updated:     { label: 'Settings Updated',     icon: Settings,  color: 'bg-slate-100 text-slate-600 ring-slate-200',        dot: 'bg-slate-400'   },
}

const ALL_ACTIONS = [
  'all', 'employee_created', 'employee_updated', 'employee_deleted',
  'employee_activated', 'employee_deactivated', 'password_reset', 'settings_updated',
]

function ActionBadge({ action }) {
  const c = actionConfig[action] || { label: action, icon: Activity, color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-300' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${c.color}`}>
      <c.icon size={11} />
      {c.label}
    </span>
  )
}

function EmptyLogs() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="rounded-full bg-slate-100 p-5"><ClipboardList size={32} className="text-slate-300" /></div>
      <p className="text-base font-semibold text-slate-500">No audit logs found</p>
      <p className="text-sm text-slate-400">Actions you take will appear here.</p>
    </div>
  )
}

export default function AuditLogs() {
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [total, setTotal]       = useState(0)
  const [search, setSearch]     = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const LIMIT = 20

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: LIMIT }
      if (actionFilter !== 'all') params.action = actionFilter
      const res = await auditApi.getAll(params)
      setLogs(res.data.logs)
      setTotal(res.data.total)
      setPages(res.data.pages)
      setPage(p)
    } catch (e) {} finally { setLoading(false) }
  }

  useEffect(() => { load(1) }, [actionFilter])

  const filtered = useMemo(() => {
    if (!search.trim()) return logs
    const q = search.toLowerCase()
    return logs.filter((l) =>
      l.admin?.fullName?.toLowerCase().includes(q) ||
      l.targetLabel?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    )
  }, [logs, search])

  const formatTime = (dt) => {
    const d = new Date(dt)
    return { date: d.toLocaleDateString('en-IN'), time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
  }

  return (
    <DashboardLayout title="Activity History">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Admin Audit Log</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} total actions recorded · Complete admin activity trail
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(page)}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input !pl-9 !py-2 text-sm"
              placeholder="Search by admin, employee, action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Action filter */}
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="input !pl-9 !py-2 text-sm pr-8 appearance-none"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
            >
              {ALL_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a === 'all' ? 'All Actions' : (actionConfig[a]?.label || a)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {ALL_ACTIONS.map((a) => (
            <button
              key={a}
              onClick={() => { setActionFilter(a); setPage(1) }}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                actionFilter === a
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {a === 'all' ? 'All' : (actionConfig[a]?.label || a)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-48 bg-slate-100 rounded" />
                  <div className="h-3 w-64 bg-slate-100 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
                <div className="h-6 w-28 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyLogs />
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_1fr] gap-4 px-5 py-3 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #f8fafc, #f1f5f9)' }}>
              {['Action', 'Target / Details', 'Performed By', 'Date & Time', ''].map((h, i) => (
                <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</p>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {filtered.map((log, idx) => {
                const c   = actionConfig[log.action] || { dot: 'bg-slate-300' }
                const { date, time } = formatTime(log.createdAt)
                return (
                  <div
                    key={log._id}
                    className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_1fr] gap-4 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Action badge */}
                    <div><ActionBadge action={log.action} /></div>

                    {/* Target */}
                    <div>
                      {log.targetLabel && (
                        <p className="text-sm font-semibold text-slate-700">{log.targetLabel}</p>
                      )}
                      {log.details && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{log.details}</p>
                      )}
                      {!log.targetLabel && !log.details && (
                        <p className="text-xs text-slate-400">—</p>
                      )}
                    </div>

                    {/* Admin */}
                    <div className="flex items-center gap-2">
                      <Avatar name={log.admin?.fullName || 'System'} size={28} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700 leading-tight">{log.admin?.fullName || 'System'}</p>
                        <p className="text-[10px] text-slate-400">{log.admin?.employeeId || ''}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{date}</p>
                      <p className="text-[11px] text-slate-400">{time}</p>
                    </div>

                    {/* Index */}
                    <div>
                      <span className="text-[10px] text-slate-300 font-mono">#{(page - 1) * LIMIT + idx + 1}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {pages > 1 && !loading && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {page} of {pages} · {total} total logs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => load(page - 1)}
                disabled={page === 1}
                className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i
                  if (p > pages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => load(p)}
                      className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                        p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => load(page + 1)}
                disabled={page === pages}
                className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
