// Store Pinia pour la gestion du planning côté utilisateur (créneaux, disponibilités, réservation)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { planningService } from '../services/api/planning.service'

export const usePlanningStore = defineStore('planning', () => {
  // Créneaux disponibles pour la date sélectionnée
  const slots = ref([])
  // Rendez-vous pour l'affichage calendrier
  const calendarAppointments = ref([])
  // Jours disponibles dans le mois
  const availableDays = ref([])
  // Date actuellement sélectionnée (format YYYY-MM-DD)
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  // Créneau horaire actuellement sélectionné
  const selectedSlot = ref(null)
  // Indicateur de chargement
  const isLoading = ref(false)
  // Message d'erreur
  const error = ref(null)

  /**
   * Récupère les créneaux disponibles pour une date donnée.
   * @param {string} date - Date au format YYYY-MM-DD.
   * @returns {Promise<Object>} Données contenant les créneaux.
   */
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

  /**
   * Récupère les jours disponibles pour un mois donné.
   * @param {string} month - Mois au format YYYY-MM.
   * @returns {Promise<Object>} Données contenant les jours disponibles.
   */
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

  /**
   * Crée une réservation de rendez-vous.
   * @param {Object} data - Données de la réservation (créneau, motifs, etc.).
   * @returns {Promise<Object>} Résultat de la création.
   */
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

  /**
   * Récupère les rendez-vous pour l'affichage calendrier entre deux dates.
   * @param {string} startDate - Date de début (ISO).
   * @param {string} endDate - Date de fin (ISO).
   * @returns {Promise<Array>} Liste des rendez-vous.
   */
  async function fetchCalendarAppointments(startDate, endDate) {
    isLoading.value = true
    error.value = null
    try {
      const data = await planningService.getCalendarAppointments(startDate, endDate)
      calendarAppointments.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement réservations calendrier.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sélectionne un créneau horaire.
   * @param {Object} slot - Créneau à sélectionner.
   */
  function selectSlot(slot) {
    selectedSlot.value = slot
  }

  return {
    slots,
    calendarAppointments,
    availableDays,
    selectedDate,
    selectedSlot,
    isLoading,
    error,
    fetchAvailability,
    fetchAvailabilityMonth,
    createAppointment,
    selectSlot,
    fetchCalendarAppointments,
  }
})
