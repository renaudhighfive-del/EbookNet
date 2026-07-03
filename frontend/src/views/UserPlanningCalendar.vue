<template>
  <AuthenticatedLayout>
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
        <div v-for="day in weekDays" :key="day.date" class="py-4 text-center border-r border-gray-100 last:border-r-0" :class="{ 'opacity-50': isDateBeforeToday(day.date) }">
          <p class="text-xs text-gray-500 uppercase font-medium">{{ day.shortName }}</p>
          <div class="mt-1">
            <span
              :class="[
                'w-10 h-10 inline-flex items-center justify-center rounded-full text-lg font-semibold',
                day.isToday ? 'bg-[#5B8DEF] text-white' : (isDateBeforeToday(day.date) ? 'text-gray-400' : 'text-gray-900')
              ]"
            >
              {{ day.dayNumber }}
            </span>
          </div>
        </div>
      </div>

      <!-- Time grid -->
      <div class="relative" style="height: 1536px;">
        <div class="absolute inset-0 grid grid-cols-7">
          <div v-for="(day, dayIndex) in weekDays" :key="day.date" class="border-r border-gray-100 last:border-r-0 relative">
            <!-- Half-hour lines -->
            <div class="absolute inset-0 pointer-events-none" style="background-size: 100% 64px;">
              <div v-for="slot in timeSlots" :key="slot" class="h-16 border-t border-gray-100"></div>
            </div>

            <!-- Empty slots -->
            <div class="absolute inset-0 z-10">
              <template v-for="daySlot in getDaySlots(day.date)" :key="`${day.date}-${daySlot.start}`">
                <div
                  v-if="!daySlot.occupied"
                  @click.stop="!isDateBeforeToday(day.date) && onEmptySlotClick(daySlot, day.date)"
                  :class="[
                    'absolute left-1.5 right-1.5 h-16 rounded-xl border border-dashed transition-all flex items-center justify-center',
                    isDateBeforeToday(day.date)
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50 pointer-events-none'
                      : 'border-gray-200 bg-white/80 hover:bg-blue-50 cursor-pointer pointer-events-auto'
                  ]"
                  :style="{ top: `${daySlot.index * 64}px` }"
                >
                  <span
                    v-if="!isDateBeforeToday(day.date)"
                    class="text-blue-400 text-xs font-semibold"
                  >
                    +
                  </span>
                </div>
              </template>
            </div>

            <!-- Events -->
            <div class="relative z-20">
              <div
                v-for="event in getEventsForDay(day.date)"
                :key="event.id"
                @click="event.is_mine && !isDateBeforeToday(day.date) && openDetails(event)"
                :style="{
                  top: `${getEventPosition(event.start_time)}px`,
                  height: `${getEventHeight(event.start_time, event.end_time)}px`
                }"
                :class="[
                  'absolute left-1.5 right-1.5 rounded-xl p-2 text-xs font-medium overflow-hidden transition-all',
                  isDateBeforeToday(day.date) ? 'opacity-70 cursor-default' : 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:z-30',
                    !event.is_mine
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : event.status === 'confirmed'
                        ? 'bg-green-500 text-white'
                        : event.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border-2 border-dashed border-amber-400'
                        : event.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                ]"
              >
                <p class="truncate font-semibold">{{ event.is_mine ? `${event.first_name} ${event.last_name}` : 'Occupé' }}</p>
                <p class="opacity-80 mt-0.5">{{ formatTime(event.start_time) }}–{{ formatTime(event.end_time) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Time labels -->
        <div class="absolute left-0 top-0 bottom-0 w-14 pl-2 pointer-events-none">
          <div v-for="slot in timeSlots" :key="slot" class="h-16 text-[10px] text-gray-400 leading-[1.1] pt-1">
            {{ slot }}
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
                <p class="text-sm text-gray-500 mt-0.5">Consultez cette demande.</p>
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

    <BookingModal
      :isOpen="isBookingModalOpen"
      :slot="selectedBookingSlot"
      :selected-date="selectedBookingDate"
      @close="closeBookingModal"
      @submit="handleBooking"
    />
  </div>
</AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePlanningStore } from '@/stores/planning'
import { useToastStore } from '@/stores/toast'
import BookingModal from '@/components/BookingModal.vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const store = usePlanningStore()
const toastStore = useToastStore()
const weekStart = ref(new Date())
const today = new Date()
const selectedAppointment = ref(null)

const selectedBookingSlot = ref(null)
const selectedBookingDate = ref('')
const isBookingModalOpen = ref(false)

const weekDays = computed(() => {
  const days = []
  const start = getWeekStart(weekStart.value)
  const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push({
      date: toLocalISODate(date),
      shortName: names[i],
      dayNumber: date.getDate(),
      monthIndex: date.getMonth(),
      isToday: date.toDateString() === today.toDateString()
    })
  }
  return days
})

const currentWeekDisplay = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  if (start.monthIndex === end.monthIndex) {
    return `${start.dayNumber} — ${end.dayNumber} ${monthNames[end.monthIndex]}`
  }
  return `${start.dayNumber} ${monthNames[start.monthIndex]} — ${end.dayNumber} ${monthNames[end.monthIndex]}`
})

function toLocalISODate(date) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

const timeSlots = computed(() => {
  const labels = []
  const startHour = 8
  const totalSlots = 24

  for (let index = 0; index < totalSlots; index++) {
    const hour = startHour + Math.floor(index / 2)
    const minute = index % 2 === 0 ? '00' : '30'
    const nextHour = startHour + Math.floor((index + 1) / 2)
    const nextMinute = (index + 1) % 2 === 0 ? '00' : '30'
    labels.push(`${hour}h${minute}-${nextHour}h${nextMinute}`)
  }
  return labels
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
  const fmt = d => toLocalISODate(d)

  await store.fetchCalendarAppointments(fmt(start), fmt(end))
  console.log('Appointments loaded:', store.calendarAppointments)
}

function getDaySlots(date) {
  const appointments = getEventsForDay(date)
  const slots = []

  for (let index = 0; index < timeSlots.value.length; index++) {
    const [startLabel, endLabel] = timeSlots.value[index].split('-')
    const start = labelToTime(startLabel)
    const end = labelToTime(endLabel)
    const occupied = appointments.some(event => timeRangesOverlap(event.start_time, event.end_time, start, end))
    slots.push({ index, start, end, occupied })
  }

  return slots
}

function getEventsForDay(date) {

  return (store.calendarAppointments || []).filter(e => {
    const appointmentDate = normalizeDate(e.date)

    return (
    appointmentDate === date &&
    (e.is_mine || e.status !== 'cancelled')
    )
  })
}

function normalizeDate(dateValue) {
  if (!dateValue) return ''
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue
  }

  return toLocalISODate(new Date(dateValue))
}

function onEmptySlotClick(slot, date) {
  selectedBookingSlot.value = {
    start: slot.start,
    end: slot.end,
    available: true
  }
  selectedBookingDate.value = date
  isBookingModalOpen.value = true
}

function closeBookingModal() {
  isBookingModalOpen.value = false
  selectedBookingSlot.value = null
  selectedBookingDate.value = ''
}

async function handleBooking(data) {
  try {
    await store.createAppointment(data)
    closeBookingModal()
    await loadWeek()
    toastStore.success('Rendez-vous soumis ! En attente de validation.')
  } catch (error) {
    const msg = error.response?.data?.message || 'Erreur lors de la réservation.'
    toastStore.error(msg)

    if (error.response?.status === 409) {
      await loadWeek()
    }
  }
}

function getEventPosition(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const slotIndex = (hours - 8) * 2 + (minutes === 30 ? 1 : 0)
  return slotIndex * 64
}

function getEventHeight(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  const slots = duration / 30
  return Math.max(slots * 64, 40)
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

function isDateBeforeToday(dateStr) {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const [year, month, day] = dateStr.split('-').map(Number)
  const checkDate = new Date(year, month - 1, day)
  checkDate.setHours(0, 0, 0, 0)

  return checkDate < todayDate
}

function labelToTime(label) {
  const [h, m] = label.split('h')
  return `${h.padStart(2, '0')}:${m}:00`
}

function parseTimeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function timeRangesOverlap(startA, endA, startB, endB) {
  return parseTimeToMinutes(startA) < parseTimeToMinutes(endB) && parseTimeToMinutes(endA) > parseTimeToMinutes(startB)
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
