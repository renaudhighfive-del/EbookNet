import api from '../api'

/**
 * Service utilisateur.
 * Gère le tableau de bord personnel, la consultation des dépôts
 * et la création de nouveaux dépôts.
 */
export const userService = {
  /**
   * Récupère les données du tableau de bord de l'utilisateur connecté.
   * @returns {Promise<Object>} Données du tableau de bord.
   */
  async getDashboard() {
    const response = await api.get('/user/dashboard')
    return response.data
  },

  /**
   * Récupère la liste des dépôts de l'utilisateur connecté.
   * @returns {Promise<Array>} Liste des dépôts.
   */
  async getMyDeposits() {
    const response = await api.get('/user/deposits')
    return response.data
  },

  /**
   * Crée un nouveau dépôt.
   * @param {Object} data - Données du dépôt.
   * @returns {Promise<Object>} Dépôt créé.
   */
  async createDeposit(data) {
    const response = await api.post('/user/deposits', data)
    return response.data
  },

  /**
   * Récupère un dépôt par son identifiant.
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Détails du dépôt.
   */
  async getDepositById(id) {
    const response = await api.get(`/user/deposits/${id}`)
    return response.data
  },

  /**
   * Récupère l'URL du fichier d'un dépôt.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {boolean} [inline=false - Si true, renvoie l'URL pour prévisualisation inl...
   * @returns {string} URL du fichier.
   */
  getDepositFileUrl(id, inline = false) {
    const url = `${import.meta.env.VITE_API_URL}/user/deposits/${id}/file`
    return inline ? `${url}?inline=1` : url
  }
}
