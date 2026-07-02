import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { authService } from '@/services/api/auth.service'

const SANCTUM_ORIGIN = import.meta.env.VITE_SANCTUM_URL ?? (() => {
  const u = new URL(import.meta.env.VITE_API_URL)
  return u.origin
})()

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role)

  async function login(credentials) {
    isLoading.value = true
    try {
      await axios.get(`${SANCTUM_ORIGIN}/sanctum/csrf-cookie`)
      const data = await authService.login(credentials)
      user.value = data.user
      return data
    } finally {
      isLoading.value = false
    }
  }

  async function register(data) {
    isLoading.value = true
    try {
      await axios.get(`${SANCTUM_ORIGIN}/sanctum/csrf-cookie`)
      const result = await authService.register(data)
      return result
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await axios.get(`${SANCTUM_ORIGIN}/sanctum/csrf-cookie`)
      await authService.logout()
    } catch (err) {
      // Ignore logout errors — on nettoie le state utilisateur quoi qu'il arrive
    } finally {
      user.value = null
      isLoading.value = false
    }
  }

  async function fetchUser() {
    if (user.value) return
    isLoading.value = true
    try {
      const data = await authService.me()
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
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
