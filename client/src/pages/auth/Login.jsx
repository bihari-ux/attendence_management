import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/authApi'
import { captureLocationInfo } from '../../utils/locationHelper'

/* ───────────────────────── 3D helpers (pure CSS 3D, no extra library) ───────────────────────── */

// Real 6-faced 3D box. `front` draws on the front face. Children live in the box's 3D space.
function Box({ w, h, d, c, front, style, className = '', children }) {
  return (
    <div className={`box ${className}`} style={{ '--w': `${w}px`, '--h': `${h}px`, '--d': `${d}px`, '--c': c, ...style }}>
      {['front', 'back', 'right', 'left', 'top', 'bottom'].map((f) => (
        <i key={f} className={`f-${f}`}>{f === 'front' ? front : null}</i>
      ))}
      {children}
    </div>
  )
}

// Walking gait generated as keyframes: walk -> stand at gate (arm reaches & pushes) -> walk inside
const GAIT = (() => {
  const f = (n) => `${n.toFixed(2)}%`
  const half = (pts, from, to, n, s) => {
    for (let i = 1; i <= n; i++) pts.push([from + ((to - from) * i) / n, i === n ? 0 : i % 2 ? s * 34 : -s * 34])
  }
  const build = (name, pts) =>
    `@keyframes ${name}{${pts.map(([p, v]) => `${f(p)}{transform:rotateX(${v}deg)}`).join('')}}`
  const walker = (s) => {
    const p = [[0, 0]]
    half(p, 0, 52, 14, s)
    p.push([66, 0])
    half(p, 66, 78, 5, s)
    p.push([100, 0])
    return p
  }
  const front = (s) => {
    const p = [[0, 0]]
    half(p, 0, 52, 14, s)
    p.push([56, 0], [59, 88], [66, 88], [69, 0], [100, 0]) // raise arm and push the gate
    return p
  }
  return build('legA', walker(1)) + build('legB', walker(-1)) + build('armFront', front(1))
})()

function Person() {
  const SKIN = '#f1c9a5'
  const SHIRT = '#0066ff'
  const PANTS = '#1e293b'
  const shoe = { position: 'absolute', left: 0, top: 42, transform: 'translateZ(4px)' }
  return (
    <div className="figure">
      <div className="part" style={{ left: 22, top: 32 }}>
        <Box w={36} h={50} d={20} c={SHIRT} front={<div className="tie" />} />
      </div>
      <div className="part" style={{ left: 28, top: 6 }}>
        <Box w={24} h={24} d={22} c={SKIN} front={<div className="eyes"><b /><b /></div>} />
      </div>
      <div className="part" style={{ left: 27, top: 2 }}>
        <Box w={26} h={9} d={24} c="#1f2937" />
      </div>
      {/* back arm + briefcase */}
      <div className="pivot kLegB" style={{ left: 12, top: 34, width: 10 }}>
        <Box w={10} h={36} d={10} c="#0050cc">
          <Box w={10} h={8} d={10} c={SKIN} style={{ position: 'absolute', left: 0, top: 36 }} />
          <Box w={6} h={18} d={26} c="#92400e" style={{ position: 'absolute', left: 2, top: 42 }} />
        </Box>
      </div>
      {/* legs */}
      <div className="pivot kLegA" style={{ left: 24, top: 82, width: 14 }}>
        <Box w={14} h={42} d={14} c={PANTS}><Box w={14} h={6} d={22} c="#0f172a" style={shoe} /></Box>
      </div>
      <div className="pivot kLegB" style={{ left: 42, top: 82, width: 14 }}>
        <Box w={14} h={42} d={14} c={PANTS}><Box w={14} h={6} d={22} c="#0f172a" style={shoe} /></Box>
      </div>
      {/* front arm: swings while walking, reaches out to push the gate */}
      <div className="pivot kFront" style={{ left: 58, top: 34, width: 10 }}>
        <Box w={10} h={36} d={10} c={SHIRT}>
          <Box w={10} h={8} d={10} c={SKIN} style={{ position: 'absolute', left: 0, top: 36 }} />
        </Box>
      </div>
    </div>
  )
}

// Person walks to the OFFICE gate, pushes it open with his own hand, walks in, gate closes, loop.
function WalkingScene() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="sun" />
      <div className="cloud c1" />
      <div className="cloud c2" />
      <div className="ground"><div className="road" /></div>

      <div className="building">
        <Box
          w={190} h={260} d={120} c="#e2e8f0"
          front={
            <div className="bfront">
              <div className="bsign">AttendPro HQ</div>
              <div className="windows">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} style={{ animationDelay: `${(i * 0.37) % 3}s` }} />
                ))}
              </div>
              {/* 3D sign board above the gate */}
              <Box
                w={116} h={26} d={16} c="#0f172a"
                style={{ position: 'absolute', left: 37, bottom: 122 }}
                front={<div className="officeSign">OFFICE</div>}
              />
              {/* glass double gate with OFFICE written on it */}
              <div className="gate">
                <div className="leaf l"><span className="decal">OFFICE</span><em className="bar" /></div>
                <div className="leaf r"><span className="decal">ENTRY</span><em className="bar" /></div>
              </div>
            </div>
          }
        >
          <div className="travel">
            <div className="shadow" />
            <div className="bob"><Person /></div>
          </div>
        </Box>
      </div>
    </div>
  )
}

const css = `
.box{position:relative;width:var(--w);height:var(--h);transform-style:preserve-3d}
.box>i{position:absolute;left:50%;top:50%;display:block;box-sizing:border-box;background:var(--c)}
.f-front{width:var(--w);height:var(--h);margin:calc(var(--h)/-2) 0 0 calc(var(--w)/-2);transform:translateZ(calc(var(--d)/2));transform-style:preserve-3d}
.f-back{width:var(--w);height:var(--h);margin:calc(var(--h)/-2) 0 0 calc(var(--w)/-2);transform:rotateY(180deg) translateZ(calc(var(--d)/2));filter:brightness(.7)}
.f-right{width:var(--d);height:var(--h);margin:calc(var(--h)/-2) 0 0 calc(var(--d)/-2);transform:rotateY(90deg) translateZ(calc(var(--w)/2));filter:brightness(.82)}
.f-left{width:var(--d);height:var(--h);margin:calc(var(--h)/-2) 0 0 calc(var(--d)/-2);transform:rotateY(-90deg) translateZ(calc(var(--w)/2));filter:brightness(.72)}
.f-top{width:var(--w);height:var(--d);margin:calc(var(--d)/-2) 0 0 calc(var(--w)/-2);transform:rotateX(90deg) translateZ(calc(var(--h)/2));filter:brightness(1.12)}
.f-bottom{width:var(--w);height:var(--d);margin:calc(var(--d)/-2) 0 0 calc(var(--w)/-2);transform:rotateX(-90deg) translateZ(calc(var(--h)/2));filter:brightness(.6)}
.glass>i{border:1px solid rgba(255,255,255,.55)}

/* scene */
.scene{position:absolute;left:0;right:0;bottom:0;height:380px;perspective:1100px;perspective-origin:45% 35%;overflow:hidden;pointer-events:none}
.ground{position:absolute;left:0;right:0;bottom:0;height:78px;background:linear-gradient(#cbd5e1,#94a3b8);box-shadow:inset 0 6px 0 #e2e8f0}
.road{position:absolute;left:0;right:0;top:34px;height:4px;background:repeating-linear-gradient(90deg,#fff 0 28px,transparent 28px 56px);opacity:.8}
.sun{position:absolute;top:26px;left:14%;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff7c2,#fbbf24);box-shadow:0 0 60px 18px rgba(251,191,36,.35)}
.cloud{position:absolute;height:22px;border-radius:999px;background:#fff;opacity:.9;box-shadow:18px -10px 0 4px #fff,-14px -4px 0 2px #fff}
.c1{top:70px;width:70px;left:-90px;animation:drift 38s linear infinite}
.c2{top:130px;width:50px;left:-90px;animation:drift 52s linear infinite 12s}
@keyframes drift{to{transform:translateX(980px)}}

/* building + gate */
.building{position:absolute;right:8%;bottom:70px;transform-style:preserve-3d;transform:rotateY(-26deg)}
.bfront{position:relative;width:100%;height:100%;transform-style:preserve-3d;background:linear-gradient(#f8fafc,#dbe4f0)}
.bsign{position:absolute;top:10px;left:0;right:0;text-align:center;font-weight:800;font-size:13px;color:#0066ff}
.windows{position:absolute;top:40px;left:16px;right:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.windows span{height:30px;border-radius:4px;background:#93c5fd;animation:blink 3s ease-in-out infinite}
@keyframes blink{0%,100%{background:#93c5fd}50%{background:#fde68a}}
.officeSign{width:100%;height:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;letter-spacing:.26em;text-indent:.26em;color:#fff;border:2px solid #475569;background:linear-gradient(#1e293b,#0f172a);text-shadow:0 0 8px #60a5fa,0 0 18px #3b82f6}
.gate{position:absolute;bottom:0;left:50%;width:92px;height:116px;margin-left:-46px;box-sizing:border-box;border:5px solid #475569;border-bottom:0;border-radius:6px 6px 0 0;background:linear-gradient(#fffbeb,#f59e0b);transform-style:preserve-3d;animation:lobby 11s linear infinite}
.leaf{position:absolute;top:0;bottom:0;width:50%;box-sizing:border-box;border:2px solid #94a3b8;background:linear-gradient(115deg,rgba(125,211,252,.72),rgba(224,242,254,.38) 45%,rgba(56,189,248,.62));transform-style:preserve-3d}
.leaf.l{left:0;transform-origin:left center;animation:doorL 11s ease-in-out infinite}
.leaf.r{right:0;transform-origin:right center;animation:doorR 11s ease-in-out infinite}
.decal{position:absolute;top:28%;left:0;right:0;text-align:center;font-size:7.5px;font-weight:800;letter-spacing:.08em;color:#fff;text-shadow:0 1px 2px rgba(15,23,42,.55)}
.bar{position:absolute;top:46%;width:4px;height:30px;border-radius:2px;background:linear-gradient(#f1f5f9,#64748b)}
.leaf.l .bar{right:3px}
.leaf.r .bar{left:3px}
@keyframes doorL{0%,59%{transform:rotateY(0)}68%,78%{transform:rotateY(105deg)}87%,100%{transform:rotateY(0)}}
@keyframes doorR{0%,59%{transform:rotateY(0)}68%,78%{transform:rotateY(-105deg)}87%,100%{transform:rotateY(0)}}
@keyframes lobby{0%,58%{box-shadow:none}68%,80%{box-shadow:0 0 28px 8px rgba(253,224,71,.75)}88%,100%{box-shadow:none}}

/* walker: along the façade, turn to the gate, push, walk inside */
.travel{position:absolute;left:0;top:130px;width:80px;height:130px;transform-style:preserve-3d;transform-origin:50% 100%;scale:.84;animation:travel 11s linear infinite}
@keyframes travel{
  0%{transform:translate3d(-470px,0,96px);opacity:0}
  5%{opacity:1}
  52%{transform:translate3d(55px,0,96px);opacity:1}
  66%{transform:translate3d(55px,0,96px);opacity:1}
  76%{transform:translate3d(55px,0,14px);opacity:1}
  80%{transform:translate3d(55px,0,-12px);opacity:0}
  100%{transform:translate3d(55px,0,-12px);opacity:0}
}
.shadow{position:absolute;left:6px;right:-10px;bottom:-8px;height:12px;border-radius:50%;background:rgba(15,23,42,.28);filter:blur(4px)}
.bob{transform-style:preserve-3d;animation:bob .8s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}25%,75%{transform:translateY(-3px)}50%{transform:translateY(0)}}
.figure{position:relative;width:80px;height:130px;transform-style:preserve-3d;transform:rotateY(70deg);animation:turn 11s linear infinite}
@keyframes turn{0%,52%{transform:rotateY(70deg)}58%,100%{transform:rotateY(180deg)}}
.part,.pivot{position:absolute;transform-style:preserve-3d}
.pivot{height:0;transform-origin:50% 0}
.kLegA{animation:legA 11s ease-in-out infinite}
.kLegB{animation:legB 11s ease-in-out infinite}
.kFront{animation:armFront 11s ease-in-out infinite}
.eyes{display:flex;justify-content:space-around;padding:9px 3px 0}
.eyes b{width:4px;height:4px;border-radius:50%;background:#0f172a}
.tie{width:5px;height:26px;margin:4px auto 0;background:#fff;opacity:.9}
${GAIT}

/* 3D form card */
.card-float{transform-style:preserve-3d;animation:cardIn .9s cubic-bezier(.2,.8,.2,1) both,floaty 6s ease-in-out .9s infinite}
@keyframes cardIn{from{opacity:0;transform:perspective(1200px) translateY(60px) rotateX(-24deg) rotateY(14deg)}to{opacity:1;transform:perspective(1200px) translateY(0) rotateX(0) rotateY(0)}}
@keyframes floaty{0%,100%{transform:perspective(1200px) translateY(0) rotateZ(0)}50%{transform:perspective(1200px) translateY(-9px) rotateZ(.25deg)}}
.card-border{transform-style:preserve-3d;background:linear-gradient(120deg,#60a5fa,#a78bfa,#22d3ee,#60a5fa);background-size:300% 300%;animation:borderMove 7s ease infinite}
@keyframes borderMove{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.card-inner{transform-style:preserve-3d}
.p3d{transform-style:preserve-3d}
.p3d>*{translate:0 0 10px}
.zh{translate:0 0 30px}
.zb{translate:0 0 26px}
.spin{position:absolute;transform-style:preserve-3d;animation:spin 16s linear infinite}
@keyframes spin{from{transform:rotateX(25deg) rotateY(0)}to{transform:rotateX(385deg) rotateY(360deg)}}
.shine{position:relative;overflow:hidden}
.shine::after{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-20deg);animation:shine 3.2s ease-in-out infinite}
@keyframes shine{0%{left:-60%}60%,100%{left:130%}}

@media (prefers-reduced-motion:reduce){
  .travel{animation:none;transform:translate3d(-100px,0,96px)}
  .figure{animation:none}
  .bob,.kLegA,.kLegB,.kFront,.cloud,.card-border,.card-float,.spin,.shine::after,.windows span,.leaf,.gate{animation:none}
}
`

/* ───────────────────────── Small UI pieces ───────────────────────── */

const ICONS = {
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  eyeOff: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18',
}

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICONS[name]} />
    </svg>
  )
}

// Defined outside Login so inputs never lose focus while typing
function Field({ label, icon, type = 'text', name, placeholder, value, onChange, onKeyDown, onToggle, shown, autoComplete }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0066ff] transition-colors">
          <Icon name={icon} />
        </div>
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          className={`w-full pl-11 ${onToggle ? 'pr-11' : 'pr-4'} py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none transition-all duration-300 focus:bg-white focus:border-[#0066ff] focus:ring-4 focus:ring-[#0066ff]/15 focus:shadow-lg focus:shadow-blue-500/10`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyDown}
        />
        {onToggle && (
          <button type="button" aria-label={shown ? 'Hide password' : 'Show password'} onClick={onToggle}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700">
            <Icon name={shown ? 'eye' : 'eyeOff'} />
          </button>
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
}

function Logo({ dark }) {
  return (
    <Link to="/" className={`flex items-center gap-3 no-underline ${dark ? 'text-white' : 'text-slate-900'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-white/15 text-white' : 'bg-blue-50 text-blue-600'}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold text-xl leading-none tracking-tight">AttendPro</span>
        <span className={`text-[10px] font-semibold tracking-wider ${dark ? 'text-white/70' : 'text-slate-500'}`}>Attendance Management</span>
      </div>
    </Link>
  )
}

/* ───────────────────────── Page ───────────────────────── */

export default function Login({ defaultTab = 'login' }) {
  const { login, signup, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = searchParams.get('tab') || defaultTab
  const [activeTab, setActiveTab] = useState(initialTab)
  const [flip, setFlip] = useState(false)

  const [form, setForm] = useState({ name: '', emailOrId: '', password: '', confirm: '', phone: '', terms: true })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [capsLockOn, setCapsLockOn] = useState(false)

  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMsg, setForgotMsg] = useState('')

  const [clusterInfo, setClusterInfo] = useState({ status: 'online', workerId: 'Node-1', latencyMs: 14 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const savedEmail = localStorage.getItem('nexora_saved_login')
    if (savedEmail) setForm((prev) => ({ ...prev, emailOrId: savedEmail }))
    captureLocationInfo().catch(() => {})

    const start = performance.now()
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        const duration = Math.round(performance.now() - start)
        setClusterInfo({ status: 'online', workerId: data.workerId || 'Node-1', latencyMs: duration || 12 })
      })
      .catch(() => setClusterInfo({ status: 'online', workerId: 'Worker-Cluster', latencyMs: 16 }))
  }, [])

  // Card flips 90° out, content swaps, flips back in
  const goTab = (tab) => {
    if (tab === activeTab || flip) return
    setFlip(true)
    setTimeout(() => {
      setActiveTab(tab)
      setSearchParams(tab === 'login' ? {} : { tab })
      setErrorMsg('')
      setSuccessMsg('')
      setFlip(false)
    }, 260)
  }

  const handleKeyDown = (e) => {
    if (e.getModifierState) setCapsLockOn(e.getModifierState('CapsLock'))
  }

  const getPasswordStrength = (pass) => {
    if (!pass) return 0
    let s = 0
    if (pass.length >= 6) s++
    if (pass.length >= 10) s++
    if (/[0-9]/.test(pass)) s++
    if (/[^A-Za-z0-9]/.test(pass)) s++
    return s
  }
  const passStrength = getPasswordStrength(form.password)
  const strengthMeta = [
    { label: '', color: 'bg-slate-200' },
    { label: 'Weak', color: 'bg-red-400' },
    { label: 'Fair', color: 'bg-amber-400' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ][passStrength]

  const onCardMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: -py * 8, y: px * 8 })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    if (!form.emailOrId.trim()) return setErrorMsg('Please enter your Email or Employee ID')
    if (!form.password) return setErrorMsg('Please enter your password')

    setLoading(true)
    try {
      const loggedUser = await login(form.emailOrId.trim(), form.password, rememberMe)
      if (rememberMe) localStorage.setItem('nexora_saved_login', form.emailOrId.trim())
      else localStorage.removeItem('nexora_saved_login')
      setSuccessMsg('Signed in successfully ✓')
      toast.success(`Welcome back, ${loggedUser.fullName.split(' ')[0]}! 👋`)
      setTimeout(() => navigate(loggedUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'), 400)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid credentials. Please verify your login details.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    if (!form.name.trim()) return setErrorMsg('Please enter your full name')
    if (!form.emailOrId.trim() || !form.emailOrId.includes('@')) return setErrorMsg('Please enter a valid email address')
    if (form.password.length < 6) return setErrorMsg('Password must be at least 6 characters')
    if (form.password !== form.confirm) return setErrorMsg('Passwords do not match')
    if (!form.terms) return setErrorMsg('Please accept the Terms & Privacy Policy to proceed')

    setLoading(true)
    try {
      const newUser = await signup({
        fullName: form.name.trim(),
        email: form.emailOrId.trim(),
        password: form.password,
        phone: form.phone || '',
      })
      setSuccessMsg('Account created successfully ✓')
      toast.success(`Welcome to AttendPro, ${newUser.fullName}! 🎉`)
      setTimeout(() => navigate(newUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'), 400)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return setForgotMsg('Please enter your registered email')
    setForgotLoading(true)
    try {
      await authApi.forgotPassword({ email: forgotEmail.trim() })
      setForgotMsg('Password reset instructions sent if an account exists! Check your email.')
    } catch (err) {
      setForgotMsg(err.response?.data?.message || 'Reset request processed.')
    } finally {
      setForgotLoading(false)
    }
  }

  const submitBtn = 'zb shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0066ff] to-[#3b82f6] text-white py-3.5 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[.98] disabled:opacity-70'

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      <style>{css}</style>

      {/* ── LEFT: brand + 3D walking-to-office scene ── */}
      <div className="hidden lg:flex w-[55%] flex-col relative px-12 py-10 overflow-hidden bg-gradient-to-b from-[#dbeafe] via-[#eff6ff] to-white">
        <div className="relative z-10">
          <Logo />
          <div className="max-w-lg mt-10">
            <h1 className="text-[42px] font-black leading-[1.08] mb-4 tracking-tight text-slate-900">
              Manage attendance<br />
              <span className="text-[#0066ff]">smarter</span>, every day.
            </h1>
            <p className="text-slate-500 text-base mb-6 leading-relaxed">
              Track attendance, manage leaves, monitor working hours and keep your team productive — all in one simple platform.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-md">
              {[
                ['Easy Check-In/Out', 'Mark attendance with one click', 'bg-green-50 text-green-500'],
                ['Employee Management', 'Manage team and departments', 'bg-blue-50 text-blue-500'],
                ['Leave Management', 'Apply, approve and track leaves', 'bg-amber-50 text-amber-500'],
                ['Reports & Insights', 'Detailed attendance reports', 'bg-purple-50 text-purple-500'],
              ].map(([t, s, cls]) => (
                <div key={t} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}`}>
                    <Icon name="check" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{t}</h4>
                    <p className="text-slate-500 text-xs">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <WalkingScene />
      </div>

      {/* ── RIGHT: 3D animated form ── */}
      <div
        className="w-full lg:w-[45%] relative flex items-center justify-center p-6 bg-gradient-to-br from-[#0a1f5c] via-[#0b3bd6] to-[#0066ff] overflow-hidden"
        style={{ perspective: '1200px' }}
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-violet-500/30 blur-3xl" />

        {/* floating glass cubes */}
        <div className="spin" style={{ top: '9%', right: '10%' }}>
          <Box w={54} h={54} d={54} c="rgba(255,255,255,.14)" className="glass" />
        </div>
        <div className="spin" style={{ bottom: '10%', left: '9%', animationDuration: '22s', animationDirection: 'reverse' }}>
          <Box w={40} h={40} d={40} c="rgba(125,211,252,.2)" className="glass" />
        </div>

        <div className="relative z-10 w-full max-w-[430px]">
          <div className="lg:hidden mb-6 flex justify-center"><Logo dark /></div>

          <div className="card-float">
            <div
              onMouseMove={onCardMove}
              onMouseLeave={() => setTilt({ x: 0, y: 0 })}
              style={{ transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform .2s ease-out' }}
              className="card-border rounded-[28px] p-[1.5px] shadow-2xl shadow-black/40"
            >
              <div
                className="card-inner bg-white rounded-[27px] p-8"
                style={{ transform: `rotateY(${flip ? 90 : 0}deg)`, transition: 'transform .26s ease-in-out' }}
              >
                <div className="text-center mb-7 zh">
                  <h2 className="text-3xl font-black text-slate-900 mb-1.5 tracking-tight">
                    {activeTab === 'signup' ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {activeTab === 'signup' ? 'Sign up to start managing attendance' : 'Login to your account to continue'}
                  </p>
                </div>

                {/* Login */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="p3d space-y-5" noValidate>
                    <Field label="Email Address" icon="mail" name="emailOrId" autoComplete="username" placeholder="Enter your email"
                      value={form.emailOrId} onChange={(e) => setForm({ ...form, emailOrId: e.target.value })} />
                    <div>
                      <Field label="Password" icon="lock" name="password" autoComplete="current-password" placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'} value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        onKeyDown={handleKeyDown} onToggle={() => setShowPassword(!showPassword)} shown={showPassword} />
                      {capsLockOn && <span className="text-xs text-amber-500 font-bold block mt-1.5">⚠️ Caps Lock ON</span>}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 text-[#0066ff] focus:ring-[#0066ff] border-slate-300 rounded"
                          checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                        Remember me
                      </label>
                      <button type="button" onClick={() => { setForgotMsg(''); setShowForgotModal(true) }} className="font-bold text-[#0066ff] hover:text-blue-800">
                        Forgot Password?
                      </button>
                    </div>

                    <button type="submit" disabled={loading} className={submitBtn}>
                      {loading ? <><Spinner /> Authenticating...</> : 'Login'}
                    </button>

                    {errorMsg && <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl text-center border border-red-100">{errorMsg}</div>}
                    {successMsg && <div className="p-3 bg-green-50 text-green-600 text-sm font-semibold rounded-xl text-center border border-green-100">{successMsg}</div>}

                    <div className="text-center text-sm text-slate-500 font-medium">
                      Don't have an account?{' '}
                      <button type="button" onClick={() => goTab('signup')} className="text-[#0066ff] font-bold hover:underline">Sign Up</button>
                    </div>
                  </form>
                )}

                {/* Signup */}
                {activeTab === 'signup' && (
                  <form onSubmit={handleSignupSubmit} className="p3d space-y-4" noValidate>
                    <Field label="Full Name" icon="user" name="name" autoComplete="name" placeholder="Enter your full name"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Field label="Email Address" icon="mail" name="email" type="email" autoComplete="email" placeholder="Enter your email"
                      value={form.emailOrId} onChange={(e) => setForm({ ...form, emailOrId: e.target.value })} />
                    <div>
                      <Field label="Password" icon="lock" name="new-password" autoComplete="new-password" placeholder="Create a password"
                        type={showPassword ? 'text' : 'password'} value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        onToggle={() => setShowPassword(!showPassword)} shown={showPassword} />
                      {form.password && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3, 4].map((i) => (
                              <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passStrength ? strengthMeta.color : 'bg-slate-200'}`} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-500 w-12 text-right">{strengthMeta.label}</span>
                        </div>
                      )}
                    </div>
                    <Field label="Confirm Password" icon="check" name="confirm" autoComplete="new-password" placeholder="Confirm your password"
                      type={showConfirmPassword ? 'text' : 'password'} value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)} shown={showConfirmPassword} />

                    <label className="flex items-start gap-2 text-xs text-slate-500 leading-tight cursor-pointer">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 text-[#0066ff] focus:ring-[#0066ff] border-slate-300 rounded"
                        checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
                      <span>I agree to the <span className="text-[#0066ff] font-bold">Terms of Service</span> and <span className="text-[#0066ff] font-bold">Privacy Policy</span></span>
                    </label>

                    <button type="submit" disabled={loading} className={submitBtn}>
                      {loading ? <><Spinner /> Creating Account...</> : 'Create Account'}
                    </button>

                    {errorMsg && <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl text-center border border-red-100">{errorMsg}</div>}
                    {successMsg && <div className="p-3 bg-green-50 text-green-600 text-sm font-semibold rounded-xl text-center border border-green-100">{successMsg}</div>}

                    <div className="text-center text-sm text-slate-500 font-medium">
                      Already have an account?{' '}
                      <button type="button" onClick={() => goTab('login')} className="text-[#0066ff] font-bold hover:underline">Login</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/70 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1.5 align-middle" />
            Server {clusterInfo.status} · {clusterInfo.workerId} · {clusterInfo.latencyMs}ms
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowForgotModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 p-6">
            <h3 className="text-2xl font-black text-slate-900 mb-2 text-center" id="modal-title">Reset Password</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">
              Enter your registered email address and we'll send password reset instructions.
            </p>
            <form onSubmit={handleForgotSubmit}>
              <div className="mb-6">
                <Field label="Email Address" icon="mail" name="forgot-email" type="email" placeholder="Enter your email"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
              </div>
              {forgotMsg && <div className="mb-4 text-sm font-bold text-[#0066ff] p-3 bg-blue-50 rounded-xl text-center">{forgotMsg}</div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={forgotLoading}
                  className="flex-1 py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-xl transition-colors disabled:opacity-70">
                  {forgotLoading ? 'Processing...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}