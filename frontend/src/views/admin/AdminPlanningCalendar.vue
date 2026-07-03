<template>
  <div class="p-6">
    <!-- Header navigation -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button @click="previousWeek" class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button @click="goToToday" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
          Aujourd'hui
        </button>
        <h2 class="text-xl font-bold text-gray-900">{{ currentWeekDisplay }}</h2>
        <button @click="nextWeek" class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1.5 text-xs text-gray-500">
          <span class="w-3 h-3 rounded bg-green-500"></span> Confirmé
        </span>
        <span class="flex items-center gap-1.5 text-xs text-gray-500">
          <span class="w-3 h-3 rounded bg-amber-400 border border-dashed border-amber-600"></span> En attente
        </span>
        <span class="flex items-center gap-1.5 text-xs text-gray-500">
          <span class="w-3 h-3 rounded bg-gray-400"></span> Terminé
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
    </div>

    <!-- Calendar grid -->
    <div v-else class="rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <!-- Day headers -->
      <div class="grid grid-cols-7 border-b border-gray-100">
        <div v-for="day in weekDays" :key="day.date" class="py-4 text-center border-r border-gray-100 last:border-r-0">
          <p class="text-xs text-gray-500 uppercase font-medium">{{ day.shortName }}</p>
          <div class="mt-1">
            <span
              :class="[
                'w-10 h-10 inline-flex items-center justify-center rounded-full text-lg font-semibold',
                day.isToday ? 'bg-[#5B8DEF] text-white' : 'text-gray-900'
              ]"
            >
              {{ day.dayNumber }}
            </span>
          </div>
        </div>
      </div>

      <!-- Time grid -->
      <div class="relative" style="height: 800px;">
        <div class="absolute inset-0 grid grid-cols-7">
          <div v-for="(day, dayIndex) in weekDays" :key="day.date" class="border-r border-gray-100 last:border-r-0 relative">
            <!-- Hour lines -->
            <div class="absolute inset-0" style="background-size: 100% 80px;">
              <div v-for="i in 12" :key="i" class="h-20 border-t border-gray-100"></div>
            </div>

            <!-- Events -->
            <div class="relative">
              <div
                v-for="event in getEventsForDay(day.date)"
                :key="event.id"
                @click="openDetails(event)"
                :style="{
                  top: `${getEventPosition(event.start_time)}px`,
                  height: `${getEventHeight(event.start_time, event.end_time)}px`
                }"
                :class="[
                  'absolute left-1.5 right-1.5 rounded-xl p-2 text-xs font-medium overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] hover:z-10',
                  event.status === 'confirmed' ? 'bg-green-500 text-white' : 
                  event.status === 'pending' ? 'bg-amber-50 text-amber-800 border-2 border-dashed border-amber-400' : 
                  'bg-gray-100 text-gray-600'
                ]"
              >
                <p class="truncate font-semibold">{{ event.first_name }} {{ event.last_name }}</p>
                <p class="opacity-80 mt-0.5">{{ formatTime(event.start_time) }}–{{ formatTime(event.end_time) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Time labels -->
        <div class="absolute left-0 top-0 bottom-0 w-12 pl-2 pointer-events-none">
          <div v-for="i in 12" :key="i" class="h-20 text-xs text-gray-400 pt-2">
            {{ (7 + i).toString().padStart(2, '0') }}:00
          </div>
        </div>
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
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="confirmFromSidebar"
                    class="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Confirmer
                  </button>
                  <button
                    @click="cancelFromSidebar"
                    class="w-full py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Refuser
                  </button>
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminPlanningStore } from '@/stores/admin-planning'
import { useToastStore } from '@/stores/toast'

const store = useAdminPlanningStore()
const toastStore = useToastStore()
const weekStart = ref(new Date())
const today = new Date()
const selectedAppointment = ref(null)

const weekDays = computed(() => {
  const days = []
  const start = getWeekStart(weekStart.value)
  const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      shortName: names[i],
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString()
    })
  }
  return days
})

const currentWeekDisplay = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const startDate = new Date(start.date)
  const endDate = new Date(end.date)

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()} — ${endDate.getDate()} ${monthNames[endDate.getMonth()]}`
  }
  return `${startDate.getDate()} ${monthNames[startDate.getMonth()]} — ${endDate.getDate()} ${monthNames[endDate.getMonth()]}`
})

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekEnd(date) {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

async function loadWeek() {
  const start = getWeekStart(weekStart.value)
  const end = getWeekEnd(weekStart.value)
  const fmt = d => d.toISOString().split('T')[0]
  await store.fetchCalendarAppointments(fmt(start), fmt(end))
}

function getEventsForDay(date) {
  return (store.calendarAppointments || []).filter(e => e.date === date && e.status !== 'cancelled')
}

function getEventPosition(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return ((hours - 8) * 80) + (minutes / 60 * 80)
}

function getEventHeight(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  return Math.max((duration / 60) * 80, 40)
}

function formatTime(time) {
  return time ? time.slice(0, 5) : ''
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

function formatDateFull(dateStr) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function previousWeek() {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() - 7)
  weekStart.value = d
}

function nextWeek() {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() + 7)
  weekStart.value = d
}

function goToToday() {
  weekStart.value = new Date()
}

watch(weekStart, () => {
  loadWeek()
})

function openDetails(appointment) {
  selectedAppointment.value = appointment
}

function closeDetails() {
  selectedAppointment.value = null
}

async function confirmFromSidebar() {
  if (!selectedAppointment.value) return
  try {
    await store.updateAppointment(selectedAppointment.value.id, { status: 'confirmed' })
    toastStore.success(`Rendez-vous de ${selectedAppointment.value.first_name} confirmé.`)
    closeDetails()
  } catch {
    toastStore.error('Erreur lors de la confirmation.')
  }
}

async function cancelFromSidebar() {
  if (!selectedAppointment.value) return
  try {
    await store.cancelAppointment(selectedAppointment.value.id, {
      cancel_reason: 'Annulé par l\'administrateur'
    })
    toastStore.info(`Rendez-vous de ${selectedAppointment.value.first_name} annulé.`)
    closeDetails()
  } catch {
    toastStore.error('Erreur lors de l\'annulation.')
  }
}

onMounted(async () => {
  await loadWeek()
})
</script>

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
