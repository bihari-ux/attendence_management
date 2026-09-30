import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Play, Pause, Square, Coffee } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageLoader } from '../../components/common/Loading'
import Badge from '../../components/common/Badge'
import { attendanceApi } from '../../api/attendanceApi'
import { formatDuration, formatTime } from '../../utils/format'
import { captureLocationInfo } from '../../utils/locationHelper'

export default function EmployeeTimer() {
  const [status, setStatus] = useState(null) // { attendance, liveWorkingSeconds, liveBreakSeconds, currentState }
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const [displayBreakSeconds, setDisplayBreakSeconds] = useState(0)
  const tickRef = useRef(null)

  const loadStatus = async () => {
    try {
      const res = await attendanceApi.today()
      setStatus(res.data)
      setDisplaySeconds(res.data.liveWorkingSeconds || 0)
      setDisplayBreakSeconds(res.data.liveBreakSeconds || 0)
    } catch (e) {
      toast.error('Failed to load timer status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStatus() }, [])

  // Client-side ticking for smooth display; re-synced with backend on every action
  useEffect(() => {
    clearInterval(tickRef.current)
    if (status?.currentState === 'working') {
      tickRef.current = setInterval(() => setDisplaySeconds((s) => s + 1), 1000)
    } else if (status?.currentState === 'on_break') {
      tickRef.current = setInterval(() => setDisplayBreakSeconds((s) => s + 1), 1000)
    }
    return () => clearInterval(tickRef.current)
  }, [status?.currentState])

  // Periodic re-sync with backend (in case of drift / multi-tab)
  useEffect(() => {
    const interval = setInterval(loadStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const runAction = async (fn, successMsg) => {
    setActionLoading(true)
    try {
      await fn()
      toast.success(successMsg)
      await loadStatus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartWork = async () => {
    let loc = null
    try {
      loc = await captureLocationInfo()
    } catch (e) {}
    await runAction(() => attendanceApi.start({ locationInfo: loc }), 'Work started! Have a productive day.')
  }

  if (loading) return <DashboardLayout title="My Timer"><PageLoader /></DashboardLayout>

  const state = status?.currentState || 'not_started'
  const attendance = status?.attendance

  return (
    <DashboardLayout title="My Timer">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center !py-10">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Today's Working Time</p>
          <p className="mt-4 font-mono text-6xl font-bold text-slate-800 tabular-nums">{formatDuration(displaySeconds)}</p>
          <div className="mt-3 flex justify-center"><Badge status={state} /></div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {state === 'not_started' && (
              <button onClick={handleStartWork} disabled={actionLoading} className="btn-success !px-8 !py-3">
                <Play size={18} /> Start Work
              </button>
            )}
            {state === 'working' && (
              <>
                <button onClick={() => runAction(attendanceApi.startBreak, 'Break started')} disabled={actionLoading} className="btn-secondary !px-6 !py-3">
                  <Coffee size={18} /> Pause (Break)
                </button>
                <button onClick={() => runAction(attendanceApi.stop, 'Work stopped. Great job today!')} disabled={actionLoading} className="btn-danger !px-6 !py-3">
                  <Square size={18} /> Stop Work
                </button>
              </>
            )}
            {state === 'on_break' && (
              <>
                <button onClick={() => runAction(attendanceApi.endBreak, 'Welcome back! Work resumed.')} disabled={actionLoading} className="btn-primary !px-6 !py-3">
                  <Play size={18} /> Resume Work
                </button>
                <button onClick={() => runAction(attendanceApi.stop, 'Work stopped.')} disabled={actionLoading} className="btn-danger !px-6 !py-3">
                  <Square size={18} /> Stop Work
                </button>
              </>
            )}
            {state === 'stopped' && (
              <p className="text-sm text-slate-500">You've completed work for today. See you tomorrow!</p>
            )}
          </div>
        </div>

        {attendance && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-xs text-slate-500">Start Time</p>
              <p className="mt-1 font-semibold text-slate-800">{formatTime(attendance.startTime)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-slate-500">Current Time</p>
              <p className="mt-1 font-semibold text-slate-800">{formatTime(new Date())}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-slate-500">Break Time</p>
              <p className="mt-1 font-semibold text-amber-600">{formatDuration(displayBreakSeconds)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-slate-500">Net Working</p>
              <p className="mt-1 font-semibold text-emerald-600">{formatDuration(displaySeconds)}</p>
            </div>
          </div>
        )}

        <div className="mt-5 card bg-slate-50 border-dashed">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>Note:</strong> Your working time is calculated securely on the server using timestamps, so it stays accurate
            even if you refresh the page, close the tab, or lose connection. The timer above will always re-sync automatically.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
