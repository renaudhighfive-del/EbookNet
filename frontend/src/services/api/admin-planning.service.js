import api from '../api'

/**
 * Service de gestion du planning côté administrateur.
 * Permet la gestion des règles de disponibilité, des rendez-vous,
 * des paramètres de planning et de l'intégration Google Calendar.
 */
export const adminPlanningService = {
  /**
   * Récupère toutes les règles de disponibilité.
   * @returns {Promise<Array>} Liste des règles de disponibilité.
   */
  async getAvailabilityRules() {
    const response = await api.get('/admin/planning/availability-rules')
    return response.data
  },

  /**
   * Crée une nouvelle règle de disponibilité.
   * @param {Object} data - Données de la règle de disponibilité.
   * @returns {Promise<Object>} Règle de disponibilité créée.
   */
  async createAvailabilityRule(data) {
    const response = await api.post('/admin/planning/availability-rules', data)
    return response.data
  },

  /**
   * Met à jour une règle de disponibilité existante.
   * @param {number|string} id - Identifiant de la règle.
   * @param {Object} data - Nouvelles données de la règle.
   * @returns {Promise<Object>} Règle de disponibilité mise à jour.
   */
  async updateAvailabilityRule(id, data) {
    const response = await api.put(`/admin/planning/availability-rules/${id}`, data)
    return response.data
  },

  /**
   * Supprime une règle de disponibilité.
   * @param {number|string} id - Identifiant de la règle à supprimer.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
  async deleteAvailabilityRule(id) {
    const response = await api.delete(`/admin/planning/availability-rules/${id}`)
    return response.data
  },

  /**
   * Crée une exception de disponibilité.
   * @param {Object} data - Données de l'exception.
   * @returns {Promise<Object>} Exception créée.
   */
  async createAvailabilityException(data) {
    const response = await api.post('/admin/planning/availability-exceptions', data)
    return response.data
  },

  /**
   * Récupère la liste des rendez-vous avec filtres optionnels.
   * @param {Object} [params={}] - Paramètres de filtrage.
   * @returns {Promise<Array>} Liste des rendez-vous.
   */
  async getAppointments(params = {}) {
    const response = await api.get('/admin/planning/appointments', { params })
    return response.data
  },

  /**
   * Récupère les rendez-vous pour un affichage calendrier entre deux dates.
   * @param {string} startDate - Date de début (YYYY-MM-DD).
   * @param {string} endDate - Date de fin (YYYY-MM-DD).
   * @returns {Promise<Array>} Liste des rendez-vous pour le calendrier.
   */
  async getCalendarAppointments(startDate, endDate) {
    const response = await api.get('/admin/planning/appointments/calendar', {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  /**
   * Récupère un rendez-vous par son identifiant.
   * @param {number|string} id - Identifiant du rendez-vous.
   * @returns {Promise<Object>} Détails du rendez-vous.
   */
  async getAppointment(id) {
    const response = await api.get(`/admin/planning/appointments/${id}`)
    return response.data
  },

  /**
   * Crée manuellement un rendez-vous (sans réservation publique).
   * @param {Object} data - Données du rendez-vous.
   * @returns {Promise<Object>} Rendez-vous créé.
   */
  async createManualAppointment(data) {
    const response = await api.post('/admin/planning/appointments/manual', data)
    return response.data
  },

  /**
   * Met à jour un rendez-vous existant.
   * @param {number|string} id - Identifiant du rendez-vous.
   * @param {Object} data - Nouvelles données du rendez-vous.
   * @returns {Promise<Object>} Rendez-vous mis à jour.
   */
  async updateAppointment(id, data) {
    const response = await api.put(`/admin/planning/appointments/${id}`, data)
    return response.data
  },

  /**
   * Annule un rendez-vous avec une raison optionnelle.
   * @param {number|string} id - Identifiant du rendez-vous.
   * @param {Object} [data={}] - Données d'annulation (raison, etc.).
   * @returns {Promise<Object>} Résultat de l'annulation.
   */
  async cancelAppointment(id, data = {}) {
    const response = await api.post(`/admin/planning/appointments/${id}/cancel`, data)
    return response.data
  },

  /**
   * Récupère les paramètres du planning.
   * @returns {Promise<Object>} Paramètres du planning.
   */
  async getSettings() {
    const response = await api.get('/admin/planning/settings')
    return response.data
  },

  /**
   * Met à jour les paramètres du planning.
   * @param {Object} data - Nouveaux paramètres.
   * @returns {Promise<Object>} Paramètres mis à jour.
   */
  async updateSettings(data) {
    const response = await api.put('/admin/planning/settings', data)
    return response.data
  },

  /**
   * Vérifie le statut de la connexion Google Calendar.
   * @returns {Promise<Object>} Statut de la connexion Google Calendar.
   */
  async getGoogleCalendarStatus() {
    const response = await api.get('/admin/planning/google-calendar/status')
    return response.data
  },

  /**
   * Récupère l'URL d'autorisation Google Calendar.
   * @returns {Promise<Object>} URL d'autorisation.
   */
  async getGoogleCalendarAuthorizeUrl() {
    const response = await api.get('/admin/planning/google-calendar/authorize')
    return response.data
  },

  /**
   * Déconnecte Google Calendar du planning.
   * @returns {Promise<Object>} Résultat de la déconnexion.
   */
  async disconnectGoogleCalendar() {
    const response = await api.post('/admin/planning/google-calendar/disconnect')
    return response.data
  },
}
