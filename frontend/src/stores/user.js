// Store Pinia des utilisateurs
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hrService } from '@/services/api/hr.service'
import { adminService } from '@/services/api/admin.service'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  // Liste des utilisateurs
  const users = ref([])
  // Informations de pagination pour la liste principale
  const pagination = ref({})
  // Liste des utilisateurs archivés
  const archivedUsers = ref([])
  // Informations de pagination pour les archivés
  const archivedPagination = ref({})
  // Utilisateur actuellement consulté
  const currentUser = ref(null)
  // Indicateur de chargement principal
  const isLoading = ref(false)
  // Indicateur de chargement pour les actions
  const isActionLoading = ref(false)
  // Message d'erreur
  const error = ref(null)

  // Statistiques calculées à partir de la liste des utilisateurs
  const stats = computed(() => ({
    total: users.value.length,
    active: users.value.filter((u) => u.status === 'active').length,
    inactive: users.value.filter((u) => u.status === 'inactive').length,
    suspended: users.value.filter((u) => u.status === 'suspended').length,
    pending_suspension: users.value.filter((u) => u.status === 'pending_suspension').length,
    archived: users.value.filter((u) => u.status === 'archived').length,
  }))

  // 5 utilisateurs les plus récents (par date de création)
  const recentUsers = computed(() =>
    [...users.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
  )

  /**
   * Récupère la liste paginée des utilisateurs.
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Object>} Données paginées des utilisateurs.
   */
  async function fetchUsers(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await hrService.getUsers(params)
      users.value = data.data ?? []
      pagination.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère un utilisateur par son identifiant.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Données de l'utilisateur.
   */
  async function fetchUser(id) {
    isLoading.value = true
    error.value = null
    try {
      const data = await hrService.getUser(id)
      currentUser.value = data.user
      return data.user
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Utilisateur introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Rafraîchit les données du tableau de bord utilisateur.
   * @returns {Promise<void>}
   */
  async function refreshDashboardData() {
    if (currentUser.value?.id) {
      await fetchUser(currentUser.value.id)
    }
  }

  /**
   * Crée un nouvel utilisateur.
   * @param {Object} data - Données de l'utilisateur.
   * @returns {Promise<Object>} Résultat contenant l'utilisateur créé.
   */
  async function createUser(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await hrService.createUser(data)
      users.value.unshift(result.user)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour un utilisateur existant.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @param {Object} data - Nouvelles données.
   * @returns {Promise<Object>} Résultat contenant l'utilisateur mis à jour.
   */
  async function updateUser(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await hrService.updateUser(id, data)
      _patchInList(id, result.user)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour le statut d'un utilisateur.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @param {string} status - Nouveau statut.
   * @returns {Promise<Object>} Résultat de l'opération.
   */
  async function updateStatus(id, status) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await hrService.updateUserStatus(id, status)
      _patchField(id, 'status', status)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur statut.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Archive un utilisateur.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Résultat de l'archivage.
   */
  async function archiveUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await hrService.archiveUser(id)
      _patchField(id, 'status', 'archived')
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur archivage.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Demande la suspension d'un utilisateur.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Résultat de la demande.
   */
  async function requestSuspend(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await hrService.requestSuspendUser(id)
      _patchField(id, 'status', 'pending_suspension')
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur demande suspension.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Approuve un utilisateur (le rend actif). Délègue au service approprié selon le ...
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Résultat de l'approbation.
   */
  async function approveUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const authStore = useAuthStore()
      let result
      // Choix du service selon le rôle de l'utilisateur connecté
      if (authStore.userRole === 'responsable_rh') {
        result = await hrService.approveUser(id)
      } else {
        result = await adminService.approveUser(id)
      }
      _patchField(id, 'status', 'active')
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur approbation.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Suspend un utilisateur (action admin directe).
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Résultat de la suspension.
   */
  async function suspendUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.suspendUser(id)
      _patchField(id, 'status', 'suspended')
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suspension.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Valide la suspension d'un utilisateur (admin valide une demande de suspension).
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Résultat de la validation.
   */
  async function validateSuspend(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.validateSuspendUser(id)
      _patchField(id, 'status', 'suspended')
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur validation suspension.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Met à jour le rôle d'un utilisateur.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @param {string} role - Nouveau rôle.
   * @returns {Promise<Object>} Résultat de la mise à jour.
   */
  async function updateRole(id, role) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.updateUserRole(id, role)
      _patchField(id, 'role', role)
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur rôle.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Restaure un utilisateur archivé ou suspendu.
   * @param {number|string} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object>} Résultat de la restauration.
   */
  async function restoreUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminService.restoreUser(id)
      _patchField(id, 'status', 'active')
      return result
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur restauration.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Récupère la liste paginée des utilisateurs archivés.
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Object>} Données paginées des utilisateurs archivés.
   */
  async function fetchArchivedUsers(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await hrService.getArchivedUsers(params)
      archivedUsers.value = data.data ?? []
      archivedPagination.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement utilisateurs archivés.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère le profil de l'utilisateur connecté.
   * @returns {Promise<void>}
   */
  async function fetchUserProfile() {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    try {
      const data = await hrService.getUser(authStore.user.id)
      currentUser.value = data.user
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      clearCurrentUser()
      throw err
    }
  }

  /**
   * Remplace un utilisateur dans la liste locale et currentUser si correspondant.
   * @param {number|string} id - Identifiant.
   * @param {Object} updated - Données mises à jour.
   */
  function _patchInList(id, updated) {
    const i = users.value.findIndex((u) => u.id === Number(id))
    if (i !== -1) users.value[i] = updated
    if (currentUser.value?.id === Number(id)) currentUser.value = updated
  }

  /**
   * Met à jour un champ spécifique d'un utilisateur dans la liste locale.
   * @param {number|string} id - Identifiant.
   * @param {string} field - Nom du champ.
   * @param {*} value - Nouvelle valeur.
   */
  function _patchField(id, field, value) {
    const i = users.value.findIndex((u) => u.id === Number(id))
    if (i !== -1) users.value[i][field] = value
    if (currentUser.value?.id === Number(id)) currentUser.value[field] = value
  }

  /**
   * Réinitialise l'utilisateur courant et l'erreur.
   */
  function clearCurrentUser() {
    currentUser.value = null
    error.value = null
  }

  /**
   * Retourne le libellé d'un rôle.
   * @param {string} r - Code du rôle.
   * @returns {string} Libellé.
   */
  const getRoleLabel = (r) =>
    ({
      admin: 'Administrateur',
      responsable_rh: 'Responsable RH',
      responsable_demande: 'Resp. Demandes',
      user: 'Utilisateur',
    })[r] ?? r

  /**
   * Retourne la classe CSS pour un rôle.
   * @param {string} r - Code du rôle.
   * @returns {string} Classe Tailwind.
   */
  const getRoleClass = (r) =>
    ({
      admin: 'bg-purple-100 text-purple-700',
      responsable_rh: 'bg-amber-100 text-amber-700',
      responsable_demande: 'bg-teal-100 text-teal-700',
      user: 'bg-gray-100 text-gray-700',
    })[r] ?? 'bg-gray-100 text-gray-700'

  /**
   * Retourne le libellé d'un statut utilisateur.
   * @param {string} s - Code du statut.
   * @returns {string} Libellé.
   */
  const getStatusLabel = (s) =>
    ({
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      pending_suspension: 'Suspension en attente',
      archived: 'Archivé',
    })[s] ?? s

  /**
   * Retourne la classe CSS pour un statut utilisateur.
   * @param {string} s - Code du statut.
   * @returns {string} Classe Tailwind.
   */
  const getStatusClass = (s) =>
    ({
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      suspended: 'bg-red-100 text-red-700',
      pending_suspension: 'bg-orange-100 text-orange-700',
      archived: 'bg-slate-100 text-slate-500',
    })[s] ?? 'bg-gray-100 text-gray-600'

  /**
   * Retourne une couleur d'avatar basée sur l'identifiant.
   * @param {number} id - Identifiant utilisateur.
   * @returns {string} Classe de couleur Tailwind.
   */
  const getAvatarColor = (id) =>
    ['bg-amber-600', 'bg-teal-700', 'bg-[#1B2A4A]', 'bg-purple-700', 'bg-rose-700'][id % 5]

  /**
   * Retourne les initiales d'un utilisateur.
   * @param {Object} u - Utilisateur.
   * @returns {string} Initiales en majuscules.
   */
  const getUserInitials = (u) => `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase()

  /**
   * Formate une date au format court français.
   * @param {string|Date} d - Date à formater.
   * @returns {string} Date formatée.
   */
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  /**
   * Formate une date avec heure au format long français.
   * @param {string|Date} d - Date à formater.
   * @returns {string} Date et heure formatées.
   */
  const formatDateTime = (d) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  /**
   * Calcule un texte relatif (il y a X min/h/jour).
   * @param {string|Date} d - Date de référence.
   * @returns {string} Texte relatif.
   */
  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 60) return `Il y a ${m} min`
    const h = Math.floor(m / 60)
    if (h < 24) return `Il y a ${h} h`
    const j = Math.floor(h / 24)
    return `Il y a ${j} jour${j > 1 ? 's' : ''}`
  }

  return {
    users,
    pagination,
    archivedUsers,
    archivedPagination,
    currentUser,
    isLoading,
    isActionLoading,
    error,
    stats,
    recentUsers,
    fetchUsers,
    fetchUser,
    refreshDashboardData,
    createUser,
    updateUser,
    updateStatus,
    archiveUser,
    requestSuspend,
    approveUser,
    suspendUser,
    validateSuspend,
    updateRole,
    restoreUser,
    fetchArchivedUsers,
    clearCurrentUser,
    fetchUserProfile,
    getRoleLabel,
    getRoleClass,
    getStatusLabel,
    getStatusClass,
    getAvatarColor,
    getUserInitials,
    formatDate,
    formatDateTime,
    timeAgo,
  }
})
