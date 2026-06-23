<template>
  <AdminLayout>
    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-gray-100 mb-5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative w-full sm:w-80">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une référence..."
          class="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 outline-none"
        />
      </div>
      <button class="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a7a6f] transition-colors shrink-0">
        <Plus class="w-4 h-4" />
        Ajouter une référence
      </button>
    </div>

    <!-- Filtre -->
    <div class="bg-white rounded-2xl border border-gray-100 mb-5 px-4 py-3 flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Catégorie</label>
        <select v-model="filterCategory" class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-[#0D9488] outline-none">
          <option value="">Toutes</option>
          <option value="droit">Droit</option>
          <option value="informatique">Informatique</option>
          <option value="sante">Santé</option>
        </select>
      </div>
      <span class="ml-auto text-xs text-gray-400 font-mono">{{ filteredReferences.length }} référence(s)</span>
    </div>

    <!-- Empty -->
    <div v-if="filteredReferences.length === 0" class="bg-white rounded-2xl border border-gray-100 py-16 text-center">
      <BookOpen class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="font-medium text-[#1B2A4A]">Aucune référence trouvée</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-[#F8F7F4] border-b border-gray-100">
            <tr>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Référence</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Auteurs</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="ref in filteredReferences" :key="ref.id" class="hover:bg-[#F8F7F4] transition-colors">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0', ref.coverColor]">
                    <BookOpen class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-[#1B2A4A] truncate">{{ ref.title }}</p>
                    <p class="text-xs text-gray-400">{{ ref.type }} · {{ ref.year }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5 text-sm text-gray-600 hidden md:table-cell">{{ ref.authors.join(', ') }}</td>
              <td class="px-4 py-3.5">
                <span class="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-semibold">{{ ref.category }}</span>
              </td>
              <td class="px-4 py-3.5">
                <span :class="ref.status === 'Publié' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                      class="px-2 py-0.5 rounded-full text-xs font-semibold">
                  {{ ref.status }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1B2A4A] transition-colors" title="Voir">
                    <Eye class="w-4 h-4" />
                  </button>
                  <button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1B2A4A] transition-colors" title="Modifier">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Supprimer">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
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
import { Search, Plus, BookOpen, Eye, Pencil, Trash2 } from '@lucide/vue'
import AdminLayout from '../../layouts/AdminLayout.vue'

const searchQuery   = ref('')
const filterCategory = ref('')

const references = ref([
  { id: 1, title: 'Introduction au Droit Constitutionnel Béninois', type: 'Livre',   year: 2021, authors: ['Prof. Koffi Adanlété', 'Dr. Marie Zannou'], category: 'Droit',        coverColor: 'bg-[#1B2A4A]',    status: 'Publié' },
  { id: 2, title: 'Algorithmique et Structures de Données',         type: 'Manuel',  year: 2022, authors: ['Dr. Akeh Boko'],                            category: 'Informatique', coverColor: 'bg-[#0D9488]',    status: 'Publié' },
  { id: 3, title: "Santé Publique en Afrique de l'Ouest",           type: 'Mémoire', year: 2023, authors: ['Dr. Afi Agossou'],                          category: 'Santé',        coverColor: 'bg-green-700',    status: 'Publié' },
])

const filteredReferences = computed(() => {
  let r = references.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(x => x.title.toLowerCase().includes(q) || x.authors.some(a => a.toLowerCase().includes(q)))
  }
  if (filterCategory.value) r = r.filter(x => x.category.toLowerCase() === filterCategory.value)
  return r
})
</script>
