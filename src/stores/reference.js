import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/api/admin.service'

export const useReferenceStore = defineStore('reference', () => {
  const references = ref([])
  const pagination = ref({})
  const archivedReferences = ref([])
  const archivedPagination = ref({})
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

  async function fetchReferences(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getReferences(params)
      references.value = data.data ?? data
      pagination.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement références.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReference(id) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getReference(id)
      return data.reference
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Référence introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createReference(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.createReference(data)
      references.value.unshift(result.reference)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création référence.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function updateReference(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.updateReference(id, data)
      _updateInList(id, result.reference)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour référence.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function deleteReference(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.deleteReference(id)
      _removeFromList(id)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suppression référence.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function toggleReferenceStatus(id, status) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.toggleReferenceStatus(id, status)
      _updateInList(id, result.reference)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur changement statut.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function fetchArchivedReferences(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getArchivedReferences(params)
      archivedReferences.value = data.data ?? []
      archivedPagination.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement références archivées.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function restoreReference(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.restoreReference(id)
      const index = archivedReferences.value.findIndex((r) => r.id === Number(id))
      if (index !== -1) {
        archivedReferences.value.splice(index, 1)
      }
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur restauration référence.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

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
    references,
    pagination,
    archivedReferences,
    archivedPagination,
    isLoading,
    isActionLoading,
    error,
    fetchReferences,
    fetchReference,
    createReference,
    updateReference,
    deleteReference,
    toggleReferenceStatus,
    fetchArchivedReferences,
    restoreReference,
    formatDate,
    getDocumentTypeLabel,
    getStatusLabel,
    getStatusClass,
    getLanguageLabel,
  }
})
