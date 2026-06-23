<script setup>
import { ref } from 'vue'
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'

const activeTab = ref('pending')

const tabs = [
  { id: 'pending', label: 'À examiner', count: 3 },
  { id: 'approved', label: 'Validées', count: 1 },
  { id: 'rejected', label: 'Refusées', count: 1 },
  { id: 'all', label: 'Toutes', count: 5 },
]

const pendingDeposits = ref([
  {
    id: 7,
    title: 'Étude sur le Commerce Transfrontalier au Bénin',
    deposant: 'Marie Zannou',
    type: 'Mémoire',
    typeIcon: '📄',
    typeColor: 'bg-teal-100 text-teal-700',
    assignedDate: '10 juin 2024',
    isPriority: true,
    warning: 'Assignée il y a 4 jours',
  },
  {
    id: 8,
    title: 'Guide Pratique de Comptabilité Appliquée',
    deposant: 'Kofi Mensah',
    type: 'Guide',
    typeIcon: '📌',
    typeColor: 'bg-amber-100 text-amber-700',
    assignedDate: '12 juin 2024',
    isPriority: false,
    warning: null,
  },
  {
    id: 9,
    title: "Rapport sur l'Économie Rurale du Zou",
    deposant: 'Afi Dossou',
    type: 'Rapport',
    typeIcon: '📊',
    typeColor: 'bg-navy-100 text-navy-700',
    assignedDate: '13 juin 2024',
    isPriority: false,
    warning: null,
  },
])
</script>

<template>
  <ResponsableLayout>
    <template #title>
      <div class="flex items-center gap-3">
        <span>Demandes qui me sont assignées</span>
        <span class="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold"
          >3 à examiner</span
        >
      </div>
    </template>

    <!-- Filter Tabs -->
    <div class="flex gap-4 mb-6 border-b border-gray-200 pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="[
          activeTab === tab.id
            ? 'text-navy-800 border-b-2 border-teal-600'
            : 'text-gray-500 hover:text-navy-800',
        ]"
      >
        {{ tab.label }} <span class="text-gray-400">({{ tab.count }})</span>
      </button>
    </div>

    <!-- Cards Grid -->
    <div v-if="activeTab === 'pending'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="deposit in pendingDeposits"
        :key="deposit.id"
        class="bg-white rounded-2xl p-6 shadow-soft border-l-4 border-gray-200"
        :class="{ 'border-l-amber-500': deposit.isPriority }"
      >
        <div class="flex items-start gap-4 mb-4">
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            :class="deposit.typeColor"
          >
            {{ deposit.typeIcon }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-navy-800 mb-2">{{ deposit.title }}</h3>
            <p class="text-gray-600 text-sm mb-3">{{ deposit.deposant }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs">
                {{ deposit.type }}
              </span>
              <span class="text-gray-500 text-xs">Assignée le {{ deposit.assignedDate }}</span>
            </div>
            <div
              v-if="deposit.warning"
              class="mb-4 inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs"
            >
              ⚠️ {{ deposit.warning }}
            </div>
            <span
              class="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs mb-4"
            >
              En attente d'examen
            </span>
          </div>
        </div>
        <router-link
          :to="`/manager/deposits/${deposit.id}/review`"
          class="w-full flex items-center justify-center bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
        >
          Examiner la demande →
        </router-link>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="activeTab === 'approved'" class="text-center py-16">
      <div class="text-6xl mb-4">✅</div>
      <p class="text-gray-500">Aucune demande validée pour le moment</p>
    </div>
  </ResponsableLayout>
</template>
