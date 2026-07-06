<template>
  <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
    <!-- User greeting -->
    <div class="mb-6">
      <p class="text-sm text-gray-600 mb-1">Bonjour,</p>
      <p class="text-xl font-bold text-gray-900">{{ user?.first_name || 'Admin' }} 👋</p>
    </div>

    <!-- New slot button -->
    <button class="w-full py-3 bg-[#5B8DEF] text-white font-semibold rounded-xl hover:bg-[#4b7bdf] transition-all flex items-center justify-center gap-2 mb-6">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      Nouveau créneau
    </button>

    <!-- Mini calendar -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <p class="font-semibold text-gray-900">{{ currentMonth }}</p>
        <div class="flex items-center gap-2">
          <button @click="previousMonth" class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button @click="nextMonth" class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        <span v-for="day in weekDayNames" :key="day" class="text-gray-400 font-medium">{{ day }}</span>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, i) in calendarDays"
          :key="i"
          @click="!day.isEmpty && selectDate(day)"
          :class="[
            'h-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all',
            day.isToday ? 'bg-[#5B8DEF] text-white font-semibold' : day.isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100',
            day.isEmpty ? 'text-transparent cursor-default hover:bg-transparent' : '',
            day.hasEvent && !day.isToday ? 'relative' : ''
          ]"
        >
          {{ day.number }}
          <span v-if="day.hasEvent && !day.isToday" class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="pb-6 mb-6 border-b border-gray-200">
      <p class="text-sm font-semibold text-gray-700 mb-3">CETTE SEMAINE</p>
      <p class="text-4xl font-bold text-gray-900 mb-1">{{ thisWeekAppointments.length }}</p>
      <p class="text-sm text-gray-500">rendez-vous programmés</p>
    </div>

    <!-- Legend -->
    <div>
      <p class="text-sm font-semibold text-gray-700 mb-3">LÉGENDE</p>
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <div class="w-4 h-4 rounded-full bg-[#47eb31]"></div>
          <span class="text-sm text-gray-700">Confirmé</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-4 h-4 rounded-full border-2 border-dashed border-amber-400 bg-amber-50"></div>
          <span class="text-sm text-gray-700">En attente</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-4 h-4 rounded-full bg-gray-100"></div>
          <span class="text-sm text-gray-700">Annulé</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminPlanningStore } from '@/stores/admin-planning'
import { useAuthStore } from '@/stores/auth'

const store = useAdminPlanningStore()
const authStore = useAuthStore()

const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const weekDayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const currentMonth = computed(() => {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // First day of month
  const firstDay = new Date(year, month, 1)
  const startingDay = (firstDay.getDay() + 6) % 7 // Monday = 0
  
  // Last day of month
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  const days = []
  const today = new Date()
  
  // Empty days before month start
  for (let i = 0; i < startingDay; i++) {
    days.push({ isEmpty: true })
  }
  
  // Days in month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      number: i,
      date: dateStr,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: date.toDateString() === selectedDate.value.toDateString(),
      hasEvent: (store.appointments || []).some(a => a.date === dateStr && a.status !== 'cancelled'),
    })
  }
  
  return days
})

const thisWeekAppointments = computed(() => {
  const now = new Date()
  const weekStart = new Date(now)
  const day = weekStart.getDay()
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
  weekStart.setDate(diff)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  return (store.appointments || []).filter(a => {
    const apptDate = new Date(a.date)
    return apptDate >= weekStart && apptDate <= weekEnd && a.status !== 'cancelled'
  })
})

const user = computed(() => authStore.user)

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function selectDate(day) {
  const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day.number)
  selectedDate.value = date
}

onMounted(async () => {
  await store.fetchAppointments()
})
</script>
