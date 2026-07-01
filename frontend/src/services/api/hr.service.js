import api from '../api'

export const hrService = {
  // Users
  async getUsers(params = {}) {
    const response = await api.get('/hr/users', { params })
    return response.data
  },

  async getArchivedUsers(params = {}) {
    const response = await api.get('/hr/users/archived', { params })
    return response.data
  },

  async getUser(id) {
    const response = await api.get(`/hr/users/${id}`)
    return response.data
  },

  async createUser(data) {
    const response = await api.post('/hr/users', data)
    return response.data
  },

  async updateUser(id, data) {
    const response = await api.put(`/hr/users/${id}`, data)
    return response.data
  },

  async updateUserStatus(id, status) {
    const response = await api.patch(`/hr/users/${id}/status`, { status })
    return response.data
  },

  async archiveUser(id) {
    const response = await api.delete(`/hr/users/${id}`)
    return response.data
  },

  async requestSuspendUser(id) {
    const response = await api.patch(`/hr/users/${id}/request-suspend`)
    return response.data
  },

  async approveUser(id) {
    const response = await api.patch(`/hr/users/${id}/approve`)
    return response.data
  },

  // Activity Logs
  async getActivityLogs() {
    const response = await api.get('/hr/activity-logs')
    return response.data
  }
}
