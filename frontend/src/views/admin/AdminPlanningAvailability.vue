<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Disponibilités</h2>
      <p class="text-gray-500">
        Définissez vos horaires par jour de la semaine. Les créneaux seront générés automatiquement.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- COLONNE GAUCHE -->
      <div class="space-y-6">

        <!-- CONFIGURATION D'UN JOUR -->
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Configurer un jour</h3>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Jour</label>
            <select
              v-model="previewDayIndex"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
            >
              <option v-for="(day, index) in previewDays" :key="index" :value="index">
                {{ day }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Début</label>
              <input
                type="time"
                :value="selectedRule?.start_time?.slice(0,5) || '09:00'"
                @input="updateSelectedRule('start_time', $event.target.value + ':00')"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <input
                type="time"
                :value="selectedRule?.end_time?.slice(0,5) || '17:00'"
                @input="updateSelectedRule('end_time', $event.target.value + ':00')"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div class="mt-4 flex justify-between items-center">
            <span class="text-sm text-gray-600">
              {{ previewDays[previewDayIndex] }}
              <span v-if="selectedRule?.is_active">
                : {{ selectedRule.start_time?.slice(0,5) }} → {{ selectedRule.end_time?.slice(0,5) }}
              </span>
              <span v-else class="text-gray-400"> (inactif)</span>
            </span>

            <button
              @click="toggleSelectedDay"
              class="px-4 py-1.5 rounded-xl text-sm font-semibold"
              :class="selectedRule?.is_active
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-600'"
            >
              {{ selectedRule?.is_active ? 'Désactiver' : 'Activer' }}
            </button>
          </div>
        </div>

      </div>

      <!-- COLONNE DROITE -->
      <div class="space-y-6">

        <!-- HORAIRES HEBDOMADAIRES -->
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Horaires hebdomadaires</h3>

          <div class="space-y-3">
            <div
              v-for="rule in availabilityRules"
              :key="rule.day_of_week"
              class="flex items-center gap-4 p-4 border rounded-2xl"
              :class="rule.is_active ? 'border-gray-200' : 'opacity-50'"
              @click="previewDayIndex = rule.day_of_week"
            >
              <div
                @click.stop="rule.is_active = !rule.is_active"
                class="w-10 h-6 rounded-full relative cursor-pointer"
                :class="rule.is_active ? 'bg-blue-500' : 'bg-gray-300'"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="rule.is_active ? 'left-5' : 'left-1'"
                />
              </div>

              <div class="w-24 font-medium">
                {{ getDayName(rule.day_of_week) }}
              </div>

              <div v-if="rule.is_active" class="text-sm text-gray-600">
                {{ rule.start_time?.slice(0,5) }} → {{ rule.end_time?.slice(0,5) }}
              </div>

              <div v-else class="text-sm text-gray-400 italic">
                Non défini
              </div>
            </div>
          </div>

          <button
            @click="saveAllRules"
            type="button"
            :disabled="isSaving"
            class="mt-6 w-full py-2.5 rounded-xl font-semibold transition"
            :class="isSaving ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'"
          >
            <span v-if="isSaving">Enregistrement en cours...</span>
            <span v-else>Enregistrer les horaires</span>
          </button>
        </div>

        <!-- GOOGLE CALENDAR -->
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
              <!-- Google icon -->
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 1C7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.07 5.38 12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1z" fill="#EA4335"/>
              </svg>
            </div>

            <div class="flex-1">
              <p class="font-semibold text-gray-900">Google Calendar</p>
              <p class="text-sm text-gray-500">Synchroniser vos rendez-vous</p>
            </div>

            <button
              @click="onGoogleButtonClick"
              type="button"
              :disabled="googleLoading"
              class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
              :class="googleConnected
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                : 'bg-blue-500 text-white hover:bg-blue-600'"
            >
              <span v-if="googleLoading" class="inline-flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="opacity-75" />
                </svg>
                Chargement...
              </span>
              <span v-else>{{ googleConnected ? 'Déconnecter' : 'Connecter' }}</span>
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
const toast = useToastStore()

const availabilityRules = ref([])
const previewDayIndex = ref(0)
const googleConnected = ref(false)
const googleLoading = ref(false)

const previewDays = [
  'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'
]

const selectedRule = computed(() =>
  availabilityRules.value.find(r => r.day_of_week === previewDayIndex.value)
)

const isSaving = computed(() => store.isActionLoading)

onMounted(async () => {
  await Promise.all([store.fetchRules(), fetchGoogleCalendarStatus()])
  initRules()
  handleGoogleCallbackQuery()
})

watch(() => store.rules, initRules, { deep: true })

function initRules() {
  const db = store.rules || []
  availabilityRules.value = [0,1,2,3,4,5,6].map(day => {
    const found = db.find(r => r.day_of_week === day)
    return found || {
      day_of_week: day,
      start_time: '09:00:00',
      end_time: '17:00:00',
      is_active: false,
      slot_duration_minutes: 30,
      buffer_minutes: 0,
      id: null
    }
  })
}

function handleGoogleCallbackQuery() {
  const params = new URLSearchParams(window.location.search)
  if (params.has('google_calendar_connected')) {
    toast.success('Google Calendar connecté avec succès.')
    params.delete('google_calendar_connected')
    window.history.replaceState({}, document.title, `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`)
  }
  if (params.has('google_calendar_error')) {
    toast.error('Échec de la connexion Google Calendar.')
    params.delete('google_calendar_error')
    window.history.replaceState({}, document.title, `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`)
  }
}

async function fetchGoogleCalendarStatus() {
  try {
    const response = await store.getGoogleCalendarStatus()
    googleConnected.value = !!response.connected
  } catch (e) {
    googleConnected.value = false
  }
}

async function onGoogleButtonClick() {
  googleLoading.value = true

  try {
    if (googleConnected.value) {
      await store.disconnectGoogleCalendar()
      googleConnected.value = false
      toast.success('Google Calendar déconnecté.')
      return
    }

    const response = await store.getGoogleCalendarAuthorizeUrl()
    if (response.url) {
      window.location.href = response.url
    }
  } catch (e) {
    toast.error('Impossible de connecter Google Calendar.')
  } finally {
    googleLoading.value = false
  }
}

async function saveSelectedRule(rule) {
  if (!rule) return

  const payload = {
    day_of_week: rule.day_of_week,
    start_time: rule.is_active ? rule.start_time : null,
    end_time: rule.is_active ? rule.end_time : null,
    is_active: rule.is_active,
    slot_duration_minutes: rule.slot_duration_minutes,
    buffer_minutes: rule.buffer_minutes
  }

  if (rule.id) {
    await store.updateRule(rule.id, payload)
  } else if (rule.is_active) {
    const res = await store.createRule(payload)
    if (res?.rule?.id) {
      rule.id = res.rule.id
    }
  }
}

async function updateSelectedRule(field, value) {
  const rule = selectedRule.value
  if (!rule) return
  rule[field] = value
  rule.is_active = true
  await saveSelectedRule(rule)
}

async function toggleSelectedDay() {
  const rule = selectedRule.value
  if (!rule) return
  rule.is_active = !rule.is_active
  await saveSelectedRule(rule)
}

function getDayName(d) {
  return previewDays[d]
}

async function saveAllRules() {
  try {
    for (const rule of availabilityRules.value) {
      const payload = {
        day_of_week: rule.day_of_week,
        start_time: rule.is_active ? rule.start_time : null,
        end_time: rule.is_active ? rule.end_time : null,
        is_active: rule.is_active,
        slot_duration_minutes: rule.slot_duration_minutes,
        buffer_minutes: rule.buffer_minutes
      }

      if (rule.id) {
        await store.updateRule(rule.id, payload)
      } else if (rule.is_active) {
        const res = await store.createRule(payload)
        rule.id = res.rule.id
      }
    }

    toast.success('Horaires enregistrés')
  } catch (e) {
    toast.error('Erreur enregistrement')
  }
}
</script>