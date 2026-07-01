import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/api/admin.service'

export const useAuthorStore = defineStore('author', () => {
  const authors = ref([])
  const pagination = ref({})
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

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

  function _updateInList(id, updatedAuthor) {
    const index = authors.value.findIndex(a => a.id === id)
    if (index !== -1) {
      const existing = authors.value[index]
      authors.value.splice(index, 1, { ...existing, ...updatedAuthor })
    }
  }

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
