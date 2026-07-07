// Store Pinia pour la gestion des éditeurs (CRUD, listes paginées)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/api/admin.service'

export const usePublisherStore = defineStore('publisher', () => {
  // Liste des éditeurs
  const publishers = ref([])
  // Informations de pagination
  const pagination = ref({})
  // Indicateur de chargement principal
  const isLoading = ref(false)
  // Indicateur de chargement pour les actions
  const isActionLoading = ref(false)
  // Message d'erreur
  const error = ref(null)

  /**
   * Récupère la liste paginée des éditeurs.
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Object>} Données paginées des éditeurs.
   */
  async function fetchPublishers(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getPublishers(params)
      const resultData = data.data ?? data
      publishers.value = Array.isArray(resultData) ? resultData : []
      pagination.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement éditeurs.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère tous les éditeurs (sans pagination, pour les listes déroulantes).
   * @returns {Promise<Array>} Liste de tous les éditeurs.
   */
  async function fetchAllPublishers() {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getAllPublishers()
      return data.publishers
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement éditeurs.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère un éditeur par son identifiant.
   * @param {number|string} id - Identifiant de l'éditeur.
   * @returns {Promise<Object>} Données de l'éditeur.
   */
  async function fetchPublisher(id) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getPublisher(id)
      return data.publisher
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Éditeur introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crée un nouvel éditeur.
   * @param {Object} data - Données de l'éditeur.
   * @returns {Promise<Object>} Résultat contenant l'éditeur créé.
   */
  async function createPublisher(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.createPublisher(data)
      publishers.value.unshift(result.publisher)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création éditeur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour un éditeur existant.
   * @param {number|string} id - Identifiant de l'éditeur.
   * @param {Object} data - Nouvelles données.
   * @returns {Promise<Object>} Résultat contenant l'éditeur mis à jour.
   */
  async function updatePublisher(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.updatePublisher(id, data)
      _updateInList(id, result.publisher)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour éditeur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Supprime un éditeur.
   * @param {number|string} id - Identifiant de l'éditeur.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
  async function deletePublisher(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.deletePublisher(id)
      _removeFromList(id)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suppression éditeur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour un éditeur dans la liste locale.
   * @param {number|string} id - Identifiant.
   * @param {Object} updatedPublisher - Données mises à jour.
   */
  function _updateInList(id, updatedPublisher) {
    const index = publishers.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const existing = publishers.value[index]
      publishers.value.splice(index, 1, { ...existing, ...updatedPublisher })
    }
  }

  /**
   * Retire un éditeur de la liste locale.
   * @param {number|string} id - Identifiant à retirer.
   */
  function _removeFromList(id) {
    publishers.value = publishers.value.filter(p => p.id !== id)
  }

  return {
    publishers,
    pagination,
    isLoading,
    isActionLoading,
    error,
    fetchPublishers,
    fetchAllPublishers,
    fetchPublisher,
    createPublisher,
    updatePublisher,
    deletePublisher,
  }
})
