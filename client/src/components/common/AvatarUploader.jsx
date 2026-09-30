import React, { useRef, useState } from 'react'
import { Camera, Loader2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'

/**
 * AvatarUploader — click to open file picker, preview + upload base64 avatar.
 * Shows the current avatar (photo or gradient initials), hover reveals camera icon.
 */
export default function AvatarUploader({ size = 96 }) {
  const { user, updateUser } = useAuth()
  const inputRef    = useRef(null)
  const [preview, setPreview]     = useState(user?.avatar || null)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved]         = useState(false)

  const initials = (user?.fullName || '?')
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  const gradients = [
    ['#6366f1', '#4f46e5'], ['#10b981', '#059669'], ['#f59e0b', '#d97706'],
    ['#ef4444', '#dc2626'], ['#38bdf8', '#0284c7'], ['#a855f7', '#7c3aed'],
    ['#14b8a6', '#0d9488'], ['#f43f5e', '#e11d48'],
  ]
  const idx = user?.fullName?.length ? user.fullName.charCodeAt(0) % gradients.length : 0
  const [from, to] = gradients[idx]

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate type + size (max 2 MB)
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result
      setPreview(base64)
      setUploading(true)
      try {
        const res = await authApi.updateProfile({ avatar: base64 })
        updateUser(res.data.user)
        setSaved(true)
        toast.success('Profile photo updated!')
        setTimeout(() => setSaved(false), 2500)
      } catch (err) {
        toast.error('Failed to upload photo')
        setPreview(user?.avatar || null)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = async () => {
    setUploading(true)
    try {
      const res = await authApi.updateProfile({ avatar: '' })
      updateUser(res.data.user)
      setPreview(null)
      toast.success('Photo removed')
    } catch {
      toast.error('Failed to remove photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group" style={{ width: size, height: size }}>
        {/* Avatar circle */}
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="rounded-full object-cover w-full h-full ring-4 ring-white shadow-lg"
          />
        ) : (
          <div
            className="rounded-full w-full h-full flex items-center justify-center text-white font-black ring-4 ring-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${from}, ${to})`,
              fontSize: size * 0.35,
            }}
          >
            {initials}
          </div>
        )}

        {/* Overlay on hover */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Change photo"
        >
          {uploading ? (
            <Loader2 size={22} className="text-white animate-spin" />
          ) : saved ? (
            <Check size={22} className="text-emerald-400" />
          ) : (
            <>
              <Camera size={20} className="text-white" />
              <span className="text-[9px] text-white font-semibold mt-1">Change</span>
            </>
          )}
        </button>

        {/* Remove button */}
        {preview && !uploading && (
          <button
            onClick={removePhoto}
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors z-10"
            title="Remove photo"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>
      <p className="text-[10px] text-slate-400">JPG, PNG up to 2 MB</p>
    </div>
  )
}
