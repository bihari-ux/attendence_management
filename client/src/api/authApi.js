import api from './axios'

export const authApi = {
  login:          (data)   => api.post('/auth/login', data),
  signupAdmin:    (data)   => api.post('/auth/signup', data),
  getMe:          ()       => api.get('/auth/me'),
  logout:         ()       => api.post('/auth/logout'),
  forgotPassword: (data)   => api.post('/auth/forgot-password', data),
  changePassword: (data)   => api.put('/auth/change-password', data),
  updateProfile:  (data)   => api.put('/auth/profile', data),
  getAdminStatus: ()       => api.get('/auth/admin-status'),
}
