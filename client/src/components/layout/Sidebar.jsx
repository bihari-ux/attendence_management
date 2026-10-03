import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, CalendarCheck, ListChecks, CalendarDays,
  FileBarChart, Settings, LogOut, ChevronLeft, ChevronRight,
  Timer, User, ClipboardList, Shield, Zap, History, Home
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'

export const adminLinks = [
  { to: '/admin/dashboard',  label: 'Dashboard',       icon: LayoutDashboard, color: 'text-indigo-500' },
  { to: '/admin/employees',  label: 'Employees',        icon: Users,           color: 'text-sky-500'    },
  { to: '/admin/attendance', label: 'Attendance',       icon: CalendarCheck,   color: 'text-emerald-500'},
  { to: '/admin/tasks',      label: 'Tasks',            icon: ListChecks,      color: 'text-violet-500' },
  { to: '/admin/holidays',   label: 'Holidays & Leaves',icon: CalendarDays,    color: 'text-amber-500'  },
  { to: '/admin/reports',    label: 'Reports',          icon: FileBarChart,    color: 'text-rose-500'   },
  { to: '/admin/audit-logs', label: 'Activity Log',     icon: History,         color: 'text-teal-500'   },
  { to: '/admin/settings',   label: 'Settings',         icon: Settings,        color: 'text-slate-500'  },
]

export const employeeLinks = [
  { to: '/employee/dashboard',  label: 'Dashboard',    icon: LayoutDashboard, color: 'text-indigo-500'  },
  { to: '/employee/timer',      label: 'My Timer',     icon: Timer,           color: 'text-emerald-500' },
  { to: '/employee/tasks',      label: 'My Tasks',     icon: ListChecks,      color: 'text-violet-500'  },
  { to: '/employee/attendance', label: 'My Attendance',icon: CalendarCheck,   color: 'text-sky-500'     },
  { to: '/employee/history',    label: 'My History',   icon: History,         color: 'text-teal-500'    },
  { to: '/employee/holidays',   label: 'My Holidays',  icon: CalendarDays,    color: 'text-amber-500'   },
  { to: '/employee/profile',    label: 'My Profile',   icon: User,            color: 'text-rose-500'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const links = user?.role === 'admin' ? adminLinks : employeeLinks
  const isAdmin = user?.role === 'admin'

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white text-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}
        >
          B
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-white leading-tight truncate">Bewda</p>
            <p className="text-[10px] text-indigo-300/70 font-medium tracking-widest uppercase">
              {isAdmin ? 'Admin Panel' : 'Employee'}
            </p>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            {isAdmin ? <Shield size={13} className="text-indigo-400 shrink-0" /> : <Zap size={13} className="text-indigo-400 shrink-0" />}
            <span className="text-xs font-semibold text-indigo-300 truncate capitalize">{user?.role} Access</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <NavLink
          to="/"
          title={collapsed ? 'Back to Website' : undefined}
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 mb-6 text-sm font-extrabold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${collapsed ? 'justify-center' : ''}`}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(45, 212, 191, 0.3)',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          <Home size={18} className="shrink-0 text-white drop-shadow-sm" />
          {!collapsed && <span className="tracking-wide uppercase text-[12px]">Back to Website</span>}
        </NavLink>

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'rgba(99,102,241,0.2)', boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.3)' }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  size={18}
                  className={`shrink-0 transition-colors ${isActive ? link.color : 'text-slate-500 group-hover:text-slate-300'}`}
                />
                {!collapsed && <span className="truncate">{link.label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + actions */}
      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 mb-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="h-8 w-8 rounded-full object-cover shrink-0" />
            ) : (
              <Avatar name={user?.fullName} size={32} />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white leading-tight">{user?.fullName}</p>
              <p className="truncate text-[10px] text-slate-400">{user?.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight size={16} className="shrink-0" /> : <ChevronLeft size={16} className="shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
