import api from './axios'

export const reportApi = {
  attendance: (params) => api.get('/reports/attendance', { params }),
  tasks: (params) => api.get('/reports/tasks', { params }),
}
