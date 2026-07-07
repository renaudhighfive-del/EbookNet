// Store Pinia pour la gestion des auteurs (CRUD, listes paginées)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/api/admin.service'

export const useAuthorStore = defineStore('author', () => {
  // Liste des auteurs
  const authors = ref([])
  // Informations de pagination
  const pagination = ref({})
  // Indicateur de chargement principal
  const isLoading = ref(false)
  // Indicateur de chargement pour les actions
  const isActionLoading = ref(false)
  // Message d'erreur
  const error = ref(null)

  /**
   * Récupère la liste paginée des auteurs.
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Object>} Données paginées des auteurs.
   */
  async function fetchAuthors(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getAuthors(params)
      const resultData = data.data ?? data
      authors.value = Array.isArray(resultData) ? resultData : []
      pagination.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement auteurs.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère tous les auteurs (sans pagination, pour les listes déroulantes).
   * @returns {Promise<Array>} Liste de tous les auteurs.
   */
  async function fetchAllAuthors() {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getAllAuthors()
      return data.authors
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement auteurs.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère un auteur par son identifiant.
   * @param {number|string} id - Identifiant de l'auteur.
   * @returns {Promise<Object>} Données de l'auteur.
   */
  async function fetchAuthor(id) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getAuthor(id)
      return data.author
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Auteur introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crée un nouvel auteur.
   * @param {Object} data - Données de l'auteur.
   * @returns {Promise<Object>} Résultat contenant l'auteur créé.
   */
  async function createAuthor(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.createAuthor(data)
      authors.value.unshift(result.author)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création auteur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour un auteur existant.
   * @param {number|string} id - Identifiant de l'auteur.
   * @param {Object} data - Nouvelles données.
   * @returns {Promise<Object>} Résultat contenant l'auteur mis à jour.
   */
  async function updateAuthor(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.updateAuthor(id, data)
      _updateInList(id, result.author)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour auteur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Supprime un auteur.
   * @param {number|string} id - Identifiant de l'auteur.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
  async function deleteAuthor(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.deleteAuthor(id)
      _removeFromList(id)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suppression auteur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour un auteur dans la liste locale (fusion avec l'existant).
   * @param {number|string} id - Identifiant de l'auteur.
   * @param {Object} updatedAuthor - Données mises à jour.
   */
  function _updateInList(id, updatedAuthor) {
    const index = authors.value.findIndex(a => a.id === id)
    if (index !== -1) {
      const existing = authors.value[index]
      authors.value.splice(index, 1, { ...existing, ...updatedAuthor })
    }
  }

  /**
   * Retire un auteur de la liste locale par son identifiant.
   * @param {number|string} id - Identifiant à retirer.
   */
  function _removeFromList(id) {
    authors.value = authors.value.filter(a => a.id !== id)
  }

  return {
    authors,
    pagination,
    isLoading,
    isActionLoading,
    error,
    fetchAuthors,
    fetchAllAuthors,
    fetchAuthor,
    createAuthor,
    updateAuthor,
    deleteAuthor,
  }
})
