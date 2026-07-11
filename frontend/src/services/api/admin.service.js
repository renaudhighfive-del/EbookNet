import api from '../api'

/**
 * Service d'administration centralisé.
 * Gère les statistiques, la gestion des utilisateurs, des catégories,
 * des auteurs, des éditeurs, des références, des dépôts et des journaux d'activité.
 */
export const adminService = {
  // Stats
  /**
   * Récupère les statistiques générales du panneau d'administration.
   * @returns {Promise<Object>} Statistiques générales.
   */
  async getStats() {
    const response = await api.get('/admin/stats')
    return response.data
  },

  /**
   * Récupère le nombre de dépôts groupés par mois.
   * @returns {Promise<Array>} Données des dépôts par mois.
   */
  async getDepositsByMonth() {
    const response = await api.get('/admin/stats/deposits-by-month')
    return response.data
  },

  /**
   * Récupère le nombre de références groupées par catégorie.
   * @returns {Promise<Array>} Données des références par catégorie.
   */
  async getReferencesByCategory() {
    const response = await api.get('/admin/stats/references-by-category')
    return response.data
  },

  // Users
  /**
   * Approuve un utilisateur en attente.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Utilisateur approuvé.
   */
  async approveUser(id) {
    const response = await api.patch(`/admin/users/${id}/approve`)
    return response.data
  },

  /**
   * Suspend un utilisateur actif.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Utilisateur suspendu.
   */
  async suspendUser(id) {
    const response = await api.patch(`/admin/users/${id}/suspend`)
    return response.data
  },

  /**
   * Valide ou refuse la suspension demandée pour un utilisateur.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Résultat de la validation.
   */
  async validateSuspendUser(id) {
    const response = await api.patch(`/admin/users/${id}/validate-suspend`)
    return response.data
  },

  /**
   * Met à jour le rôle d'un utilisateur.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @param {string} role - Nouveau rôle (admin, manager, hr, user).
   * @returns {Promise<Object>} Utilisateur mis à jour.
   */
  async updateUserRole(id, role) {
    const response = await api.patch(`/admin/users/${id}/role`, { role })
    return response.data
  },

  /**
   * Restaure un utilisateur précédemment supprimé ou suspendu.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Utilisateur restauré.
   */
  async restoreUser(id) {
    const response = await api.patch(`/admin/users/${id}/restore`)
    return response.data
  },

  // Categories
  /**
   * Récupère la liste paginée des catégories.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des catégories.
   */
  async getCategories(params = {}) {
    const response = await api.get('/admin/categories', { params })
    return response.data
  },

  /**
   * Récupère toutes les catégories (sans pagination).
   * @returns {Promise<Array>} Liste complète des catégories.
   */
  async getAllCategories() {
    const response = await api.get('/admin/categories/all')
    return response.data
  },

  /**
   * Récupère une catégorie par son identifiant.
   * @param {number|string} id - Identifiant de la catégorie.
   * @returns {Promise<Object>} Détails de la catégorie.
   */
  async getCategory(id) {
    const response = await api.get(`/admin/categories/${id}`)
    return response.data
  },

  /**
   * Crée une nouvelle catégorie.
   * @param {Object} data - Données de la catégorie.
   * @returns {Promise<Object>} Catégorie créée.
   */
  async createCategory(data) {
    const response = await api.post('/admin/categories', data)
    return response.data
  },

  /**
   * Met à jour une catégorie existante.
   * @param {number|string} id - Identifiant de la catégorie.
   * @param {Object} data - Nouvelles données de la catégorie.
   * @returns {Promise<Object>} Catégorie mise à jour.
   */
  async updateCategory(id, data) {
    const response = await api.put(`/admin/categories/${id}`, data)
    return response.data
  },

  /**
   * Supprime une catégorie.
   * @param {number|string} id - Identifiant de la catégorie.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
  async deleteCategory(id) {
    const response = await api.delete(`/admin/categories/${id}`)
    return response.data
  },

  /**
   * Active ou désactive une catégorie.
   * @param {number|string} id - Identifiant de la catégorie.
   * @returns {Promise<Object>} Catégorie avec statut mis à jour.
   */
  async toggleCategoryStatus(id) {
    const response = await api.patch(`/admin/categories/${id}/status`)
    return response.data
  },

  // Authors
  /**
   * Récupère la liste paginée des auteurs.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des auteurs.
   */
  async getAuthors(params = {}) {
    const response = await api.get('/admin/authors', { params })
    return response.data
  },

  /**
   * Récupère tous les auteurs (sans pagination).
   * @returns {Promise<Array>} Liste complète des auteurs.
   */
  async getAllAuthors() {
    const response = await api.get('/admin/authors/all')
    return response.data
  },

  /**
   * Récupère un auteur par son identifiant.
   * @param {number|string} id - Identifiant de l'auteur.
   * @returns {Promise<Object>} Détails de l'auteur.
   */
  async getAuthor(id) {
    const response = await api.get(`/admin/authors/${id}`)
    return response.data
  },

  /**
   * Crée un nouvel auteur.
   * @param {Object} data - Données de l'auteur.
   * @returns {Promise<Object>} Auteur créé.
   */
  async createAuthor(data) {
    const response = await api.post('/admin/authors', data)
    return response.data
  },

  /**
   * Met à jour un auteur existant.
   * @param {number|string} id - Identifiant de l'auteur.
   * @param {Object} data - Nouvelles données de l'auteur.
   * @returns {Promise<Object>} Auteur mis à jour.
   */
  async updateAuthor(id, data) {
    const response = await api.put(`/admin/authors/${id}`, data)
    return response.data
  },

  /**
   * Supprime un auteur.
   * @param {number|string} id - Identifiant de l'auteur.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
  async deleteAuthor(id) {
    const response = await api.delete(`/admin/authors/${id}`)
    return response.data
  },

  // Publishers
  /**
   * Récupère la liste paginée des éditeurs.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des éditeurs.
   */
  async getPublishers(params = {}) {
    const response = await api.get('/admin/publishers', { params })
    return response.data
  },

  /**
   * Récupère tous les éditeurs (sans pagination).
   * @returns {Promise<Array>} Liste complète des éditeurs.
   */
  async getAllPublishers() {
    const response = await api.get('/admin/publishers/all')
    return response.data
  },

  /**
   * Récupère un éditeur par son identifiant.
   * @param {number|string} id - Identifiant de l'éditeur.
   * @returns {Promise<Object>} Détails de l'éditeur.
   */
  async getPublisher(id) {
    const response = await api.get(`/admin/publishers/${id}`)
    return response.data
  },

  /**
   * Crée un nouvel éditeur.
   * @param {Object} data - Données de l'éditeur.
   * @returns {Promise<Object>} Éditeur créé.
   */
  async createPublisher(data) {
    const response = await api.post('/admin/publishers', data)
    return response.data
  },

  /**
   * Met à jour un éditeur existant.
   * @param {number|string} id - Identifiant de l'éditeur.
   * @param {Object} data - Nouvelles données de l'éditeur.
   * @returns {Promise<Object>} Éditeur mis à jour.
   */
  async updatePublisher(id, data) {
    const response = await api.put(`/admin/publishers/${id}`, data)
    return response.data
  },

  /**
   * Supprime un éditeur.
   * @param {number|string} id - Identifiant de l'éditeur.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
  async deletePublisher(id) {
    const response = await api.delete(`/admin/publishers/${id}`)
    return response.data
  },

  // References
  /**
   * Récupère la liste paginée des références.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des références.
   */
  async getReferences(params = {}) {
    const response = await api.get('/admin/references', { params })
    return response.data
  },

  /**
   * Récupère la liste paginée des références archivées.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des références archivées.
   */
  async getArchivedReferences(params = {}) {
    const response = await api.get('/admin/references/archived', { params })
    return response.data
  },

  /**
   * Récupère une référence par son identifiant.
   * @param {number|string} id - Identifiant de la référence.
   * @returns {Promise<Object>} Détails de la référence.
   */
  async getReference(id) {
    const response = await api.get(`/admin/references/${id}`)
    return response.data
  },

  /**
   * Crée une nouvelle référence.
   * @param {Object} data - Données de la référence.
   * @returns {Promise<Object>} Référence créée.
   */
  async createReference(data) {
    const response = await api.post('/admin/references', data)
    return response.data
  },

  /**
   * Met à jour une référence existante.
   * Supporte FormData pour l'upload de fichiers (méthode POST avec _method=PUT).
   * @param {number|string} id - Identifiant de la référence.
   * @param {Object|FormData} data - Nouvelles données ou FormData de la référence.
   * @returns {Promise<Object>} Référence mise à jour.
   */
  async updateReference(id, data) {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      return await api.post(`/admin/references/${id}`, data)
    }
    const response = await api.put(`/admin/references/${id}`, data)
    return response.data
  },

  /**
   * Supprime une référence (déplacement vers les archives).
   * @param {number|string} id - Identifiant de la référence.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
  async deleteReference(id) {
    const response = await api.delete(`/admin/references/${id}`)
    return response.data
  },

  /**
   * Active ou désactive une référence avec un statut donné.
   * @param {number|string} id - Identifiant de la référence.
   * @param {string} status - Nouveau statut (published, draft, etc.).
   * @returns {Promise<Object>} Référence avec statut mis à jour.
   */
  async toggleReferenceStatus(id, status) {
    const response = await api.patch(`/admin/references/${id}/status`, { status })
    return response.data
  },

  /**
   * Restaure une référence depuis les archives.
   * @param {number|string} id - Identifiant de la référence.
   * @returns {Promise<Object>} Référence restaurée.
   */
  async restoreReference(id) {
    const response = await api.patch(`/admin/references/${id}/restore`)
    return response.data
  },

  // Deposits
  /**
   * Récupère la liste paginée des dépôts.
   * @param {Object} [params={}] - Paramètres de pagination/filtrage.
   * @returns {Promise<Object>} Liste paginée des dépôts.
   */
  async getDeposits(params = {}) {
    const response = await api.get('/admin/deposits', { params })
    return response.data
  },

  /**
   * Récupère un dépôt par son identifiant.
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Détails du dépôt.
   */
  async getDeposit(id) {
    const response = await api.get(`/admin/deposits/${id}`)
    return response.data
  },

  /**
   * Assigne un dépôt à un manager.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {number|string} managerId - Identifiant du manager.
   * @returns {Promise<Object>} Dépôt mis à jour.
   */
  async assignDeposit(id, managerId) {
    const response = await api.patch(`/admin/deposits/${id}/assign`, { assigned_manager_id: managerId })
    return response.data
  },

  /**
   * Publie un dépôt dans le catalogue.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {Object} [meta={}] - { comment, adminOverride } — requis quand on
   *   publie après un refus responsable ("Passer outre & Publier") : le
   *   contrôleur exige alors un commentaire (min 50 caractères).
   * @returns {Promise<Object>} Dépôt publié + référence créée.
   */
  async publishDeposit(id, meta = {}) {
    const payload = {}
    if (meta.comment) payload.comment = meta.comment
    if (meta.adminOverride) payload.admin_override = true
    const response = await api.patch(`/admin/deposits/${id}/publish`, payload)
    return response.data
  },

  /**
   * Annule l'assignation d'un dépôt (retour à 'pending').
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Dépôt mis à jour.
   */
  async unassignDeposit(id) {
    const response = await api.patch(`/admin/deposits/${id}/unassign`)
    return response.data
  },

  /**
   * Envoie une relance au responsable assigné.
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Confirmation.
   */
  async remindDeposit(id) {
    const response = await api.patch(`/admin/deposits/${id}/remind`)
    return response.data
  },

  /**
   * Approuve un dépôt (action responsable).
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Dépôt approuvé.
   */
  async approveDeposit(id) {
    const response = await api.patch(`/admin/deposits/${id}/approve`)
    return response.data
  },

  /**
   * Rejette définitivement un dépôt.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {string} comment - Motif de rejet définitif.
   * @returns {Promise<Object>} Dépôt rejeté.
   */
  async rejectDeposit(id, comment) {
    const response = await api.patch(`/admin/deposits/${id}/reject-definitive`, { comment })
    return response.data
  },

  /**
   * Demande un second avis pour un dépôt.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {string} comment - Motif de la demande de second avis.
   * @returns {Promise<Object>} Dépôt mis à jour.
   */
  async requestSecondOpinion(id, comment) {
    const response = await api.patch(`/admin/deposits/${id}/second-opinion`, { comment })
    return response.data
  },

  /**
   * Dépublie un dépôt.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {string} comment - Motif de la dépublication.
   * @returns {Promise<Object>} Dépôt dépublié.
   */
  async unpublishDeposit(id, comment) {
    const response = await api.patch(`/admin/deposits/${id}/unpublish`, { comment })
    return response.data
  },

  // Managers
  /**
   * Récupère la liste des responsables disponibles.
   * @returns {Promise<Array>} Liste des responsables.
   */
  async getManagers() {
    const response = await api.get('/admin/deposits/managers')
    return response.data
  },

  /**
   * Récupère l'URL du fichier d'un dépôt.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {boolean} [inline=false - Si true, renvoie l'URL pour prévisualisation inline.
   * @returns {string} URL du fichier.
   */
  getDepositFileUrl(id, inline = false) {
    const url = `${import.meta.env.VITE_API_URL}/admin/deposits/${id}/file`
    return inline ? `${url}?inline=1` : url
  },

  // Activity Logs
  /**
   * Récupère les journaux d'activité de l'administration.
   * @returns {Promise<Array>} Liste des journaux d'activité.
   */
  async getActivityLogs() {
    const response = await api.get('/admin/activity-logs')
    return response.data
  }
}