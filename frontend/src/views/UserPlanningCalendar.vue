<template>
  <AuthenticatedLayout>
    <div class="p-6">
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
      </div>

      <div class="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">
        <div class="grid grid-cols-7 border-b border-gray-100">
          <div v-for="day in weekDays" :key="day.date" class="py-4 text-center border-r border-gray-100 last:border-r-0">
            <p class="text-xs text-gray-500 uppercase font-medium">{{ day.shortName }}</p>
            <div class="mt-1">
              <span
                :class="[
                  'w-10 h-10 inline-flex items-center justify-center rounded-full text-lg font-semibold',
                  day.isToday ? 'bg-[#5B8DEF] text-white' : 'text-gray-900',
                ]"
              >
                {{ day.dayNumber }}
              </span>
            </div>
          </div>
        </div>

        <div class="relative" style="height: 800px;">
          <div class="absolute inset-0 grid grid-cols-7">
            <div v-for="(day, dayIndex) in weekDays" :key="day.date" class="border-r border-gray-100 last:border-r-0 relative">
              <div class="absolute inset-0" style="background-size: 100% 80px;">
                <div v-for="i in 12" :key="i" class="h-20 border-t border-gray-100"></div>
              </div>

              <div class="relative">
                <div
                  v-for="slot in (daySlots[day.date] || [])"
                  :key="`${day.date}-${slot.start}`"
                  @click="slot.available && openBookingModal(slot, day.date)"
                  :style="{
                    top: `${getEventPosition(slot.start)}px`,
                    height: `${getEventHeight(slot.start, slot.end)}px`,
                  }"
                  :class="[
                    'absolute left-2 right-2 rounded-xl p-2 text-sm font-medium overflow-hidden cursor-pointer transition-all',
                    slot.available 
                      ? 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300' 
                      : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed',
                  ]"
                >
                  <p class="truncate">{{ formatTime(slot.start) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="absolute left-0 top-0 bottom-0 w-12 pl-2">
            <div v-for="i in 12" :key="i" class="h-20 text-xs text-gray-400 pt-2">
              {{ (7 + i).toString().padStart(2, '0') }}:00
            </div>
          </div>
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
import AppLayout from '@/layouts/AppLayout.vue'
import BookingModal from '@/components/BookingModal.vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'


const planningStore = usePlanningStore()
const weekStart = ref(new Date())
const today = new Date()
const isModalOpen = ref(false)
const selectedSlot = ref(null)
const selectedSlotDate = ref('')
const daySlots = ref({})

const weekDays = computed(() => {
  const days = []
  const start = new Date(weekStart.value)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  
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

function getEventPosition(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return ((hours - 8) * 80) + (minutes / 60 * 80)
}

function getEventHeight(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  return (duration / 60) * 80
}

function formatTime(time) {
  return time.slice(0, 5)
}

async function loadWeekSlots() {
  daySlots.value = {}
  const promises = weekDays.value.map(async day => {
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
    await loadWeekSlots()
  } catch (error) {
    console.error('Booking error:', error)
  }
}

function previousWeek() {
  weekStart.value = new Date(weekStart.value.getFullYear(), weekStart.value.getMonth(), weekStart.value.getDate() - 7)
}

function nextWeek() {
  weekStart.value = new Date(weekStart.value.getFullYear(), weekStart.value.getMonth(), weekStart.value.getDate() + 7)
}

function goToToday() {
  weekStart.value = new Date()
}

watch(weekStart, async () => {
  await loadWeekSlots()
}, { immediate: true })

onMounted(async () => {
  await loadWeekSlots()
})
</script>
