import api from './axios'

export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getOne: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  updateStatus: (id, status) => api.patch(`/employees/${id}/status`, { status }),
  remove: (id) => api.delete(`/employees/${id}`),
  resetPassword: (id, data) => api.patch(`/employees/${id}/reset-password`, typeof data === 'string' ? { password: data } : data),
  resetAllPasswords: (data) => api.post('/employees/reset-all-passwords', typeof data === 'string' ? { password: data } : data),
}
