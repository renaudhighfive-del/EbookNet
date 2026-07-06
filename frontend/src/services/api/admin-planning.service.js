import api from '../api'

export const adminPlanningService = {
  async getAvailabilityRules() {
    const response = await api.get('/admin/planning/availability-rules')
    return response.data
  },

  async createAvailabilityRule(data) {
    const response = await api.post('/admin/planning/availability-rules', data)
    return response.data
  },

  async updateAvailabilityRule(id, data) {
    const response = await api.put(`/admin/planning/availability-rules/${id}`, data)
    return response.data
  },

  async deleteAvailabilityRule(id) {
    const response = await api.delete(`/admin/planning/availability-rules/${id}`)
    return response.data
  },

  async createAvailabilityException(data) {
    const response = await api.post('/admin/planning/availability-exceptions', data)
    return response.data
  },

  async getAppointments(params = {}) {
    const response = await api.get('/admin/planning/appointments', { params })
    return response.data
  },

  async getCalendarAppointments(startDate, endDate) {
    const response = await api.get('/admin/planning/appointments/calendar', {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  async getAppointment(id) {
    const response = await api.get(`/admin/planning/appointments/${id}`)
    return response.data
  },

  async createManualAppointment(data) {
    const response = await api.post('/admin/planning/appointments/manual', data)
    return response.data
  },

  async updateAppointment(id, data) {
    const response = await api.put(`/admin/planning/appointments/${id}`, data)
    return response.data
  },

  async cancelAppointment(id, data = {}) {
    const response = await api.post(`/admin/planning/appointments/${id}/cancel`, data)
    return response.data
  },

  async getSettings() {
    const response = await api.get('/admin/planning/settings')
    return response.data
  },

  async updateSettings(data) {
    const response = await api.put('/admin/planning/settings', data)
    return response.data
  },

  async getGoogleCalendarStatus() {
    const response = await api.get('/admin/planning/google-calendar/status')
    return response.data
  },

  async getGoogleCalendarAuthorizeUrl() {
    const response = await api.get('/admin/planning/google-calendar/authorize')
    return response.data
  },

  async disconnectGoogleCalendar() {
    const response = await api.post('/admin/planning/google-calendar/disconnect')
    return response.data
  },
}
