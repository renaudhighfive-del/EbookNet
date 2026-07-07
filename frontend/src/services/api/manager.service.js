import api from '../api'

/**
 * Service de gestion des managers.
 * Permet la consultation et le traitement des dépôts
 * (approbation ou rejet avec justification).
 */
export const managerService = {
  // Deposits
  /**
   * Récupère la liste des dépôts assignés au manager.
   * @returns {Promise<Array>} Liste des dépôts.
   */
  async getDeposits() {
    const response = await api.get('/manager/deposits')
    return response.data
  },

  /**
   * Récupère un dépôt par son identifiant.
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Détails du dépôt.
   */
  async getDeposit(id) {
    const response = await api.get(`/manager/deposits/${id}`)
    return response.data
  },

  /**
   * Approuve un dépôt.
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Dépôt approuvé.
   */
  async approveDeposit(id) {
    const response = await api.patch(`/manager/deposits/${id}/approve`)
    return response.data
  },

  /**
   * Rejette un dépôt avec une justification.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {string} justification - Raison du rejet.
   * @returns {Promise<Object>} Dépôt rejeté.
   */
  async rejectDeposit(id, justification) {
    const response = await api.patch(`/manager/deposits/${id}/reject`, { justification })
    return response.data
  }
}
