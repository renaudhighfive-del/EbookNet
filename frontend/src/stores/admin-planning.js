import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminPlanningService } from '../services/api/admin-planning.service'

export const useAdminPlanningStore = defineStore('adminPlanning', () => {
  const rules = ref([])
  const appointments = ref([])
  const pagination = ref({})
  const settings = ref(null)
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref(null)

  async function fetchRules() {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminPlanningService.getAvailabilityRules()
      rules.value = data.rules
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement règles.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createRule(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.createAvailabilityRule(data)
      rules.value.push(result.rule)
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur création règle.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function updateRule(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.updateAvailabilityRule(id, data)
      const index = rules.value.findIndex(r => r.id === id)
      if (index !== -1) {
        rules.value[index] = result.rule
      }
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur mise à jour règle.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function deleteRule(id) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.deleteAvailabilityRule(id)
      rules.value = rules.value.filter(r => r.id !== id)
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur suppression règle'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function createAvailabilityException(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.createAvailabilityException(data)
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur création exception'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function fetchAppointments(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminPlanningService.getAppointments(params)
      appointments.value = data.data || data
      pagination.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement rendez-vous.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateAppointment(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.updateAppointment(id, data)
      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index] = result.appointment
      }
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur mise à jour rendez-vous.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function cancelAppointment(id, data = {}) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.cancelAppointment(id, data)
      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index] = result.appointment
      }
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur annulation rendez-vous.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  async function fetchSettings() {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminPlanningService.getSettings()
      settings.value = data.settings
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement paramètres.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.updateSettings(data)
      settings.value = result.settings
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur mise à jour paramètres.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    rules,
    appointments,
    pagination,
    settings,
    isLoading,
    isActionLoading,
    error,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    createAvailabilityException,
    fetchAppointments,
    updateAppointment,
    cancelAppointment,
    fetchSettings,
    updateSettings
  }
})
