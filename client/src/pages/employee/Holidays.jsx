import React, { useEffect, useState } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { SkeletonRow } from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { leaveApi } from '../../api/leaveApi'
import { holidayApi } from '../../api/holidayApi'
import { formatDateKey } from '../../utils/format'

const emptyForm = { leaveType: 'casual', startDate: formatDateKey(), endDate: formatDateKey(), reason: '' }

export default function EmployeeHolidays() {
  const [tab, setTab] = useState('myLeaves')
  const [leaves, setLeaves] = useState([])
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadLeaves = async () => {
    try {
      const res = await leaveApi.getAll({ limit: 50 })
      setLeaves(res.data.leaves)
    } catch (e) { toast.error('Failed to load leaves') }
  }

  const loadHolidays = async () => {
    try {
      const res = await holidayApi.getAll({ year: new Date().getFullYear() })
      setHolidays(res.data.holidays)
    } catch (e) {}
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([loadLeaves(), loadHolidays()]).finally(() => setLoading(false))
  }, [])

  const handleApply = async (e) => {
    e.preventDefault()
    if (new Date(form.endDate) < new Date(form.startDate)) { toast.error('End date cannot be before start date'); return }
    setSaving(true)
    try {
      await leaveApi.apply(form)
      toast.success('Leave application submitted successfully')
      setModalOpen(false)
      setForm(emptyForm)
      loadLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave application')
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout title="My Holidays & Leaves">
      <div className="flex gap-2 mb-5 border-b border-slate-200">
        {['myLeaves', 'calendar'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {t === 'myLeaves' ? 'My Leave Requests' : 'Holiday Calendar'}
          </button>
        ))}
      </div>

      {tab === 'myLeaves' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> Apply for Leave</button>
          </div>
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Type</th>
                    <th className="table-th">Dates</th>
                    <th className="table-th">Days</th>
                    <th className="table-th">Reason</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Admin Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                  ) : leaves.length === 0 ? (
                    <tr><td colSpan={6}><EmptyState title="No leave requests yet" description="Apply for your first leave using the button above." /></td></tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50">
                        <td className="table-td capitalize font-medium">{l.leaveType}</td>
                        <td className="table-td">{l.startDate} → {l.endDate}</td>
                        <td className="table-td">{l.days}</td>
                        <td className="table-td max-w-[180px] truncate" title={l.reason}>{l.reason}</td>
                        <td className="table-td"><Badge status={l.status} /></td>
                        <td className="table-td text-slate-500">{l.adminComment || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'calendar' && (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Holiday</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Description</th>
                </tr>
              </thead>
              <tbody>
                {holidays.length === 0 ? (
                  <tr><td colSpan={4}><EmptyState icon={CalendarDays} title="No holidays listed" /></td></tr>
                ) : (
                  holidays.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50">
                      <td className="table-td font-medium">{h.name}</td>
                      <td className="table-td">{h.date}</td>
                      <td className="table-td capitalize">{h.type}</td>
                      <td className="table-td text-slate-500">{h.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Apply for Leave">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="label">Leave Type</label>
            <select className="input" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="wfh">Work From Home</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" required className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" required className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Reason *</label>
            <textarea required rows={3} className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Briefly explain your reason for leave" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Submitting...' : 'Submit Application'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
