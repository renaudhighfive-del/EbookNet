import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminService } from '@/services/api/admin.service'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const pagination = ref({})
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

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
