import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/api/admin.service'

export const usePublisherStore = defineStore('publisher', () => {
  const publishers = ref([])
  const pagination = ref({})
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

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

  function _updateInList(id, updatedPublisher) {
    const index = publishers.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const existing = publishers.value[index]
      publishers.value.splice(index, 1, { ...existing, ...updatedPublisher })
    }
  }

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
