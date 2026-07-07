// Store Pinia pour la gestion des catégories (CRUD, activation/désactivation, listes)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminService } from '@/services/api/admin.service'

export const useCategoryStore = defineStore('category', () => {
  // Liste des catégories
  const categories = ref([])
  // Informations de pagination
  const pagination = ref({})
  // Indicateur de chargement principal
  const isLoading = ref(false)
  // Indicateur de chargement pour les actions
  const isActionLoading = ref(false)
  // Message d'erreur
  const error = ref(null)

  /**
   * Récupère la liste paginée des catégories.
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Object>} Données paginées des catégories.
   */
  async function fetchCategories(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getCategories(params)
      const resultData = data.data ?? data
      categories.value = Array.isArray(resultData) ? resultData : []
      pagination.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement catégories.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère toutes les catégories (sans pagination, pour les listes déroulantes).
   * @returns {Promise<Array>} Liste de toutes les catégories.
   */
  async function fetchAllCategories() {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getAllCategories()
      return data.categories
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement catégories.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère une catégorie par son identifiant.
   * @param {number|string} id - Identifiant de la catégorie.
   * @returns {Promise<Object>} Données de la catégorie.
   */
  async function fetchCategory(id) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getCategory(id)
      return data.category
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Catégorie introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crée une nouvelle catégorie.
   * @param {Object} data - Données de la catégorie.
   * @returns {Promise<Object>} Résultat contenant la catégorie créée.
   */
  async function createCategory(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.createCategory(data)
      categories.value.unshift(result.category)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création catégorie.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour une catégorie existante.
   * @param {number|string} id - Identifiant de la catégorie.
   * @param {Object} data - Nouvelles données.
   * @returns {Promise<Object>} Résultat contenant la catégorie mise à jour.
   */
  async function updateCategory(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.updateCategory(id, data)
      _updateInList(id, result.category)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour catégorie.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Supprime une catégorie.
   * @param {number|string} id - Identifiant de la catégorie.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
  async function deleteCategory(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.deleteCategory(id)
      _removeFromList(id)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suppression catégorie.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Active ou désactive une catégorie.
   * @param {number|string} id - Identifiant de la catégorie.
   * @returns {Promise<Object>} Résultat contenant la catégorie mise à jour.
   */
  async function toggleCategoryStatus(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.toggleCategoryStatus(id)
      _updateInList(id, result.category)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour statut.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour une catégorie dans la liste locale.
   * @param {number|string} id - Identifiant.
   * @param {Object} updatedCategory - Données mises à jour.
   */
  function _updateInList(id, updatedCategory) {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      const existing = categories.value[index]
      categories.value.splice(index, 1, { ...existing, ...updatedCategory })
    }
  }

  /**
   * Retire une catégorie de la liste locale.
   * @param {number|string} id - Identifiant à retirer.
   */
  function _removeFromList(id) {
    categories.value = categories.value.filter(c => c.id !== id)
  }

  // Catégories filtrées dont le statut est 'active'
  const activeCategories = computed(() => categories.value.filter(c => c.status === 'active'))

  return {
    categories,
    pagination,
    isLoading,
    isActionLoading,
    error,
    fetchCategories,
    fetchAllCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    activeCategories,
  }
})
