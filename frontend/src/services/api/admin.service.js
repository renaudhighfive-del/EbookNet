import api from '../api'

export const adminService = {
  // Stats
  async getStats() {
    const response = await api.get('/admin/stats')
    return response.data
  },

  async getDepositsByMonth() {
    const response = await api.get('/admin/stats/deposits-by-month')
    return response.data
  },

  async getReferencesByCategory() {
    const response = await api.get('/admin/stats/references-by-category')
    return response.data
  },

  // Users
  async approveUser(id) {
    const response = await api.patch(`/admin/users/${id}/approve`)
    return response.data
  },

  async suspendUser(id) {
    const response = await api.patch(`/admin/users/${id}/suspend`)
    return response.data
  },

  async validateSuspendUser(id) {
    const response = await api.patch(`/admin/users/${id}/validate-suspend`)
    return response.data
  },

  async updateUserRole(id, role) {
    const response = await api.patch(`/admin/users/${id}/role`, { role })
    return response.data
  },

  async restoreUser(id) {
    const response = await api.patch(`/admin/users/${id}/restore`)
    return response.data
  },

  // Categories
  async getCategories(params = {}) {
    const response = await api.get('/admin/categories', { params })
    return response.data
  },

  async getAllCategories() {
    const response = await api.get('/admin/categories/all')
    return response.data
  },

  async getCategory(id) {
    const response = await api.get(`/admin/categories/${id}`)
    return response.data
  },

  async createCategory(data) {
    const response = await api.post('/admin/categories', data)
    return response.data
  },

  async updateCategory(id, data) {
    const response = await api.put(`/admin/categories/${id}`, data)
    return response.data
  },

  async deleteCategory(id) {
    const response = await api.delete(`/admin/categories/${id}`)
    return response.data
  },

  async toggleCategoryStatus(id) {
    const response = await api.patch(`/admin/categories/${id}/status`)
    return response.data
  },

  // Authors
  async getAuthors(params = {}) {
    const response = await api.get('/admin/authors', { params })
    return response.data
  },

  async getAllAuthors() {
    const response = await api.get('/admin/authors/all')
    return response.data
  },

  async getAuthor(id) {
    const response = await api.get(`/admin/authors/${id}`)
    return response.data
  },

  async createAuthor(data) {
    const response = await api.post('/admin/authors', data)
    return response.data
  },

  async updateAuthor(id, data) {
    const response = await api.put(`/admin/authors/${id}`, data)
    return response.data
  },

  async deleteAuthor(id) {
    const response = await api.delete(`/admin/authors/${id}`)
    return response.data
  },

  // Publishers
  async getPublishers(params = {}) {
    const response = await api.get('/admin/publishers', { params })
    return response.data
  },

  async getAllPublishers() {
    const response = await api.get('/admin/publishers/all')
    return response.data
  },

  async getPublisher(id) {
    const response = await api.get(`/admin/publishers/${id}`)
    return response.data
  },

  async createPublisher(data) {
    const response = await api.post('/admin/publishers', data)
    return response.data
  },

  async updatePublisher(id, data) {
    const response = await api.put(`/admin/publishers/${id}`, data)
    return response.data
  },

  async deletePublisher(id) {
    const response = await api.delete(`/admin/publishers/${id}`)
    return response.data
  },

  // References
  async getReferences(params = {}) {
    const response = await api.get('/admin/references', { params })
    return response.data
  },

  async getArchivedReferences(params = {}) {
    const response = await api.get('/admin/references/archived', { params })
    return response.data
  },

  async getReference(id) {
    const response = await api.get(`/admin/references/${id}`)
    return response.data
  },

  async createReference(data) {
    const response = await api.post('/admin/references', data)
    return response.data
  },

  async updateReference(id, data) {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      return await api.post(`/admin/references/${id}`, data)
    }
    const response = await api.put(`/admin/references/${id}`, data)
    return response.data
  },

  async deleteReference(id) {
    const response = await api.delete(`/admin/references/${id}`)
    return response.data
  },

  async toggleReferenceStatus(id, status) {
    const response = await api.patch(`/admin/references/${id}/status`, { status })
    return response.data
  },

  async restoreReference(id) {
    const response = await api.patch(`/admin/references/${id}/restore`)
    return response.data
  },

  // Deposits
  async assignDeposit(id, managerId) {
    const response = await api.patch(`/admin/deposits/${id}/assign`, { assigned_manager_id: managerId })
    return response.data
  },

  async publishDeposit(id) {
    const response = await api.patch(`/admin/deposits/${id}/publish`)
    return response.data
  },

  // Activity Logs
  async getActivityLogs() {
    const response = await api.get('/admin/activity-logs')
    return response.data
  }
}
