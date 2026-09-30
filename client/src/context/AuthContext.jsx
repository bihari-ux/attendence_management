import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

import { captureLocationInfo } from '../utils/locationHelper'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser))
          const res = await authApi.getMe()
          setUser(res.data.user)
          localStorage.setItem('user', JSON.stringify(res.data.user))
        } catch (err) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (emailOrId, password, rememberMe, locationInfo) => {
    let loc = locationInfo
    if (!loc) {
      try {
        loc = await captureLocationInfo()
      } catch (e) {
        loc = null
      }
    }
    const res = await authApi.login({ emailOrId, password, locationInfo: loc })
    const { token, user: loggedInUser } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    if (rememberMe) localStorage.setItem('rememberMe', 'true')
    setUser(loggedInUser)
    return loggedInUser
  }

  const signupAdmin = async (data) => {
    const res = await authApi.signupAdmin(data)
    const { token, user: newUser } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      // ignore network errors on logout
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signupAdmin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
