<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import api from '@/services/api'
import { Search, Clock, User, Filter, Database } from '@lucide/vue'

const logs = ref([])
const pagination = ref({})
const isLoading = ref(false)

const searchQuery = ref('')
const searchTimeout = ref(null)
const filterTable = ref('')

const visiblePages = computed(() => {
  if (!pagination.value.last_page) return []
  const c = pagination.value.current_page
  const l = pagination.value.last_page
  const pages = []
  for (let i = Math.max(1, c - 2); i <= Math.min(l, c + 2); i++) pages.push(i)
  return pages
})

const fetchLogs = (page = 1) => {
  isLoading.value = true
  const params = { page }
  if (searchQuery.value) params.action = searchQuery.value
  if (filterTable.value) params.target_table = filterTable.value
  
  api.get('/admin/activity-logs', { params })
    .then(response => {
      logs.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }
    })
    .catch(error => {
      console.error('Erreur lors du chargement des logs:', error)
    })
    .finally(() => {
      isLoading.value = false
    })
}

const onSearchInput = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => fetchLogs(1), 400)
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
  if (action.includes('Suppression') || action.includes('Archivage')) return 'bg-red-50 text-red-700 border-red-200'
  if (action.includes('Suspension')) return 'bg-orange-50 text-orange-700 border-orange-200'
  if (action.includes('Approbation') || action.includes('Restauration')) return 'bg-teal-50 text-teal-700 border-teal-200'
  if (action.includes('login')) return 'bg-purple-50 text-purple-700 border-purple-200'
  if (action.includes('logout')) return 'bg-gray-50 text-gray-700 border-gray-200'
  return 'bg-gray-50 text-gray-700 border-gray-200'
}

const getTableClass = (table) => {
  const classes = {
    'users': 'bg-blue-50 text-blue-700 border-blue-200',
    'references': 'bg-green-50 text-green-700 border-green-200',
    'deposit_requests': 'bg-orange-50 text-orange-700 border-orange-200',
    'categories': 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return classes[table] || 'bg-gray-50 text-gray-700 border-gray-200'
}

const getTableLabel = (table) => {
  const labels = {
    'users': 'Utilisateurs',
    'references': 'Références',
    'deposit_requests': 'Demandes de dépôt',
    'categories': 'Catégories',
  }
  return labels[table] || table
}

onMounted(() => fetchLogs())
</script>

<template>
  <AdminLayout>
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
      <div class="flex flex-wrap items-center gap-3 flex-1 min-w-0">
        <!-- Recherche -->
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
        <!-- Filtre table -->
        <select
          v-model="filterTable"
          @change="fetchLogs(1)"
          class="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]"
        >
          <option value="">Toutes les tables</option>
          <option value="users">Utilisateurs</option>
          <option value="references">Références</option>
          <option value="deposit_requests">Demandes de dépôt</option>
          <option value="categories">Catégories</option>
        </select>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <Filter class="w-4 h-4" />
        <span>Filtres actifs</span>
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
      v-else-if="logs.length === 0"
      class="bg-white rounded-2xl border border-gray-100 py-16 text-center"
    >
      <Clock class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="font-medium text-[#1B2A4A]">Aucune activité trouvée</p>
      <p class="text-sm text-gray-400 mt-1">Aucune activité n'a été enregistrée sur la plateforme.</p>
    </div>

    <!-- Logs List -->
    <div v-else class="space-y-3">
      <div
        v-for="log in logs"
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
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="font-medium text-[#1B2A4A]">
                {{ log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Système' }}
              </span>
              <span
                v-if="log.user"
                class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                {{ log.user.role }}
              </span>
              <span
                v-if="log.target_table"
                class="text-xs px-2 py-0.5 rounded-full border font-medium"
                :class="getTableClass(log.target_table)"
              >
                <Database class="w-3 h-3 inline mr-1" />
                {{ getTableLabel(log.target_table) }}
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
    <div
      v-if="pagination.last_page > 1"
      class="flex items-center justify-center gap-2 mt-6"
    >
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
  </AdminLayout>
</template>

<script>
const getUserInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}
</script>
