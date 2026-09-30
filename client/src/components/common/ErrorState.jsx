import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-red-50 p-4 text-red-500">
        <AlertTriangle size={32} />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          <RefreshCw size={15} /> Retry
        </button>
      )}
    </div>
  )
}
