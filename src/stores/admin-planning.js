import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminPlanningService } from '../services/api/admin-planning.service'

export const useAdminPlanningStore = defineStore('adminPlanning', () => {
  const rules = ref([])
  const appointments = ref([])
  const calendarAppointments = ref([])
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

  async function fetchCalendarAppointments(startDate, endDate) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminPlanningService.getCalendarAppointments(startDate, endDate)
      calendarAppointments.value = Array.isArray(data) ? data : []
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement calendrier.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createManualAppointment(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.createManualAppointment(data)
      // Ajouter le rendez-vous aux listes
      if (!appointments.value.find(a => a.id === result.appointment.id)) {
        appointments.value.unshift(result.appointment)
      }
      if (!calendarAppointments.value.find(a => a.id === result.appointment.id)) {
        calendarAppointments.value.push(result.appointment)
      }
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur création rendez-vous manuel.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  function _syncAppointmentInList(list, appointment) {
    const index = list.findIndex(a => a.id === appointment.id)
    if (index !== -1) {
      list[index] = appointment
    }
    return list
  }

  function _removeAppointmentFromList(list, id) {
    return list.filter(a => a.id !== id)
  }

  async function updateAppointment(id, data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.updateAppointment(id, data)
      const updated = result.appointment
      _syncAppointmentInList(appointments.value, updated)
      _syncAppointmentInList(calendarAppointments.value, updated)
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
      const cancelled = result.appointment
      _syncAppointmentInList(appointments.value, cancelled)
      _syncAppointmentInList(calendarAppointments.value, cancelled)
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
    calendarAppointments,
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
    fetchCalendarAppointments,
    createManualAppointment,
    updateAppointment,
    cancelAppointment,
    fetchSettings,
    updateSettings,
  }
})
