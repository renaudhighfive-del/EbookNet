<script setup>
import { ref } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { BookMarked, Star, Download } from '@lucide/vue'

const activeTab = ref('all')

const tabs = [
  { id: 'all', label: 'Tous' },
  { id: 'consulted', label: 'Consultés' },
  { id: 'downloaded', label: 'Téléchargés' },
  { id: 'favorites', label: 'Favoris' },
]

const documents = ref([
  {
    id: 1,
    title: 'Introduction au Droit Constitutionnel Béninois',
    authors: ['Prof. Koffi Adanlété'],
    category: 'Droit',
    year: 2021,
    lastAccess: 'Il y a 2h',
    coverColor: 'from-navy-800 to-navy-950',
  },
  {
    id: 2,
    title: 'Algorithmique et Structures de Données',
    authors: ['Dr. Akeh Boko'],
    category: 'Informatique',
    year: 2022,
    lastAccess: 'Il y a 1 jour',
    coverColor: 'from-teal-700 to-teal-900',
  },
])
</script>

<template>
  <AuthenticatedLayout>
    <div>
      <h1 class="text-3xl font-bold text-navy-800 font-serif mb-2">Mes documents</h1>
      <p class="text-gray-500 mb-8">
        Consultez votre historique de lecture et vos documents favoris
      </p>
      <!-- Tabs: Tous, Consultés, Téléchargés, Favoris -->
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
        </button>
      </div>

      <!-- Documents List -->
      <div class="space-y-4">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="bg-white rounded-2xl p-5 shadow-soft flex gap-4 items-start"
        >
          <div
            class="w-24 h-32 bg-gradient-to-br flex items-center justify-center rounded-xl shrink-0"
            :class="doc.coverColor"
          >
            <BookMarked class="w-12 h-12 text-white/30" />
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-navy-800">
                {{ doc.title }}
              </h3>
              <div class="flex gap-2">
                <button class="text-gray-400 hover:text-amber-500">
                  <Star class="w-5 h-5" />
                </button>
                <button class="text-gray-400 hover:text-teal-600">
                  <Download class="w-5 h-5" />
                </button>
              </div>
            </div>
            <p class="text-gray-600 text-sm mb-2">
              {{ doc.authors.join(', ') }}
            </p>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span class="bg-teal-50 text-teal-700 px-2 py-1 rounded-full">{{
                doc.category
              }}</span>
              <span>{{ doc.year }}</span>
              <span>{{ doc.lastAccess }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
