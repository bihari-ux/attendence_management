import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorConfig = {
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  ring: 'ring-indigo-100',   bar: 'bg-indigo-500', shadow: 'stat-card-indigo'  },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100',  bar: 'bg-emerald-500',shadow: 'stat-card-emerald' },
  red:     { bg: 'bg-red-50',     icon: 'text-red-600',     ring: 'ring-red-100',      bar: 'bg-red-500',    shadow: 'stat-card-red'     },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   ring: 'ring-amber-100',    bar: 'bg-amber-500',  shadow: 'stat-card-amber'   },
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    ring: 'ring-blue-100',     bar: 'bg-blue-500',   shadow: 'stat-card-blue'    },
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  ring: 'ring-purple-100',   bar: 'bg-purple-500', shadow: 'stat-card-purple'  },
  teal:    { bg: 'bg-teal-50',    icon: 'text-teal-600',    ring: 'ring-teal-100',     bar: 'bg-teal-500',   shadow: 'stat-card-teal'    },
  slate:   { bg: 'bg-slate-100',  icon: 'text-slate-600',   ring: 'ring-slate-200',    bar: 'bg-slate-400',  shadow: 'stat-card-slate'   },
  sky:     { bg: 'bg-sky-50',     icon: 'text-sky-600',     ring: 'ring-sky-100',      bar: 'bg-sky-500',    shadow: 'stat-card-blue'    },
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color = 'indigo',
  subtitle,
  progress,
}) {
  const c = colorConfig[color] || colorConfig.indigo

  return (
    <div className={`card group hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5 ${c.shadow} animate-slide-up`}>
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white animate-count-up tabular-nums">
            {value ?? '—'}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 truncate">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0
                ? <TrendingUp size={12} />
                : <TrendingDown size={12} />
              }
              <span>{Math.abs(trend)}% {trendLabel || 'vs yesterday'}</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={`rounded-xl p-2.5 ${c.bg} ring-1 ${c.ring} group-hover:scale-110 group-hover:shadow-sm transition-all duration-200 shrink-0`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>

      {/* Progress bar (optional) */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400 font-medium">Progress</span>
            <span className="text-[10px] font-bold text-slate-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${c.bar} transition-all duration-700`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
