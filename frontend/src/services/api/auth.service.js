import api from '../api'

/**
 * Service d'authentification.
 * Gère la connexion, l'inscription, la déconnexion et la récupération
 * des informations de l'utilisateur connecté.
 */
export const authService = {
  /**
   * Connecte un utilisateur avec ses identifiants.
   * @param {Object} credentials - Identifiants de connexion (email, mot de passe).
   * @returns {Promise<Object>} Données de l'utilisateur connecté et token.
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Inscrit un nouvel utilisateur.
   * @param {Object} data - Données d'inscription (nom, email, mot de passe, etc.).
   * @returns {Promise<Object>} Utilisateur créé.
   */
  async register(data) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  /**
   * Déconnecte l'utilisateur courant.
   * @returns {Promise<Object>} Confirmation de la déconnexion.
   */
  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  /**
   * Récupère les informations de l'utilisateur connecté.
   * @returns {Promise<Object>} Données du profil utilisateur.
   */
  async me() {
    const response = await api.get('/auth/me')
    return response.data
  }
}
