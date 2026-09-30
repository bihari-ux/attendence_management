import React from 'react'

// Premium gradient pairs for each avatar
const gradients = [
  ['#6366f1', '#4f46e5'], // indigo
  ['#10b981', '#059669'], // emerald
  ['#f59e0b', '#d97706'], // amber
  ['#ef4444', '#dc2626'], // red
  ['#38bdf8', '#0284c7'], // sky
  ['#a855f7', '#7c3aed'], // purple
  ['#14b8a6', '#0d9488'], // teal
  ['#f43f5e', '#e11d48'], // rose
]

export default function Avatar({ name = '', size = 36, className = '' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const idx = name.length ? name.charCodeAt(0) % gradients.length : 0
  const [from, to] = gradients[idx]

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: `0 2px 8px ${from}40`,
      }}
      title={name}
    >
      {initials || '?'}
    </div>
  )
}
