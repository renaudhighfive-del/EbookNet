import api from '../api'

/**
 * Service des ressources humaines (HR).
 * Gère la gestion des utilisateurs (création, modification, statut, archivage)
 * et la consultation des journaux d'activité.
 */
export const hrService = {
  // Users
  /**
   * Récupère la liste paginée des utilisateurs.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des utilisateurs.
   */
  async getUsers(params = {}) {
    const response = await api.get('/hr/users', { params })
    return response.data
  },

  /**
   * Récupère la liste des utilisateurs archivés.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des utilisateurs archivés.
   */
  async getArchivedUsers(params = {}) {
    const response = await api.get('/hr/users/archived', { params })
    return response.data
  },

  /**
   * Récupère un utilisateur par son identifiant.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Détails de l'utilisateur.
   */
  async getUser(id) {
    const response = await api.get(`/hr/users/${id}`)
    return response.data
  },

  /**
   * Crée un nouvel utilisateur.
   * @param {Object} data - Données de l'utilisateur (nom, email, rôle, etc.).
   * @returns {Promise<Object>} Utilisateur créé.
   */
  async createUser(data) {
    const response = await api.post('/hr/users', data)
    return response.data
  },

  /**
   * Met à jour un utilisateur existant.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @param {Object} data - Nouvelles données de l'utilisateur.
   * @returns {Promise<Object>} Utilisateur mis à jour.
   */
  async updateUser(id, data) {
    const response = await api.put(`/hr/users/${id}`, data)
    return response.data
  },

  /**
   * Met à jour le statut d'un utilisateur (actif, inactif, etc.).
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @param {string} status - Nouveau statut.
   * @returns {Promise<Object>} Utilisateur avec statut mis à jour.
   */
  async updateUserStatus(id, status) {
    const response = await api.patch(`/hr/users/${id}/status`, { status })
    return response.data
  },

  /**
   * Archive un utilisateur (suppression logique).
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Utilisateur archivé.
   */
  async archiveUser(id) {
    const response = await api.delete(`/hr/users/${id}`)
    return response.data
  },

  /**
   * Demande la suspension d'un utilisateur (en attente de validation admin).
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Résultat de la demande.
   */
  async requestSuspendUser(id) {
    const response = await api.patch(`/hr/users/${id}/request-suspend`)
    return response.data
  },

  /**
   * Approuve un utilisateur en attente de validation.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Utilisateur approuvé.
   */
  async approveUser(id) {
    const response = await api.patch(`/hr/users/${id}/approve`)
    return response.data
  },

  // Activity Logs
  /**
   * Récupère les journaux d'activité des ressources humaines.
   * @returns {Promise<Array>} Liste des journaux d'activité.
   */
  async getActivityLogs() {
    const response = await api.get('/hr/activity-logs')
    return response.data
  }
}
