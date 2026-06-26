import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useReferenceStore = defineStore('reference', () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const archivedReferences = ref([])
  const archivedPagination = ref({})
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

  // ─── Actions ────────────────────────────────────────────────────────────

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

  // ─── Helpers présentation ────────────────────────────────────────────────
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  return {
    archivedReferences,
    archivedPagination,
    isLoading,
    isActionLoading,
    error,
    fetchArchivedReferences,
    restoreReference,
    formatDate,
  }
})
