import api from '../api'

/**
 * Service de planning côté utilisateur.
 * Gère la consultation des disponibilités, la création et l'annulation
 * des rendez-vous ainsi que le suivi de leur statut.
 */
export const planningService = {
  /**
   * Récupère les disponibilités pour une date donnée.
   * @param {string} date - Date au format YYYY-MM-DD.
   * @returns {Promise<Array>} Créneaux de disponibilité.
   */
  async getAvailability(date) {
    const response = await api.get('/planning/availability', { params: { date } })
    return response.data
  },

  /**
   * Récupère les disponibilités pour un mois complet.
   * @param {string} month - Mois au format YYYY-MM.
   * @returns {Promise<Array>} Disponibilités du mois.
   */
  async getAvailabilityMonth(month) {
    const response = await api.get('/planning/availability/month', { params: { month } })
    return response.data
  },

  /**
   * Récupère les rendez-vous pour un affichage calendrier entre deux dates.
   * @param {string} startDate - Date de début (YYYY-MM-DD).
   * @param {string} endDate - Date de fin (YYYY-MM-DD).
   * @returns {Promise<Array>} Liste des rendez-vous.
   */
  async getCalendarAppointments(startDate, endDate) {
    const response = await api.get('/planning/appointments', {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    })

   return response.data
  },

  /**
   * Crée un nouveau rendez-vous.
   * @param {Object} data - Données du rendez-vous.
   * @returns {Promise<Object>} Rendez-vous créé.
   */
  async createAppointment(data) {
    const response = await api.post('/planning/appointments', data)
    return response.data
  },

  /**
   * Récupère le statut d'un rendez-vous.
   * @param {number|string} id - Identifiant du rendez-vous.
   * @returns {Promise<Object>} Statut du rendez-vous.
   */
  async getAppointmentStatus(id) {
    const response = await api.get(`/planning/appointments/${id}/status`)
    return response.data
  },

  /**
   * Annule un rendez-vous.
   * @param {number|string} id - Identifiant du rendez-vous.
   * @returns {Promise<Object>} Résultat de l'annulation.
   */
  async cancelAppointment(id) {
    const response = await api.post(`/planning/appointments/${id}/cancel`)
    return response.data
  }
}
