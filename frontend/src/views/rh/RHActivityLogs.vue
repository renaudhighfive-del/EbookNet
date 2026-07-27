<script setup>
import { ref, computed, onMounted } from 'vue'
import RHLayout from '@/layouts/RHLayout.vue'
import api from '@/services/api'
import { Search, Clock, User, Filter } from '@lucide/vue'

const logs = ref([])
const pagination = ref({})
const isLoading = ref(false)

const searchQuery = ref('')
const searchTimeout = ref(null)

const visiblePages = computed(() => {
  if (!pagination.value.last_page) return []
  const c = pagination.value.current_page
  const l = pagination.value.last_page
  const pages = []
  for (let i = Math.max(1, c - 2); i <= Math.min(l, c + 2); i++) pages.push(i)
  return pages
})

const filteredLogs = computed(() => {
  let result = logs.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (log) =>
        log.action.toLowerCase().includes(query) ||
        (log.user && `${log.user.first_name} ${log.user.last_name}`.toLowerCase().includes(query)),
    )
  }

  return result
})

const fetchLogs = (page = 1) => {
  isLoading.value = true
  const params = { page }

  api
    .get('/hr/activity-logs', { params })
    .then((response) => {
      logs.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }
    })
    .catch((error) => {
      console.error('Erreur lors du chargement des logs:', error)
    })
    .finally(() => {
      isLoading.value = false
    })
}

const onSearchInput = () => {
  // Plus besoin de debounce car le filtrage est côté frontend
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getActionClass = (action) => {
  if (action.includes('Création')) return 'bg-green-50 text-green-700 border-green-200'
  if (action.includes('Modification')) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (action.includes('Suppression') || action.includes('Archivage'))
    return 'bg-red-50 text-red-700 border-red-200'
  if (action.includes('Suspension')) return 'bg-orange-50 text-orange-700 border-orange-200'
  if (action.includes('Approbation') || action.includes('Restauration'))
    return 'bg-teal-50 text-teal-700 border-teal-200'
  return ':bg-gray-50 text-gray-700 border-gray-200'
}

const getUserInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

onMounted(() => fetchLogs())
</script>

<template>
  <RHLayout>
    <template #title>
      Journal d'activité
      <span
        v-if="pagination.total"
        class="ml-2 text-xs font-mono font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"
      >
        {{ pagination.total }}
      </span>
    </template>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div class="relative w-full sm:w-80">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        />
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="Rechercher une action..."
          class="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
        />
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <Filter class="w-4 h-4" />
        <span>Filtrer par action</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <div
        class="w-10 h-10 rounded-full border-2 border-t-[#0D9488] border-gray-200 animate-spin"
      ></div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="filteredLogs.length === 0"
      class="bg-white rounded-2xl border border-gray-100 py-16 text-center"
    >
      <Clock class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="font-medium text-[#1B2A4A]">Aucune activité trouvée</p>
      <p class="text-sm text-gray-400 mt-1">
        Aucune action de gestion utilisateur n'a été enregistrée.
      </p>
    </div>

    <!-- Logs List -->
    <div v-else class="space-y-3">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="bg-white rounded-xl border border-gray-100 p-4 hover:border-[#0D9488] transition-colors"
      >
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-full bg-[#F2F4F9] flex items-center justify-center text-[#1B2A4A] font-semibold text-sm shrink-0"
          >
            {{ log.user ? getUserInitials(log.user.first_name, log.user.last_name) : 'Système' }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-[#1B2A4A]">
                {{ log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Système' }}
              </span>
              <span
                v-if="log.user"
                class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                {{ log.user.role }}
              </span>
            </div>
            <p class="text-sm text-gray-700 mb-2">{{ log.action }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <div class="flex items-center gap-1">
                <Clock class="w-3 h-3" />
                <span>{{ formatDate(log.created_at) }}</span>
              </div>
              <div v-if="log.ip_address" class="flex items-center gap-1">
                <span>{{ log.ip_address }}</span>
              </div>
            </div>
          </div>

          <!-- Action Badge -->
          <div
            class="px-3 py-1 rounded-full text-xs font-medium border shrink-0"
            :class="getActionClass(log.action)"
          >
            {{ log.action.split(':')[0] }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1" class="flex items-center justify-center gap-2 mt-6">
      <button
        @click="fetchLogs(pagination.current_page - 1)"
        :disabled="pagination.current_page === 1"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Précédent
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="fetchLogs(page)"
        class="px-3 py-2 rounded-lg border text-sm"
        :class="
          page === pagination.current_page
            ? 'border-[#0D9488] bg-[#0D9488] text-white'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
        "
      >
        {{ page }}
      </button>
      <button
        @click="fetchLogs(pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant
      </button>
    </div>
  </RHLayout>
</template>
