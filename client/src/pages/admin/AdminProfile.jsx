import React, { useState } from 'react'
import {
  Mail, Phone, Briefcase, Building2, Hash, Calendar,
  Lock, Eye, EyeOff, Save, Shield, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AvatarUploader from '../../components/common/AvatarUploader'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/authApi'

export default function AdminProfile() {
  const { user, updateUser } = useAuth()

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // Password form
  const [pwForm, setPwForm]         = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [savingPw, setSavingPw]       = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.fullName.trim()) { toast.error('Full name is required'); return }
    setSavingProfile(true)
    try {
      const res = await authApi.updateProfile(profileForm)
      updateUser(res.data.user)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally { setSavingProfile(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match'); return
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setSavingPw(true)
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setSavingPw(false) }
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl space-y-5">

        {/* ── Profile header card ── */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar uploader */}
            <AvatarUploader size={100} />

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h2 className="text-xl font-black text-slate-800">{user?.fullName}</h2>
                <Badge status={user?.status} />
              </div>
              <p className="text-sm text-slate-500 mt-1">{user?.email}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {[
                  { icon: Hash,      label: 'Employee ID',  val: user?.employeeId  },
                  { icon: Shield,    label: 'Role',         val: 'Administrator'   },
                  { icon: Briefcase, label: 'Designation',  val: user?.designation || '—' },
                  { icon: Calendar,  label: 'Last Login',   val: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : '—' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <f.icon size={13} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">{f.label}</p>
                      <p className="font-semibold text-slate-700 leading-tight">{f.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit profile form ── */}
        <div className="card">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="h-4 w-1 rounded bg-indigo-500" />
            Edit Profile
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <input
                  className="input"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input !pl-9"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 99999 99999"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              <Mail size={13} className="text-slate-400 shrink-0" />
              <span>Email: <strong className="text-slate-700">{user?.email}</strong> — Contact admin to change email.</span>
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</> : <><Save size={15} />Save Changes</>}
            </button>
          </form>
        </div>

        {/* ── Change password ── */}
        <div className="card">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="h-4 w-1 rounded bg-rose-500" />
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { label: 'Current Password', key: 'currentPassword', show: showCurrent, toggle: () => setShowCurrent(s => !s) },
              { label: 'New Password',     key: 'newPassword',     show: showNew,     toggle: () => setShowNew(s => !s)     },
              { label: 'Confirm New Password', key: 'confirmPassword', show: showNew, toggle: () => setShowNew(s => !s)     },
            ].map((f) => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={f.show ? 'text' : 'password'}
                    required
                    className="input !pl-9 !pr-10"
                    value={pwForm[f.key]}
                    onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
            {pwForm.newPassword && pwForm.confirmPassword && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${pwForm.newPassword === pwForm.confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                <CheckCircle size={12} />
                {pwForm.newPassword === pwForm.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}
            <button type="submit" disabled={savingPw} className="btn-danger !bg-rose-600 !text-white !border-0 hover:!bg-rose-700">
              {savingPw ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Updating...</> : <><Lock size={15} />Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
