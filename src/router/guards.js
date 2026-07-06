import { useAuthStore } from '@/stores/auth'

export function setupAuthGuards(router) {
  router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()

    if (!authStore.user) {
      await authStore.fetchUser()
    }

    const getRoleDashboard = () => {
      const userRole = authStore.userRole
      if (userRole === 'admin') return { name: 'admin-dashboard' }
      if (userRole === 'responsable_rh') return { name: 'rh-dashboard' }
      if (userRole === 'responsable_demande') return { name: 'manager-dashboard' }
      return { name: 'dashboard' }
    }

    const getRoleBasedRedirect = () => {
      const userRole = authStore.userRole
      if (userRole === 'admin') return { name: 'admin-dashboard' }
      if (userRole === 'responsable_rh') return { name: 'rh-dashboard' }
      if (userRole === 'responsable_demande') return { name: 'manager-dashboard' }
      if (userRole === 'user') return { name: 'dashboard' }
      return { name: 'auth' }
    }

    if (to.meta?.public) {
      if (to.name === 'auth' && authStore.isAuthenticated) {
        return getRoleBasedRedirect()
      }
      return
    }

    if (!authStore.isAuthenticated) {
      return { name: 'auth' }
    }

    if (to.meta?.roles && !to.meta.roles.includes(authStore.userRole)) {
      return getRoleBasedRedirect()
    }
  })
}
