import api from './axios'

export const departmentApi = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  remove: (id) => api.delete(`/departments/${id}`),
}
