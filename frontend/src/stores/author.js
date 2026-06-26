import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthorStore = defineStore('author', () => {
  // ─── State ──────────────────────────────────────────────────────────────

  const authors = ref([])
  const pagination = ref({})
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

  // ─── Actions ─────────────────────────────────────────────────────────────

  /** GET /api/admin/authors — Liste paginée des auteurs */
  async function fetchAuthors(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/admin/authors', { params })
      // Gérer différents formats de réponse
      const data = res.data.data ?? res.data
      authors.value = Array.isArray(data) ? data : []
      pagination.value = res.data
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement auteurs.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** GET /api/admin/authors/all — Liste toutes les auteurs (pour select) */
  async function fetchAllAuthors() {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/admin/authors/all')
      return res.data.authors
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement auteurs.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** GET /api/admin/authors/:id — Détail d'un auteur */
  async function fetchAuthor(id) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get(`/admin/authors/${id}`)
      return res.data.author
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Auteur introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** POST /api/admin/authors — Créer un auteur */
  async function createAuthor(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.post('/admin/authors', data)
      authors.value.unshift(res.data.author)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création auteur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PUT /api/admin/authors/:id — Modifier un auteur */
  async function updateAuthor(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.put(`/admin/authors/${id}`, data)
      _updateInList(id, res.data.author)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour auteur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** DELETE /api/admin/authors/:id — Supprimer un auteur */
  async function deleteAuthor(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.delete(`/admin/authors/${id}`)
      _removeFromList(id)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suppression auteur.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

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

  // ─── Getters ─────────────────────────────────────────────────────────────

  return {
    // State
    authors,
    pagination,
    isLoading,
    isActionLoading,
    error,
    // Actions
    fetchAuthors,
    fetchAllAuthors,
    fetchAuthor,
    createAuthor,
    updateAuthor,
    deleteAuthor,
  }
})
