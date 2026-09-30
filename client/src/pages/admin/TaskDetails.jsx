import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, User, Calendar, Flag } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageLoader } from '../../components/common/Loading'
import ErrorState from '../../components/common/ErrorState'
import Badge from '../../components/common/Badge'
import { taskApi } from '../../api/taskApi'

export default function TaskDetails() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [timeLogs, setTimeLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = async () => {
    setLoading(true); setError(false)
    try {
      const res = await taskApi.getOne(id)
      setTask(res.data.task)
      setTimeLogs(res.data.timeLogs)
    } catch (e) { setError(true) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  if (loading) return <DashboardLayout title="Task Details"><PageLoader /></DashboardLayout>
  if (error || !task) return <DashboardLayout title="Task Details"><ErrorState message="Failed to load task" onRetry={load} /></DashboardLayout>

  return (
    <DashboardLayout title="Task Details">
      <Link to="/admin/tasks" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-5">
        <ArrowLeft size={16} /> Back to Tasks
      </Link>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{task.description || 'No description provided.'}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Badge status={task.priority} />
            <Badge status={task.status} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600"><User size={15} className="text-slate-400" /> {task.assignedTo?.fullName}</div>
          <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar size={15} className="text-slate-400" /> {task.taskDate}</div>
          <div className="flex items-center gap-2 text-sm text-slate-600"><Clock size={15} className="text-slate-400" /> Est: {task.estimatedTimeMinutes}m</div>
          <div className="flex items-center gap-2 text-sm text-slate-600"><Flag size={15} className="text-slate-400" /> Actual: {task.actualTimeMinutes}m</div>
        </div>
      </div>

      <div className="mt-5 card !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Time Logs</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {timeLogs.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No time logs recorded yet.</p>
          ) : timeLogs.map((log) => (
            <div key={log._id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-700">{log.note || 'Time entry'}</p>
                <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
              <span className="text-sm font-semibold text-primary-600">{log.minutesSpent}m</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
