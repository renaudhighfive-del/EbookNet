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
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Scale,
  Loader2,
  FileDown,
} from '@lucide/vue'

const router = useRouter()
const store = useDepositsStore()
const toast = useToastStore()

// Icônes associées à chaque clé d'action du registre du store (le store ne
// connaît que les données, les icônes restent une préoccupation d'affichage).
const ACTION_ICONS = {
  assign: User,
  reassign: User,
  remind: AlertCircle,
  reject_direct: XCircle,
  approve_publish: CheckCircle,
  second_opinion_req: Eye,
  reject_definitive: XCircle,
  confirm_reject: XCircle,
  override_publish: CheckCircle,
  unpublish: XCircle,
}

const VARIANT_CLASSES = {
  green: 'bg-green-600 text-white hover:bg-green-700',
  red: 'bg-red-600 text-white hover:bg-red-700',
  blue: 'bg-blue-600 text-white hover:bg-blue-700',
  amber: 'bg-amber-600 text-white hover:bg-amber-700',
  orange: 'bg-orange-500 text-white hover:bg-orange-600',
  white: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  'red-outline': 'bg-white text-red-600 border-2 border-red-500 hover:bg-red-50',
}

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

// Ligne actuellement dépliée (accordéon simple, un seul panneau ouvert à la fois)
const expandedId = ref(null)

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
const isSecondOpinion = ref(false)
const secondOpinionComment = ref('')

// Dialogue de confirmation générique pour les actions du panneau accordéon
const showActionDialog = ref(false)
const actionTargetId = ref(null)
const actionDef = ref(null) // { key, label, variant, requiresComment, minLength }
const actionComment = ref('')
const isActionSubmitting = ref(false)

const statusTabs = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'assigned', label: 'Assignées' },
  { value: 'manager_approved', label: 'Validées resp.' },
  { value: 'manager_rejected', label: 'Refusées resp.' },
  { value: 'second_opinion', label: 'Second avis' },
  { value: 'approved_published', label: 'Publiées' },
  { value: 'rejected', label: 'Rejetées' },
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
      d.id.toString().toLowerCase().includes(q) ||
      d.authors?.some(a => a.toLowerCase().includes(q)) ||
      d.submittedBy?.first_name?.toLowerCase().includes(q) ||
      d.submittedBy?.last_name?.toLowerCase().includes(q) ||
      d.publisher?.toLowerCase().includes(q) ||
      d.isbn?.toLowerCase().includes(q) ||
      d.keywords?.some(k => k.toLowerCase().includes(q))
    )
  }
  if (selectedStatuses.value.length > 0) list = list.filter(d => selectedStatuses.value.includes(d.status))
  if (selectedManagerId.value) list = list.filter(d => d.assignedManagerId === parseInt(selectedManagerId.value))
  if (selectedCategoryId.value) list = list.filter(d => d.category?.id === parseInt(selectedCategoryId.value))
  if (selectedType.value) list = list.filter(d => d.type === selectedType.value)
  if (dateFrom.value) { const from = new Date(dateFrom.value); list = list.filter(d => new Date(d.submittedAt) >= from) }
  if (dateTo.value) { const to = new Date(dateTo.value); to.setHours(23, 59, 59, 999); list = list.filter(d => new Date(d.submittedAt) <= to) }

  list.sort((a, b) => {
    let cmp = 0
    if (sortField.value === 'submittedAt') cmp = new Date(a.submittedAt) - new Date(b.submittedAt)
    else if (sortField.value === 'title') cmp = a.title.localeCompare(b.title)
    else if (sortField.value === 'status') cmp = (a.status || '').localeCompare(b.status || '')
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
const currentSortIcon = computed(() => (sortDir.value === 'asc' ? ChevronUp : ChevronDown))

const categories = computed(() => {
  const cats = store.deposits.map(d => d.category).filter(Boolean)
  const unique = new Map()
  cats.forEach(c => unique.set(c.id, c))
  return [...unique.values()]
})

const statusCounts = computed(() => {
  const counts = {}
  store.deposits.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1 })
  return counts
})

const hasActiveFilters = computed(() =>
  searchQuery.value || selectedStatuses.value.length > 0 || selectedManagerId.value ||
  selectedCategoryId.value || selectedType.value || dateFrom.value || dateTo.value
)

function toggleSort(field) {
  if (sortField.value === field) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortField.value = field; sortDir.value = 'desc' }
}

function toggleSelectAll() {
  if (isSelectAll.value) { selectedIds.value = []; isSelectAll.value = false }
  else { selectedIds.value = paginatedDeposits.value.map(d => d.id); isSelectAll.value = true }
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
  isSelectAll.value = selectedIds.value.length === paginatedDeposits.value.length && paginatedDeposits.value.length > 0
}

function clearFilters() {
  searchQuery.value = ''; selectedStatuses.value = []; selectedManagerId.value = ''
  selectedCategoryId.value = ''; selectedType.value = ''; dateFrom.value = ''; dateTo.value = ''
  currentPage.value = 1
}

function changePage(page) { if (page >= 1 && page <= totalPages.value) currentPage.value = page }

function getAssigneeName(deposit) {
  const mgr = store.getManagerById(deposit.assignedManagerId)
  return mgr ? `${mgr.first_name} ${mgr.last_name}` : null
}

function setStatusFilter(status) {
  selectedStatuses.value = status === 'all' ? [] : [status]
}

function getStatusTabCount(status) {
  return status === 'all' ? store.deposits.length : (statusCounts.value[status] || 0)
}

// --- Panneau accordéon ---
function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function isExpanded(id) { return expandedId.value === id }

// --- Dialogue d'assignation (ligne unique) ---
function openAssignDialog(depositId, forSecondOpinion = false) {
  assignTargetId.value = depositId
  assignManagerId.value = ''
  isSecondOpinion.value = forSecondOpinion
  secondOpinionComment.value = ''
  showAssignDialog.value = true
}

async function confirmAssign() {
  if (!assignManagerId.value) { toast.error('Veuillez sélectionner un responsable.'); return }
  if (isSecondOpinion.value && secondOpinionComment.value.length < 20) {
    toast.error('La justification doit contenir au moins 20 caractères.')
    return
  }
  isAssignSubmitting.value = true
  try {
    await store.assignManager(assignTargetId.value, parseInt(assignManagerId.value))
    if (isSecondOpinion.value) {
      await store.updateDepositStatus(assignTargetId.value, 'second_opinion', { comment: secondOpinionComment.value })
    }
    showAssignDialog.value = false
    expandedId.value = null
  } catch {
    toast.error("Erreur lors de l'assignation.")
  } finally {
    isAssignSubmitting.value = false
  }
}

// --- Dialogue générique d'action (relance, rejet, publication, second avis...) ---
function openActionDialog(depositId, def) {
  actionTargetId.value = depositId
  actionDef.value = def
  actionComment.value = ''
  showActionDialog.value = true
}

const actionCommentValid = computed(() => {
  if (!actionDef.value?.requiresComment) return true
  return actionComment.value.length >= (actionDef.value.minLength || 0)
})

async function confirmActionDialog() {
  if (!actionCommentValid.value) return
  isActionSubmitting.value = true
  const { key } = actionDef.value
  const id = actionTargetId.value
  try {
    if (key === 'remind') await store.remindManager(id)
    else if (key === 'approve_publish') await store.approveAndPublish(id)
    else if (key === 'override_publish') await store.approveAndPublish(id, { comment: actionComment.value, adminOverride: true })
    else if (key === 'reject_direct' || key === 'reject_definitive' || key === 'confirm_reject') {
      await store.updateDepositStatus(id, 'rejected', { comment: actionComment.value })
    } else if (key === 'second_opinion_req') {
      await store.updateDepositStatus(id, 'second_opinion', { comment: actionComment.value })
    } else if (key === 'unpublish') {
      await store.updateDepositStatus(id, 'pending', { comment: actionComment.value })
    }
    showActionDialog.value = false
    expandedId.value = null
  } catch {
    toast.error("Erreur lors de l'exécution de l'action.")
  } finally {
    isActionSubmitting.value = false
  }
}

// Point d'entrée unique appelé par les boutons du panneau : ouvre soit le
// sélecteur de responsable, soit le dialogue de confirmation générique.
function runAction(deposit, def) {
  if (def.key === 'assign' || def.key === 'reassign') openAssignDialog(deposit.id)
  else if (def.key === 'second_opinion_req') openAssignDialog(deposit.id, true)
  else openActionDialog(deposit.id, def)
}

function viewDetail(id) { router.push(`/admin/demandes/${id}`) }

// --- Actions groupées ---
async function openBulkAssign() {
  if (selectedIds.value.length === 0) return
  showBulkAssignDialog.value = true
  bulkAssignTarget.value = ''
}

async function confirmBulkAssign() {
  if (!bulkAssignTarget.value) { toast.error('Veuillez sélectionner un responsable.'); return }
  isBulkSubmitting.value = true
  try {
    for (const id of selectedIds.value) await store.assignManager(id, parseInt(bulkAssignTarget.value))
    showBulkAssignDialog.value = false
    const count = selectedIds.value.length
    selectedIds.value = []; isSelectAll.value = false
    toast.success(`${count} demande(s) assignée(s) avec succès.`)
  } catch {
    toast.error("Erreur lors de l'assignation en masse.")
  } finally {
    isBulkSubmitting.value = false
  }
}

function openBulkReject() {
  if (selectedIds.value.length === 0) return
  showBulkRejectDialog.value = true
  bulkRejectComment.value = ''; bulkRejectError.value = ''
}

async function confirmBulkReject() {
  if (bulkRejectComment.value.length < 50) {
    bulkRejectError.value = `La justification doit contenir au moins 50 caractères (${bulkRejectComment.value.length}/50).`
    return
  }
  bulkRejectError.value = ''
  isBulkSubmitting.value = true
  let rejectedCount = 0, skippedCount = 0
  try {
    for (const id of selectedIds.value) {
      const dep = store.deposits.find(d => String(d.id) === String(id))
      if (dep && store.canTransition(dep.status, 'rejected')) {
        await store.updateDepositStatus(id, 'rejected', { comment: bulkRejectComment.value })
        rejectedCount++
      } else {
        skippedCount++
      }
    }
    showBulkRejectDialog.value = false
    selectedIds.value = []; isSelectAll.value = false
    if (rejectedCount > 0) toast.success(`${rejectedCount} demande(s) rejetée(s).`)
    if (skippedCount > 0) toast.warning(`${skippedCount} demande(s) ignorée(s) (statut non compatible).`)
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
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `demandes_depot_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Export CSV téléchargé.')
}

watch([selectedStatuses, selectedManagerId, selectedCategoryId, selectedType, dateFrom, dateTo, searchQuery], () => {
  currentPage.value = 1
})

onMounted(async () => {
  try { await store.fetchDeposits() } catch { toast.error('Erreur lors du chargement des demandes.') }
  store.fetchManagers()
})
</script>

<template>
  <AdminLayout>
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold text-navy-800 font-serif">Demandes de dépôt</h1>
          <p class="text-sm text-gray-500 mt-1">{{ totalFiltered }} demande(s) trouvée(s)</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
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

      <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="setStatusFilter(tab.value)"
          class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors"
          :class="selectedStatuses.length === 0 && tab.value === 'all'
            ? 'bg-navy-800 text-white'
            : (selectedStatuses.length === 1 && selectedStatuses[0] === tab.value)
              ? 'bg-teal-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
        >
          {{ tab.label }}
          <span
            class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
            :class="(selectedStatuses.length === 0 && tab.value === 'all') || (selectedStatuses.length === 1 && selectedStatuses[0] === tab.value)
              ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'"
          >
            {{ getStatusTabCount(tab.value) }}
          </span>
        </button>
      </div>

      <div v-if="showFilters" class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Responsable</label>
            <select v-model="selectedManagerId" class="w-full bg-beige border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500">
              <option value="">Tous</option>
              <option v-for="m in allManagers" :key="m.id" :value="m.id">{{ m.first_name }} {{ m.last_name }}</option>
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
            <button @click="clearFilters" class="px-4 py-2 text-sm text-gray-500 hover:text-navy-800 font-medium transition-colors">
              Effacer les filtres
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div v-if="selectedIds.length > 0" class="flex items-center gap-3 px-4 py-3 bg-navy-50 border-b border-navy-100 flex-wrap">
          <CheckSquare class="w-4 h-4 text-navy-600 shrink-0" />
          <span class="text-sm font-medium text-navy-700">{{ selectedIds.length }} sélectionnée(s)</span>
          <div class="ml-auto flex items-center gap-2 flex-wrap">
            <button @click="openBulkAssign" class="px-3 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-medium hover:bg-navy-900 transition-colors">Assigner</button>
            <button @click="openBulkReject" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors">Rejeter</button>
            <button @click="selectedIds = []; isSelectAll = false" class="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs font-medium">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="px-4 py-3 border-b border-gray-100">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              placeholder="Rechercher (titre, déposant, id)..."
              class="w-full bg-beige border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-225">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50/50">
                <th class="p-4 w-10">
                  <input type="checkbox" :checked="isSelectAll && paginatedDeposits.length > 0" @change="toggleSelectAll" class="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                </th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Réf.</th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Titre</th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Déposant</th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Responsable</th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap" @click="toggleSort('submittedAt')">
                  <span class="inline-flex items-center gap-1">Soumise <component :is="currentSortIcon" v-if="sortField === 'submittedAt'" class="w-3 h-3" /></span>
                </th>
                <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap" @click="toggleSort('status')">
                  <span class="inline-flex items-center gap-1">Statut <component :is="currentSortIcon" v-if="sortField === 'status'" class="w-3 h-3" /></span>
                </th>
                <th class="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <template v-for="deposit in paginatedDeposits" :key="deposit.id">
                <tr
                  class="hover:bg-gray-50/60 transition-colors cursor-pointer"
                  :class="{ 'bg-teal-50/30': selectedIds.includes(deposit.id) || isExpanded(deposit.id) }"
                  @click="toggleExpand(deposit.id)"
                >
                  <td class="p-4" @click.stop>
                    <input type="checkbox" :checked="selectedIds.includes(deposit.id)" @change="toggleSelect(deposit.id)" class="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  </td>
                  <td class="p-4"><span class="text-sm font-mono text-slate-600 whitespace-nowrap">DEP-{{ deposit.id }}</span></td>
                  <td class="p-4">
                    <div class="flex items-center gap-3 max-w-xs">
                      <div class="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center shrink-0">
                        <FileText class="w-5 h-5 text-navy-400" />
                      </div>
                      <div class="min-w-0">
                        <p class="font-medium text-[#1B2A4A] text-sm truncate">{{ deposit.title }}</p>
                        <p class="text-xs text-slate-500">{{ store.getTypeLabel(deposit.type) }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold shrink-0">
                        {{ store.getUserInitials(deposit.submittedBy) }}
                      </div>
                      <span class="text-sm text-[#1B2A4A] whitespace-nowrap">{{ deposit.submittedBy?.first_name }} {{ deposit.submittedBy?.last_name }}</span>
                    </div>
                  </td>
                  <td class="p-4">
                    <div v-if="deposit.assignedManagerId" class="flex items-center gap-2">
                      <span class="text-sm text-[#1B2A4A] whitespace-nowrap">{{ getAssigneeName(deposit) }}</span>
                    </div>
                    <span v-else class="text-sm text-slate-500 italic">Non assignée</span>
                  </td>
                  <td class="p-4 text-sm text-slate-600 whitespace-nowrap">{{ store.formatDate(deposit.submittedAt) }}</td>
                  <td class="p-4">
                    <span :class="store.getStatusConfig(deposit.status).cls" class="px-3 py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap">
                      {{ store.getStatusConfig(deposit.status).label }}
                    </span>
                  </td>
                  <td class="p-4 text-right" @click.stop>
                    <div class="flex items-center justify-end gap-1">
                      <button @click="viewDetail(deposit.id)" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Ouvrir la vue détaillée">
                        <Eye class="w-4 h-4" />
                      </button>
                      <button @click="toggleExpand(deposit.id)" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        <component :is="isExpanded(deposit.id) ? ChevronUp : ChevronDown" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Panneau accordéon : Aperçu de la demande + Actions disponibles -->
                <tr v-if="isExpanded(deposit.id)">
                  <td colspan="8" class="p-0 bg-teal-50/30 border-t border-teal-100">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                      <div>
                        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Aperçu de la demande</h3>
                        <div class="flex gap-4">
                          <div class="w-20 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText class="w-8 h-8 text-navy-300" />
                          </div>
                          <div class="min-w-0">
                            <p class="font-serif font-bold text-navy-800 mb-1">{{ deposit.title }}</p>
                            <p class="text-sm text-gray-600">Déposant : {{ deposit.submittedBy?.first_name }} {{ deposit.submittedBy?.last_name }}</p>
                            <p class="text-sm text-gray-600">Type : {{ store.getTypeLabel(deposit.type) }}</p>
                            <p class="text-sm text-gray-600 mb-2">Catégorie : {{ deposit.category?.name || 'Non spécifiée' }}</p>
                            <a v-if="deposit.file" href="#" @click.prevent class="text-teal-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
                              <FileDown class="w-3.5 h-3.5" /> Voir le fichier PDF
                            </a>
                          </div>
                        </div>

                        <div class="mt-4">
                          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Historique</h4>
                          <div class="space-y-1.5">
                            <div v-for="(entry, i) in deposit.history" :key="i" class="flex items-start gap-2 text-sm">
                              <div class="w-1.5 h-1.5 mt-1.5 rounded-full bg-navy-400 shrink-0"></div>
                              <div>
                                <span class="text-navy-800">{{ entry.action }}</span>
                                <span class="text-gray-400"> — {{ entry.actor }} · {{ store.formatDate(entry.at) }}</span>
                                <p v-if="entry.comment" class="text-gray-500 italic">« {{ entry.comment }} »</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                          <Scale class="w-4 h-4" /> Actions disponibles
                        </h3>

                        <div v-if="deposit.status === 'pending'" class="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm text-gray-500 flex items-center gap-2">
                          <FileText class="w-4 h-4 shrink-0" /> Cette demande n'est pas encore assignée.
                        </div>
                        <div v-else-if="deposit.status === 'assigned'" class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3 text-sm text-blue-700 flex items-center gap-2">
                          <Clock class="w-4 h-4 shrink-0" /> Assignée à {{ getAssigneeName(deposit) }} — en attente de revue.
                        </div>
                        <div v-else-if="deposit.status === 'second_opinion'" class="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-3 text-sm text-purple-700 flex items-center gap-2">
                          <Eye class="w-4 h-4 shrink-0" /> En attente du second avis.
                        </div>
                        <div v-else-if="deposit.status === 'rejected'" class="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm text-gray-500">
                          Demande rejetée — lecture seule.
                        </div>

                        <div class="space-y-2.5">
                          <button
                            v-for="def in store.getActionsForStatus(deposit.status)"
                            :key="def.key"
                            @click="runAction(deposit, def)"
                            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                            :class="VARIANT_CLASSES[def.variant]"
                          >
                            <component :is="ACTION_ICONS[def.key]" class="w-4 h-4" />
                            {{ def.label }}
                          </button>
                        </div>

                        <button @click="viewDetail(deposit.id)" class="mt-3 text-teal-600 text-sm font-medium hover:underline">
                          Ouvrir la vue détaillée →
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

              <tr v-if="!paginatedDeposits.length">
                <td colspan="8" class="text-center py-16 text-slate-400 text-sm">
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

        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Afficher</span>
            <select v-model.number="perPage" class="bg-beige border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none">
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <span class="text-sm text-slate-500">sur {{ totalFiltered }}</span>
          </div>
          <div class="flex gap-2">
            <button :disabled="currentPage <= 1" @click="changePage(currentPage - 1)" class="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
            <span class="flex items-center text-sm text-slate-500 px-2">Page {{ currentPage }} / {{ totalPages }}</span>
            <button :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)" class="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
          </div>
        </div>
      </div>

      <Teleport to="body">
        <!-- Dialog d'assignation (ligne unique) -->
        <div v-if="showAssignDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showAssignDialog = false">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-navy-800">{{ isSecondOpinion ? 'Demander un 2ème avis' : 'Assigner à un responsable' }}</h3>
              <button @click="showAssignDialog = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
            </div>
            <p class="text-sm text-gray-500 mb-4">Sélectionnez un responsable disponible (sans demande en cours d'examen).</p>
            <select v-model="assignManagerId" class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 mb-4">
              <option value="">Sélectionnez un responsable</option>
              <option v-for="m in availableManagers" :key="m.id" :value="m.id">{{ m.first_name }} {{ m.last_name }} ({{ m.open_deposits }} demande(s) ouverte(s))</option>
            </select>
            <div v-if="isSecondOpinion" class="space-y-3 mb-4">
              <label class="block text-sm font-medium text-navy-800">Justification <span class="text-red-600">*</span></label>
              <textarea
                v-model="secondOpinionComment"
                rows="4"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                placeholder="Justification (minimum 20 caractères)..."
              ></textarea>
              <div class="flex items-center justify-between text-sm">
                <span :class="secondOpinionComment.length < 20 ? 'text-red-600' : 'text-green-600'">{{ secondOpinionComment.length }} / 20</span>
                <span v-if="secondOpinionComment.length < 20" class="text-red-600 text-xs">Minimum 20 caractères requis</span>
              </div>
            </div>
            <div v-if="availableManagers.length === 0" class="text-sm text-amber-600 mb-4 flex items-center gap-2">
              <AlertCircle class="w-4 h-4" /> Aucun responsable disponible pour le moment.
            </div>
            <div class="flex gap-3 justify-end">
              <button @click="showAssignDialog = false" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button
                @click="confirmAssign"
                :disabled="isAssignSubmitting || !assignManagerId || availableManagers.length === 0 || (isSecondOpinion && secondOpinionComment.length < 20)"
                class="px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                :class="isSecondOpinion ? 'bg-purple-600' : 'bg-green-600'"
              >
                <Loader2 v-if="isAssignSubmitting" class="w-4 h-4 animate-spin" />
                {{ isAssignSubmitting ? 'Traitement...' : (isSecondOpinion ? 'Demander' : 'Assigner') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Dialogue générique de confirmation d'action -->
        <div v-if="showActionDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="isActionSubmitting ? null : (showActionDialog = false)">
          <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h3 class="text-lg font-semibold text-navy-800 mb-2">Confirmation</h3>
            <p class="text-sm text-gray-600 mb-4">Êtes-vous sûr de vouloir {{ actionDef?.label?.toLowerCase() }} ?</p>
            <div v-if="actionDef?.requiresComment" class="space-y-3">
              <label class="block text-sm font-medium text-navy-800">Justification <span class="text-red-600">*</span></label>
              <textarea
                v-model="actionComment"
                rows="4"
                class="w-full bg-beige border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                :class="actionComment.length < actionDef.minLength ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'"
                :placeholder="`Justification (minimum ${actionDef.minLength} caractères)...`"
              ></textarea>
              <div class="flex items-center justify-between text-sm">
                <span :class="actionComment.length < actionDef.minLength ? 'text-red-600' : 'text-green-600'">{{ actionComment.length }} / {{ actionDef.minLength }}</span>
              </div>
            </div>
            <div class="flex gap-3 justify-end mt-6">
              <button @click="showActionDialog = false" :disabled="isActionSubmitting" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">Annuler</button>
              <button
                @click="confirmActionDialog"
                :disabled="isActionSubmitting || !actionCommentValid"
                class="px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
                :class="VARIANT_CLASSES[actionDef?.variant] || 'bg-navy-800'"
              >
                <Loader2 v-if="isActionSubmitting" class="w-4 h-4 animate-spin" />
                {{ isActionSubmitting ? 'Traitement...' : 'Confirmer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Dialog d'assignation en masse -->
        <div v-if="showBulkAssignDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showBulkAssignDialog = false">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-navy-800">Assignation en masse</h3>
              <button @click="showBulkAssignDialog = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
            </div>
            <p class="text-sm text-gray-500 mb-4">{{ selectedIds.length }} demande(s) sélectionnée(s)</p>
            <select v-model="bulkAssignTarget" class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 mb-4">
              <option value="">Sélectionnez un responsable</option>
              <option v-for="m in availableManagers" :key="m.id" :value="m.id">{{ m.first_name }} {{ m.last_name }} ({{ m.open_deposits }} demande(s) ouverte(s))</option>
            </select>
            <div v-if="availableManagers.length === 0" class="text-sm text-amber-600 mb-4 flex items-center gap-2">
              <AlertCircle class="w-4 h-4" /> Aucun responsable disponible pour le moment.
            </div>
            <div class="flex gap-3 justify-end">
              <button @click="showBulkAssignDialog = false" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button
                @click="confirmBulkAssign"
                :disabled="isBulkSubmitting || !bulkAssignTarget || availableManagers.length === 0"
                class="px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
              >
                <Loader2 v-if="isBulkSubmitting" class="w-4 h-4 animate-spin" />
                {{ isBulkSubmitting ? 'Assignation...' : 'Assigner' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Dialog de rejet en masse -->
        <div v-if="showBulkRejectDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showBulkRejectDialog = false">
          <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-navy-800">Rejet en masse</h3>
              <button @click="showBulkRejectDialog = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
            </div>
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
                <span :class="bulkRejectComment.length < 50 ? 'text-red-600' : 'text-gray-500'">{{ bulkRejectComment.length }} / 50</span>
              </div>
              <p v-if="bulkRejectError" class="text-red-600 text-sm">{{ bulkRejectError }}</p>
            </div>
            <div class="flex gap-3 justify-end mt-4">
              <button @click="showBulkRejectDialog = false" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button
                @click="confirmBulkReject"
                :disabled="isBulkSubmitting || bulkRejectComment.length < 50"
                class="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
              >
                <Loader2 v-if="isBulkSubmitting" class="w-4 h-4 animate-spin" />
                {{ isBulkSubmitting ? 'Rejet...' : 'Rejeter' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </AdminLayout>
</template>