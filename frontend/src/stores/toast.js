// Store Pinia pour la gestion des notifications toast (messages temporaires)
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  // Liste des toasts affichés
  const toasts = ref([])

  /**
   * Ajoute un toast avec un message et un type, puis le retire après la durée spéci...
   * @param {string} message - Texte du toast.
   * @param {string} [type='success'] - Type (success, error, info).
   * @param {number} [duration=4000] - Durée d'affichage en ms.
   */
  function add(message, type = 'success', duration = 4000) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  /**
   * Affiche un toast de type succès.
   * @param {string} message - Texte du toast.
   */
  function success(message) {
    add(message, 'success')
  }

  /**
   * Affiche un toast de type erreur.
   * @param {string} message - Texte du toast.
   */
  function error(message) {
    add(message, 'error')
  }

  /**
   * Affiche un toast de type information.
   * @param {string} message - Texte du toast.
   */
  function info(message) {
    add(message, 'info')
  }

  /**
   * Affiche un toast de type avertissement.
   * @param {string} message - Texte du toast.
   */
  function warning(message) {
    add(message, 'warning')
  }

  return { toasts, add, success, error, info, warning }
})
