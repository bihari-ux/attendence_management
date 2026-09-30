import React, { useEffect, useState } from 'react'
import { Download, FileBarChart } from 'lucide-react'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageLoader } from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import { reportApi } from '../../api/reportApi'
import { downloadCsv } from '../../utils/download'

const COLORS = ['#10b981', '#f59e0b', '#4f46e5']

export default function Reports() {
  const [type, setType] = useState('attendance')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [attData, setAttData] = useState([])
  const [taskData, setTaskData] = useState(null)

  const runReport = async () => {
    setLoading(true)
    try {
      if (type === 'attendance') {
        const res = await reportApi.attendance({ from: from || undefined, to: to || undefined, status })
        setAttData(res.data.records)
      } else {
        const res = await reportApi.tasks({ from: from || undefined, to: to || undefined, status: status === 'all' ? undefined : status })
        setTaskData(res.data)
      }
    } catch (e) {
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { runReport() }, [type])

  const handleExport = async () => {
    try {
      if (type === 'attendance') {
        await downloadCsv('/reports/attendance', { from: from || undefined, to: to || undefined, status }, 'attendance-report.csv')
      } else {
        await downloadCsv('/reports/tasks', { from: from || undefined, to: to || undefined, status: status === 'all' ? undefined : status }, 'task-report.csv')
      }
      toast.success('Report downloaded successfully')
    } catch (e) { toast.error('Failed to export report') }
  }

  const taskPieData = taskData ? [
    { name: 'Completed', value: taskData.summary.completed },
    { name: 'Pending', value: taskData.summary.pending },
    { name: 'In Progress', value: taskData.summary.inProgress },
  ] : []

  return (
    <DashboardLayout title="Reports">
      <div className="flex gap-2 mb-5">
        {['attendance', 'tasks'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${type === t ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            {t} Report
          </button>
        ))}
      </div>

      <div className="card mb-5 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="label">From</label>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex-1 w-full">
          <label className="label">To</label>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex-1 w-full">
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            {type === 'attendance' ? (
              <>
                <option value="present">Present</option>
                <option value="completed">Completed</option>
                <option value="on_leave">On Leave</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </>
            )}
          </select>
        </div>
        <button onClick={runReport} className="btn-secondary w-full sm:w-auto">Apply</button>
        <button onClick={handleExport} className="btn-primary w-full sm:w-auto"><Download size={15} /> Export CSV</button>
      </div>

      {loading ? <PageLoader /> : type === 'tasks' && taskData ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div className="card"><p className="text-xs text-slate-500">Total Tasks</p><p className="text-xl font-bold">{taskData.summary.total}</p></div>
            <div className="card"><p className="text-xs text-slate-500">Completed</p><p className="text-xl font-bold text-emerald-600">{taskData.summary.completed}</p></div>
            <div className="card"><p className="text-xs text-slate-500">Completion Rate</p><p className="text-xl font-bold text-primary-600">{taskData.summary.completionRate}%</p></div>
            <div className="card"><p className="text-xs text-slate-500">Time Spent</p><p className="text-xl font-bold">{(taskData.summary.totalTimeSpentMinutes / 60).toFixed(1)}h</p></div>
          </div>
          <div className="card mb-5">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {taskPieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ReportTable rows={taskData.records} />
        </>
      ) : type === 'attendance' ? (
        attData.length === 0 ? <EmptyState icon={FileBarChart} title="No records found" description="Adjust filters and try again." /> : <ReportTable rows={attData} />
      ) : null}
    </DashboardLayout>
  )
}

function ReportTable({ rows }) {
  if (!rows || rows.length === 0) return <EmptyState icon={FileBarChart} title="No records found" />
  const columns = Object.keys(rows[0])
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr>{columns.map((c) => <th key={c} className="table-th">{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                {columns.map((c) => <td key={c} className="table-td">{r[c]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
