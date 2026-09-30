/**
 * Helper to capture employee login & attendance location metadata
 * Uses fast IP-lookup with fallback and optional browser GPS
 */

export const getDeviceInfo = () => {
  const ua = navigator.userAgent || ''
  let browser = 'Unknown Browser'
  let os = 'Unknown OS'
  let device = 'Desktop'

  if (/mobile/i.test(ua)) device = 'Mobile'
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet'

  if (/chrome|crios/i.test(ua)) browser = 'Chrome'
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua)) browser = 'Safari'
  else if (/edg/i.test(ua)) browser = 'Edge'
  else if (/opera|opr/i.test(ua)) browser = 'Opera'

  if (/windows/i.test(ua)) os = 'Windows'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'

  return { browser, os, device }
}

/**
 * Fast client location gatherer with fallback, GPS support and session cache
 */
export const captureLocationInfo = async () => {
  const deviceMeta = getDeviceInfo()
  const info = {
    ...deviceMeta,
    ip: '',
    city: '',
    region: '',
    country: '',
    latitude: null,
    longitude: null,
    address: '',
    source: 'IP Geolocation',
  }

  // Check cached session location for instant response
  try {
    const cached = sessionStorage.getItem('nexora_cached_loc')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed.city || parsed.country) {
        Object.assign(info, parsed, deviceMeta)
      }
    }
  } catch (e) {
    // ignore storage error
  }

  // 1. IP Geolocation Promise (ipwho.is first -> db-ip fallback -> ipapi fallback)
  const ipPromise = (async () => {
    // Try ipwho.is (fast, reliable, generous free tier)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      const res = await fetch('https://ipwho.is/', { signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.ok) {
        const data = await res.json()
        if (data.success !== false && (data.city || data.country)) {
          info.ip = data.ip || info.ip
          info.city = data.city || ''
          info.region = data.region || ''
          info.country = data.country || ''
          info.latitude = data.latitude || null
          info.longitude = data.longitude || null
          info.address = [data.city, data.region, data.country].filter(Boolean).join(', ')
          return
        }
      }
    } catch (e) {
      // continue to fallback
    }

    // Fallback 1: api.db-ip.com
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1800)
      const res = await fetch('https://api.db-ip.com/v2/free/self', { signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.ok) {
        const data = await res.json()
        if (data.city || data.countryName) {
          info.ip = data.ipAddress || info.ip
          info.city = data.city || ''
          info.region = data.stateProv || ''
          info.country = data.countryName || ''
          info.address = [data.city, data.stateProv, data.countryName].filter(Boolean).join(', ')
          return
        }
      }
    } catch (e) {
      // continue to fallback
    }

    // Fallback 2: ipapi.co
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1800)
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.ok) {
        const data = await res.json()
        if (!data.error && (data.city || data.country_name)) {
          info.ip = data.ip || info.ip
          info.city = data.city || ''
          info.region = data.region || ''
          info.country = data.country_name || data.country || ''
          info.latitude = data.latitude || info.latitude
          info.longitude = data.longitude || info.longitude
          info.address = [data.city, data.region, data.country_name].filter(Boolean).join(', ')
        }
      }
    } catch (e) {
      // silent
    }
  })()

  // 2. High-accuracy GPS coords if permitted
  const gpsPromise = new Promise((resolve) => {
    if (!navigator.geolocation) return resolve()
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos?.coords) {
          info.latitude = pos.coords.latitude
          info.longitude = pos.coords.longitude
          info.source = 'GPS + IP'
        }
        resolve()
      },
      () => resolve(),
      { timeout: 1500, maximumAge: 120000, enableHighAccuracy: false }
    )
  })

  // Wait max 2 seconds for both
  await Promise.race([
    Promise.all([ipPromise, gpsPromise]),
    new Promise((r) => setTimeout(r, 2200)),
  ])

  // Save in session cache
  try {
    sessionStorage.setItem('nexora_cached_loc', JSON.stringify(info))
  } catch (e) {}

  return info
}
