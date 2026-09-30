import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { SkeletonRow } from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { holidayApi } from '../../api/holidayApi'
import { leaveApi } from '../../api/leaveApi'

const emptyHoliday = { name: '', date: '', description: '', type: 'mandatory' }

export default function AdminHolidays() {
  const [tab, setTab] = useState('leaves')

  // Leaves
  const [leaves, setLeaves] = useState([])
  const [leavesLoading, setLeavesLoading] = useState(true)
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('pending')
  const [reviewTarget, setReviewTarget] = useState(null) // { leave, action }
  const [comment, setComment] = useState('')
  const [reviewing, setReviewing] = useState(false)

  // Holidays
  const [holidays, setHolidays] = useState([])
  const [holidaysLoading, setHolidaysLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyHoliday)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadLeaves = async () => {
    setLeavesLoading(true)
    try {
      const res = await leaveApi.getAll({ status: leaveStatusFilter, limit: 50 })
      setLeaves(res.data.leaves)
    } catch (e) { toast.error('Failed to load leave requests') } finally { setLeavesLoading(false) }
  }

  const loadHolidays = async () => {
    setHolidaysLoading(true)
    try {
      const res = await holidayApi.getAll({ year: new Date().getFullYear() })
      setHolidays(res.data.holidays)
    } catch (e) { toast.error('Failed to load holidays') } finally { setHolidaysLoading(false) }
  }

  useEffect(() => { loadLeaves() }, [leaveStatusFilter])
  useEffect(() => { loadHolidays() }, [])

  const handleReview = async () => {
    setReviewing(true)
    try {
      if (reviewTarget.action === 'approve') {
        await leaveApi.approve(reviewTarget.leave._id, comment)
        toast.success('Leave approved successfully')
      } else {
        await leaveApi.reject(reviewTarget.leave._id, comment)
        toast.success('Leave rejected')
      }
      setReviewTarget(null)
      setComment('')
      loadLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setReviewing(false)
    }
  }

  const handleSaveHoliday = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await holidayApi.create(form)
      toast.success('Holiday added successfully')
      setModalOpen(false)
      setForm(emptyHoliday)
      loadHolidays()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add holiday')
    } finally { setSaving(false) }
  }

  const handleDeleteHoliday = async () => {
    try {
      await holidayApi.remove(deleteTarget._id)
      toast.success('Holiday removed')
      setDeleteTarget(null)
      loadHolidays()
    } catch (e) { toast.error('Failed to delete holiday') }
  }

  return (
    <DashboardLayout title="Holidays & Leave Management">
      <div className="flex gap-2 mb-5 border-b border-slate-200">
        {['leaves', 'holidays'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {t === 'leaves' ? 'Leave Requests' : 'Company Holidays'}
          </button>
        ))}
      </div>

      {tab === 'leaves' && (
        <>
          <div className="flex gap-2 mb-4">
            {['pending', 'approved', 'rejected', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setLeaveStatusFilter(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${leaveStatusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Employee</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Dates</th>
                    <th className="table-th">Days</th>
                    <th className="table-th">Reason</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leavesLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                  ) : leaves.length === 0 ? (
                    <tr><td colSpan={7}><EmptyState title="No leave requests found" description="No pending leave requests at the moment." /></td></tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50">
                        <td className="table-td font-medium">{l.employee?.fullName}</td>
                        <td className="table-td capitalize">{l.leaveType}</td>
                        <td className="table-td">{l.startDate} → {l.endDate}</td>
                        <td className="table-td">{l.days}</td>
                        <td className="table-td max-w-[200px] truncate" title={l.reason}>{l.reason}</td>
                        <td className="table-td"><Badge status={l.status} /></td>
                        <td className="table-td">
                          {l.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setReviewTarget({ leave: l, action: 'approve' })} className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Check size={16} /></button>
                              <button onClick={() => setReviewTarget({ leave: l, action: 'reject' })} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><X size={16} /></button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">{l.adminComment || '-'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'holidays' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> Add Holiday</button>
          </div>
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Holiday</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Description</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidaysLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                  ) : holidays.length === 0 ? (
                    <tr><td colSpan={5}><EmptyState icon={CalendarDays} title="No holidays added yet" /></td></tr>
                  ) : (
                    holidays.map((h) => (
                      <tr key={h._id} className="hover:bg-slate-50">
                        <td className="table-td font-medium">{h.name}</td>
                        <td className="table-td">{h.date}</td>
                        <td className="table-td capitalize">{h.type}</td>
                        <td className="table-td text-slate-500">{h.description}</td>
                        <td className="table-td">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setDeleteTarget(h)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Review leave modal */}
      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)} title={reviewTarget?.action === 'approve' ? 'Approve Leave' : 'Reject Leave'} size="sm">
        <p className="text-sm text-slate-600 mb-3">
          {reviewTarget?.leave?.employee?.fullName} — {reviewTarget?.leave?.leaveType} leave ({reviewTarget?.leave?.days} day(s))
        </p>
        <label className="label">Admin Comment (optional)</label>
        <textarea className="input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a note..." />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setReviewTarget(null)}>Cancel</button>
          <button className={reviewTarget?.action === 'approve' ? 'btn-success' : 'btn-danger'} onClick={handleReview} disabled={reviewing}>
            {reviewing ? 'Please wait...' : reviewTarget?.action === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </Modal>

      {/* Add holiday modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Company Holiday">
        <form onSubmit={handleSaveHoliday} className="space-y-4">
          <div>
            <label className="label">Holiday Name *</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Date *</label>
            <input required type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="mandatory">Mandatory</option>
              <option value="optional">Optional</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={2} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Add Holiday'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteHoliday}
        title="Delete Holiday"
        message={`Remove "${deleteTarget?.name}" from the holiday calendar?`}
        confirmText="Delete"
      />
    </DashboardLayout>
  )
}
