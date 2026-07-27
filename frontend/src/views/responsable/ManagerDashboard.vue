<template>
  <ResponsableLayout>
    <template #title>Tableau de bord</template>

    <!-- Banner rôle -->
    <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <Info class="w-4 h-4 text-teal-600 shrink-0" />
      <p class="text-sm text-teal-800">
        Votre rôle : Examiner les demandes de dépôt qui vous sont assignées et émettre un avis
        motivé.
      </p>
    </div>

    <!-- Loader -->
    <div v-if="store.isLoading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"
      ></div>
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div class="bg-[#1B2A4A] text-white rounded-2xl p-5 border border-white/5">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <ClipboardList class="w-5 h-5" />
            </div>
            <div>
              <div class="text-3xl font-bold font-mono">{{ assignedCount }}</div>
              <div class="text-white/60 text-sm">Demandes assignées</div>
            </div>
          </div>
        </div>
        <div class="bg-amber-500 text-white rounded-2xl p-5">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <div class="text-3xl font-bold font-mono">{{ pendingCount }}</div>
              <div class="text-amber-100 text-sm">À examiner</div>
            </div>
          </div>
        </div>
        <div class="bg-green-600 text-white rounded-2xl p-5">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle class="w-5 h-5" />
            </div>
            <div>
              <div class="text-3xl font-bold font-mono">{{ treatedCount }}</div>
              <div class="text-green-100 text-sm">Traitées</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Table priorité -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
            <h2 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide">
              Demandes à traiter en priorité
            </h2>
            <router-link to="/manager/deposits" class="text-xs text-teal-600 hover:underline"
              >Voir tout</router-link
            >
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-[#F8F7F4]">
                <tr>
                  <th
                    class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Titre
                  </th>
                  <th
                    class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Déposant
                  </th>
                  <th
                    class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell"
                  >
                    Type
                  </th>
                  <th
                    class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Retard
                  </th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="priorityRequests.length === 0">
                  <td colspan="5" class="px-5 py-8 text-center text-gray-500">
                    Aucune demande à traiter en priorité pour le moment.
                  </td>
                </tr>
                <tr
                  v-for="deposit in priorityRequests"
                  :key="deposit.id"
                  class="hover:bg-[#F8F7F4] transition-colors"
                >
                  <td
                    class="px-5 py-3.5 font-medium text-[#1B2A4A] truncate max-w-[200px]"
                    :title="deposit.title"
                  >
                    {{ deposit.title }}
                  </td>
                  <td class="px-4 py-3.5 text-gray-600">
                    {{
                      deposit.submittedBy
                        ? `${deposit.submittedBy.first_name} ${deposit.submittedBy.last_name}`
                        : '—'
                    }}
                  </td>
                  <td class="px-4 py-3.5 hidden md:table-cell">
                    <span
                      class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ store.getTypeLabel(deposit.type) }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span
                      v-if="store.getAgingBadge(deposit.submittedAt)"
                      class="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
                      :class="store.getAgingBadge(deposit.submittedAt).cls"
                    >
                      <AlertTriangle class="w-3 h-3" />
                      {{ store.getAgingBadge(deposit.submittedAt).label }}
                    </span>
                    <span v-else class="text-gray-400 text-xs">—</span>
                  </td>
                  <td class="px-4 py-3.5">
                    <router-link
                      :to="`/manager/deposits/${deposit.id}/review`"
                      class="flex items-center gap-1 text-[#0D9488] text-sm font-medium hover:underline whitespace-nowrap"
                    >
                      Examiner <ArrowRight class="w-3.5 h-3.5" />
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="space-y-5">
          <!-- Décisions récentes -->
          <div class="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-4">
              Traitées récemment
            </h3>
            <div class="space-y-3">
              <div v-if="recentDecisions.length === 0" class="text-sm text-gray-500 py-2">
                Aucune demande traitée récemment.
              </div>
              <div
                v-for="deposit in recentDecisions"
                :key="deposit.id"
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span class="text-sm text-[#1B2A4A] truncate max-w-[150px]" :title="deposit.title">
                  {{ deposit.title }}
                </span>
                <span
                  v-if="['manager_approved', 'approved_published'].includes(deposit.status)"
                  class="flex items-center gap-1 text-xs text-green-600 font-medium whitespace-nowrap"
                >
                  <CheckCircle class="w-3.5 h-3.5" /> Validée
                </span>
                <span
                  v-else
                  class="flex items-center gap-1 text-xs text-red-600 font-medium whitespace-nowrap"
                >
                  <XCircle class="w-3.5 h-3.5" /> Refusée
                </span>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-4">
              Notifications
            </h3>
            <div class="space-y-3 text-sm">
              <div
                v-if="priorityRequests.length > 0"
                class="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400 text-amber-800"
              >
                Vous avez {{ priorityRequests.length }} demande(s) en attente d'examen.
              </div>
              <div v-else class="p-3 bg-gray-50 rounded-lg text-gray-600">
                Toutes les demandes assignées ont été traitées.
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </ResponsableLayout>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import {
  Info,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from '@lucide/vue'
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'
import { useDepositsStore } from '@/stores/deposits'

const store = useDepositsStore()

onMounted(async () => {
  await store.fetchDeposits()
})

const assignedCount = computed(() => store.deposits.length)
const pendingCount = computed(
  () =>
    store.deposits.filter((d) => d.status === 'assigned' || d.status === 'second_opinion').length,
)
const treatedCount = computed(
  () =>
    store.deposits.filter((d) =>
      ['manager_approved', 'manager_rejected', 'approved_published', 'rejected'].includes(d.status),
    ).length,
)

const priorityRequests = computed(() => {
  return store.deposits
    .filter((d) => d.status === 'assigned' || d.status === 'second_opinion')
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    .slice(0, 3)
})

const recentDecisions = computed(() => {
  return store.deposits
    .filter((d) =>
      ['manager_approved', 'manager_rejected', 'approved_published', 'rejected'].includes(d.status),
    )
    .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
    .slice(0, 5)
})
</script>
