// Store Pinia des dépôts utilisateur
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/api/user.service'
import { useToastStore } from './toast'

export const useDepositStore = defineStore('deposit', () => {
  // Liste des dépôts de l'utilisateur connecté
  const deposits = ref([])
  // Indicateur de chargement
  const isLoading = ref(false)
  // Indicateur de soumission en cours
  const isSubmitting = ref(false)
  // Message d'erreur
  const error = ref(null)

  /**
   * Récupère la liste des dépôts de l'utilisateur connecté.
   * @returns {Promise<Array>} Liste des dépôts.
   */
  async function fetchMyDeposits() {
    isLoading.value = true
    error.value = null
    try {
      const data = await userService.getMyDeposits()
      deposits.value = Array.isArray(data) ? data : []
      return data
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erreur chargement des dépôts.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crée une nouvelle demande de dépôt.
   * @param {FormData} formData - Données du formulaire (fichier, métadonnées).
   * @returns {Promise<Object>} Résultat contenant la demande créée.
   */
  async function createDeposit(formData) {
    isSubmitting.value = true
    error.value = null
    try {
      const result = await userService.createDeposit(formData)
      deposits.value.unshift(result.deposit_request)
      const toast = useToastStore()
      toast.success(result.message || 'Demande de dépôt créée avec succès.')
      return result
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Erreur lors de la création de la demande.'
      error.value = msg
      const toast = useToastStore()
      toast.error(msg)
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    deposits,
    isLoading,
    isSubmitting,
    error,
    fetchMyDeposits,
    createDeposit,
  }
})
