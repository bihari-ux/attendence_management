import api from './axios'

export const dashboardApi = {
  admin: () => api.get('/dashboard/admin'),
  employee: () => api.get('/dashboard/employee'),
}
