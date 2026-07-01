import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useReferenceStore = defineStore('reference', () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const references = ref([])
  const pagination = ref({})
  const archivedReferences = ref([])
  const archivedPagination = ref({})
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

  // ─── Actions ────────────────────────────────────────────────────────────

  /** GET /api/admin/references — Liste paginée des références (Admin uniquement) */
  async function fetchReferences(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/admin/references', { params })
      const data = res.data.data ?? res.data
      references.value = Array.isArray(data) ? data : []
      pagination.value = res.data
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement références.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** GET /api/admin/references/{id} — Détail d'une référence (Admin uniquement) */
  async function fetchReference(id) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get(`/admin/references/${id}`)
      return res.data.reference
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Référence introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** POST /api/admin/references — Créer une référence (Admin uniquement) */
  async function createReference(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.post('/admin/references', data)
      references.value.unshift(res.data.reference)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création référence.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PUT /api/admin/references/{id} — Modifier une référence (Admin uniquement) */
  async function updateReference(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      let res
      if (data instanceof FormData) {
        data.append('_method', 'PUT')
        res = await api.post(`/admin/references/${id}`, data)
      } else {
        res = await api.put(`/admin/references/${id}`, data)
      }
      _updateInList(id, res.data.reference)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour référence.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** DELETE /api/admin/references/{id} — Supprimer une référence (Admin uniquement) */
  async function deleteReference(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.delete(`/admin/references/${id}`)
      _removeFromList(id)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suppression référence.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PATCH /api/admin/references/{id}/status — Changer le statut (Admin uniquement) */
  async function toggleReferenceStatus(id, status) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/admin/references/${id}/status`, { status })
      _updateInList(id, res.data.reference)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur changement statut.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** GET /api/admin/references/archived — Liste des références archivées (Admin uniquement) */
  async function fetchArchivedReferences(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/admin/references/archived', { params })
      archivedReferences.value = res.data.data ?? []
      archivedPagination.value = res.data
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement références archivées.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** PATCH /api/admin/references/{id}/restore — Restaurer une référence archivée (Admin uniquement) */
  async function restoreReference(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/admin/references/${id}/restore`)
      // Retirer de la liste des archivés
      const index = archivedReferences.value.findIndex((r) => r.id === Number(id))
      if (index !== -1) {
        archivedReferences.value.splice(index, 1)
      }
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur restauration référence.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function _updateInList(id, updatedReference) {
    const index = references.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      const existing = references.value[index]
      references.value.splice(index, 1, { ...existing, ...updatedReference })
    }
  }

  function _removeFromList(id) {
    references.value = references.value.filter((r) => r.id !== id)
  }

  // ─── Helpers présentation ────────────────────────────────────────────────
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  const getDocumentTypeLabel = (type) => {
    const labels = {
      livre: 'Livre',
      memoire: 'Mémoire',
      these: 'Thèse',
      article: 'Article',
      revue: 'Revue',
      rapport: 'Rapport',
      guide: 'Guide',
      autre: 'Autre',
    }
    return labels[type] || type
  }

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Brouillon',
      published: 'Publié',
      archived: 'Archivé',
    }
    return labels[status] || status
  }

  const getStatusClass = (status) => {
    const classes = {
      draft: 'bg-gray-100 text-gray-600',
      published: 'bg-teal-50 text-teal-700',
      archived: 'bg-red-50 text-red-600',
    }
    return classes[status] || 'bg-gray-100 text-gray-600'
  }

  const getLanguageLabel = (lang) => {
    const labels = {
      fr: 'Français',
      en: 'Anglais',
      autre: 'Autre',
    }
    return labels[lang] || lang
  }

  return {
    // State
    references,
    pagination,
    archivedReferences,
    archivedPagination,
    isLoading,
    isActionLoading,
    error,
    // Actions
    fetchReferences,
    fetchReference,
    createReference,
    updateReference,
    deleteReference,
    toggleReferenceStatus,
    fetchArchivedReferences,
    restoreReference,
    // Helpers
    formatDate,
    getDocumentTypeLabel,
    getStatusLabel,
    getStatusClass,
    getLanguageLabel,
  }
})
