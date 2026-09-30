import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Building2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function ChangePassword() {
  return (
    <DashboardLayout title="Password Settings">
      <div className="max-w-md card text-center p-8">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Password Changes Restricted</h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Employee passwords cannot be changed directly by employees. Only your company administrator has permission to set or reset your account password.
        </p>
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
          Please contact your administrator if you need a password update.
        </div>
        <div className="mt-6">
          <Link to="/employee/profile" className="btn-primary w-full justify-center flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to My Profile</span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
