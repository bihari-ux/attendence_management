import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-slate-100 p-4 text-slate-400">
        <Icon size={32} />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>}
    </div>
  )
}
