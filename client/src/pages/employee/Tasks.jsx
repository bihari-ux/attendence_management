import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { SkeletonRow } from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { taskApi } from '../../api/taskApi'
import { formatDateKey } from '../../utils/format'

const emptyForm = { title: '', description: '', taskDate: formatDateKey(), priority: 'medium', estimatedTimeMinutes: 60 }

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await taskApi.getAll({ status: statusFilter, search, limit: 50 })
      setTasks(res.data.tasks)
    } catch (e) { toast.error('Failed to load tasks') } finally { setLoading(false) }
  }, [statusFilter, search])

  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await taskApi.create(form)
      toast.success('Task added successfully')
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task')
    } finally { setSaving(false) }
  }

  const quickStatusChange = async (task, status) => {
    try {
      await taskApi.updateStatus(task._id, status)
      toast.success('Task status updated')
      load()
    } catch (e) { toast.error('Failed to update status') }
  }

  return (
    <DashboardLayout title="My Tasks">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'in_progress', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary shrink-0"><Plus size={16} /> Add Task</button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input !pl-9 max-w-sm" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse bg-slate-100" />)
        ) : tasks.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3"><EmptyState title="No tasks found" description="Add a new task or adjust your filters." /></div>
        ) : (
          tasks.map((t) => (
            <div key={t._id} className="card hover:shadow-soft transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/employee/tasks/${t._id}`} className="font-semibold text-slate-800 hover:text-primary-600 line-clamp-1">{t.title}</Link>
                <Badge status={t.priority} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{t.description || 'No description'}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{t.taskDate}</span>
                <span>{t.estimatedTimeMinutes}m est.</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge status={t.status} />
                <select
                  value={t.status}
                  onChange={(e) => quickStatusChange(t, e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 px-2 py-1 outline-none focus:border-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Task Title *</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Task Date</label>
              <input type="date" className="input" value={form.taskDate} onChange={(e) => setForm({ ...form, taskDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Estimated Time (minutes)</label>
            <input type="number" min="0" className="input" value={form.estimatedTimeMinutes} onChange={(e) => setForm({ ...form, estimatedTimeMinutes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Add Task'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
