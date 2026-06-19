<template>
  <AdminLayout>
    <!-- Top bar: search + add button -->
    <div class="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full md:w-96">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une référence..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
        />
      </div>
      <button class="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2">
        <span>+</span>
        Ajouter une référence
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600 font-medium">Catégorie:</label>
        <select v-model="filterCategory" class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-teal-600 outline-none">
          <option value="">Toutes</option>
          <option value="droit">Droit</option>
          <option value="informatique">Informatique</option>
          <option value="sante">Santé</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Référence</th>
              <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Auteurs</th>
              <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catégorie</th>
              <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
              <th class="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="ref in filteredReferences" :key="ref.id" class="hover:bg-beige/50 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div :class="['w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg', ref.coverColor]">
                    📖
                  </div>
                  <div>
                    <p class="font-medium text-navy-900">{{ ref.title }}</p>
                    <p class="text-xs text-slate-500">{{ ref.type }} · {{ ref.year }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 text-sm text-slate-600">{{ ref.authors.join(', ') }}</td>
              <td class="p-4">
                <span class="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {{ ref.category }}
                </span>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                    ref.status === 'Publié' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'
                  ]"
                >
                  {{ ref.status }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button class="text-slate-500 hover:text-navy-900 transition-colors mr-3">
                  👁️
                </button>
                <button class="text-slate-500 hover:text-navy-900 transition-colors mr-3">
                  ✏️
                </button>
                <button class="text-slate-500 hover:text-red-700 transition-colors">
                  🗑️
                </button>
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

const searchQuery = ref('')
const filterCategory = ref('')

const references = ref([
  {
    id: 1,
    title: 'Introduction au Droit Constitutionnel Béninois',
    type: 'Livre',
    year: 2021,
    authors: ['Prof. Koffi Adanlété', 'Dr. Marie Zannou'],
    category: 'Droit',
    coverColor: 'bg-gradient-to-br from-navy-800 to-blue-900',
    status: 'Publié',
  },
  {
    id: 2,
    title: 'Algorithmique et Structures de Données',
    type: 'Manuel',
    year: 2022,
    authors: ['Dr. Akeh Boko'],
    category: 'Informatique',
    coverColor: 'bg-gradient-to-br from-teal-700 to-teal-900',
    status: 'Publié',
  },
  {
    id: 3,
    title: 'Santé Publique en Afrique de l\'Ouest',
    type: 'Mémoire',
    year: 2023,
    authors: ['Dr. Afi Agossou'],
    category: 'Santé',
    coverColor: 'bg-gradient-to-br from-green-700 to-green-900',
    status: 'Publié',
  },
])

const filteredReferences = computed(() => {
  let result = references.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.authors.some(a => a.toLowerCase().includes(query))
    )
  }

  if (filterCategory.value) {
    result = result.filter(r => r.category.toLowerCase() === filterCategory.value)
  }

  return result
})
</script>
