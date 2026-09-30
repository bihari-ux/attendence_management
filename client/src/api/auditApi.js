import api from './axios'

export const auditApi = {
  getAll:     (params) => api.get('/audit-logs', { params }),
  myHistory:  (params) => api.get('/audit-logs/my-history', { params }),
}
