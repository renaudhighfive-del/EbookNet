<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <button @click="close" class="p-2 hover:bg-gray-100 rounded-full">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <button @click="close" class="p-2 hover:bg-gray-100 rounded-full">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="px-6 py-4">
        <input
          v-model="form.title"
          type="text"
          placeholder="Ajouter un titre"
          class="w-full text-2xl font-bold text-gray-900 border-b-2 border-transparent focus:border-blue-600 outline-none pb-2"
        >
      </div>

      <div class="px-6 py-4">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3 3-3 3-3"></path>
            </svg>
            <div class="flex-1">
              <p class="text-gray-900 font-medium">{{ formatDate(selectedDate) }}, {{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}</p>
            </div>
          </div>

          <div>
            <div class="flex items-center gap-4">
              <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v6"></path>
              </svg>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="Prénom"
                required
                class="flex-1 border-b border-gray-300 focus:border-blue-600 outline-none py-2"
              >
              <input
                v-model="form.lastName"
                type="text"
                placeholder="Nom"
                required
                class="flex-1 border-b border-gray-300 focus:border-blue-600 outline-none py-2"
              >
            </div>
          </div>

          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
            </svg>
            <input
              v-model="form.email"
              type="email"
              placeholder="Email"
              required
              class="flex-1 border-b border-gray-300 focus:border-blue-600 outline-none py-2"
            >
          </div>

          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9h6"></path>
            </svg>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="Téléphone (optionnel)"
              class="flex-1 border-b border-gray-300 focus:border-blue-600 outline-none py-2"
            >
          </div>

          <div class="flex items-start gap-4">
            <svg class="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
            </svg>
            <textarea
              v-model="form.subject"
              placeholder="Sujet (optionnel)"
              rows="3"
              class="flex-1 border-b border-gray-300 focus:border-blue-600 outline-none py-2 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          @click="close"
          class="px-6 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-all"
        >
          Annuler
        </button>
        <button
          @click="handleSubmit"
          :disabled="isLoading || !canSubmit"
          class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Réservation en cours...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  slot: {
    type: Object,
    default: null
  },
  selectedDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  title: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: ''
})

const isLoading = ref(false)

const canSubmit = computed(() => 
  form.value.firstName && 
  form.value.lastName && 
  form.value.email && 
  props.slot
)

watch(() => [props.isOpen, authStore.user], () => {
  if (props.isOpen && authStore.user) {
    form.value = {
      title: '',
      firstName: authStore.user.first_name || '',
      lastName: authStore.user.last_name || '',
      email: authStore.user.email || '',
      phone: '',
      subject: ''
    }
  } else if (!props.isOpen) {
    form.value = {
      title: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: ''
    }
  }
}, { immediate: true })

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  return date.toLocaleDateString('fr-FR', options)
}

function formatTime(timeStr) {
  return timeStr.slice(0, 5)
}

function close() {
  emit('close')
}

async function handleSubmit() {
  if (!canSubmit.value) return
  
  isLoading.value = true
  try {
    emit('submit', {
      date: props.selectedDate,
      start_time: props.slot.start,
      end_time: props.slot.end,
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      email: form.value.email,
      phone: form.value.phone,
      subject: form.value.subject
    })
  } finally {
    isLoading.value = false
  }
}
</script>
