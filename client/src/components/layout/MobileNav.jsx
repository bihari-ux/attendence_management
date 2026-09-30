import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminLinks, employeeLinks } from './Sidebar'

export default function MobileNav() {
  const { user } = useAuth()
  const links = (user?.role === 'admin' ? adminLinks : employeeLinks).slice(0, 5)

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 py-2"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all duration-200 ${
              isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-indigo-600" />
              )}
              <link.icon
                size={20}
                className={`transition-colors ${isActive ? link.color : 'text-slate-400'}`}
              />
              <span className="truncate max-w-[56px]">{link.label.split(' ')[0]}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
