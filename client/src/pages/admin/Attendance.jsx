import React, { useEffect, useState, useCallback } from 'react'
import { Calendar, Download, MapPin, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { SkeletonRow } from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Pagination from '../../components/common/Pagination'
import { attendanceApi } from '../../api/attendanceApi'
import { employeeApi } from '../../api/employeeApi'
import { downloadCsv } from '../../utils/download'

export default function AdminAttendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ limit: 200 })
      setEmployees(res.data.employees)
    } catch (e) {}
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await attendanceApi.historyAdmin({
        employee: employeeFilter || undefined, status: statusFilter, from: from || undefined, to: to || undefined, page, limit: 10,
      })
      setRecords(res.data.records)
      setPages(res.data.pages)
    } catch (e) {
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }, [employeeFilter, statusFilter, from, to, page])

  useEffect(() => { loadEmployees() }, [])
  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    try {
      await downloadCsv('/reports/attendance', { employee: employeeFilter || undefined, status: statusFilter, from: from || undefined, to: to || undefined }, 'attendance-report.csv')
      toast.success('Attendance report downloaded')
    } catch (e) {
      toast.error('Failed to export report')
    }
  }

  return (
    <DashboardLayout title="Attendance Management">
      <div className="card mb-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select className="input" value={employeeFilter} onChange={(e) => { setEmployeeFilter(e.target.value); setPage(1) }}>
          <option value="">All Employees</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.fullName}</option>)}
        </select>
        <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="all">All Status</option>
          <option value="present">Present</option>
          <option value="working">Working</option>
          <option value="completed">Completed</option>
          <option value="on_leave">On Leave</option>
          <option value="absent">Absent</option>
        </select>
        <input type="date" className="input" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} />
        <input type="date" className="input" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} />
      </div>

      <div className="flex justify-end mb-3">
        <button onClick={handleExport} className="btn-secondary"><Download size={15} /> Export CSV</button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Employee</th>
                <th className="table-th">Date</th>
                <th className="table-th">Start</th>
                <th className="table-th">End</th>
                <th className="table-th">Punch-in Location</th>
                <th className="table-th">Working Hrs</th>
                <th className="table-th">Break Hrs</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
              ) : records.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={Calendar} title="No attendance records found" description="Try adjusting date range or filters." /></td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.employee?.fullName} size={28} />
                        <span className="font-medium text-slate-700">{r.employee?.fullName}</span>
                      </div>
                    </td>
                    <td className="table-td">{r.date}</td>
                    <td className="table-td">{r.startTime ? new Date(r.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="table-td">{r.endTime ? new Date(r.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="table-td">
                      {r.city || r.locationAddress ? (
                        <div className="flex items-center gap-1 text-xs text-slate-700">
                          <MapPin size={12} className="text-sky-500 shrink-0" />
                          <span>{r.city || r.locationAddress}</span>
                          {r.latitude && r.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:text-sky-800 ml-1 inline-flex items-center"
                              title="Open in Maps"
                            >
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      ) : r.ip ? (
                        <span className="text-xs font-mono text-slate-500">{r.ip}</span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="table-td">{(r.totalWorkingSeconds / 3600).toFixed(1)}h</td>
                    <td className="table-td">{(r.totalBreakSeconds / 3600).toFixed(1)}h</td>
                    <td className="table-td"><Badge status={r.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>
    </DashboardLayout>
  )
}
