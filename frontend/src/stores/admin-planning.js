// Store Pinia de planning admin
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminPlanningService } from '../services/api/admin-planning.service'

export const useAdminPlanningStore = defineStore('adminPlanning', () => {
  // Liste des règles de disponibilité
  const rules = ref([])
  // Liste des rendez-vous (pagifiée)
  const appointments = ref([])
  // Liste des rendez-vous pour l'affichage calendrier
  const calendarAppointments = ref([])
  // Informations de pagination pour les rendez-vous
  const pagination = ref({})
  // Paramètres généraux du planning
  const settings = ref(null)
  // Indicateur de chargement principal
  const isLoading = ref(false)
  // Indicateur de chargement pour les actions (création, mise à jour, etc.)
  const isActionLoading = ref(false)
  // Message d'erreur
  const error = ref(null)

  /**
   * Récupère toutes les règles de disponibilité.
   * @returns {Promise<Object>} Données contenant les règles.
   */
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

  /**
   * Crée une nouvelle règle de disponibilité.
   * @param {Object} data - Données de la règle.
   * @returns {Promise<Object>} Résultat contenant la règle créée.
   */
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

  /**
   * Met à jour une règle de disponibilité existante.
   * @param {number|string} id - Identifiant de la règle.
   * @param {Object} data - Nouvelles données.
   * @returns {Promise<Object>} Résultat contenant la règle mise à jour.
   */
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

  /**
   * Supprime une règle de disponibilité.
   * @param {number|string} id - Identifiant de la règle.
   * @returns {Promise<Object>} Résultat de la suppression.
   */
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

  /**
   * Crée une exception de disponibilité (jour férié, fermeture, etc.).
   * @param {Object} data - Données de l'exception.
   * @returns {Promise<Object>} Résultat de la création.
   */
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

  /**
   * Récupère la liste des rendez-vous avec pagination.
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Object>} Données paginées des rendez-vous.
   */
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

  /**
   * Récupère les rendez-vous pour un affichage calendrier entre deux dates.
   * @param {string} startDate - Date de début (ISO).
   * @param {string} endDate - Date de fin (ISO).
   * @returns {Promise<Array>} Liste des rendez-vous.
   */
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

  /**
   * Crée un rendez-vous manuellement (par un admin).
   * @param {Object} data - Données du rendez-vous.
   * @returns {Promise<Object>} Résultat contenant le rendez-vous créé.
   */
  async function createManualAppointment(data) {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.createManualAppointment(data)
      // Ajouter le rendez-vous aux listes locales
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

  /**
   * Synchronise un rendez-vous dans une liste locale (remplace si existant).
   * @param {Array} list - Liste locale de rendez-vous.
   * @param {Object} appointment - Rendez-vous mis à jour.
   * @returns {Array} Liste mise à jour.
   */
  function _syncAppointmentInList(list, appointment) {
    const index = list.findIndex(a => a.id === appointment.id)
    if (index !== -1) {
      list[index] = appointment
    }
    return list
  }

  /**
   * Retire un rendez-vous d'une liste locale par son identifiant.
   * @param {Array} list - Liste locale.
   * @param {number|string} id - Identifiant à retirer.
   * @returns {Array} Nouvelle liste filtrée.
   */
  function _removeAppointmentFromList(list, id) {
    return list.filter(a => a.id !== id)
  }

  /**
   * Met à jour un rendez-vous existant.
   * @param {number|string} id - Identifiant du rendez-vous.
   * @param {Object} data - Nouvelles données.
   * @returns {Promise<Object>} Résultat contenant le rendez-vous mis à jour.
   */
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

  /**
   * Annule un rendez-vous.
   * @param {number|string} id - Identifiant du rendez-vous.
   * @param {Object} [data={}] - Données complémentaires (motif, etc.).
   * @returns {Promise<Object>} Résultat contenant le rendez-vous annulé.
   */
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

  /**
   * Récupère les paramètres généraux du planning.
   * @returns {Promise<Object>} Données des paramètres.
   */
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

  /**
   * Met à jour les paramètres généraux du planning.
   * @param {Object} data - Nouveaux paramètres.
   * @returns {Promise<Object>} Résultat contenant les paramètres mis à jour.
   */
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

  /**
   * Récupère le statut de connexion Google Calendar.
   * @returns {Promise<Object>} Statut de connexion.
   */
  async function getGoogleCalendarStatus() {
    isLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.getGoogleCalendarStatus()
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement Google Calendar.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère l'URL d'autorisation Google Calendar.
   * @returns {Promise<Object>} URL d'autorisation.
   */
  async function getGoogleCalendarAuthorizeUrl() {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.getGoogleCalendarAuthorizeUrl()
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur autorisation Google Calendar.'
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * Déconnecte Google Calendar.
   * @returns {Promise<Object>} Résultat de la déconnexion.
   */
  async function disconnectGoogleCalendar() {
    isActionLoading.value = true
    error.value = null
    try {
      const result = await adminPlanningService.disconnectGoogleCalendar()
      return result
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur déconnexion Google Calendar.'
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
    getGoogleCalendarStatus,
    getGoogleCalendarAuthorizeUrl,
    disconnectGoogleCalendar,
  }
})
