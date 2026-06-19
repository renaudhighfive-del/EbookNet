import { useAuthStore } from '@/stores/auth'

export function setupAuthGuards(router) {
  router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()
    
    // Fetch user if not already fetched
    if (!authStore.user) {
      await authStore.fetchUser()
    }

    // Public routes that don't require authentication
    const publicRoutes = ['home', 'catalogue', 'document-detail', 'search', 'auth']
    
    if (publicRoutes.includes(to.name)) {
      // If already authenticated and trying to go to auth page, redirect to dashboard
      if (to.name === 'auth' && authStore.isAuthenticated) {
        return { name: 'dashboard' }
      }
      return
    }

    // Protected routes below
    if (!authStore.isAuthenticated) {
      return { name: 'auth' }
    }

    // Role-based protection
    const userRole = authStore.userRole
    
    // RH routes
    if (to.name?.startsWith('rh-') && !['responsable_rh', 'admin'].includes(userRole)) {
      return { name: 'dashboard' }
    }

    // Manager routes
    if (to.name?.startsWith('manager-') && !['responsable_demande', 'admin'].includes(userRole)) {
      return { name: 'dashboard' }
    }

    // Admin routes
    if (to.name?.startsWith('admin-') && userRole !== 'admin') {
      return { name: 'dashboard' }
    }
  })
}
