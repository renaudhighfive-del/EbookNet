import api from '../api'

export const planningService = {
  async getAvailability(date) {
    const response = await api.get('/planning/availability', { params: { date } })
    return response.data
  },

  async getAvailabilityMonth(month) {
    const response = await api.get('/planning/availability/month', { params: { month } })
    return response.data
  },

  async createAppointment(data) {
    const response = await api.post('/planning/appointments', data)
    return response.data
  },

  async getAppointmentStatus(id) {
    const response = await api.get(`/planning/appointments/${id}/status`)
    return response.data
  },

  async cancelAppointment(id) {
    const response = await api.post(`/planning/appointments/${id}/cancel`)
    return response.data
  }
}
