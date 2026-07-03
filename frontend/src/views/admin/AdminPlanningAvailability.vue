<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Disponibilités</h2>
      <p class="text-gray-500">Définissez vos horaires par jour de la semaine. Les créneaux seront générés automatiquement.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <!-- Configurer un jour -->
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Configurer un jour</h3>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Jour</label>
            <select v-model="previewDayIndex" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
              <option v-for="(day, index) in previewDays" :key="index" :value="index">{{ day }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Début</label>
              <div class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl">
                <input
                  type="time"
                  :value="selectedRule?.start_time?.slice(0, 5) || '09:00'"
                  @input="updateSelectedRule('start_time', $event.target.value + ':00')"
                  class="w-full text-sm font-medium text-gray-900 bg-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <div class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl">
                <input
                  type="time"
                  :value="selectedRule?.end_time?.slice(0, 5) || '17:00'"
                  @input="updateSelectedRule('end_time', $event.target.value + ':00')"
                  class="w-full text-sm font-medium text-gray-900 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Durée du créneau</label>
              <select
                :value="selectedRule?.slot_duration_minutes || 30"
                @change="updateSelectedRule('slot_duration_minutes', Number($event.target.value))"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option :value="30">30 min</option>
                <option :value="45">45 min</option>
                <option :value="60">60 min</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tampon entre créneaux</label>
              <select
                :value="selectedRule?.buffer_minutes || 0"
                @change="updateSelectedRule('buffer_minutes', Number($event.target.value))"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option :value="0">0 min</option>
                <option :value="5">5 min</option>
                <option :value="10">10 min</option>
                <option :value="15">15 min</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3 py-3 px-4 bg-blue-50 rounded-xl mb-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-blue-800">
                <span class="font-bold">{{ previewDays[previewDayIndex] }}</span>
                <span v-if="selectedRule?.is_active">
                  · {{ selectedRule?.start_time?.slice(0, 5) || '--:--' }} → {{ selectedRule?.end_time?.slice(0, 5) || '--:--' }}
                  · {{ selectedRule?.slot_duration_minutes || 30 }} min
                </span>
                <span v-else class="text-blue-500"> · Jour inactif</span>
              </p>
            </div>
            <button
              @click="toggleSelectedDay"
              class="px-4 py-1.5 text-sm font-semibold rounded-xl transition-all"
              :class="selectedRule?.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'"
            >
              {{ selectedRule?.is_active ? 'Désactiver' : 'Activer' }}
            </button>
          </div>

          <h4 class="text-sm font-semibold text-gray-700 mb-2">Aperçu des créneaux générés</h4>
          <div class="grid grid-cols-3 gap-2" v-if="previewSlots.length > 0">
            <div
              v-for="slot in previewSlots"
              :key="slot.time"
              class="py-2 px-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-sm font-medium text-[#5B8DEF]"
            >
              {{ slot.time }}
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center py-4">
            {{ selectedRule?.is_active ? 'Aucun créneau disponible (vérifiez les heures)' : 'Activez ce jour pour voir les créneaux' }}
          </p>
        </div>

        <!-- Exceptions -->
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

        <!-- Paramètres -->
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

      <div class="space-y-6">
        <!-- Horaires hebdomadaires (résumé) -->
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Horaires hebdomadaires</h3>
              <p class="text-sm text-gray-500">Aperçu de votre planning avant enregistrement.</p>
            </div>
            <button
              @click="saveAllRules"
              :disabled="isSaving"
              class="px-6 py-2.5 bg-[#5B8DEF] text-white font-semibold rounded-xl hover:bg-[#4b7bdf] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
          </div>

          <div v-if="saveSuccess" class="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Horaires enregistrés avec succès !
          </div>

          <div v-if="saveError" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ saveError }}
          </div>

          <div class="space-y-3">
            <div
              v-for="rule in availabilityRules"
              :key="rule.day_of_week"
              :class="[
                'flex items-center gap-4 p-4 border rounded-2xl transition-all',
                rule.day_of_week === selectedDayOfWeek ? 'border-[#5B8DEF] bg-blue-50/30' : 'border-gray-200',
                rule.is_active ? '' : 'opacity-60'
              ]"
              @click="previewDayIndex = rule.day_of_week"
            >
              <div
                @click.stop="rule.is_active = !rule.is_active"
                :class="['w-10 h-6 rounded-full transition-all relative cursor-pointer', rule.is_active ? 'bg-[#5B8DEF]' : 'bg-gray-200']"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="rule.is_active ? 'left-5' : 'left-1'"
                ></span>
              </div>
              <span class="font-medium text-gray-900 w-24">{{ getDayName(rule.day_of_week) }}</span>

              <template v-if="rule.is_active">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="font-mono">{{ rule.start_time?.slice(0, 5) || '--:--' }}</span>
                  <span class="text-gray-300">→</span>
                  <span class="font-mono">{{ rule.end_time?.slice(0, 5) || '--:--' }}</span>
                  <span class="ml-2 px-2 py-0.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-500">{{ rule.slot_duration_minutes || 30 }} min</span>
                  <span v-if="rule.buffer_minutes > 0" class="px-2 py-0.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-500">+{{ rule.buffer_minutes }} min tampon</span>
                </div>
              </template>
              <span v-else class="text-sm text-gray-400 italic">Jour non défini</span>
            </div>
          </div>
        </div>

        <!-- Google Calendar -->
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminPlanningStore } from '@/stores/admin-planning'
import { useToastStore } from '@/stores/toast'

const store = useAdminPlanningStore()
const toastStore = useToastStore()

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
const isSaving = ref(false)
const saveSuccess = ref(false)
const saveError = ref(null)
const previewDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const selectedDayOfWeek = computed(() => previewDayIndex.value)

const selectedRule = computed(() =>
  availabilityRules.value.find(r => r.day_of_week === selectedDayOfWeek.value)
)

const previewSlots = computed(() => {
  const rule = selectedRule.value
  if (!rule || !rule.is_active) return []

  const slots = []
  let current = new Date(`2000-01-01T${rule.start_time || '09:00:00'}`)
  const end = new Date(`2000-01-01T${rule.end_time || '17:00:00'}`)
  const duration = rule.slot_duration_minutes || 30
  const buffer = rule.buffer_minutes || 0

  while (current.getTime() + duration * 60000 <= end.getTime()) {
    const time = current.toTimeString().slice(0, 5)
    slots.push({ time })
    current.setMinutes(current.getMinutes() + duration + buffer)
  }

  return slots
})

function updateSelectedRule(field, value) {
  const rule = selectedRule.value
  if (rule) {
    if ((field === 'start_time' || field === 'end_time') && (!value || value === ':00')) {
      return
    }
    rule[field] = value
    if (!rule.is_active) {
      rule.is_active = true
    }
  }
}

function toggleSelectedDay() {
  const rule = selectedRule.value
  if (rule) {
    rule.is_active = !rule.is_active
  }
}

onMounted(async () => {
  await Promise.all([
    store.fetchRules(),
    store.fetchSettings()
  ])

  initRules()
  settings.value = { ...store.settings }
})

watch(() => store.rules, () => {
  initRules()
}, { deep: true })

function initRules() {
  const dbRules = store.rules || []
  const days = [0, 1, 2, 3, 4, 5, 6]
  availabilityRules.value = days.map(day => {
    const existing = dbRules.find(r => r.day_of_week === day)
    return existing ? { ...existing } : {
      day_of_week: day,
      start_time: '09:00:00',
      end_time: '17:00:00',
      slot_duration_minutes: 30,
      buffer_minutes: 0,
      is_active: false,
      teacher_id: null,
      id: null,
    }
  })
}

function getDayName(dayOfWeek) {
  const names = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  return names[dayOfWeek]
}

async function saveAllRules() {
  saveSuccess.value = false
  saveError.value = null
  isSaving.value = true

  try {
    for (const rule of availabilityRules.value) {
      const payload = {
        day_of_week: rule.day_of_week,
        start_time: rule.is_active ? rule.start_time : null,
        end_time: rule.is_active ? rule.end_time : null,
        slot_duration_minutes: rule.slot_duration_minutes,
        buffer_minutes: rule.buffer_minutes,
        is_active: rule.is_active,
      }

      if (rule.is_active && rule.id) {
        await store.updateRule(rule.id, payload)
      } else if (rule.is_active && !rule.id) {
        const result = await store.createRule(payload)
        rule.id = result.rule.id
        rule.teacher_id = result.rule.teacher_id
      } else if (!rule.is_active && rule.id) {
        await store.deleteRule(rule.id)
        rule.id = null
      }
    }

    saveSuccess.value = true
    toastStore.success('Horaires enregistrés avec succès.')
    setTimeout(() => { saveSuccess.value = false }, 4000)
  } catch (e) {
    saveError.value = e.response?.data?.message || 'Erreur lors de l\'enregistrement.'
    toastStore.error('Erreur lors de l\'enregistrement des horaires.')
  } finally {
    isSaving.value = false
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
    toastStore.success('Jour bloqué ajouté.')
  } catch (e) {
    toastStore.error('Erreur lors de l\'ajout de l\'exception.')
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
    toastStore.success('Paramètres mis à jour.')
  } catch (e) {
    toastStore.error('Erreur lors de la sauvegarde des paramètres.')
  }
}

async function toggleAutoConfirm() {
  settings.value.auto_confirm = !settings.value.auto_confirm
  await saveSettings()
}
</script>
