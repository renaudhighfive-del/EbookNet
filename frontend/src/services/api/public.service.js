import api from '../api'

/**
 * Service public.
 * Fournit les données accessibles sans authentification :
 * statistiques, catégories, références et recherche.
 */
export const publicService = {
  /**
   * Récupère les statistiques publiques du site.
   * @returns {Promise<Object>} Statistiques publiques.
   */
  async getStats() {
    const response = await api.get('/public/stats')
    return response.data
  },

  /**
   * Récupère la liste des catégories publiques.
   * @returns {Promise<Array>} Liste des catégories.
   */
  async getCategories() {
    const response = await api.get('/public/categories')
    return response.data
  },

  /**
   * Récupère la liste paginée des références publiques.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des références.
   */
  async getReferences(params = {}) {
    const response = await api.get('/public/references', { params })
    return response.data
  },

  /**
   * Récupère les dernières références publiées.
   * @returns {Promise<Array>} Liste des dernières références.
   */
  async getLatestReferences() {
    const response = await api.get('/public/references/latest')
    return response.data
  },

  /**
   * Récupère la référence mise en avant.
   * @returns {Promise<Object>} Référence mise en avant.
   */
  async getFeaturedReference() {
    const response = await api.get('/public/references/featured')
    return response.data
  },

  /**
   * Récupère une référence par son identifiant.
   * @param {number|string} id - Identifiant de la référence.
   * @returns {Promise<Object>} Détails de la référence.
   */
  async getReference(id) {
    const response = await api.get(`/public/references/${id}`)
    return response.data
  },

  /**
   * Effectue une recherche publique.
   * @param {string} query - Terme de recherche.
   * @returns {Promise<Array>} Résultats de la recherche.
   */
  async search(query) {
    const response = await api.get('/public/search', { params: { q: query } })
    return response.data
  },
}
