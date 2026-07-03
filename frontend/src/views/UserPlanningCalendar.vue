<template>
  <AuthenticatedLayout>
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Mes rendez-vous -->
      <div v-if="myAppointments.length > 0" class="mb-6 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Mes rendez-vous</h3>
        <div class="space-y-3">
          <div
            v-for="apt in myAppointments"
            :key="apt.id"
            class="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-blue-200 transition-all"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              :class="apt.status === 'confirmed' ? 'bg-green-100' : apt.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'"
            >
              <svg v-if="apt.status === 'confirmed'" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg v-else-if="apt.status === 'pending'" class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">
                {{ formatDateFull(apt.date) }}
              </p>
              <p class="text-sm text-gray-500">
                {{ formatTime(apt.start_time) }} - {{ formatTime(apt.end_time) }}
              </p>
              <p v-if="apt.subject" class="text-xs text-gray-400 truncate mt-0.5">{{ apt.subject }}</p>
            </div>
            <span
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap',
                apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              ]"
            >
              {{ getStatusLabel(apt.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- En-tête -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button @click="previousWeek" class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button @click="goToToday" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            Aujourd'hui
          </button>
          <h2 class="text-xl font-bold text-gray-900 min-w-[200px]">{{ currentWeekDisplay }}</h2>
          <button @click="nextWeek" class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
        <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
          <button
            @click="viewMode = 'week'"
            :class="['px-4 py-1.5 rounded-lg text-sm font-medium transition-all', viewMode === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800']"
          >
            Semaine
          </button>
          <button
            @click="viewMode = 'day'"
            :class="['px-4 py-1.5 rounded-lg text-sm font-medium transition-all', viewMode === 'day' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800']"
          >
            Jour
          </button>
        </div>
      </div>

      <!-- Calendrier -->
      <div class="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">
        <!-- En-tête des jours -->
        <div class="grid grid-cols-7 border-b border-gray-100">
          <div v-for="day in visibleDays" :key="day.date" class="py-4 text-center border-r border-gray-100 last:border-r-0">
            <p class="text-xs text-gray-500 uppercase font-medium tracking-wide">{{ day.shortName }}</p>
            <div class="mt-1">
              <span
                :class="[
                  'w-10 h-10 inline-flex items-center justify-center rounded-full text-lg font-semibold transition-all',
                  day.isToday ? 'bg-[#5B8DEF] text-white shadow-sm' : 'text-gray-900',
                ]"
              >
                {{ day.dayNumber }}
              </span>
            </div>
          </div>
        </div>

        <!-- Corps du calendrier -->
        <div class="relative" :style="{ height: viewMode === 'day' ? '600px' : '800px' }">
          <div class="absolute inset-0 grid" :class="viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'">
            <div v-for="(day, dayIndex) in visibleDays" :key="day.date" class="border-r border-gray-100 last:border-r-0 relative">
              <div class="absolute inset-0" style="background-size: 100% 80px;">
                <div v-for="i in (viewMode === 'day' ? 10 : 12)" :key="i" class="h-20 border-t border-gray-50"></div>
              </div>

              <div class="relative">
                <div
                  v-for="slot in (daySlots[day.date] || [])"
                  :key="`${day.date}-${slot.start}`"
                  @click="handleSlotClick(slot, day.date)"
                  :style="{
                    top: `${getEventPosition(slot.start, viewMode === 'day' ? 7 : 8)}px`,
                    height: `${Math.max(getEventHeight(slot.start, slot.end), 36)}px`,
                    minHeight: '36px',
                  }"
                  :class="[
                    'absolute left-1.5 right-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150',
                    slot.is_mine
                      ? slot.appointment_status === 'confirmed'
                        ? 'bg-green-50 border border-green-200 text-green-700 cursor-default shadow-sm'
                        : 'bg-amber-50 border border-amber-200 text-amber-700 cursor-default shadow-sm'
                      : slot.available
                        ? 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md cursor-pointer'
                        : 'bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed',
                  ]"
                >
                  <div class="flex items-center gap-1.5">
                    <span class="font-semibold">{{ formatTime(slot.start) }}</span>
                    <span v-if="slot.is_mine" class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      :class="slot.appointment_status === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'"
                    >
                      {{ getStatusLabel(slot.appointment_status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Heures (gauche) -->
          <div class="absolute left-0 top-0 bottom-0 w-12 pl-2 pointer-events-none">
            <div v-for="i in (viewMode === 'day' ? 10 : 12)" :key="i" class="h-20 text-xs text-gray-400 pt-2">
              {{ (viewMode === 'day' ? 8 + i : 7 + i).toString().padStart(2, '0') }}:00
            </div>
          </div>
        </div>
      </div>

      <!-- Légende -->
      <div class="flex flex-wrap items-center gap-6 mt-5 text-sm text-gray-500">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-md bg-white border-2 border-blue-200"></div>
          <span>Disponible</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-md bg-amber-50 border border-amber-200"></div>
          <span>Ma réservation (en attente)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-md bg-green-50 border border-green-200"></div>
          <span>Ma réservation (confirmée)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-md bg-gray-50 border border-gray-200"></div>
          <span>Indisponible</span>
        </div>
      </div>

      <BookingModal
        :isOpen="isModalOpen"
        :slot="selectedSlot"
        :selected-date="selectedSlotDate"
        @close="closeModal"
        @submit="handleBooking"
      />
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePlanningStore } from '@/stores/planning'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BookingModal from '@/components/BookingModal.vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const planningStore = usePlanningStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const weekStart = ref(new Date())
const today = new Date()
const isModalOpen = ref(false)
const selectedSlot = ref(null)
const selectedSlotDate = ref('')
const daySlots = ref({})
const viewMode = ref('week')

const visibleDays = computed(() => {
  if (viewMode.value === 'day') {
    const date = new Date(weekStart.value)
    const startOfWeek = getWeekStart(date)
    const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const dayIndex = date.getDay()
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
    const dayDate = new Date(startOfWeek)
    dayDate.setDate(startOfWeek.getDate() + adjustedIndex)
    return [{
      date: dayDate.toISOString().split('T')[0],
      shortName: names[adjustedIndex],
      dayNumber: dayDate.getDate(),
      isToday: dayDate.toDateString() === today.toDateString()
    }]
  }
  return buildWeekDays(weekStart.value)
})

function getWeekStart(date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  return start
}

function buildWeekDays(date) {
  const days = []
  const start = getWeekStart(date)
  const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({
      date: d.toISOString().split('T')[0],
      shortName: names[i],
      dayNumber: d.getDate(),
      isToday: d.toDateString() === today.toDateString()
    })
  }
  return days
}

const myAppointments = computed(() => {
  const allSlots = Object.values(daySlots.value).flat()
  const seen = new Set()
  return allSlots
    .filter(s => s.is_mine && s.appointment_id)
    .map(s => ({
      id: s.appointment_id,
      date: Object.keys(daySlots.value).find(date =>
        daySlots.value[date]?.some(x => x.appointment_id === s.appointment_id)
      ),
      start_time: s.start,
      end_time: s.end,
      status: s.appointment_status,
      subject: null,
    }))
    .filter(apt => {
      if (seen.has(apt.id)) return false
      seen.add(apt.id)
      return true
    })
    .sort((a, b) => `${a.date}T${a.start_time}`.localeCompare(`${b.date}T${b.start_time}`))
})

const currentWeekDisplay = computed(() => {
  const first = visibleDays.value[0]
  const last = visibleDays.value[visibleDays.value.length - 1]
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const startDate = new Date(first.date)
  const endDate = new Date(last.date)

  if (viewMode.value === 'day') {
    return `${startDate.getDate()} ${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`
  }
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()} — ${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${startDate.getFullYear()}`
  }
  return `${startDate.getDate()} ${monthNames[startDate.getMonth()]} — ${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`
})

function slotClass(slot) {
  if (slot.is_mine) {
    return slot.appointment_status === 'confirmed'
      ? 'bg-green-50 border border-green-200 text-green-700 cursor-default'
      : 'bg-amber-50 border border-amber-200 text-amber-700 cursor-default'
  }
  if (slot.available) {
    return 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md cursor-pointer'
  }
  return 'bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed'
}

function handleSlotClick(slot, date) {
  if (slot.is_mine) return
  if (slot.available) openBookingModal(slot, date)
}

function getEventPosition(time, startHour = 8) {
  const [hours, minutes] = time.split(':').map(Number)
  return ((hours - startHour) * 80) + (minutes / 60 * 80)
}

function getEventHeight(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  return Math.max((duration / 60) * 80, 36)
}

function formatTime(time) {
  if (!time) return ''
  return time.slice(0, 5)
}

function formatDateFull(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
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

async function loadSlots() {
  daySlots.value = {}
  const promises = visibleDays.value.map(async day => {
    await planningStore.fetchAvailability(day.date)
    daySlots.value[day.date] = [...planningStore.slots]
  })
  await Promise.all(promises)
}

function openBookingModal(slot, date) {
  selectedSlot.value = slot
  selectedSlotDate.value = date
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedSlot.value = null
  selectedSlotDate.value = ''
}

async function handleBooking(data) {
  try {
    await planningStore.createAppointment(data)
    closeModal()
    await loadSlots()
    toastStore.success('Rendez-vous soumis ! En attente de validation.')
  } catch (error) {
    const msg = error.response?.data?.message || 'Erreur lors de la réservation.'
    toastStore.error(msg)
    if (error.response?.status === 409) {
      await loadSlots()
    }
  }
}

function previousWeek() {
  const days = viewMode.value === 'day' ? 1 : 7
  weekStart.value = new Date(weekStart.value.getFullYear(), weekStart.value.getMonth(), weekStart.value.getDate() - days)
}

function nextWeek() {
  const days = viewMode.value === 'day' ? 1 : 7
  weekStart.value = new Date(weekStart.value.getFullYear(), weekStart.value.getMonth(), weekStart.value.getDate() + days)
}

function goToToday() {
  weekStart.value = new Date()
}

watch(weekStart, async () => {
  await loadSlots()
}, { immediate: true })

watch(viewMode, async () => {
  await loadSlots()
})
</script>
