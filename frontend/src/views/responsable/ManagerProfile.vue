<script setup>
import { ref } from 'vue'
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'

const form = ref({
  firstName: 'Léon',
  lastName: 'Houessou',
  email: 'leon.houessou@bibli.num.bj',
  phone: '+229 95 12 34 56'
})

const handleSave = () => {
  alert('Modifications enregistrées avec succès !')
}
</script>

<template>
  <ResponsableLayout>
    <template #title>Mon profil</template>

    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-soft p-8">
        <!-- Profile Header -->
        <div class="text-center mb-8">
          <div class="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-4xl font-bold">
            LH
          </div>
          <h2 class="text-2xl font-bold text-navy-800 mb-1">Dr. Léon Houessou</h2>
          <span class="inline-block bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Responsable — Demandes
          </span>
          <div class="text-gray-600 text-sm">
            5 demandes traitées
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSave" class="space-y-6">
          <!-- Personal Info -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-semibold text-navy-800 mb-4">Informations personnelles</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-navy-800 mb-2">Prénom *</label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                >
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-navy-800 mb-2">Nom *</label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                >
              </div>
            </div>
            <div class="mt-4">
              <label for="email" class="block text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <span>🔒</span> Adresse e-mail
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                disabled
                class="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-600"
              >
            </div>
            <div class="mt-4">
              <label for="phone" class="block text-sm font-medium text-navy-800 mb-2">Téléphone</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                placeholder="+229 97 XX XX XX"
              >
            </div>
          </div>

          <!-- Security -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-semibold text-navy-800 mb-4">Sécurité</h3>
            <div class="space-y-4">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-600 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                >
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-600 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                  >
                </div>
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-600 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Account Info -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-4">Informations du compte</h4>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Membre depuis</span>
                <span class="text-gray-700 font-mono">15 janvier 2024</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Rôle</span>
                <span class="text-navy-800 font-medium">Responsable — Demandes</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Statut</span>
                <span class="text-green-700 font-medium">✅ Actif</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Dernière connexion</span>
                <span class="text-gray-700 font-mono">Il y a 2 heures</span>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-between pt-4">
            <button type="button" class="text-gray-600 hover:text-navy-800 font-medium">
              Annuler
            </button>
            <button
              type="submit"
              class="bg-teal-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  </ResponsableLayout>
</template>


