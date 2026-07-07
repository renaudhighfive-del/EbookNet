// Store Pinia pour la gestion des références (CRUD, archivage, restauration)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/api/admin.service'

export const useReferenceStore = defineStore('reference', () => {
  // Liste des références actives
  const references = ref([])
  // Informations de pagination pour les références actives
  const pagination = ref({})
  // Liste des références archivées
  const archivedReferences = ref([])
  // Informations de pagination pour les références archivées
  const archivedPagination = ref({})
  // Indicateur de chargement principal
  const isLoading = ref(false)
  // Indicateur de chargement pour les actions
  const isActionLoading = ref(false)
  // Message d'erreur
  const error = ref(null)

  /**
   * Récupère la liste paginée des références actives.
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Object>} Données paginées des références.
   */
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

  /**
   * Récupère une référence par son identifiant.
   * @param {number|string} id - Identifiant de la référence.
   * @returns {Promise<Object>} Données de la référence.
   */
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

  /**
   * Crée une nouvelle référence.
   * @param {Object} data - Données de la référence.
   * @returns {Promise<Object>} Résultat contenant la référence créée.
   */
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

  /**
   * Met à jour une référence existante.
   * @param {number|string} id - Identifiant de la référence.
   * @param {Object} data - Nouvelles données.
   * @returns {Promise<Object>} Résultat contenant la référence mise à jour.
   */
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

  /**
   * Supprime une référence.
   * @param {number|string} id - Identifiant de la référence.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
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

  /**
   * Active ou désactive (archive) une référence selon le statut donné.
   * @param {number|string} id - Identifiant de la référence.
   * @param {string} status - Nouveau statut (published, archived, etc.).
   * @returns {Promise<Object>} Résultat contenant la référence mise à jour.
   */
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

  /**
   * Récupère la liste paginée des références archivées.
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Object>} Données paginées des références archivées.
   */
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

  /**
   * Restaure une référence archivée.
   * @param {number|string} id - Identifiant de la référence.
   * @returns {Promise<Object>} Résultat de la restauration.
   */
  async function restoreReference(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.restoreReference(id)
      // Retire la référence de la liste des archivées si présente
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

  /**
   * Met à jour une référence dans la liste locale.
   * @param {number|string} id - Identifiant.
   * @param {Object} updatedReference - Données mises à jour.
   */
  function _updateInList(id, updatedReference) {
    const index = references.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      const existing = references.value[index]
      references.value.splice(index, 1, { ...existing, ...updatedReference })
    }
  }

  /**
   * Retire une référence de la liste locale.
   * @param {number|string} id - Identifiant à retirer.
   */
  function _removeFromList(id) {
    references.value = references.value.filter((r) => r.id !== id)
  }

  /**
   * Formate une date au format court français.
   * @param {string|Date} d - Date à formater.
   * @returns {string} Date formatée.
   */
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  /**
   * Retourne le libellé d'un type de document.
   * @param {string} type - Code du type.
   * @returns {string} Libellé.
   */
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

  /**
   * Retourne le libellé d'un statut de référence.
   * @param {string} status - Code du statut.
   * @returns {string} Libellé.
   */
  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Brouillon',
      published: 'Publié',
      archived: 'Archivé',
    }
    return labels[status] || status
  }

  /**
   * Retourne la classe CSS pour un statut de référence.
   * @param {string} status - Code du statut.
   * @returns {string} Classe Tailwind.
   */
  const getStatusClass = (status) => {
    const classes = {
      draft: 'bg-gray-100 text-gray-600',
      published: 'bg-teal-50 text-teal-700',
      archived: 'bg-red-50 text-red-600',
    }
    return classes[status] || 'bg-gray-100 text-gray-600'
  }

  /**
   * Retourne le libellé d'une langue.
   * @param {string} lang - Code ISO de la langue.
   * @returns {string} Libellé.
   */
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
