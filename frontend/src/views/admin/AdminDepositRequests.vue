<template>
  <AdminLayout>
    <!-- Filter tabs -->
    <div class="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-6">
      <div class="flex items-center gap-2 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
            activeTab === tab.id ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-beige',
          ]"
        >
          {{ tab.name }}
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
              v-for="request in filteredRequests"
              :key="request.id"
              class="hover:bg-beige/50 transition-colors"
            >
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-11 h-11 bg-navy-50 rounded-xl flex items-center justify-center text-navy-800 text-lg"
                  >
                    📖
                  </div>
                  <div>
                    <p class="font-medium text-navy-900">{{ request.title }}</p>
                    <p class="text-xs text-slate-500">{{ request.category }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold"
                  >
                    {{ request.authorInitials }}
                  </div>
                  <span class="text-sm text-navy-900">{{ request.author }}</span>
                </div>
              </td>
              <td class="p-4 text-sm text-slate-600">{{ request.date }}</td>
              <td class="p-4">
                <div v-if="request.assignee" class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold"
                  >
                    {{ request.assigneeInitials }}
                  </div>
                  <span class="text-sm text-navy-900">{{ request.assignee }}</span>
                </div>
                <span v-else class="text-sm text-slate-500 italic">Non assigné</span>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                    request.status === 'En attente'
                      ? 'bg-amber-100 text-amber-700'
                      : request.status === 'En révision'
                        ? 'bg-blue-100 text-blue-700'
                        : request.status === 'Validée'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-red-100 text-red-700',
                  ]"
                >
                  {{ request.status }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button class="text-slate-500 hover:text-navy-900 transition-colors">Voir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'

const activeTab = ref('toutes')
const tabs = ref([
  { id: 'toutes', name: 'Toutes les demandes', count: 24 },
  { id: 'attente', name: 'En attente', count: 12 },
  { id: 'revision', name: 'En révision', count: 8 },
  { id: 'validees', name: 'Validées', count: 2 },
  { id: 'refusees', name: 'Refusées', count: 2 },
])

const requests = ref([
  {
    id: 1,
    title: 'Droit constitutionnel béninois',
    category: 'Droit',
    author: 'Jean Dossa',
    authorInitials: 'JD',
    date: '18 Juin 2024',
    status: 'En attente',
    assignee: null,
    assigneeInitials: null,
  },
  {
    id: 2,
    title: 'Algorithmique avancée',
    category: 'Informatique',
    author: 'Aïcha Kpodje',
    authorInitials: 'AK',
    date: '17 Juin 2024',
    status: 'En révision',
    assignee: 'Paul Kiki',
    assigneeInitials: 'PK',
  },
  {
    id: 3,
    title: 'Santé publique en Afrique',
    category: 'Santé',
    author: 'Pierre Yayi',
    authorInitials: 'PY',
    date: '16 Juin 2024',
    status: 'Validée',
    assignee: 'Paul Kiki',
    assigneeInitials: 'PK',
  },
])

const filteredRequests = computed(() => {
  if (activeTab.value === 'toutes') return requests.value
  if (activeTab.value === 'attente') return requests.value.filter((r) => r.status === 'En attente')
  if (activeTab.value === 'revision')
    return requests.value.filter((r) => r.status === 'En révision')
  if (activeTab.value === 'validees') return requests.value.filter((r) => r.status === 'Validée')
  if (activeTab.value === 'refusees') return requests.value.filter((r) => r.status === 'Refusée')
  return requests.value
})
</script>
