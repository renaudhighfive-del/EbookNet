<script setup>
import { ref, onMounted, computed } from 'vue'
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'
import { useDepositsStore } from '@/stores/deposits'

const store = useDepositsStore()
const activeTab = ref('pending')

onMounted(async () => {
  await store.fetchDeposits()
})

const pendingCount = computed(
  () =>
    store.deposits.filter((d) => d.status === 'assigned' || d.status === 'second_opinion').length,
)
const approvedCount = computed(
  () =>
    store.deposits.filter(
      (d) => d.status === 'manager_approved' || d.status === 'approved_published',
    ).length,
)
const rejectedCount = computed(
  () =>
    store.deposits.filter((d) => d.status === 'manager_rejected' || d.status === 'rejected').length,
)

const tabs = computed(() => [
  { id: 'pending', label: 'À examiner', count: pendingCount.value },
  { id: 'approved', label: 'Validées', count: approvedCount.value },
  { id: 'rejected', label: 'Refusées', count: rejectedCount.value },
  { id: 'all', label: 'Toutes', count: store.deposits.length },
])

const filteredDeposits = computed(() => {
  const list = store.deposits
  if (activeTab.value === 'pending') {
    return list.filter((d) => d.status === 'assigned' || d.status === 'second_opinion')
  }
  if (activeTab.value === 'approved') {
    return list.filter((d) => d.status === 'manager_approved' || d.status === 'approved_published')
  }
  if (activeTab.value === 'rejected') {
    return list.filter((d) => d.status === 'manager_rejected' || d.status === 'rejected')
  }
  return list
})

function getTabEmptyMessage() {
  if (activeTab.value === 'pending') return 'Aucune demande à examiner pour le moment.'
  if (activeTab.value === 'approved') return 'Aucune demande validée.'
  if (activeTab.value === 'rejected') return 'Aucune demande refusée.'
  return 'Aucun dépôt enregistré.'
}
</script>

<template>
  <ResponsableLayout>
    <template #title>
      <div class="flex items-center gap-3">
        <span>Demandes qui me sont assignées</span>
        <span
          v-if="pendingCount > 0"
          class="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold"
        >
          {{ pendingCount }} à examiner
        </span>
      </div>
    </template>

    <!-- Loader -->
    <div v-if="store.isLoading" class="flex justify-center py-16">
      <div
        class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"
      ></div>
    </div>

    <template v-else>
      <!-- Filter Tabs -->
      <div class="flex gap-4 mb-6 border-b border-gray-200 pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="[
            activeTab === tab.id
              ? 'text-[#1B2A4A] border-b-2 border-teal-600 font-semibold'
              : 'text-gray-500 hover:text-[#1B2A4A]',
          ]"
        >
          {{ tab.label }} <span class="text-gray-400">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Cards Grid -->
      <div v-if="filteredDeposits.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="deposit in filteredDeposits"
          :key="deposit.id"
          class="bg-white rounded-2xl p-6 shadow-soft border-l-4 border-gray-200 flex flex-col justify-between"
          :class="{
            'border-l-amber-500':
              deposit.status === 'second_opinion' || store.getAgingDays(deposit.submittedAt) >= 3,
            'border-l-green-600': ['manager_approved', 'approved_published'].includes(
              deposit.status,
            ),
            'border-l-red-600': ['manager_rejected', 'rejected'].includes(deposit.status),
          }"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-teal-50 text-teal-700"
            >
              📗
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-[#1B2A4A] mb-2 truncate" :title="deposit.title">
                {{ deposit.title }}
              </h3>
              <p class="text-gray-600 text-sm mb-3">
                Soumis par :
                {{
                  deposit.submittedBy
                    ? `${deposit.submittedBy.first_name} ${deposit.submittedBy.last_name}`
                    : '—'
                }}
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs">
                  {{ store.getTypeLabel(deposit.type) }}
                </span>
                <span class="text-gray-500 text-xs flex items-center">
                  Soumis le {{ store.formatDate(deposit.submittedAt) }}
                </span>
              </div>
              <div
                v-if="
                  store.getAgingBadge(deposit.submittedAt) &&
                  (deposit.status === 'assigned' || deposit.status === 'second_opinion')
                "
                class="mb-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                :class="store.getAgingBadge(deposit.submittedAt).cls"
              >
                ⚠️ Assignée depuis {{ store.getAgingBadge(deposit.submittedAt).label }}
              </div>
              <div class="mb-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="store.getStatusConfig(deposit.status).cls"
                >
                  {{ store.getStatusConfig(deposit.status).label }}
                </span>
              </div>
            </div>
          </div>
          <router-link
            :to="`/manager/deposits/${deposit.id}/review`"
            class="w-full flex items-center justify-center bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors mt-auto text-center"
          >
            {{
              ['assigned', 'second_opinion'].includes(deposit.status)
                ? 'Examiner la demande →'
                : 'Voir les détails →'
            }}
          </router-link>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">📂</div>
        <p class="text-gray-500">{{ getTabEmptyMessage() }}</p>
      </div>
    </template>
  </ResponsableLayout>
</template>
