import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hrService } from '@/services/api/hr.service'
import { adminService } from '@/services/api/admin.service'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const pagination = ref({})
  const archivedUsers = ref([])
  const archivedPagination = ref({})
  const currentUser = ref(null)
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

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

  async function refreshDashboardData() {
    if (currentUser.value?.id) {
      await fetchUser(currentUser.value.id)
    }
  }

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

  async function approveUser(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const authStore = useAuthStore()
      let result
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
