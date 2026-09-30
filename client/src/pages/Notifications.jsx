import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/layout/DashboardLayout'
import { PageLoader } from '../components/common/Loading'
import EmptyState from '../components/common/EmptyState'
import { notificationApi } from '../api/notificationApi'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await notificationApi.getAll()
      setNotifications(res.data.notifications)
    } catch (e) { toast.error('Failed to load notifications') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await notificationApi.markRead(id)
    load()
  }

  return (
    <DashboardLayout title="Notifications">
      <div className="flex justify-end mb-4">
        <button
          onClick={async () => { await notificationApi.markAllRead(); load(); toast.success('All notifications marked as read') }}
          className="btn-secondary"
        >
          Mark all as read
        </button>
      </div>

      {loading ? <PageLoader /> : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="card !p-0 divide-y divide-slate-50 overflow-hidden">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => markRead(n._id)}
              className={`w-full text-left px-5 py-4 hover:bg-slate-50 flex items-start gap-3 ${!n.isRead ? 'bg-primary-50/40' : ''}`}
            >
              <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? 'bg-primary-600' : 'bg-transparent'}`} />
              <div>
                <p className="text-sm font-medium text-slate-700">{n.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
