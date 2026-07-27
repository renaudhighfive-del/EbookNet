import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
})

const MAX_RETRIES = 2

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config

    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        authStore.user = null
        const router = (await import('@/router')).default
        await router.push('/connexion')
      }
      return Promise.reject(error)
    }

    // Retry sur timeout / network error (pas de retry pour 4xx/5xx)
    if ((error.code === 'ECONNABORTED' || !error.response) && config && !config._retryCount) {
      config._retryCount = config._retryCount || 0
      if (config._retryCount < MAX_RETRIES) {
        config._retryCount++
        await new Promise((r) => setTimeout(r, 1000 * config._retryCount))
        return api(config)
      }
    }

    return Promise.reject(error)
  },
)

export default api
