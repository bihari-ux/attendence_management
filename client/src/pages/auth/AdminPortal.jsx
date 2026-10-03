import React from 'react'
import Login from './Login'

export default function AdminPortal({ defaultTab = 'admin' }) {
  return <Login defaultTab={defaultTab === 'signup' ? 'signup' : 'admin'} />
}
