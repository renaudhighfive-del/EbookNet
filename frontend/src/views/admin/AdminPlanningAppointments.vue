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
          class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              ? 'bg-blue-500 text-white'
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
        class="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all"
      >
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-blue-500"
          :style="{ backgroundColor: getInitialsBg(`${appointment.first_name} ${appointment.last_name}`) }"
        >
          {{ getInitials(`${appointment.first_name} ${appointment.last_name}`) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-base font-semibold text-gray-900">{{ appointment.first_name }} {{ appointment.last_name }}</p>
          <p class="text-sm text-gray-500 truncate">{{ appointment.subject || 'Sans sujet' }}</p>
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
              appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="appointment.status === 'confirmed' ? 'bg-green-500' : appointment.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'"></span>
            {{ getStatusLabel(appointment.status) }}
          </span>
        </div>
        <div v-if="appointment.status === 'pending'" class="flex items-center gap-2">
          <button @click="confirmAppointment(appointment)" class="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </button>
          <button @click="cancelAppointment(appointment)" class="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="filteredAppointments.length === 0" class="text-center py-12">
        <p class="text-gray-500">Aucun rendez-vous trouvé</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminPlanningStore } from '@/stores/admin-planning'
import { debounce } from 'lodash-es'

const store = useAdminPlanningStore()

const searchQuery = ref('')
const activeFilter = ref('all')

const filters = [
  { id: 'all', label: 'Tous' },
  { id: 'pending', label: 'En attente' },
  { id: 'confirmed', label: 'Confirmés' },
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

const debouncedSearch = debounce(() => {
  // We could fetch with search params, but for now filter client-side
}, 300)

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

async function confirmAppointment(appointment) {
  try {
    await store.updateAppointment(appointment.id, { status: 'confirmed' })
  } catch (e) {
    console.error(e)
  }
}

async function cancelAppointment(appointment) {
  try {
    await store.cancelAppointment(appointment.id, { cancel_reason: 'Annulé par l\'administrateur' })
  } catch (e) {
    console.error(e)
  }
}
</script>
