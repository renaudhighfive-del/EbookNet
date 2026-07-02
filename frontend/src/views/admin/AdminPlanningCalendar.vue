<template>
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
      <div class="flex items-center gap-2">
        <button class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
          Semaine
        </button>
        <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
          Jour
        </button>
        <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
          Liste
        </button>
      </div>
    </div>

    <div class="rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
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

      <div class="relative" style="height: 800px;">
        <div class="absolute inset-0 grid grid-cols-7">
          <div v-for="(day, dayIndex) in weekDays" :key="day.date" class="border-r border-gray-100 last:border-r-0 relative">
            <div class="absolute inset-0" style="background-size: 100% 80px;">
              <div v-for="i in 12" :key="i" class="h-20 border-t border-gray-100"></div>
            </div>

            <div class="relative">
              <div
                v-for="event in getEventsForDay(day.date)"
                :key="event.id"
                :style="{
                  top: `${getEventPosition(event.start_time)}px`,
                  height: `${getEventHeight(event.start_time, event.end_time)}px`
                }"
                :class="[
                  'absolute left-2 right-2 rounded-xl p-2 text-sm font-medium overflow-hidden',
                  event.status === 'confirmed' ? 'bg-[#5B8DEF] text-white' : 
                  event.status === 'pending' ? 'bg-amber-50 text-amber-800 border-2 border-dashed border-amber-300' : 
                  'bg-gray-100 text-gray-600'
                ]"
              >
                <p class="truncate">{{ event.first_name }} {{ event.last_name }}</p>
                <p class="text-xs opacity-80 mt-0.5">{{ formatTime(event.start_time) }}–{{ formatTime(event.end_time) }}</p>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminPlanningStore } from '@/stores/admin-planning'

const store = useAdminPlanningStore()
const weekStart = ref(new Date())
const today = new Date()

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

function getEventsForDay(date) {
  return (store.appointments || []).filter(e => e.date === date && e.status !== 'cancelled')
}

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

function previousWeek() {
  weekStart.value = new Date(weekStart.value.getFullYear(), weekStart.value.getMonth(), weekStart.value.getDate() - 7)
}

function nextWeek() {
  weekStart.value = new Date(weekStart.value.getFullYear(), weekStart.value.getMonth(), weekStart.value.getDate() + 7)
}

function goToToday() {
  weekStart.value = new Date()
}

onMounted(async () => {
  await store.fetchAppointments()
})
</script>
