import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Eye, Pencil, UserCheck, UserX, Trash2, KeyRound, Copy, RefreshCw, Check, Sparkles, MapPin, ExternalLink, Monitor, Smartphone, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { SkeletonRow } from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import { employeeApi } from '../../api/employeeApi'
import { departmentApi } from '../../api/departmentApi'

const emptyForm = {
  fullName: '', employeeId: '', email: '', phone: '', department: '', designation: '',
  joiningDate: '', password: '', status: 'active',
}

const generatePassword = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  let res = 'Emp@'
  for (let i = 0; i < 4; i++) {
    res += digits.charAt(Math.floor(Math.random() * digits.length))
  }
  for (let i = 0; i < 2; i++) {
    res += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  return res
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Actions
  const [confirmAction, setConfirmAction] = useState(null) // { type, employee }

  // Individual Password Change Modal
  const [pwdModal, setPwdModal] = useState({
    open: false,
    employee: null,
    password: '',
    show: false,
    mustChange: false,
    saving: false,
    copied: false,
  })

  const loadDepartments = async () => {
    try {
      const res = await departmentApi.getAll()
      setDepartments(res.data.departments)
    } catch (e) {}
  }

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await employeeApi.getAll({
        search, department: deptFilter, status: statusFilter, page, limit: 8,
      })
      setEmployees(res.data.employees)
      setPages(res.data.pages)
      setTotal(res.data.total)
    } catch (e) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [search, deptFilter, statusFilter, page])

  useEffect(() => { loadDepartments() }, [])
  useEffect(() => {
    const t = setTimeout(() => loadEmployees(), 350)
    return () => clearTimeout(t)
  }, [loadEmployees])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (emp) => {
    setEditingId(emp._id)
    setForm({
      fullName: emp.fullName, employeeId: emp.employeeId, email: emp.email, phone: emp.phone || '',
      department: emp.department?._id || '', designation: emp.designation || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : '', password: '', status: emp.status,
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await employeeApi.update(editingId, form)
        toast.success('Employee updated successfully')
      } else {
        await employeeApi.create(form)
        toast.success('Employee created successfully')
      }
      setModalOpen(false)
      loadEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirm = async () => {
    if (!confirmAction) return
    const { type, employee } = confirmAction
    try {
      if (type === 'delete') {
        await employeeApi.remove(employee._id)
        toast.success('Employee deleted successfully')
      } else if (type === 'activate' || type === 'deactivate') {
        await employeeApi.updateStatus(employee._id, type === 'activate' ? 'active' : 'inactive')
        toast.success(`Employee ${type === 'activate' ? 'activated' : 'deactivated'} successfully`)
      }
      setConfirmAction(null)
      loadEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  // Open password modal for specific employee
  const openPasswordModal = (emp) => {
    setPwdModal({
      open: true,
      employee: emp,
      password: '',
      show: true,
      mustChange: false,
      saving: false,
      copied: false,
    })
  }

  // Handle saving new password for single employee
  const handleSavePassword = async (e) => {
    e.preventDefault()
    if (!pwdModal.password || pwdModal.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setPwdModal((prev) => ({ ...prev, saving: true }))
    try {
      await employeeApi.resetPassword(pwdModal.employee._id, {
        password: pwdModal.password,
        mustChangePassword: pwdModal.mustChange,
      })
      toast.success(`Password updated for ${pwdModal.employee.fullName}! 🔑`)
      setPwdModal((prev) => ({ ...prev, open: false }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setPwdModal((prev) => ({ ...prev, saving: false }))
    }
  }

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setPwdModal((prev) => ({ ...prev, copied: true }))
    setTimeout(() => setPwdModal((prev) => ({ ...prev, copied: false })), 2000)
    toast.success('Password copied to clipboard!')
  }

  return (

    <DashboardLayout title="Employee Management">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-sm text-slate-500">{total} total employees registered</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={openCreate} className="btn-primary !py-2 !px-3.5 flex items-center gap-1.5 text-xs sm:text-sm">
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input !pl-9"
            placeholder="Search by name, ID, email, designation..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className="input sm:w-48" value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1) }}>
          <option value="all">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select className="input sm:w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Employee</th>
                <th className="table-th">Department</th>
                <th className="table-th">Designation</th>
                <th className="table-th">Login Location & Device</th>
                <th className="table-th">Joining Date</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : employees.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No employees found" description="Try adjusting your search or filters, or add a new employee." /></td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.fullName} size={34} />
                        <div>
                          <Link to={`/admin/employees/${emp._id}`} className="font-medium text-slate-700 hover:text-primary-600">{emp.fullName}</Link>
                          <p className="text-xs text-slate-400">{emp.employeeId} · {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">{emp.department?.name || '-'}</td>
                    <td className="table-td">{emp.designation || '-'}</td>
                    <td className="table-td">
                      {emp.lastLoginInfo?.city || emp.lastLoginInfo?.ip || emp.lastLogin ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md">
                              <MapPin size={11} className="text-sky-600 shrink-0" />
                              <span>{emp.lastLoginInfo?.city ? `${emp.lastLoginInfo.city}${emp.lastLoginInfo.country ? ', ' + emp.lastLoginInfo.country : ''}` : 'Network Connected'}</span>
                            </span>
                            {emp.lastLoginInfo?.latitude && emp.lastLoginInfo?.longitude && (
                              <a
                                href={`https://www.google.com/maps?q=${emp.lastLoginInfo.latitude},${emp.lastLoginInfo.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 px-1.5 py-0.5 rounded transition-colors"
                                title="Open in Google Maps"
                              >
                                <span>Map</span>
                                <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            {emp.lastLoginInfo?.device === 'Mobile' ? <Smartphone size={11} className="text-slate-400" /> : <Monitor size={11} className="text-slate-400" />}
                            <span className="truncate max-w-[170px]">{emp.lastLoginInfo?.browser || 'Browser'} · {emp.lastLoginInfo?.ip || 'IP'}</span>
                          </p>
                          {emp.lastLogin && (
                            <p className="text-[10px] text-slate-400">
                              {new Date(emp.lastLogin).toLocaleDateString()} {new Date(emp.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No login record yet</span>
                      )}
                    </td>
                    <td className="table-td">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-'}</td>
                    <td className="table-td"><Badge status={emp.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/employees/${emp._id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary-600" title="View Details">
                          <Eye size={16} />
                        </Link>
                        <button onClick={() => openEdit(emp)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600" title="Edit Employee">
                          <Pencil size={16} />
                        </button>
                        {/* Change/Reset Employee Password */}
                        <button
                          onClick={() => openPasswordModal(emp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Change / Reset Password"
                        >
                          <KeyRound size={16} />
                        </button>
                        {emp.status === 'active' ? (
                          <button onClick={() => setConfirmAction({ type: 'deactivate', employee: emp })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600" title="Deactivate">
                            <UserX size={16} />
                          </button>
                        ) : (
                          <button onClick={() => setConfirmAction({ type: 'activate', employee: emp })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600" title="Activate">
                            <UserCheck size={16} />
                          </button>
                        )}
                        <button onClick={() => setConfirmAction({ type: 'delete', employee: emp })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600" title="Delete">
                          <Trash2 size={16} />
                        </button>
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

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input required className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="label">Employee ID *</label>
              <input required disabled={!!editingId} className="input disabled:bg-slate-50" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="EMP1009" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Designation</label>
              <input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Software Engineer" />
            </div>
            <div>
              <label className="label">Joining Date</label>
              <input type="date" className="input" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {!editingId && (
              <div className="sm:col-span-2">
                <label className="label">Initial Password</label>
                <input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank for default: Welcome@123" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editingId ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Single Employee Password Change Modal ── */}
      <Modal
        open={pwdModal.open}
        onClose={() => setPwdModal((prev) => ({ ...prev, open: false }))}
        title="Change Employee Password"
        size="md"
      >
        {pwdModal.employee && (
          <form onSubmit={handleSavePassword} className="space-y-4">
            {/* Target Employee Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Avatar name={pwdModal.employee.fullName} size={40} />
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{pwdModal.employee.fullName}</p>
                <p className="text-xs text-slate-500">ID: {pwdModal.employee.employeeId} · {pwdModal.employee.email}</p>
              </div>
            </div>

            <div>
              <label className="label">New Password *</label>
              <div className="relative">
                <input
                  type={pwdModal.show ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  placeholder="Enter new password (min 6 characters)"
                  value={pwdModal.password}
                  onChange={(e) => setPwdModal((prev) => ({ ...prev, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setPwdModal((prev) => ({ ...prev, show: !prev.show }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {pwdModal.show ? <Eye size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Quick helper buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPwdModal((prev) => ({ ...prev, password: generatePassword() }))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              >
                <Sparkles size={13} />
                <span>Generate Random</span>
              </button>

              <button
                type="button"
                onClick={() => setPwdModal((prev) => ({ ...prev, password: 'Welcome@123' }))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <span>Use Welcome@123</span>
              </button>

              {pwdModal.password && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(pwdModal.password, false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold ml-auto transition-colors"
                >
                  {pwdModal.copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{pwdModal.copied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pwdModal.mustChange}
                  onChange={(e) => setPwdModal((prev) => ({ ...prev, mustChange: e.target.checked }))}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Require employee to change password on their next login
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPwdModal((prev) => ({ ...prev, open: false }))}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pwdModal.saving}
                className="btn-primary flex items-center gap-2"
              >
                {pwdModal.saving ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Status Confirmation Modal */}
      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={
          confirmAction?.type === 'delete' ? 'Delete Employee' :
          confirmAction?.type === 'deactivate' ? 'Deactivate Employee' : 'Activate Employee'
        }
        message={
          confirmAction?.type === 'delete'
            ? `Are you sure you want to permanently delete ${confirmAction?.employee?.fullName}? This action cannot be undone.`
            : confirmAction?.type === 'deactivate'
            ? `${confirmAction?.employee?.fullName} will immediately lose login access. Continue?`
            : `${confirmAction?.employee?.fullName} will regain login access. Continue?`
        }
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : confirmAction?.type === 'deactivate' ? 'Deactivate' : 'Activate'}
        danger={confirmAction?.type !== 'activate'}
      />
    </DashboardLayout>
  )
}
