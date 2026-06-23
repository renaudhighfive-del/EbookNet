import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user        = ref(null)
  const isLoading   = ref(false)
  // Passe à true après un logout explicite — bloque fetchUser() pour éviter
  // la re-connexion automatique via la session Sanctum encore active.
  // Repasse à false uniquement quand l'user se connecte manuellement.
  const sessionEnded = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userRole        = computed(() => user.value?.role)

  async function login(credentials) {
    isLoading.value = true
    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie')
      const response = await api.post('/auth/login', credentials)
      user.value         = response.data.user
      sessionEnded.value = false  // session active, autoriser fetchUser()
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  async function register(data) {
    isLoading.value = true
    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie')
      const response = await api.post('/auth/register', data)
      // Le compte est inactif — ne pas connecter automatiquement
      user.value = null
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.log('Logout API error:', err)
    } finally {
      user.value         = null
      sessionEnded.value = true   // bloquer fetchUser() jusqu'au prochain login
      isLoading.value    = false
    }
  }

  /**
   * Appelé par le guard à chaque navigation.
   * - Si l'user est déjà chargé → skip.
   * - Si l'user vient de se déconnecter → skip (evite la reconnexion auto via cookie).
   * - Sinon → tente de récupérer l'user depuis la session Sanctum.
   */
  async function fetchUser() {
    if (user.value || sessionEnded.value) return
    isLoading.value = true
    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
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
