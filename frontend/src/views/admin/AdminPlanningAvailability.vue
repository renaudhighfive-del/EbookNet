<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Disponibilités</h2>
      <p class="text-gray-500">Définissez vos horaires par jour de la semaine. Les créneaux seront générés automatiquement.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-1">Horaires hebdomadaires</h3>
          
          <div class="space-y-4 mt-6">
            <div
              v-for="rule in availabilityRules"
              :key="rule.day_of_week"
              class="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl hover:border-blue-200 transition-all"
            >
              <div class="flex items-center gap-3 w-28 flex-shrink-0">
                <button
                  @click="toggleRuleActive(rule)"
                  :class="[
                    'w-10 h-6 rounded-full transition-all relative',
                    rule.is_active ? 'bg-[#5B8DEF]' : 'bg-gray-200'
                  ]"
                >
                  <span
                    class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                    :class="rule.is_active ? 'left-5' : 'left-1'"
                  ></span>
                </button>
                <span class="font-medium text-gray-900">{{ getDayName(rule.day_of_week) }}</span>
              </div>
              
              <template v-if="rule.is_active">
                <div class="flex items-center gap-2 flex-1">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl">
                      <input
                        v-model="rule.start_time"
                        type="time"
                        class="w-full text-sm font-medium text-gray-900 bg-transparent outline-none"
                        @change="updateRule(rule)"
                      />
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                      </svg>
                    </div>
                  </div>
                  <span class="text-gray-400">—</span>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl">
                      <input
                        v-model="rule.end_time"
                        type="time"
                        class="w-full text-sm font-medium text-gray-900 bg-transparent outline-none"
                        @change="updateRule(rule)"
                      />
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                      </svg>
                    </div>
                  </div>
                  <select
                    v-model="rule.slot_duration_minutes"
                    @change="updateRule(rule)"
                    class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 bg-white"
                  >
                    <option :value="30">30 min</option>
                    <option :value="45">45 min</option>
                    <option :value="60">60 min</option>
                  </select>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center gap-2 flex-1 opacity-50">
                  <div class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl">
                    <span class="text-sm text-gray-400">{{ rule.start_time || '09:00' }}</span>
                  </div>
                  <span class="text-gray-300">—</span>
                  <div class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl">
                    <span class="text-sm text-gray-400">{{ rule.end_time || '17:00' }}</span>
                  </div>
                  <div class="px-4 py-2.5 border border-gray-200 rounded-xl">
                    <span class="text-sm text-gray-400">{{ rule.slot_duration_minutes || 30 }} min</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-1">Exceptions</h3>
          <p class="text-sm text-gray-500 mb-4">Bloquez des dates ponctuelles (jours fériés, absences).</p>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="exception in exceptions"
              :key="exception.id || exception.date"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-sm"
            >
              {{ formatDate(exception.date) }}
              <button @click="removeException(exception)" class="text-gray-400 hover:text-gray-600">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </span>
          </div>

          <div class="flex gap-2">
            <input
              ref="exceptionDateInput"
              v-model="newExceptionDate"
              type="date"
              class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            />
            <button
              @click="addException"
              :disabled="!newExceptionDate"
              class="px-4 py-2.5 bg-[#5B8DEF] text-white font-semibold rounded-xl hover:bg-[#4b7bdf] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Paramètres</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Délai minimum de réservation</label>
              <select v-model="settings.min_notice_hours" @change="saveSettings" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
                <option :value="1">1 heure</option>
                <option :value="2">2 heures</option>
                <option :value="24">24 heures</option>
                <option :value="48">48 heures</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Réservation maximum à l'avance</label>
              <select v-model="settings.max_advance_days" @change="saveSettings" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
                <option :value="7">7 jours</option>
                <option :value="30">30 jours</option>
                <option :value="60">60 jours</option>
                <option :value="90">90 jours</option>
              </select>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Confirmation automatique</span>
              <button
                @click="toggleAutoConfirm"
                :class="[
                  'w-10 h-6 rounded-full transition-all relative',
                  settings.auto_confirm ? 'bg-[#5B8DEF]' : 'bg-gray-200'
                ]"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.auto_confirm ? 'left-5' : 'left-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sticky top-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Aperçu</h3>
            <select v-model="previewDayIndex" class="px-3 py-1.5 border border-gray-200 rounded-xl text-sm bg-white">
              <option v-for="(day, index) in previewDays" :key="index" :value="index">{{ day }}</option>
            </select>
          </div>

          <p class="text-sm text-gray-500 mb-4">Créneaux générés pour un {{ previewDays[previewDayIndex].toLowerCase() }} type.</p>

          <div class="grid grid-cols-3 gap-2 mb-4" v-if="previewSlots.length > 0">
            <div
              v-for="slot in previewSlots"
              :key="slot.time"
              class="py-2 px-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-sm font-medium text-[#5B8DEF]"
            >
              {{ slot.time }}
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center py-4">Aucun créneau disponible pour ce jour</p>

          <div class="mt-6 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">Google Calendar</p>
                <p class="text-sm text-gray-500">Synchronisez vos rendez-vous avec Google.</p>
              </div>
              <button class="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                Connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminPlanningStore } from '@/stores/admin-planning'

const store = useAdminPlanningStore()

const availabilityRules = ref([])
const exceptions = ref([])
const settings = ref({
  min_notice_hours: 2,
  max_advance_days: 30,
  auto_confirm: false,
  timezone: 'Africa/Porto-Novo'
})

const newExceptionDate = ref('')
const previewDayIndex = ref(0)
const previewDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const previewSlots = computed(() => {
  const dayRule = availabilityRules.value.find(r => r.day_of_week === previewDayIndex + 1)
  if (!dayRule || !dayRule.is_active) return []
  
  const slots = []
  let current = new Date(`2000-01-01T${dayRule.start_time}`)
  const end = new Date(`2000-01-01T${dayRule.end_time}`)
  const duration = dayRule.slot_duration_minutes || 30
  
  while (current.getTime() + duration * 60000 <= end.getTime()) {
    const time = current.toTimeString().slice(0, 5)
    slots.push({ time })
    current.setMinutes(current.getMinutes() + duration)
  }
  
  return slots
})

onMounted(async () => {
  await Promise.all([
    store.fetchRules(),
    store.fetchSettings()
  ])
  
  initRules()
  settings.value = { ...store.settings }
})

watch(() => store.rules, (newRules) => {
  initRules()
}, { deep: true })

function initRules() {
  const days = [1, 2, 3, 4, 5, 6, 7]
  availabilityRules.value = days.map(day => {
    const existing = store.rules.find(r => r.day_of_week === day)
    return existing || {
      teacher_id: null,
      day_of_week: day,
      start_time: '09:00:00',
      end_time: '17:00:00',
      slot_duration_minutes: 30,
      buffer_minutes: 0,
      is_active: false,
      id: null
    }
  })
}

function getDayName(dayOfWeek) {
  const names = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  return names[dayOfWeek]
}

async function toggleRuleActive(rule) {
  rule.is_active = !rule.is_active
  if (rule.id) {
    await updateRule(rule)
  } else if (rule.is_active) {
    await createRule(rule)
  }
}

async function createRule(rule) {
  try {
    await store.createRule({
      day_of_week: rule.day_of_week,
      start_time: rule.start_time,
      end_time: rule.end_time,
      slot_duration_minutes: rule.slot_duration_minutes,
      buffer_minutes: 0,
      is_active: rule.is_active
    })
  } catch (e) {
    console.error(e)
  }
}

async function updateRule(rule) {
  if (!rule.id) return await createRule(rule)
  try {
    await store.updateRule(rule.id, {
      day_of_week: rule.day_of_week,
      start_time: rule.start_time,
      end_time: rule.end_time,
      slot_duration_minutes: rule.slot_duration_minutes,
      buffer_minutes: 0,
      is_active: rule.is_active
    })
  } catch (e) {
    console.error(e)
  }
}

async function addException() {
  if (!newExceptionDate.value) return
  try {
    await store.createAvailabilityException({
      date: newExceptionDate.value,
      type: 'blocked',
      reason: null
    })
    exceptions.value.push({
      date: newExceptionDate.value,
      type: 'blocked'
    })
    newExceptionDate.value = ''
  } catch (e) {
    console.error(e)
  }
}

function removeException(exception) {
  exceptions.value = exceptions.value.filter(e => e.date !== exception.date)
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

async function saveSettings() {
  try {
    await store.updateSettings(settings.value)
  } catch (e) {
    console.error(e)
  }
}

async function toggleAutoConfirm() {
  settings.value.auto_confirm = !settings.value.auto_confirm
  await saveSettings()
}
</script>
