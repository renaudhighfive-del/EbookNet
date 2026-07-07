<script setup>
import { ref, onMounted, computed } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useDepositStore } from '@/stores/deposit'
import {
  BookMarked,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  FileText,
  AlertCircle,
  Plus,
} from '@lucide/vue'

const depositStore = useDepositStore()
const activeTab = ref('all')

const statusConfig = {
  pending:             { label: 'En attente',        cls: 'bg-gray-100 text-gray-600',      icon: Clock },
  assigned:            { label: 'Assignée',           cls: 'bg-blue-100 text-blue-700',       icon: Send },
  approved_by_manager: { label: 'Validée (resp.)',   cls: 'bg-teal-100 text-teal-700',       icon: CheckCircle },
  rejected_by_manager: { label: 'Refusée (resp.)',   cls: 'bg-orange-100 text-orange-700',   icon: XCircle },
  second_review:       { label: 'Second avis',        cls: 'bg-purple-100 text-purple-700',   icon: Eye },
  approved:            { label: 'Approuvée',          cls: 'bg-green-100 text-green-700',     icon: CheckCircle },
  rejected:            { label: 'Rejetée',            cls: 'bg-red-100 text-red-700',         icon: XCircle },
  published:           { label: 'Publiée',            cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
}

const deposits = computed(() => depositStore.deposits)

const tabs = computed(() => [
  { id: 'all',      label: 'Toutes',   count: deposits.value.length },
  { id: 'pending',  label: 'En cours', count: deposits.value.filter(d => ['pending', 'assigned', 'second_review'].includes(d.status)).length },
  { id: 'approved', label: 'Validées', count: deposits.value.filter(d => ['approved_by_manager', 'approved', 'published'].includes(d.status)).length },
  { id: 'rejected', label: 'Refusées', count: deposits.value.filter(d => ['rejected_by_manager', 'rejected'].includes(d.status)).length },
])

const filteredDeposits = computed(() => {
  if (activeTab.value === 'all') return deposits.value
  if (activeTab.value === 'pending') return deposits.value.filter(d => ['pending', 'assigned', 'second_review'].includes(d.status))
  if (activeTab.value === 'approved') return deposits.value.filter(d => ['approved_by_manager', 'approved', 'published'].includes(d.status))
  if (activeTab.value === 'rejected') return deposits.value.filter(d => ['rejected_by_manager', 'rejected'].includes(d.status))
  return deposits.value
})

function getStatus(s) {
  return statusConfig[s] ?? { label: s, cls: 'bg-gray-100 text-gray-500', icon: AlertCircle }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

onMounted(async () => {
  try {
    await depositStore.fetchMyDeposits()
  } catch {
    // handled by store
  }
})
</script>

<template>
  <AuthenticatedLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-navy-800 font-serif mb-2">Mes dépôts</h1>
          <p class="text-gray-500">
            Suivez l'état de vos demandes de dépôt documentaire
          </p>
        </div>
        <router-link
          to="/deposit-request"
          class="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus class="w-5 h-5" />
          Nouveau dépôt
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="depositStore.isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
      </div>

      <template v-else>
        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b border-gray-200 pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors"
            :class="[
              activeTab === tab.id
                ? 'bg-navy-800 text-white'
                : 'text-gray-500 hover:text-navy-800 hover:bg-gray-100',
            ]"
          >
            {{ tab.label }}
            <span class="ml-1.5 text-xs opacity-60">({{ tab.count }})</span>
          </button>
        </div>

        <!-- List -->
        <div v-if="filteredDeposits.length" class="space-y-4">
          <router-link
            v-for="deposit in filteredDeposits"
            :key="deposit.id"
            :to="`/my-documents/${deposit.id}`"
            class="bg-white rounded-2xl p-5 shadow-soft flex gap-4 items-start hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="w-12 h-16 bg-navy-50 rounded-xl flex items-center justify-center shrink-0">
              <FileText class="w-6 h-6 text-navy-400" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="text-base font-semibold text-navy-800 truncate max-w-lg">
                    {{ deposit.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-0.5">
                    {{ deposit.author || 'Auteur non renseigné' }}
                    <span v-if="deposit.publication_year"> · {{ deposit.publication_year }}</span>
                  </p>
                </div>
                <span
                  :class="`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatus(deposit.status).cls}`"
                >
                  {{ getStatus(deposit.status).label }}
                </span>
              </div>
              <div class="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span v-if="deposit.category">{{ deposit.category.name }}</span>
                <span v-if="deposit.category && deposit.created_at">·</span>
                <span>{{ formatDate(deposit.created_at) }}</span>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-20 bg-white rounded-2xl shadow-soft">
          <FileText class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg text-gray-500 mb-2">Aucune demande de dépôt</p>
          <p class="text-sm text-gray-400 mb-6">
            {{ activeTab === 'all' ? 'Vous n\'avez encore soumis aucune demande.' : 'Aucune demande dans cette catégorie.' }}
          </p>
          <router-link
            v-if="activeTab === 'all'"
            to="/deposit-request"
            class="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus class="w-5 h-5" />
            Déposer un document
          </router-link>
        </div>
      </template>
    </div>
  </AuthenticatedLayout>
</template>
