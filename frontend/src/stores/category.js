import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useCategoryStore = defineStore('category', () => {
  // ─── State ──────────────────────────────────────────────────────────────

  const categories = ref([])
  const pagination = ref({})
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

  // ─── Actions ─────────────────────────────────────────────────────────────

  /** GET /api/admin/categories — Liste paginée des catégories */
  async function fetchCategories(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/admin/categories', { params })
      // Gérer différents formats de réponse
      const data = res.data.data ?? res.data
      categories.value = Array.isArray(data) ? data : []
      pagination.value = res.data
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement catégories.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** GET /api/admin/categories/all — Liste toutes les catégories actives (pour select) */
  async function fetchAllCategories() {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/admin/categories/all')
      return res.data.categories
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement catégories.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** GET /api/admin/categories/:id — Détail d'une catégorie */
  async function fetchCategory(id) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get(`/admin/categories/${id}`)
      return res.data.category
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Catégorie introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** POST /api/admin/categories — Créer une catégorie */
  async function createCategory(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.post('/admin/categories', data)
      categories.value.unshift(res.data.category)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création catégorie.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PUT /api/admin/categories/:id — Modifier une catégorie */
  async function updateCategory(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.put(`/admin/categories/${id}`, data)
      _updateInList(id, res.data.category)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour catégorie.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** DELETE /api/admin/categories/:id — Supprimer une catégorie */
  async function deleteCategory(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.delete(`/admin/categories/${id}`)
      _removeFromList(id)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suppression catégorie.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PATCH /api/admin/categories/:id/status — Activer/Désactiver une catégorie */
  async function toggleCategoryStatus(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/admin/categories/${id}/status`)
      _updateInList(id, res.data.category)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour statut.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function _updateInList(id, updatedCategory) {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      const existing = categories.value[index]
      categories.value.splice(index, 1, { ...existing, ...updatedCategory })
    }
  }

  function _removeFromList(id) {
    categories.value = categories.value.filter(c => c.id !== id)
  }

  // ─── Getters ─────────────────────────────────────────────────────────────

  const activeCategories = computed(() => categories.value.filter(c => c.status === 'active'))

  return {
    // State
    categories,
    pagination,
    isLoading,
    isActionLoading,
    error,
    // Actions
    fetchCategories,
    fetchAllCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    // Getters
    activeCategories,
  }
})
