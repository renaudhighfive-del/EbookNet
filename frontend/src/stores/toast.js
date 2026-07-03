import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function add(message, type = 'success', duration = 4000) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(message) { add(message, 'success') }
  function error(message) { add(message, 'error') }
  function info(message) { add(message, 'info') }

  return { toasts, add, success, error, info }
})
