<script setup>
import { ref } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const user = ref({
  first_name: 'Jean',
  last_name: 'Dupont'
})
</script>

<template>
  <AuthenticatedLayout>
    <div>
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-navy-800 font-serif">
          Bonjour, {{ user.first_name }} !
        </h1>
        <p class="text-gray-500">
          Bienvenue dans votre espace personnel
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 shadow-soft">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 text-2xl">📚</div>
            <div>
              <div class="text-2xl font-bold text-navy-800 font-mono">12</div>
              <div class="text-gray-500 text-sm">Documents consultés</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-soft">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center text-navy-700 text-2xl">⬇️</div>
            <div>
              <div class="text-2xl font-bold text-navy-800 font-mono">8</div>
              <div class="text-gray-500 text-sm">Documents téléchargés</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-soft">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 text-2xl">📥</div>
            <div>
              <div class="text-2xl font-bold text-navy-800 font-mono">3</div>
              <div class="text-gray-500 text-sm">Demandes de dépôt</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Activity -->
        <div class="bg-white rounded-2xl p-6 shadow-soft">
          <h2 class="text-lg font-semibold text-navy-800 mb-4">Activité récente</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">📖</div>
              <div class="flex-1">
                <p class="text-navy-800 text-sm">Vous avez consulté « Introduction au Droit Constitutionnel Béninois »</p>
                <p class="text-gray-400 text-xs">Il y a 2 heures</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center text-navy-700">⬇️</div>
              <div class="flex-1">
                <p class="text-navy-800 text-sm">Vous avez téléchargé « Algorithmique et Structures de Données »</p>
                <p class="text-gray-400 text-xs">Il y a 1 jour</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">📥</div>
              <div class="flex-1">
                <p class="text-navy-800 text-sm">Votre demande de dépôt « Mon mémoire a été acceptée »</p>
                <p class="text-gray-400 text-xs">Il y a 3 jours</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl p-6 shadow-soft">
          <h2 class="text-lg font-semibold text-navy-800 mb-4">Actions rapides</h2>
          <div class="space-y-3">
            <router-link
              to="/catalogue"
              class="flex items-center justify-between p-4 bg-beige rounded-xl hover:bg-teal-50 transition-colors"
            >
              <span class="text-navy-800">🔍 Explorer le catalogue</span>
              <span class="text-teal-700">→</span>
            </router-link>
            <router-link
              to="/deposit-request"
              class="flex items-center justify-between p-4 bg-beige rounded-xl hover:bg-teal-50 transition-colors"
            >
              <span class="text-navy-800">📥 Déposer un document</span>
              <span class="text-teal-700">→</span>
            </router-link>
            <router-link
              to="/profile"
              class="flex items-center justify-between p-4 bg-beige rounded-xl hover:bg-teal-50 transition-colors"
            >
              <span class="text-navy-800">👤 Modifier mon profil</span>
              <span class="text-teal-700">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>


