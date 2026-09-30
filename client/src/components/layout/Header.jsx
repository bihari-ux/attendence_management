import React, { useState, useEffect, useRef } from 'react'
import { Bell, Search, Sun, Moon, X, CheckCheck, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationApi } from '../../api/notificationApi'
import Avatar from '../common/Avatar'
import { Link } from 'react-router-dom'

export default function Header({ title }) {
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const loadNotifications = async () => {
    try {
      const res = await notificationApi.getAll()
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unreadCount)
    } catch (e) {}
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle('dark', !d)
      return !d
    })
  }

  const markRead = async (id) => {
    await notificationApi.markRead(id)
    loadNotifications()
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 md:px-6 py-3.5 dark:border-slate-800/60"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.03)',
      }}
    >
      {/* Left: Title */}
      <div className="min-w-0">
        <h1 className="text-base md:text-lg font-bold text-slate-800 truncate leading-tight">{title}</h1>
        <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">{today}</p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="input !pl-8 !py-2 w-48 !rounded-xl text-xs !border-slate-200 bg-slate-50 focus:bg-white transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50 animate-fade-in"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 20px 60px -10px rgba(15,23,42,0.2)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-slate-500" />
                  <p className="text-sm font-semibold text-slate-700">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => { await notificationApi.markAllRead(); loadNotifications() }}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <CheckCheck size={12} />
                    All read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <div className="rounded-full bg-slate-100 p-3"><Bell size={20} className="text-slate-300" /></div>
                    <p className="text-sm text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <button
                      key={n._id}
                      onClick={() => markRead(n._id)}
                      className={`block w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors group ${
                        !n.isRead ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!n.isRead && (
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        )}
                        <div className={!n.isRead ? '' : 'ml-4'}>
                          <p className="text-sm font-semibold text-slate-700 leading-snug">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                <Link
                  to={user?.role === 'admin' ? '/admin/notifications' : '/employee/notifications'}
                  onClick={() => setNotifOpen(false)}
                  className="block text-center text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar / Profile */}
        <Link
          to={user?.role === 'admin' ? '/admin/profile' : '/employee/profile'}
          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Avatar name={user?.fullName} size={32} />
          <div className="hidden lg:block text-left min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate max-w-[100px]">{user?.fullName?.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
