import api from './axios'

export const leaveApi = {
  getAll: (params) => api.get('/leaves', { params }),
  apply: (data) => api.post('/leaves', data),
  approve: (id, adminComment) => api.patch(`/leaves/${id}/approve`, { adminComment }),
  reject: (id, adminComment) => api.patch(`/leaves/${id}/reject`, { adminComment }),
}
