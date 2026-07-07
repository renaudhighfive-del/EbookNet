<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useDepositsStore } from '@/stores/deposits'
import { useToastStore } from '@/stores/toast'
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  CheckSquare,
  X,
  FileText,
} from '@lucide/vue'

const router = useRouter()
const store = useDepositsStore()
const toast = useToastStore()

const searchQuery = ref('')
const selectedStatuses = ref([])
const selectedManagerId = ref('')
const selectedCategoryId = ref('')
const selectedType = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortField = ref('submittedAt')
const sortDir = ref('desc')
const currentPage = ref(1)
const perPage = ref(25)
const selectedIds = ref([])
const showFilters = ref(false)
const isSelectAll = ref(false)

const showBulkAssignDialog = ref(false)
const showBulkRejectDialog = ref(false)
const bulkRejectComment = ref('')
const bulkRejectError = ref('')
const bulkAssignTarget = ref('')
const isBulkSubmitting = ref(false)

const showAssignDialog = ref(false)
const assignTargetId = ref(null)
const assignManagerId = ref('')
const isAssignSubmitting = ref(false)

const remindDepositId = ref(null)
const isRemindSubmitting = ref(false)

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'manager_approved', label: 'Validée (resp.)' },
  { value: 'manager_rejected', label: 'Refusée (resp.)' },
  { value: 'second_opinion', label: 'Second avis' },
  { value: 'approved_published', label: 'Publiée' },
  { value: 'rejected', label: 'Rejetée' },
]

const typeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'livre', label: 'Livre' },
  { value: 'memoire', label: 'Mémoire' },
  { value: 'these', label: 'Thèse' },
  { value: 'article', label: 'Article' },
  { value: 'revue', label: 'Revue' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'guide', label: 'Guide' },
  { value: 'autre', label: 'Autre' },
]

const filteredDeposits = computed(() => {
  let list = [...store.deposits]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.authors?.some(a => a.toLowerCase().includes(q)) ||
      d.submittedBy?.first_name?.toLowerCase().includes(q) ||
      d.submittedBy?.last_name?.toLowerCase().includes(q) ||
      d.publisher?.toLowerCase().includes(q) ||
      d.isbn?.toLowerCase().includes(q) ||
      d.keywords?.some(k => k.toLowerCase().includes(q))
    )
  }

  if (selectedStatuses.value.length > 0) {
    list = list.filter(d => selectedStatuses.value.includes(d.status))
  }

  if (selectedManagerId.value) {
    list = list.filter(d => d.assignedManagerId === parseInt(selectedManagerId.value))
  }

  if (selectedCategoryId.value) {
    list = list.filter(d => d.category?.id === parseInt(selectedCategoryId.value))
  }

  if (selectedType.value) {
    list = list.filter(d => d.type === selectedType.value)
  }

  if (dateFrom.value) {
    const from = new Date(dateFrom.value)
    list = list.filter(d => new Date(d.submittedAt) >= from)
  }

  if (dateTo.value) {
    const to = new Date(dateTo.value)
    to.setHours(23, 59, 59, 999)
    list = list.filter(d => new Date(d.submittedAt) <= to)
  }

  list.sort((a, b) => {
    let cmp = 0
    if (sortField.value === 'submittedAt') {
      cmp = new Date(a.submittedAt) - new Date(b.submittedAt)
    } else if (sortField.value === 'title') {
      cmp = a.title.localeCompare(b.title)
    } else if (sortField.value === 'status') {
      cmp = (a.status || '').localeCompare(b.status || '')
    }
    return sortDir.value === 'asc' ? cmp : -cmp
  })

  return list
})

const totalFiltered = computed(() => filteredDeposits.value.length)

const paginatedDeposits = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredDeposits.value.slice(start, start + perPage.value)
})

const totalPages = computed(() => Math.ceil(filteredDeposits.value.length / perPage.value) || 1)

const availableManagers = computed(() => store.getAvailableManagers())

const allManagers = computed(() => store.getActiveManagers())

const currentSortIcon = computed(() => {
  return sortDir.value === 'asc' ? ChevronUp : ChevronDown
})

const categories = computed(() => {
  const cats = store.deposits.map(d => d.category).filter(Boolean)
  const unique = new Map()
  cats.forEach(c => unique.set(c.id, c))
  return [...unique.values()]
})

function toggleSort(field) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'desc'
  }
}

function toggleSelectAll() {
  if (isSelectAll.value) {
    selectedIds.value = []
    isSelectAll.value = false
  } else {
    selectedIds.value = paginatedDeposits.value.map(d => d.id)
    isSelectAll.value = true
  }
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
  isSelectAll.value = selectedIds.value.length === paginatedDeposits.value.length
}

function clearFilters() {
  searchQuery.value = ''
  selectedStatuses.value = []
  selectedManagerId.value = ''
  selectedCategoryId.value = ''
  selectedType.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

function toggleStatus(value) {
  const idx = selectedStatuses.value.indexOf(value)
  idx === -1 ? selectedStatuses.value.push(value) : selectedStatuses.value.splice(idx, 1)
}

const hasActiveFilters = computed(() =>
  searchQuery.value ||
  selectedStatuses.value.length > 0 ||
  selectedManagerId.value ||
  selectedCategoryId.value ||
  selectedType.value ||
  dateFrom.value ||
  dateTo.value
)

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function getAssigneeName(deposit) {
  const mgr = store.getManagerById(deposit.assignedManagerId)
  return mgr ? `${mgr.first_name} ${mgr.last_name}` : null
}

function openAssignDialog(depositId) {
  assignTargetId.value = depositId
  assignManagerId.value = ''
  showAssignDialog.value = true
}

async function confirmAssign() {
  if (!assignManagerId.value) {
    toast.error('Veuillez sélectionner un responsable.')
    return
  }
  isAssignSubmitting.value = true
  try {
    await store.assignManager(assignTargetId.value, parseInt(assignManagerId.value))
    showAssignDialog.value = false
    toast.success('Demande assignée avec succès.')
  } catch {
    toast.error("Erreur lors de l'assignation.")
  } finally {
    isAssignSubmitting.value = false
  }
}

async function remindManager(depositId) {
  isRemindSubmitting.value = true
  try {
    await store.remindManager(depositId)
    toast.success('Relance envoyée au responsable.')
  } catch {
    toast.error('Erreur lors de la relance.')
  } finally {
    isRemindSubmitting.value = false
  }
}

async function openBulkAssign() {
  if (selectedIds.value.length === 0) return
  showBulkAssignDialog.value = true
  bulkAssignTarget.value = ''
}

async function confirmBulkAssign() {
  if (!bulkAssignTarget.value) {
    toast.error('Veuillez sélectionner un responsable.')
    return
  }
  isBulkSubmitting.value = true
  try {
    for (const id of selectedIds.value) {
      await store.assignManager(id, parseInt(bulkAssignTarget.value))
    }
    showBulkAssignDialog.value = false
    selectedIds.value = []
    toast.success(`${selectedIds.value.length} demandes assignées avec succès.`)
  } catch {
    toast.error("Erreur lors de l'assignation en masse.")
  } finally {
    isBulkSubmitting.value = false
  }
}

function openBulkReject() {
  if (selectedIds.value.length === 0) return
  showBulkRejectDialog.value = true
  bulkRejectComment.value = ''
  bulkRejectError.value = ''
}

async function confirmBulkReject() {
  if (bulkRejectComment.value.length < 50) {
    bulkRejectError.value = `La justification doit contenir au moins 50 caractères (${bulkRejectComment.value.length}/50).`
    return
  }
  bulkRejectError.value = ''
  isBulkSubmitting.value = true
  try {
    for (const id of selectedIds.value) {
      await store.updateDepositStatus(id, 'rejected', { comment: bulkRejectComment.value })
    }
    showBulkRejectDialog.value = false
    selectedIds.value = []
    toast.success(`${selectedIds.value.length} demandes rejetées.`)
  } catch {
    toast.error('Erreur lors du rejet en masse.')
  } finally {
    isBulkSubmitting.value = false
  }
}

function exportCSV() {
  const headers = ['ID', 'Titre', 'Type', 'Auteur(s)', 'Éditeur', 'ISBN', 'Statut', 'Date soumission', 'Responsable']
  const rows = filteredDeposits.value.map(d => [
    d.id,
    `"${d.title.replace(/"/g, '""')}"`,
    store.getTypeLabel(d.type),
    `"${(d.authors || []).join(', ').replace(/"/g, '""')}"`,
    `"${(d.publisher || '').replace(/"/g, '""')}"`,
    d.isbn || '',
    store.getStatusConfig(d.status).label,
    store.formatDate(d.submittedAt),
    getAssigneeName(d) || 'Non assigné',
  ])

  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `demandes_depot_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Export CSV téléchargé.')
}

function viewDetail(id) {
  router.push(`/admin/demandes/${id}`)
}

function getQuickActions(deposit) {
  const actions = []
  switch (deposit.status) {
    case 'pending':
      actions.push({ label: 'Assigner', action: () => openAssignDialog(deposit.id), cls: 'text-blue-600 hover:bg-blue-50' })
      break
    case 'assigned':
      actions.push({ label: 'Relancer', action: () => remindManager(deposit.id), cls: 'text-amber-600 hover:bg-amber-50' })
      break
    case 'manager_approved':
    case 'manager_rejected':
      actions.push({ label: 'Décider', action: () => viewDetail(deposit.id), cls: 'text-teal-600 hover:bg-teal-50' })
      break
    case 'second_opinion':
      actions.push({ label: 'Voir', action: () => viewDetail(deposit.id), cls: 'text-purple-600 hover:bg-purple-50' })
      break
    case 'approved_published':
    case 'rejected':
      actions.push({ label: 'Consulter', action: () => viewDetail(deposit.id), cls: 'text-gray-600 hover:bg-gray-50' })
      break
  }
  return actions
}

watch([selectedStatuses, selectedManagerId, selectedCategoryId, selectedType, dateFrom, dateTo, searchQuery], () => {
  currentPage.value = 1
})

onMounted(async () => {
  try {
    await store.fetchDeposits()
  } catch {
    toast.error('Erreur lors du chargement des demandes.')
  }
})
</script>

<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-navy-800 font-serif">Demandes de dépôt</h1>
          <p class="text-sm text-gray-500 mt-1">{{ totalFiltered }} demande(s) trouvée(s)</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="showFilters = !showFilters"
            class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            :class="{ 'bg-gray-100 border-gray-300': showFilters }"
          >
            <SlidersHorizontal class="w-4 h-4" />
            Filtres
            <span v-if="hasActiveFilters" class="bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded-full">!</span>
          </button>
          <button
            @click="exportCSV"
            class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download class="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div v-if="showFilters" class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Statut</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="opt in statusOptions"
                :key="opt.value"
                @click="toggleStatus(opt.value)"
                class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                :class="selectedStatuses.includes(opt.value)
                  ? 'bg-navy-800 text-white border-navy-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Responsable</label>
            <select v-model="selectedManagerId" class="w-full bg-beige border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500">
              <option value="">Tous</option>
              <option v-for="m in allManagers" :key="m.id" :value="m.id">
                {{ m.first_name }} {{ m.last_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
            <select v-model="selectedType" class="w-full bg-beige border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500">
              <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Catégorie</label>
            <select v-model="selectedCategoryId" class="w-full bg-beige border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500">
              <option value="">Toutes</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Date de début</label>
            <input type="date" v-model="dateFrom" class="w-full bg-beige border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Date de fin</label>
            <input type="date" v-model="dateTo" class="w-full bg-beige border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="px-4 py-2 text-sm text-gray-500 hover:text-navy-800 font-medium transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div v-if="selectedIds.length > 0" class="flex items-center gap-3 px-4 py-3 bg-navy-50 border-b border-navy-100">
          <CheckSquare class="w-4 h-4 text-navy-600" />
          <span class="text-sm font-medium text-navy-700">{{ selectedIds.length }} sélectionnée(s)</span>
          <div class="ml-auto flex items-center gap-2">
            <button
              @click="openBulkAssign"
              class="px-3 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-medium hover:bg-navy-900 transition-colors"
            >
              Assigner
            </button>
            <button
              @click="openBulkReject"
              class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
            >
              Rejeter
            </button>
            <button
              @click="selectedIds = []; isSelectAll = false"
              class="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs font-medium"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="px-4 py-3 border-b border-gray-100">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              placeholder="Rechercher par titre, auteur, ISBN, éditeur, mots-clés..."
              class="w-full bg-beige border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50/50">
                <th class="p-4 w-10">
                  <input
                    type="checkbox"
                    :checked="isSelectAll && paginatedDeposits.length > 0"
                    :indeterminate="selectedIds.length > 0 && !isSelectAll"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Référence</th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Auteur</th>
                <th
                  class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('submittedAt')"
                >
                  <span class="inline-flex items-center gap-1">
                    Date
                    <component :is="currentSortIcon" v-if="sortField === 'submittedAt'" class="w-3 h-3" />
                  </span>
                </th>
                <th
                  class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('title')"
                >
                  <span class="inline-flex items-center gap-1">
                    Titre
                    <component :is="currentSortIcon" v-if="sortField === 'title'" class="w-3 h-3" />
                  </span>
                </th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ancienneté</th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>
                <th
                  class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('status')"
                >
                  <span class="inline-flex items-center gap-1">
                    Statut
                    <component :is="currentSortIcon" v-if="sortField === 'status'" class="w-3 h-3" />
                  </span>
                </th>
                <th class="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="deposit in paginatedDeposits"
                :key="deposit.id"
                class="hover:bg-gray-50/60 transition-colors"
                :class="{ 'bg-teal-50/30': selectedIds.includes(deposit.id) }"
              >
                <td class="p-4">
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(deposit.id)"
                    @change="toggleSelect(deposit.id)"
                    class="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 bg-navy-50 rounded-xl flex items-center justify-center text-navy-800 text-lg shrink-0">
                      <FileText class="w-5 h-5 text-navy-400" />
                    </div>
                    <div>
                      <p class="font-medium text-[#1B2A4A] text-sm">{{ deposit.title }}</p>
                      <p class="text-xs text-slate-500">{{ deposit.id }} · {{ store.getTypeLabel(deposit.type) }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold shrink-0">
                      {{ store.getUserInitials(deposit.submittedBy) }}
                    </div>
                    <span class="text-sm text-[#1B2A4A]">{{ deposit.submittedBy?.first_name }} {{ deposit.submittedBy?.last_name }}</span>
                  </div>
                </td>
                <td class="p-4 text-sm text-slate-600 whitespace-nowrap">{{ store.formatDate(deposit.submittedAt) }}</td>
                <td class="p-4 text-sm text-slate-600 max-w-[200px] truncate">{{ deposit.title }}</td>
                <td class="p-4">
                  <span
                    v-if="store.getAgingBadge(deposit.submittedAt)"
                    :class="`px-2 py-0.5 rounded-full text-xs font-medium ${store.getAgingBadge(deposit.submittedAt).cls}`"
                  >
                    {{ store.getAgingBadge(deposit.submittedAt).label }}
                  </span>
                  <span v-else class="text-xs text-slate-400">—</span>
                </td>
                <td class="p-4">
                  <div v-if="deposit.assignedManagerId" class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
                      {{ (store.getManagerById(deposit.assignedManagerId)?.first_name?.[0] || '') + (store.getManagerById(deposit.assignedManagerId)?.last_name?.[0] || '') }}
                    </div>
                    <span class="text-sm text-[#1B2A4A]">
                      {{ store.getManagerById(deposit.assignedManagerId)?.first_name }} {{ store.getManagerById(deposit.assignedManagerId)?.last_name }}
                    </span>
                  </div>
                  <span v-else class="text-sm text-slate-500 italic">Non assigné</span>
                </td>
                <td class="p-4">
                  <span :class="store.getStatusConfig(deposit.status).cls" class="px-3 py-1 rounded-full text-xs font-semibold inline-block">
                    {{ store.getStatusConfig(deposit.status).label }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <template v-if="deposit.status === 'pending'">
                      <button
                        @click="openAssignDialog(deposit.id)"
                        class="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Assigner
                      </button>
                    </template>
                    <template v-else-if="deposit.status === 'assigned'">
                      <button
                        @click="remindManager(deposit.id)"
                        :disabled="isRemindSubmitting"
                        class="px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Relancer
                      </button>
                    </template>
                    <template v-else-if="deposit.status === 'manager_approved' || deposit.status === 'manager_rejected'">
                      <button
                        @click="viewDetail(deposit.id)"
                        class="px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        Décider
                      </button>
                    </template>
                    <template v-else-if="deposit.status === 'second_opinion'">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mr-1">Second avis</span>
                      <button
                        @click="viewDetail(deposit.id)"
                        class="px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        Voir
                      </button>
                    </template>
                    <template v-else>
                      <button
                        @click="viewDetail(deposit.id)"
                        class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Consulter
                      </button>
                    </template>
                    <router-link
                      :to="`/admin/demandes/${deposit.id}`"
                      class="px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      Détail
                    </router-link>
                  </div>
                </td>
              </tr>
              <tr v-if="!paginatedDeposits.length">
                <td colspan="9" class="text-center py-16 text-slate-400 text-sm">
                  <FileText class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  Aucune demande de dépôt trouvée.
                  <button v-if="hasActiveFilters" @click="clearFilters" class="block mx-auto mt-2 text-teal-600 font-medium hover:underline">
                    Effacer les filtres
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Afficher</span>
            <select
              v-model.number="perPage"
              class="bg-beige border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
            >
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <span class="text-sm text-slate-500">sur {{ totalFiltered }}</span>
          </div>
          <div class="flex gap-2">
            <button
              :disabled="currentPage <= 1"
              @click="changePage(currentPage - 1)"
              class="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span class="flex items-center text-sm text-slate-500 px-2">
              Page {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              :disabled="currentPage >= totalPages"
              @click="changePage(currentPage + 1)"
              class="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <Teleport to="body">
        <div v-if="showAssignDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAssignDialog = false">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 class="text-lg font-semibold text-navy-800 mb-4">Assigner à un responsable</h3>
            <select
              v-model="assignManagerId"
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 mb-4"
            >
              <option value="">Sélectionnez un responsable</option>
              <option v-for="m in availableManagers" :key="m.id" :value="m.id">
                {{ m.first_name }} {{ m.last_name }} ({{ m.open_deposits }} demandes ouvertes)
              </option>
            </select>
            <div class="flex gap-3 justify-end">
              <button @click="showAssignDialog = false" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button
                @click="confirmAssign"
                :disabled="isAssignSubmitting || !assignManagerId"
                class="px-4 py-2.5 rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-900 disabled:opacity-50 transition-colors"
              >
                {{ isAssignSubmitting ? 'Assignation...' : 'Assigner' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="showBulkAssignDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showBulkAssignDialog = false">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 class="text-lg font-semibold text-navy-800 mb-2">Assignation en masse</h3>
            <p class="text-sm text-gray-500 mb-4">{{ selectedIds.length }} demande(s) sélectionnée(s)</p>
            <select
              v-model="bulkAssignTarget"
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 mb-4"
            >
              <option value="">Sélectionnez un responsable</option>
              <option v-for="m in availableManagers" :key="m.id" :value="m.id">
                {{ m.first_name }} {{ m.last_name }} ({{ m.open_deposits }} demandes ouvertes)
              </option>
            </select>
            <div class="flex gap-3 justify-end">
              <button @click="showBulkAssignDialog = false" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button
                @click="confirmBulkAssign"
                :disabled="isBulkSubmitting || !bulkAssignTarget"
                class="px-4 py-2.5 rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-900 disabled:opacity-50 transition-colors"
              >
                {{ isBulkSubmitting ? 'Assignation...' : 'Assigner' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="showBulkRejectDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showBulkRejectDialog = false">
          <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h3 class="text-lg font-semibold text-navy-800 mb-2">Rejet en masse</h3>
            <p class="text-sm text-gray-500 mb-4">{{ selectedIds.length }} demande(s) sélectionnée(s)</p>
            <div class="space-y-3">
              <label class="block text-sm font-medium text-navy-800">Justification commune *</label>
              <textarea
                v-model="bulkRejectComment"
                rows="4"
                class="w-full bg-beige border rounded-xl px-4 py-3 text-sm focus:outline-none"
                :class="bulkRejectError ? 'border-red-400' : 'border-gray-200 focus:border-teal-500'"
                placeholder="Justification (minimum 50 caractères)..."
              ></textarea>
              <div class="flex items-center justify-between text-sm">
                <span :class="bulkRejectComment.length < 50 ? 'text-red-600' : 'text-gray-500'">
                  {{ bulkRejectComment.length }} / 50
                </span>
              </div>
              <p v-if="bulkRejectError" class="text-red-600 text-sm">{{ bulkRejectError }}</p>
            </div>
            <div class="flex gap-3 justify-end mt-4">
              <button @click="showBulkRejectDialog = false" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button
                @click="confirmBulkReject"
                :disabled="isBulkSubmitting || bulkRejectComment.length < 50"
                class="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {{ isBulkSubmitting ? 'Rejet...' : 'Rejeter' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </AdminLayout>
</template>
