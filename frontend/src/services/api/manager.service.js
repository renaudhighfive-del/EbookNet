import api from '../api'

export const managerService = {
  // Deposits
  async getDeposits() {
    const response = await api.get('/manager/deposits')
    return response.data
  },

  async getDeposit(id) {
    const response = await api.get(`/manager/deposits/${id}`)
    return response.data
  },

  async approveDeposit(id) {
    const response = await api.patch(`/manager/deposits/${id}/approve`)
    return response.data
  },

  async rejectDeposit(id) {
    const response = await api.patch(`/manager/deposits/${id}/reject`)
    return response.data
  }
}
