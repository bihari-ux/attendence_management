import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { SkeletonRow } from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import { attendanceApi } from '../../api/attendanceApi'

export default function EmployeeAttendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await attendanceApi.history({ limit: 60 })
      setRecords(res.data.records)
    } catch (e) { toast.error('Failed to load attendance history') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const presentDays = records.filter((r) => ['present', 'working', 'completed'].includes(r.status)).length
  const totalHours = records.reduce((s, r) => s + (r.totalWorkingSeconds || 0), 0) / 3600

  return (
    <DashboardLayout title="My Attendance">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <div className="card"><p className="text-xs text-slate-500">Present Days</p><p className="text-xl font-bold">{presentDays}</p></div>
        <div className="card"><p className="text-xs text-slate-500">Total Hours</p><p className="text-xl font-bold">{totalHours.toFixed(1)}h</p></div>
        <div className="card"><p className="text-xs text-slate-500">Avg Daily Hours</p><p className="text-xl font-bold">{presentDays ? (totalHours / presentDays).toFixed(1) : 0}h</p></div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Date</th>
                <th className="table-th">Start</th>
                <th className="table-th">End</th>
                <th className="table-th">Working Hrs</th>
                <th className="table-th">Break Hrs</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : records.length === 0 ? (
                <tr><td colSpan={6}><EmptyState title="No attendance records found" description="Start your timer to begin tracking attendance." /></td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="table-td font-medium">{r.date}</td>
                    <td className="table-td">{r.startTime ? new Date(r.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="table-td">{r.endTime ? new Date(r.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="table-td">{(r.totalWorkingSeconds / 3600).toFixed(1)}h</td>
                    <td className="table-td">{(r.totalBreakSeconds / 3600).toFixed(1)}h</td>
                    <td className="table-td"><Badge status={r.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
