import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const users = ref([])
  const pagination = ref({})
  const archivedUsers = ref([])
  const archivedPagination = ref({})
  const currentUser = ref(null)
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

  // ─── Getters ────────────────────────────────────────────────────────────
  const stats = computed(() => ({
    total: users.value.length,
    active: users.value.filter((u) => u.status === 'active').length,
    inactive: users.value.filter((u) => u.status === 'inactive').length,
    suspended: users.value.filter((u) => u.status === 'suspended').length,
    pending_suspension: users.value.filter((u) => u.status === 'pending_suspension').length,
    archived: users.value.filter((u) => u.status === 'archived').length,
  }))

  const recentUsers = computed(() =>
    [...users.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
  )

  // ─── Actions RH + Admin ─────────────────────────────────────────────────

  /** GET /api/hr/users */
  async function fetchUsers(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/hr/users', { params })
      users.value = res.data.data ?? []
      pagination.value = res.data
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** GET /api/hr/users/:id */
  async function fetchUser(id) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get(`/hr/users/${id}`)
      currentUser.value = res.data.user
      return res.data.user
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Utilisateur introuvable.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** POST /api/hr/users */
  async function createUser(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.post('/hr/users', data)
      users.value.unshift(res.data.user)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur création.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PUT /api/hr/users/:id */
  async function updateUser(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.put(`/hr/users/${id}`, data)
      _patchInList(id, res.data.user)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur mise à jour.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PATCH /api/hr/users/:id/status — active ↔ inactive (RH + Admin) */
  async function updateStatus(id, status) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/hr/users/${id}/status`, { status })
      _patchField(id, 'status', status)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur statut.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** DELETE /api/hr/users/:id — archivage soft (RH + Admin) */
  async function archiveUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.delete(`/hr/users/${id}`)
      _patchField(id, 'status', 'archived')
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur archivage.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PATCH /api/hr/users/:id/request-suspend — RH propose une suspension (admin doit valider) */
  async function requestSuspend(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/hr/users/${id}/request-suspend`)
      _patchField(id, 'status', 'pending_suspension')
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur demande suspension.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  // ─── Actions Admin uniquement ────────────────────────────────────────────

  /** PATCH /api/hr/users/:id/approve ou /api/admin/users/:id/approve — Approuver une inscription inactive */
  async function approveUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      // Utiliser l'endpoint HR si l'utilisateur est RH, sinon admin
      const authStore = useAuthStore()
      const endpoint = authStore.userRole === 'responsable_rh' ? `/hr/users/${id}/approve` : `/admin/users/${id}/approve`
      const res = await api.patch(endpoint)
      _patchField(id, 'status', 'active')
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur approbation.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PATCH /api/admin/users/:id/suspend — Suspension directe admin */
  async function suspendUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/admin/users/${id}/suspend`)
      _patchField(id, 'status', 'suspended')
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur suspension.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PATCH /api/admin/users/:id/validate-suspend — Valider la suspension proposée par le RH */
  async function validateSuspend(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/admin/users/${id}/validate-suspend`)
      _patchField(id, 'status', 'suspended')
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur validation suspension.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PATCH /api/admin/users/:id/role */
  async function updateRole(id, role) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/admin/users/${id}/role`, { role })
      _patchField(id, 'role', role)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur rôle.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** PATCH /api/admin/users/:id/restore — Restaurer un compte suspendu/archivé */
  async function restoreUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/admin/users/${id}/restore`)
      _patchField(id, 'status', 'active')
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur restauration.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /** GET /api/hr/users/archived — Liste des utilisateurs archivés (RH + Admin) */
  async function fetchArchivedUsers(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/hr/users/archived', { params })
      archivedUsers.value = res.data.data ?? []
      archivedPagination.value = res.data
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement utilisateurs archivés.'
      throw err
    } finally {
      isLoading.value = false
    }
  }



  // ─── Utilitaires internes ────────────────────────────────────────────────
  function _patchInList(id, updated) {
    const i = users.value.findIndex((u) => u.id === Number(id))
    if (i !== -1) users.value[i] = updated
    if (currentUser.value?.id === Number(id)) currentUser.value = updated
  }
  function _patchField(id, field, value) {
    const i = users.value.findIndex((u) => u.id === Number(id))
    if (i !== -1) users.value[i][field] = value
    if (currentUser.value?.id === Number(id)) currentUser.value[field] = value
  }
  function clearCurrentUser() {
    currentUser.value = null
    error.value = null
  }

  // ─── Helpers présentation ────────────────────────────────────────────────
  const getRoleLabel = (r) =>
    ({
      admin: 'Administrateur',
      responsable_rh: 'Responsable RH',
      responsable_demande: 'Resp. Demandes',
      user: 'Utilisateur',
    })[r] ?? r

  const getRoleClass = (r) =>
    ({
      admin: 'bg-purple-100 text-purple-700',
      responsable_rh: 'bg-amber-100 text-amber-700',
      responsable_demande: 'bg-teal-100 text-teal-700',
      user: 'bg-gray-100 text-gray-700',
    })[r] ?? 'bg-gray-100 text-gray-700'

  const getStatusLabel = (s) =>
    ({
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      pending_suspension: 'Suspension en attente',
      archived: 'Archivé',
    })[s] ?? s

  const getStatusClass = (s) =>
    ({
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      suspended: 'bg-red-100 text-red-700',
      pending_suspension: 'bg-orange-100 text-orange-700',
      archived: 'bg-slate-100 text-slate-500',
    })[s] ?? 'bg-gray-100 text-gray-600'

  const getAvatarColor = (id) =>
    ['bg-amber-600', 'bg-teal-700', 'bg-[#1B2A4A]', 'bg-purple-700', 'bg-rose-700'][id % 5]

  const getUserInitials = (u) => `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase()

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatDateTime = (d) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

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
    // RH + Admin
    fetchUsers,
    fetchUser,
    fetchArchivedUsers,
    createUser,
    updateUser,
    updateStatus,
    archiveUser,
    requestSuspend,
    // Admin only
    approveUser,
    suspendUser,
    validateSuspend,
    updateRole,
    restoreUser,
    // utilitaires
    clearCurrentUser,
    // helpers
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
