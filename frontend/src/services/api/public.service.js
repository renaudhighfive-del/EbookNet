import api from '../api'

export const publicService = {
  async getStats() {
    const response = await api.get('/public/stats')
    return response.data
  },

  async getCategories() {
    const response = await api.get('/public/categories')
    return response.data
  },

  async getReferences(params = {}) {
    const response = await api.get('/public/references', { params })
    return response.data
  },

  async getLatestReferences() {
    const response = await api.get('/public/references/latest')
    return response.data
  },

  async getFeaturedReference() {
    const response = await api.get('/public/references/featured')
    return response.data
  },

  async getReference(id) {
    const response = await api.get(`/public/references/${id}`)
    return response.data
  },

  async search(query) {
    const response = await api.get('/public/search', { params: { q: query } })
    return response.data
  }
}
