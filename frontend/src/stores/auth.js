// Store Pinia d'authentification
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { authService } from '@/services/api/auth.service'

// Origine pour le cookie CSRF Sanctum (déduite de VITE_API_URL si VITE_SANCTUM_URL no...
const SANCTUM_ORIGIN =
  import.meta.env.VITE_SANCTUM_URL ??
  (() => {
    const u = new URL(import.meta.env.VITE_API_URL)
    return u.origin
  })()

export const useAuthStore = defineStore('auth', () => {
  // Utilisateur connecté (null si non authentifié)
  const user = ref(null)
  // Indicateur de chargement
  const isLoading = ref(false)

  // Vrai si un utilisateur est connecté
  const isAuthenticated = computed(() => !!user.value)
  // Rôle de l'utilisateur connecté
  const userRole = computed(() => user.value?.role)

  /**
   * Connecte un utilisateur avec ses identifiants.
   * @param {Object} credentials - Identifiants (email, mot de passe).
   * @returns {Promise<Object>} Données de l'utilisateur connecté.
   */
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

  /**
   * Inscrit un nouvel utilisateur.
   * @param {Object} data - Données d'inscription.
   * @returns {Promise<Object>} Résultat de l'inscription.
   */
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

  /**
   * Déconnecte l'utilisateur courant.
   * @returns {Promise<void>}
   */
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

  /**
   * Récupère l'utilisateur connecté depuis l'API. Ne fait rien si déjà en cache.
   * @returns {Promise<void>}
   */
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
