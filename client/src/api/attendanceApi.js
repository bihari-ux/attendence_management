import api from './axios'

export const attendanceApi = {
  start: (data) => api.post('/attendance/start', data || {}),
  stop: () => api.post('/attendance/stop'),
  startBreak: () => api.post('/attendance/break/start'),
  endBreak: () => api.post('/attendance/break/end'),
  today: () => api.get('/attendance/today'),
  history: (params) => api.get('/attendance/history', { params }),
  allToday: () => api.get('/attendance/all-today'),
  historyAdmin: (params) => api.get('/attendance/history-admin', { params }),
  breakHistory: (employeeId) => api.get(`/attendance/${employeeId}/breaks`),
}
