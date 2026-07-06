import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/api/user.service'
import { useToastStore } from './toast'

export const useDepositStore = defineStore('deposit', () => {
  const deposits = ref([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref(null)

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
      const msg = err.response?.data?.message ?? "Erreur lors de la création de la demande."
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
