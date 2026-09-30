import React from 'react'
import { Mail, Phone, Briefcase, Calendar, ShieldCheck, Lock } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'

export default function EmployeeProfile() {
  const { user } = useAuth()

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-xl">
        <div className="card">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user?.fullName} size={80} />
            <h2 className="mt-3 text-xl font-bold text-slate-800">{user?.fullName}</h2>
            <p className="text-sm text-slate-400 font-mono font-medium">{user?.employeeId}</p>
            <div className="mt-2"><Badge status={user?.status} /></div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-slate-600"><Mail size={15} className="text-slate-400" /> {user?.email}</div>
            <div className="flex items-center gap-2.5 text-slate-600"><Phone size={15} className="text-slate-400" /> {user?.phone || 'No phone registered'}</div>
            <div className="flex items-center gap-2.5 text-slate-600"><Briefcase size={15} className="text-slate-400" /> {user?.designation || 'Staff'}</div>
            <div className="flex items-center gap-2.5 text-slate-600"><Calendar size={15} className="text-slate-400" /> Joined {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '-'}</div>
          </div>

          {/* Centralized Password Policy Notice */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Lock size={17} />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>Account Password Security</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-semibold">Admin Managed</span>
              </p>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Employee passwords are centrally administered. Employees cannot modify their own passwords. If you need your password reset or changed, please reach out to your system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
