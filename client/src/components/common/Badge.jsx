import React from 'react'

const config = {
  present:     { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  working:     { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400'    },
  absent:      { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-400'     },
  on_leave:    { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400'   },
  completed:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  pending:     { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
  in_progress: { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400'    },
  active:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  inactive:    { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-400'     },
  approved:    { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  rejected:    { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-400'     },
  on_break:    { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400'   },
  offline:     { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-300'   },
  not_started: { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-300'   },
  stopped:     { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
  low:         { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
  medium:      { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400'    },
  high:        { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400'   },
  urgent:      { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-400'     },
  holiday:     { bg: 'bg-purple-50',   text: 'text-purple-700',  dot: 'bg-purple-400'  },
}

const labels = {
  on_leave:    'On Leave',
  in_progress: 'In Progress',
  not_started: 'Not Started',
  on_break:    'On Break',
}

// Live statuses that show an animated dot
const LIVE = new Set(['working', 'active', 'in_progress'])

export default function Badge({ status, text }) {
  const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
  const display = text || labels[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '')
  const isLive = LIVE.has(status)

  return (
    <span className={`badge ${c.bg} ${c.text}`}>
      {isLive ? (
        <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${c.dot}`} />
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${c.dot} shrink-0`} />
      )}
      {display}
    </span>
  )
}
