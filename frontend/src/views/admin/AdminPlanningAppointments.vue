<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminPlanningStore } from '@/stores/admin-planning'
import { useToastStore } from '@/stores/toast'
import { debounce } from 'lodash-es'

const store = useAdminPlanningStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const activeFilter = ref('all')
const selectedAppointment = ref(null)
const appointmentEdits = ref({})
const actionLoading = ref({})

const filters = [
  { id: 'all', label: 'Tous' },
  { id: 'pending', label: 'En attente' },
  { id: 'confirmed', label: 'Confirmés' },
  { id: 'refused', label: 'Refusés' },
  { id: 'cancelled', label: 'Annulés' },
  { id: 'completed', label: 'Terminés' }
]

const filteredAppointments = computed(() => {
  let appointments = store.appointments || []

  if (activeFilter.value !== 'all') {
    appointments = appointments.filter(a => a.status === activeFilter.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    appointments = appointments.filter(a =>
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q))
    )
  }

  return appointments
})

onMounted(async () => {
  await store.fetchAppointments()
})

const debouncedSearch = debounce(() => {}, 300)

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getInitialsBg(name) {
  const colors = ['#dbeafe', '#e0e7ff', '#dcfce7', '#fef3c7', '#fce7f3']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getStatusLabel(status) {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    refused: 'Refusé',
    cancelled: 'Annulé',
    completed: 'Terminé',
    no_show: 'Absent'
  }
  return labels[status] || status
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

function formatDateFull(dateStr) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatTime(timeStr) {
  try {
    return timeStr.slice(0, 5)
  } catch {
    return timeStr
  }
}

function getFilterCount(filterId) {
  if (filterId === 'all') return store.appointments?.length || 0
  return (store.appointments || []).filter(a => a.status === filterId).length
}

function openDetails(appointment) {
  selectedAppointment.value = appointment
}

function closeDetails() {
  selectedAppointment.value = null
}

const selectedAppointmentState = computed(() => {
  return selectedAppointment.value ? getEditingState(selectedAppointment.value) : null
})

function getEditingState(appointment) {
  if (!appointmentEdits.value[appointment.id]) {
    appointmentEdits.value[appointment.id] = {
      action: null,
      admin_message: appointment.admin_message || '',
    }
  }
  return appointmentEdits.value[appointment.id]
}

function startAction(appointment, action) {
  const state = getEditingState(appointment)
  state.action = action
}

function startSelectedAction(action) {
  if (!selectedAppointment.value) return
  startAction(selectedAppointment.value, action)
}

function cancelAction(appointment) {
  const state = getEditingState(appointment)
  if (!state) return
  state.action = null
}

function isRowLoading(appointment) {
  return actionLoading.value[appointment.id] === true
}

async function submitAction(appointment = null) {
  const target = appointment || selectedAppointment.value
  if (!target) return
  const state = getEditingState(target)
  if (!state?.action) return

  actionLoading.value = {
    ...actionLoading.value,
    [target.id]: true,
  }

  const status = state.action === 'confirmed' ? 'confirmed' : 'refused'
  const payload = {
    status,
    admin_message: state.admin_message || null,
  }

  try {
    const result = await store.updateAppointment(target.id, payload)
    state.action = null
    if (selectedAppointment.value?.id === target.id) {
      selectedAppointment.value = result.appointment
    }
    if (result.email_sent === false) {
      toastStore.error('Le statut a été enregistré, mais l’email n’a pas pu être envoyé.')
    } else {
      toastStore.success(`Rendez-vous de ${target.first_name} ${status === 'confirmed' ? 'confirmé' : 'refusé'}.`)
    }
  } catch {
    toastStore.error('Erreur lors de la mise à jour du rendez-vous.')
  } finally {
    actionLoading.value = {
      ...actionLoading.value,
      [target.id]: false,
    }
  }
}
</script>


<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Rendez-vous</h2>
      <p class="text-gray-500">Gérez toutes vos demandes et rendez-vous confirmés.</p>
    </div>

    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div class="flex-1 max-w-md relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par nom, email, téléphone..."
          @input="debouncedSearch"
          class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter.id"
          @click="activeFilter = filter.id"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            activeFilter === filter.id
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          ]"
        >
          {{ filter.label }}
          <span v-if="getFilterCount(filter.id)" class="ml-1 w-5 h-5 inline-flex items-center justify-center rounded-full text-xs" :class="activeFilter === filter.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'">
            {{ getFilterCount(filter.id) }}
          </span>
        </button>
      </div>
    </div>

    <div v-if="store.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B8DEF]"></div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="appointment in filteredAppointments"
        :key="appointment.id"
        @click="openDetails(appointment)"
        class="flex flex-col gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-blue-500 shrink-0"
            :style="{ backgroundColor: getInitialsBg(`${appointment.first_name} ${appointment.last_name}`) }"
          >
            {{ getInitials(`${appointment.first_name} ${appointment.last_name}`) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-semibold text-gray-900">{{ appointment.first_name }} {{ appointment.last_name }}</p>
            <p class="text-sm text-gray-500 truncate">{{ appointment.subject || 'Sans sujet' }}</p>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>{{ appointment.email }}</span>
              <span v-if="appointment.phone">· {{ appointment.phone }}</span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-semibold text-gray-900">{{ formatDate(appointment.date) }}</p>
            <p class="text-xs text-gray-500">{{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}</p>
          </div>
          <div class="shrink-0">
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1',
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="appointment.status === 'confirmed' ? 'bg-green-500' : appointment.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'"></span>
              {{ getStatusLabel(appointment.status) }}
            </span>
          </div>
          <div class="shrink-0 text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>

      </div>

      <div v-if="filteredAppointments.length === 0" class="text-center py-16">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <p class="text-gray-500 font-medium">Aucun rendez-vous trouvé</p>
        <p class="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres de recherche.</p>
      </div>
    </div>

    <!-- Sidebar modale des détails -->
    <Teleport to="body">
      <Transition name="sidebar">
        <div v-if="selectedAppointment" class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeDetails"></div>
          <div class="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto">
            <!-- En-tête -->
            <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h3 class="text-lg font-bold text-gray-900">Détails du rendez-vous</h3>
                <p class="text-sm text-gray-500 mt-0.5">Consultez et gérez cette demande.</p>
              </div>
              <button @click="closeDetails" class="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div v-if="selectedAppointment" class="px-6 py-6 space-y-6">
              <!-- Statut -->
              <div class="flex items-center gap-3">
                <span
                  :class="[
                    'px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2',
                    selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    selectedAppointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  ]"
                >
                  <span class="w-2 h-2 rounded-full" :class="selectedAppointment.status === 'confirmed' ? 'bg-green-500' : selectedAppointment.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'"></span>
                  {{ getStatusLabel(selectedAppointment.status) }}
                </span>
                <span class="text-sm text-gray-400">#{{ selectedAppointment.id }}</span>
              </div>

              <!-- Infos étudiant -->
              <div class="bg-gray-50 rounded-2xl p-5 space-y-4">
                <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Informations étudiant</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-0.5">Prénom</p>
                    <p class="text-sm font-semibold text-gray-900">{{ selectedAppointment.first_name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-0.5">Nom</p>
                    <p class="text-sm font-semibold text-gray-900">{{ selectedAppointment.last_name }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-0.5">Email</p>
                  <a :href="`mailto:${selectedAppointment.email}`" class="text-sm font-semibold text-blue-600 hover:text-blue-700">{{ selectedAppointment.email }}</a>
                </div>
                <div v-if="selectedAppointment.phone">
                  <p class="text-xs text-gray-500 mb-0.5">Téléphone</p>
                  <a :href="`tel:${selectedAppointment.phone}`" class="text-sm font-semibold text-gray-900">{{ selectedAppointment.phone }}</a>
                </div>
              </div>

              <!-- Infos rendez-vous -->
              <div class="bg-gray-50 rounded-2xl p-5 space-y-4">
                <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Créneau</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-0.5">Date</p>
                    <p class="text-sm font-semibold text-gray-900">{{ formatDateFull(selectedAppointment.date) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-0.5">Horaire</p>
                    <p class="text-sm font-semibold text-gray-900">{{ formatTime(selectedAppointment.start_time) }} - {{ formatTime(selectedAppointment.end_time) }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-0.5">Sujet</p>
                  <p class="text-sm text-gray-900">{{ selectedAppointment.subject || 'Non renseigné' }}</p>
                </div>
              </div>

              <!-- Actions -->
              <div v-if="selectedAppointment.status === 'pending'" class="border-t border-gray-100 pt-6 space-y-3">
                <p class="text-sm text-gray-500 mb-1">Actions</p>
                <div v-if="!selectedAppointmentState?.action" class="grid grid-cols-2 gap-3">
                  <button
                    @click.stop="startSelectedAction('confirmed')"
                    class="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Confirmer
                  </button>
                  <button
                    @click.stop="startSelectedAction('refused')"
                    class="w-full py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Refuser
                  </button>
                </div>

                <div v-else class="space-y-4">
                  <label for="admin-message" class="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    id="admin-message"
                    v-model="selectedAppointmentState.admin_message"
                    placeholder="Écrivez un message"
                    rows="4"
                    class="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  ></textarea>
                  <div class="flex gap-3">
                    <button
                      @click.stop="submitAction()"
                      :disabled="isRowLoading(selectedAppointment.value)"
                      class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {{ isRowLoading(selectedAppointment.value) ? 'En cours...' : 'Valider' }}
                    </button>
                    <button
                      @click.stop="cancelAction(selectedAppointment.value)"
                      class="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>

              <!-- Annulé avec raison -->
              <div v-if="selectedAppointment.status === 'cancelled' && selectedAppointment.cancel_reason" class="bg-red-50 rounded-2xl p-5">
                <h4 class="text-sm font-bold text-red-800 uppercase tracking-wide mb-2">Raison d'annulation</h4>
                <p class="text-sm text-red-700">{{ selectedAppointment.cancel_reason }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>



<style scoped>
.sidebar-enter-active > div:first-child {
  transition: opacity 0.25s ease-out;
}
.sidebar-leave-active > div:first-child {
  transition: opacity 0.2s ease-in;
}
.sidebar-enter-from > div:first-child,
.sidebar-leave-to > div:first-child {
  opacity: 0;
}

.sidebar-enter-active > div:last-child {
  transition: transform 0.25s ease-out;
}
.sidebar-leave-active > div:last-child {
  transition: transform 0.2s ease-in;
}
.sidebar-enter-from > div:last-child,
.sidebar-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
