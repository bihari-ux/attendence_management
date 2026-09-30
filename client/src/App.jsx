import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuth } from './context/AuthContext'

// Auth pages
import Login from './pages/auth/Login'
import AdminPortal from './pages/auth/AdminPortal'
import AdminSignup from './pages/auth/AdminSignup'
import ForgotPassword from './pages/auth/ForgotPassword'

// Shared
import Notifications from './pages/Notifications'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import Employees from './pages/admin/Employees'
import EmployeeDetails from './pages/admin/EmployeeDetails'
import AdminAttendance from './pages/admin/Attendance'
import AdminTasks from './pages/admin/Tasks'
import TaskDetails from './pages/admin/TaskDetails'
import AdminHolidays from './pages/admin/Holidays'
import Reports from './pages/admin/Reports'
import AuditLogs from './pages/admin/AuditLogs'
import AdminSettings from './pages/admin/Settings'
import AdminProfile from './pages/admin/AdminProfile'

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeTimer from './pages/employee/Timer'
import EmployeeTasks from './pages/employee/Tasks'
import EmployeeTaskDetails from './pages/employee/TaskDetails'
import EmployeeAttendance from './pages/employee/Attendance'
import EmployeeHolidays from './pages/employee/Holidays'
import EmployeeProfile from './pages/employee/Profile'
import ChangePassword from './pages/employee/ChangePassword'
import EmployeeHistory from './pages/employee/History'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Portal Gateway: Login & Admin Account Creation */}
      <Route path="/admin" element={<AdminPortal />} />
      <Route path="/admin/login" element={<AdminPortal defaultTab="login" />} />
      <Route path="/admin/signup" element={<AdminPortal defaultTab="signup" />} />
      <Route path="/admin-signup" element={<AdminPortal defaultTab="signup" />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />


      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['admin']}><Employees /></ProtectedRoute>} />
      <Route path="/admin/employees/:id" element={<ProtectedRoute allowedRoles={['admin']}><EmployeeDetails /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendance /></ProtectedRoute>} />
      <Route path="/admin/tasks" element={<ProtectedRoute allowedRoles={['admin']}><AdminTasks /></ProtectedRoute>} />
      <Route path="/admin/tasks/:id" element={<ProtectedRoute allowedRoles={['admin']}><TaskDetails /></ProtectedRoute>} />
      <Route path="/admin/holidays" element={<ProtectedRoute allowedRoles={['admin']}><AdminHolidays /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><Notifications /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />

      {/* Employee routes */}
      <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/timer" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeTimer /></ProtectedRoute>} />
      <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeTasks /></ProtectedRoute>} />
      <Route path="/employee/tasks/:id" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeTaskDetails /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAttendance /></ProtectedRoute>} />
      <Route path="/employee/holidays" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeHolidays /></ProtectedRoute>} />
      <Route path="/employee/notifications" element={<ProtectedRoute allowedRoles={['employee']}><Notifications /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProfile /></ProtectedRoute>} />
      <Route path="/employee/change-password" element={<ProtectedRoute allowedRoles={['employee']}><ChangePassword /></ProtectedRoute>} />
      <Route path="/employee/history" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeHistory /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
