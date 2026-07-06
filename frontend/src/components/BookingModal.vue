<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>
      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Nouveau rendez-vous</h3>
            <p class="text-sm text-gray-500 mt-0.5">
              {{ formatDate(selectedDate) }} · {{ formatTime(slot?.start) }} - {{ formatTime(slot?.end) }}
            </p>
          </div>
          <button @click="close" class="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="px-6 py-5 space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="Votre prénom"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="Votre nom"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="votre@email.com"
              required
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="+229 XX XX XX XX"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Sujet de l'entretien</label>
            <textarea
              v-model="form.subject"
              placeholder="Décrivez brièvement l'objet de votre demande..."
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            @click="close"
            class="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            @click="handleSubmit"
            :disabled="props.isLoading || !canSubmit"
            class="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="props.isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ props.isLoading ? 'Réservation...' : 'Confirmer le rendez-vous' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
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
  bookingSlot: {
    type: Object,
    default: null
  },
  selectedDate: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: ''
})

const canSubmit = computed(() =>
  form.value.firstName &&
  form.value.lastName &&
  form.value.email &&
  props.bookingSlot
)

watch(() => [props.isOpen, authStore.user], () => {
  if (props.isOpen && authStore.user) {
    form.value = {
      firstName: authStore.user.first_name || '',
      lastName: authStore.user.last_name || '',
      email: authStore.user.email || '',
      phone: '',
      subject: ''
    }
  } else if (!props.isOpen) {
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: ''
    }
  }
}, { immediate: true })

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

function close() {
  emit('close')
}

function handleSubmit() {
  if (!canSubmit.value || props.isLoading) return

  emit('submit', {
    date: props.selectedDate,
    start_time: props.bookingSlot.start,
    end_time: props.bookingSlot.end,
    first_name: form.value.firstName,
    last_name: form.value.lastName,
    email: form.value.email,
    phone: form.value.phone,
    subject: form.value.subject
  })
}
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
