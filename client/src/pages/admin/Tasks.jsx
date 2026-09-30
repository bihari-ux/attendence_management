import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Trash2, Pencil, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { SkeletonRow } from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import { taskApi } from '../../api/taskApi'
import { employeeApi } from '../../api/employeeApi'
import { departmentApi } from '../../api/departmentApi'
import { formatDateKey } from '../../utils/format'

const emptyForm = {
  title: '', description: '', taskDate: formatDateKey(), priority: 'medium',
  estimatedTimeMinutes: 60, deadline: '', department: '', assignedTo: '',
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadMeta = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([employeeApi.getAll({ limit: 200, status: 'active' }), departmentApi.getAll()])
      setEmployees(empRes.data.employees)
      setDepartments(deptRes.data.departments)
    } catch (e) {}
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await taskApi.getAll({ search, status: statusFilter, priority: priorityFilter, page, limit: 8 })
      setTasks(res.data.tasks)
      setPages(res.data.pages)
    } catch (e) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, priorityFilter, page])

  useEffect(() => { loadMeta() }, [])
  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [load])

  const openCreate = () => { setForm(emptyForm); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.assignedTo) { toast.error('Please select an employee to assign this task to'); return }
    setSaving(true)
    try {
      await taskApi.create(form)
      toast.success('Task created and assigned successfully')
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await taskApi.remove(deleteTarget._id)
      toast.success('Task deleted successfully')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }

  return (
    <DashboardLayout title="Task Management">
      <div className="flex justify-end mb-5">
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Create & Assign Task</button>
      </div>

      <div className="card mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-9" placeholder="Search tasks..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input sm:w-44" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="input sm:w-40" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}>
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Task</th>
                <th className="table-th">Assigned To</th>
                <th className="table-th">Date</th>
                <th className="table-th">Priority</th>
                <th className="table-th">Status</th>
                <th className="table-th">Time (Est/Actual)</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No tasks found" description="Create a task and assign it to an employee to get started." /></td></tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <Link to={`/admin/tasks/${t._id}`} className="font-medium text-slate-700 hover:text-primary-600">{t.title}</Link>
                    </td>
                    <td className="table-td">{t.assignedTo?.fullName || '-'}</td>
                    <td className="table-td">{t.taskDate}</td>
                    <td className="table-td"><Badge status={t.priority} /></td>
                    <td className="table-td"><Badge status={t.status} /></td>
                    <td className="table-td">{t.estimatedTimeMinutes}m / {t.actualTimeMinutes}m</td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/tasks/${t._id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary-600"><Eye size={16} /></Link>
                        <button onClick={() => setDeleteTarget(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create & Assign Task" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Task Title *</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Assign To *</label>
              <select required className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e._id} value={e._id}>{e.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">None</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Task Date</label>
              <input type="date" className="input" value={form.taskDate} onChange={(e) => setForm({ ...form, taskDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
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
            <div>
              <label className="label">Estimated Time (minutes)</label>
              <input type="number" min="0" className="input" value={form.estimatedTimeMinutes} onChange={(e) => setForm({ ...form, estimatedTimeMinutes: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
      />
    </DashboardLayout>
  )
}
