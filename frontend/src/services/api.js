import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        authStore.user = null
        authStore.sessionEnded = true
        const router = (await import('@/router')).default
        await router.push('/connexion')
      }
    }
    return Promise.reject(error)
  },
)

export default api
