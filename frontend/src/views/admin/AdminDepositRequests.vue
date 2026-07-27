<template>
  <AdminLayout>
    <div v-if="isLoading" class="flex justify-center py-20">
      <div
        class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"
      ></div>
    </div>

    <template v-else-if="hasError">
      <div class="flex flex-col items-center justify-center py-20 text-gray-400">
        <p class="text-lg text-gray-500 mb-2">Impossible de charger les demandes de dépôt</p>
        <button
          @click="loadDeposits"
          class="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-xl font-medium hover:bg-[#0F1322] transition-colors text-sm"
        >
          Réessayer
        </button>
      </div>
    </template>

    <template v-else>
      <!-- Filter tabs -->
      <div class="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-6">
        <div class="flex items-center gap-2 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id ? 'bg-[#1B2A4A] text-white' : 'text-slate-600 hover:bg-gray-100',
            ]"
          >
            {{ tab.label }}
            <span
              v-if="tab.count"
              class="ml-2 bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th
                  class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Référence
                </th>
                <th
                  class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Auteur
                </th>
                <th
                  class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Responsable
                </th>
                <th
                  class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  class="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="deposit in filteredDeposits"
                :key="deposit.id"
                class="hover:bg-gray-50/60 transition-colors"
              >
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-11 h-11 bg-navy-50 rounded-xl flex items-center justify-center text-navy-800 text-lg"
                    >
                      📖
                    </div>
                    <div>
                      <p class="font-medium text-[#1B2A4A]">{{ deposit.title }}</p>
                      <p class="text-xs text-slate-500">{{ deposit.category?.name ?? '' }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold"
                    >
                      {{ getUserInitials(deposit.applicant) }}
                    </div>
                    <span class="text-sm text-[#1B2A4A]">{{
                      deposit.applicant
                        ? `${deposit.applicant.first_name} ${deposit.applicant.last_name}`
                        : '—'
                    }}</span>
                  </div>
                </td>
                <td class="p-4 text-sm text-slate-600">{{ formatDate(deposit.created_at) }}</td>
                <td class="p-4">
                  <div v-if="deposit.assigned_manager" class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold"
                    >
                      {{ getUserInitials(deposit.assigned_manager) }}
                    </div>
                    <span class="text-sm text-[#1B2A4A]"
                      >{{ deposit.assigned_manager.first_name }}
                      {{ deposit.assigned_manager.last_name }}</span
                    >
                  </div>
                  <span v-else class="text-sm text-slate-500 italic">Non assigné</span>
                </td>
                <td class="p-4">
                  <span :class="getStatusClass(deposit.status)">
                    {{ getStatusLabel(deposit.status) }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <router-link
                    :to="`/admin/demandes/${deposit.id}`"
                    class="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    Voir
                  </router-link>
                </td>
              </tr>
              <tr v-if="!filteredDeposits.length">
                <td colspan="6" class="text-center py-12 text-slate-400 text-sm">
                  Aucune demande de dépôt trouvée.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.last_page > 1"
          class="flex items-center justify-between px-6 py-4 border-t border-gray-100"
        >
          <span class="text-sm text-slate-500">
            Page {{ pagination.current_page }} sur {{ pagination.last_page }}
          </span>
          <div class="flex gap-2">
            <button
              :disabled="!pagination.prev_page_url"
              @click="changePage(pagination.current_page - 1)"
              class="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              :disabled="!pagination.next_page_url"
              @click="changePage(pagination.current_page + 1)"
              class="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </template>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import api from '@/services/api'

const isLoading = ref(true)
const hasError = ref(false)
const deposits = ref([])
const pagination = ref({})
const activeTab = ref('all')

const statusConfig = {
  pending: { label: 'En attente', cls: 'bg-gray-100 text-gray-600' },
  assigned: { label: 'Assignée', cls: 'bg-blue-100 text-blue-700' },
  approved_by_manager: { label: 'Validée (resp.)', cls: 'bg-teal-100 text-teal-700' },
  rejected_by_manager: { label: 'Refusée (resp.)', cls: 'bg-orange-100 text-orange-700' },
  second_review: { label: 'Second avis', cls: 'bg-purple-100 text-purple-700' },
  approved: { label: 'Approuvée', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejetée', cls: 'bg-red-100 text-red-700' },
  published: { label: 'Publiée', cls: 'bg-emerald-100 text-emerald-800' },
}

const tabs = computed(() => [
  { id: 'all', label: 'Toutes', count: deposits.value.length },
  {
    id: 'pending',
    label: 'En attente',
    count: deposits.value.filter((d) => d.status === 'pending').length,
  },
  {
    id: 'assigned',
    label: 'Assignées',
    count: deposits.value.filter((d) => d.status === 'assigned').length,
  },
  {
    id: 'approved_by_manager',
    label: 'Validées',
    count: deposits.value.filter((d) => d.status === 'approved_by_manager').length,
  },
  {
    id: 'rejected_by_manager',
    label: 'Refusées',
    count: deposits.value.filter((d) => d.status === 'rejected_by_manager').length,
  },
  {
    id: 'second_review',
    label: 'Second avis',
    count: deposits.value.filter((d) => d.status === 'second_review').length,
  },
  {
    id: 'published',
    label: 'Publiées',
    count: deposits.value.filter((d) => d.status === 'published').length,
  },
  {
    id: 'rejected',
    label: 'Rejetées',
    count: deposits.value.filter((d) => d.status === 'rejected').length,
  },
])

const filteredDeposits = computed(() => {
  if (activeTab.value === 'all') return deposits.value
  return deposits.value.filter((d) => d.status === activeTab.value)
})

function getStatusLabel(s) {
  return statusConfig[s]?.label ?? s
}

function getStatusClass(s) {
  const cls = statusConfig[s]?.cls ?? 'bg-gray-100 text-gray-500'
  return `px-3 py-1 rounded-full text-xs font-semibold ${cls}`
}

function getUserInitials(user) {
  if (!user) return '?'
  return `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function changePage(page) {
  loadDeposits(page)
}

async function loadDeposits(page = 1) {
  isLoading.value = true
  hasError.value = false
  try {
    const response = await api.get('/admin/deposits', {
      params: { page, per_page: 15 },
    })
    deposits.value = response.data.data ?? []
    pagination.value = response.data
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadDeposits())
</script>
