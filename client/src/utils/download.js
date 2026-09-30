import api from '../api/axios'

// Downloads a file from an authenticated API endpoint as a blob (query-param tokens
// are not supported by the backend's Bearer-only auth, so we fetch via axios instead).
export const downloadCsv = async (path, params, filename) => {
  const res = await api.get(path, { params: { ...params, format: 'csv' }, responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
