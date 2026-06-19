<template>
  <RHLayout>
    <template #title>
      <div class="flex items-center gap-2">
        <button @click="goBack" class="text-gray-600 hover:text-navy-800">←</button>
        <span>Fiche utilisateur</span>
      </div>
    </template>

    <div class="max-w-3xl mx-auto">
      <!-- User Header -->
      <div class="bg-white rounded-2xl shadow-soft p-8 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white bg-navy-700">
              KM
            </div>
            <div>
              <h2 class="text-2xl font-bold text-navy-800">Kofi Mensah</h2>
              <span class="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-medium mt-1">
                Utilisateur standard
              </span>
            </div>
          </div>
          <div class="flex gap-3">
            <button class="flex items-center gap-2 px-4 py-2 border border-navy-800 text-navy-800 rounded-lg hover:bg-navy-50 transition-colors">
              ✏️ Modifier
            </button>
            <button class="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              🚫 Suspendre
            </button>
          </div>
        </div>
      </div>

      <!-- Two Columns: Details + History -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Personal Info -->
          <div class="bg-white rounded-2xl shadow-soft p-6">
            <h3 class="text-lg font-semibold text-navy-800 mb-4">Informations personnelles</h3>
            <div class="space-y-3 text-sm">
              <div class="flex">
                <span class="w-32 text-gray-500">Nom & Prénoms</span>
                <span class="text-navy-800 font-medium">Kofi Mensah</span>
              </div>
              <div class="flex">
                <span class="w-32 text-gray-500">Adresse e-mail</span>
                <span class="text-navy-800">kofi.mensah@email.com</span>
              </div>
              <div class="flex">
                <span class="w-32 text-gray-500">Téléphone</span>
                <span class="text-gray-700">+229 90 12 34 56</span>
              </div>
            </div>
          </div>

          <!-- Account Info -->
          <div class="bg-white rounded-2xl shadow-soft p-6">
            <h3 class="text-lg font-semibold text-navy-800 mb-4">Informations du compte</h3>
            <div class="space-y-3 text-sm">
              <div class="flex">
                <span class="w-32 text-gray-500">Statut</span>
                <span class="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  ✅ Actif
                </span>
              </div>
              <div class="flex">
                <span class="w-32 text-gray-500">Inscrit le</span>
                <span class="text-gray-700 font-mono">13 juin 2024 à 10h30</span>
              </div>
              <div class="flex">
                <span class="w-32 text-gray-500">Dernière connexion</span>
                <span class="text-gray-700 font-mono">Il y a 4 heures</span>
              </div>
              <div class="flex">
                <span class="w-32 text-gray-500">Créé par</span>
                <span class="text-gray-700">Fatou Agbodji (RH)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Activity -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-soft p-6">
            <h3 class="text-lg font-semibold text-navy-800 mb-4">Historique d'activité</h3>
            <div class="space-y-4 text-sm">
              <div class="flex gap-3">
                <div class="w-2 h-2 mt-2 rounded-full bg-teal-500"></div>
                <div class="flex-1">
                  <p class="text-navy-800">Connexion réussie</p>
                  <p class="text-gray-500 text-xs mt-1">Il y a 4 heures</p>
                </div>
              </div>
              <div class="flex gap-3">
                <div class="w-2 h-2 mt-2 rounded-full bg-navy-700"></div>
                <div class="flex-1">
                  <p class="text-navy-800">Document consulté</p>
                  <p class="text-gray-600 text-xs">Étude sur le commerce transfrontalier</p>
                  <p class="text-gray-500 text-xs mt-1">Il y a 5 heures</p>
                </div>
              </div>
              <div class="flex gap-3">
                <div class="w-2 h-2 mt-2 rounded-full bg-amber-600"></div>
                <div class="flex-1">
                  <p class="text-navy-800">Demande de dépôt soumise</p>
                  <p class="text-gray-500 text-xs mt-1">Il y a 1 jour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </RHLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import RHLayout from '@/layouts/RHLayout.vue'

const router = useRouter()
const goBack = () => {
  router.push('/rh/users')
}
</script>
