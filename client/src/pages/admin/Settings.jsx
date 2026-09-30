import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageLoader } from '../../components/common/Loading'
import { settingsApi } from '../../api/settingsApi'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await settingsApi.get()
      setSettings(res.data.settings)
    } catch (e) { toast.error('Failed to load settings') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await settingsApi.update(settings)
      setSettings(res.data.settings)
      toast.success('Settings updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings')
    } finally { setSaving(false) }
  }

  if (loading || !settings) return <DashboardLayout title="Settings"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Application Settings">
      <form onSubmit={handleSave} className="max-w-2xl space-y-5">
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Company Information</h3>
          <div>
            <label className="label">Company Name</label>
            <input className="input" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} />
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Working Hours & Attendance Rules</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Work Start Time</label>
              <input type="time" className="input" value={settings.workStartTime} onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })} />
            </div>
            <div>
              <label className="label">Work End Time</label>
              <input type="time" className="input" value={settings.workEndTime} onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })} />
            </div>
            <div>
              <label className="label">Late After (minutes)</label>
              <input type="number" className="input" value={settings.lateAfterMinutes} onChange={(e) => setSettings({ ...settings, lateAfterMinutes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Break Duration (minutes)</label>
              <input type="number" className="input" value={settings.breakDurationMinutes} onChange={(e) => setSettings({ ...settings, breakDurationMinutes: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Leave Allowances (days / year)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Casual Leave</label>
              <input type="number" className="input" value={settings.leaveSettings?.casual || 0} onChange={(e) => setSettings({ ...settings, leaveSettings: { ...settings.leaveSettings, casual: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="label">Sick Leave</label>
              <input type="number" className="input" value={settings.leaveSettings?.sick || 0} onChange={(e) => setSettings({ ...settings, leaveSettings: { ...settings.leaveSettings, sick: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="label">Earned Leave</label>
              <input type="number" className="input" value={settings.leaveSettings?.earned || 0} onChange={(e) => setSettings({ ...settings, leaveSettings: { ...settings.leaveSettings, earned: Number(e.target.value) } })} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </DashboardLayout>
  )
}
