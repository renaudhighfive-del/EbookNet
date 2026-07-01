import api from '../api'

export const userService = {
  async getDashboard() {
    const response = await api.get('/user/dashboard')
    return response.data
  },

  async getMyDeposits() {
    const response = await api.get('/user/deposits')
    return response.data
  },

  async createDeposit(data) {
    const response = await api.post('/user/deposits', data)
    return response.data
  }
}
