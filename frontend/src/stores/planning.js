import { defineStore } from 'pinia'
import { ref } from 'vue'
import { planningService } from '../services/api/planning.service'

export const usePlanningStore = defineStore('planning', () => {
  const slots = ref([])
  const availableDays = ref([])
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const selectedSlot = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchAvailability(date) {
    isLoading.value = true
    error.value = null
    try {
      const data = await planningService.getAvailability(date)
      slots.value = data.slots
      selectedDate.value = data.date
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement créneaux.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAvailabilityMonth(month) {
    isLoading.value = true
    error.value = null
    try {
      const data = await planningService.getAvailabilityMonth(month)
      availableDays.value = data.available_days
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement disponibilités.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createAppointment(data) {
    isLoading.value = true
    error.value = null
    try {
      const result = await planningService.createAppointment(data)
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur création réservation.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function selectSlot(slot) {
    selectedSlot.value = slot
  }

  return {
    slots,
    availableDays,
    selectedDate,
    selectedSlot,
    isLoading,
    error,
    fetchAvailability,
    fetchAvailabilityMonth,
    createAppointment,
    selectSlot
  }
})
