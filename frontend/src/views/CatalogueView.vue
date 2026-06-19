<script setup>
import { ref } from 'vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import DocumentCard from '../components/DocumentCard.vue'
import { X, SlidersHorizontal, Search, ChevronLeft, ChevronRight } from '@lucide/vue'

const categories = ref([
  { id: 1, name: 'Droit & Législation', count: 124 },
  { id: 2, name: 'Informatique', count: 89 },
  { id: 3, name: 'Sciences de la Santé', count: 76 },
  { id: 4, name: 'Littérature', count: 65 },
  { id: 5, name: 'Histoire & Géographie', count: 58 },
  { id: 6, name: 'Économie', count: 47 },
])

const types = ref([
  { id: 1, name: 'Livre', count: 312 },
  { id: 2, name: 'Mémoire', count: 245 },
  { id: 3, name: 'Thèse', count: 198 },
  { id: 4, name: 'Article', count: 156 },
  { id: 5, name: 'Revue', count: 134 },
  { id: 6, name: 'Rapport', count: 98 },
  { id: 7, name: 'Guide', count: 67 },
  { id: 8, name: 'Autre', count: 38 },
])

const documents = ref([
  {
    id: 1,
    title: 'Introduction au Droit Constitutionnel Béninois',
    authors: ['Prof. Koffi Adanlété'],
    category: 'Droit',
    type: 'Livre',
    year: 2021,
    access: 'restricted',
    coverColor: 'from-navy to-blue-800'
  },
  {
    id: 2,
    title: 'Algorithmique et Structures de Données',
    authors: ['Dr. Akeh Boko'],
    category: 'Informatique',
    type: 'Manuel',
    year: 2022,
    access: 'public',
    coverColor: 'from-teal-700 to-teal-900'
  },
  {
    id: 3,
    title: 'Histoire du Bénin Précolonial',
    authors: ['Prof. Yves Houngbédji'],
    category: 'Histoire',
    type: 'Livre',
    year: 2019,
    access: 'public',
    coverColor: 'from-amber-800 to-yellow-900'
  },
  {
    id: 4,
    title: 'Mémoire sur la Santé Publique en Afrique',
    authors: ['Dr. Afi Agossou'],
    category: 'Santé',
    type: 'Mémoire',
    year: 2024,
    access: 'restricted',
    coverColor: 'from-green-700 to-green-900'
  },
  {
    id: 5,
    title: 'Géographie Économique de l\'Afrique de l\'Ouest',
    authors: ['Prof. Lucien Agbo'],
    category: 'Géographie',
    type: 'Livre',
    year: 2021,
    access: 'public',
    coverColor: 'from-yellow-700 to-amber-900'
  },
  {
    id: 6,
    title: 'Microfinance en Zone UEMOA',
    authors: ['Dr. Hortense Agilinglo'],
    category: 'Économie',
    type: 'Thèse',
    year: 2022,
    access: 'public',
    coverColor: 'from-purple-800 to-indigo-900'
  },
  {
    id: 7,
    title: 'Poésie Contemporaine Béninoise',
    authors: ['M. Romuald Hazoumé'],
    category: 'Littérature',
    type: 'Livre',
    year: 2023,
    access: 'restricted',
    coverColor: 'from-rose-800 to-pink-900'
  },
  {
    id: 8,
    title: 'Droit des affaires en OHADA',
    authors: ['Mme. Sika Kouassi'],
    category: 'Droit',
    type: 'Guide',
    year: 2020,
    access: 'public',
    coverColor: 'from-slate-700 to-gray-900'
  },
  {
    id: 9,
    title: 'Santé maternelle en milieu rural',
    authors: ['Dr. Awa Ouedraogo'],
    category: 'Santé',
    type: 'Rapport',
    year: 2024,
    access: 'public',
    coverColor: 'from-red-700 to-rose-900'
  },
])
</script>

<template>
  <PublicLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Page Title -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-navy font-serif">
            Catalogue documentaire
          </h1>
          <p class="text-gray-500 text-sm mt-1">
            Explorez l'intégralité de notre fonds numérique.
          </p>
        </div>
        <span class="inline-block bg-teal/10 text-teal px-4 py-2 rounded-full text-sm font-semibold">
          1 248 références
        </span>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters Sidebar -->
        <aside class="w-full lg:w-72 flex-shrink-0">
          <div class="bg-white rounded-2xl p-6 shadow-soft sticky top-24">
            <h3 class="font-semibold text-navy mb-5 flex items-center gap-2">
              <SlidersHorizontal class="w-4 h-4 text-teal" />
              Filtres
            </h3>

            <!-- Search in filters -->
            <div class="mb-6">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Rechercher..." class="w-full bg-surface-2 border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal">
              </div>
            </div>

            <!-- Category Filter -->
            <div class="mb-6 pb-6 border-b border-gray-100">
              <h4 class="font-semibold text-navy mb-3 text-sm">Catégorie</h4>
              <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
                <template v-for="cat in categories" :key="cat.id">
                  <label class="flex items-center gap-3 cursor-pointer hover:bg-surface-2 p-2 rounded-lg transition-colors">
                    <input type="checkbox" :checked="cat.id === 1" class="rounded border-gray-300 text-teal focus:ring-teal">
                    <span class="text-gray-700 text-sm flex-1">{{ cat.name }}</span>
                    <span class="text-gray-400 text-xs font-mono">({{ cat.count }})</span>
                  </label>
                </template>
              </div>
              <button class="text-teal text-xs font-medium mt-2 hover:underline">
                Voir plus...
              </button>
            </div>

            <!-- Type Filter -->
            <div class="mb-6 pb-6 border-b border-gray-100">
              <h4 class="font-semibold text-navy mb-3 text-sm">Type de document</h4>
              <div class="space-y-2">
                <template v-for="type in types" :key="type.id">
                  <label class="flex items-center gap-3 cursor-pointer hover:bg-surface-2 p-2 rounded-lg transition-colors">
                    <input type="checkbox" class="rounded border-gray-300 text-teal focus:ring-teal">
                    <span class="text-gray-700 text-sm flex-1">{{ type.name }}</span>
                    <span class="text-gray-400 text-xs font-mono">({{ type.count }})</span>
                  </label>
                </template>
              </div>
            </div>

            <!-- Language Filter -->
            <div class="mb-6 pb-6 border-b border-gray-100">
              <h4 class="font-semibold text-navy mb-3 text-sm">Langue</h4>
              <div class="space-y-2">
                <label class="flex items-center gap-3 cursor-pointer hover:bg-surface-2 p-2 rounded-lg transition-colors">
                  <input type="checkbox" checked class="rounded border-gray-300 text-teal focus:ring-teal">
                  <span class="text-gray-700 text-sm flex-1">Français</span>
                  <span class="text-gray-400 text-xs font-mono">(987)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer hover:bg-surface-2 p-2 rounded-lg transition-colors">
                  <input type="checkbox" class="rounded border-gray-300 text-teal focus:ring-teal">
                  <span class="text-gray-700 text-sm flex-1">Anglais</span>
                  <span class="text-gray-400 text-xs font-mono">(198)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer hover:bg-surface-2 p-2 rounded-lg transition-colors">
                  <input type="checkbox" class="rounded border-gray-300 text-teal focus:ring-teal">
                  <span class="text-gray-700 text-sm flex-1">Autre</span>
                  <span class="text-gray-400 text-xs font-mono">(63)</span>
                </label>
              </div>
            </div>

            <!-- Reset Button -->
            <button class="w-full text-center text-teal font-medium text-sm hover:underline">
              Réinitialiser tous les filtres
            </button>
          </div>
        </aside>

        <!-- Main content -->
        <main class="flex-1">
          <!-- Top Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <!-- Active Filter Chips -->
            <div class="flex flex-wrap gap-2">
              <span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs flex items-center gap-2">
                Droit & Législation
                <X class="w-3 h-3 cursor-pointer hover:text-teal-800" />
              </span>
              <span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs flex items-center gap-2">
                Français
                <X class="w-3 h-3 cursor-pointer hover:text-teal-800" />
              </span>
              <span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs flex items-center gap-2">
                2020-2024
                <X class="w-3 h-3 cursor-pointer hover:text-teal-800" />
              </span>
            </div>

            <!-- Sort Dropdown -->
            <div class="flex items-center gap-2">
              <span class="text-gray-600 text-sm">Trier par:</span>
              <select class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal shadow-sm">
                <option>Pertinence</option>
                <option>Plus récent</option>
                <option>Plus consulté</option>
                <option>Titre A-Z</option>
              </select>
            </div>
          </div>

          <!-- Documents Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocumentCard v-for="doc in documents" :key="doc.id" :document="doc" />
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-12">
            <div class="flex items-center gap-2">
              <span class="text-gray-500 text-sm">Afficher</span>
              <select class="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800">
                <option>12</option>
                <option>24</option>
                <option>48</option>
              </select>
            </div>
            <div class="flex items-center gap-1">
              <button class="p-2 rounded-lg hover:bg-white text-gray-500 hover:text-navy transition-colors">
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button class="px-3 py-1.5 rounded-lg bg-navy text-white text-sm font-medium">1</button>
              <button class="px-3 py-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-navy transition-colors text-sm">2</button>
              <button class="px-3 py-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-navy transition-colors text-sm">3</button>
              <button class="px-3 py-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-navy transition-colors text-sm">4</button>
              <span class="px-2 text-gray-400 text-sm">...</span>
              <button class="px-3 py-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-navy transition-colors text-sm">104</button>
              <button class="p-2 rounded-lg hover:bg-white text-gray-500 hover:text-navy transition-colors">
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </PublicLayout>
</template>

