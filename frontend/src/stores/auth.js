import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role)

  async function login(credentials) {
    isLoading.value = true
    try {
      // First get the CSRF cookie
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie')
      // Then login
      const response = await api.post('/auth/login', credentials)
      user.value = response.data.user
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  async function register(data) {
    isLoading.value = true
    try {
      // First get the CSRF cookie
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie')
      // Then register
      const response = await api.post('/auth/register', data)
      user.value = response.data.user
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await api.post('/auth/logout')
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    if (user.value) return
    isLoading.value = true
    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
    } catch (error) {
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
