import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import api from '@/services/api'

const SANCTUM_ORIGIN = import.meta.env.VITE_SANCTUM_URL ?? (() => {
  const u = new URL(api.defaults.baseURL)
  return u.origin
})()

export const useAuthStore = defineStore('auth', () => {
  const user        = ref(null)
  const isLoading   = ref(false)
  let isFetching    = false

  const sessionEnded = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userRole        = computed(() => user.value?.role)

  async function login(credentials) {
    isLoading.value = true
    try {
      await axios.get(`${SANCTUM_ORIGIN}/sanctum/csrf-cookie`)
      const response = await api.post('/auth/login', credentials)
      user.value         = response.data.user
      sessionEnded.value = false
      if (user.value) {
        await fetchUserProfile()
      }
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  async function register(data) {
    isLoading.value = true
    try {
      await axios.get(`${SANCTUM_ORIGIN}/sanctum/csrf-cookie`)
      const response = await api.post('/auth/register', data)
      user.value = null
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await api.post('/auth/logout', {}, { timeout: 8000 })
    } catch (err) {
      // Silently ignore logout API errors — we clear local state anyway
    } finally {
      user.value         = null
      sessionEnded.value = true
      isLoading.value    = false
    }
  }

  async function fetchUser() {
    if (user.value || sessionEnded.value || isFetching) return
    isFetching = true
    isLoading.value = true
    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
      isFetching = false
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    userRole,
    login,
    register,
    logout,
    fetchUser,
  }
})
