import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageLoader } from '../../components/common/Loading'
import ErrorState from '../../components/common/ErrorState'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { taskApi } from '../../api/taskApi'

export default function EmployeeTaskDetails() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [timeLogs, setTimeLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true); setError(false)
    try {
      const res = await taskApi.getOne(id)
      setTask(res.data.task)
      setTimeLogs(res.data.timeLogs)
    } catch (e) { setError(true) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleLogTime = async (e) => {
    e.preventDefault()
    if (!minutes || minutes <= 0) { toast.error('Please enter valid minutes'); return }
    setSaving(true)
    try {
      await taskApi.logTime(id, { minutesSpent: Number(minutes), note })
      toast.success('Time logged successfully')
      setModalOpen(false)
      setMinutes(''); setNote('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log time')
    } finally { setSaving(false) }
  }

  const handleStatusChange = async (status) => {
    try {
      await taskApi.updateStatus(id, status)
      toast.success('Task status updated')
      load()
    } catch (e) { toast.error('Failed to update status') }
  }

  if (loading) return <DashboardLayout title="Task Details"><PageLoader /></DashboardLayout>
  if (error || !task) return <DashboardLayout title="Task Details"><ErrorState message="Failed to load task" onRetry={load} /></DashboardLayout>

  return (
    <DashboardLayout title="Task Details">
      <Link to="/employee/tasks" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-5">
        <ArrowLeft size={16} /> Back to Tasks
      </Link>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{task.description || 'No description provided.'}</p>
          </div>
          <Badge status={task.priority} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="text-sm text-slate-500">Status:</span>
          <select value={task.status} onChange={(e) => handleStatusChange(e.target.value)} className="input !w-auto">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <span className="text-sm text-slate-500 ml-auto">Est: {task.estimatedTimeMinutes}m · Actual: {task.actualTimeMinutes}m</span>
        </div>
      </div>

      <div className="mt-5 card !p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Clock size={16} className="text-slate-400" /> Time Logs</h3>
          <button onClick={() => setModalOpen(true)} className="btn-secondary !px-3 !py-1.5"><Plus size={14} /> Log Time</button>
        </div>
        <div className="divide-y divide-slate-50">
          {timeLogs.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No time logged yet. Click "Log Time" to add an entry.</p>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Time Spent" size="sm">
        <form onSubmit={handleLogTime} className="space-y-4">
          <div>
            <label className="label">Minutes Spent *</label>
            <input type="number" min="1" required className="input" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="e.g. 45" />
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <textarea rows={2} className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you work on?" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Log Time'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
