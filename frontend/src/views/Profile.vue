<script setup>
import { ref, computed } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const isSaving = ref(false)

const profile = ref({
  first_name: 'Jean',
  last_name: 'Dupont',
  email: 'jean.dupont@example.com',
  phone: '+229 90 00 00 00',
})

const initials = computed(() => {
  return (profile.value.first_name[0] + profile.value.last_name[0]).toUpperCase()
})

function handleSave() {
  isSaving.value = true
  console.log('Saving profile', profile.value)
  setTimeout(() => {
    isSaving.value = false
    alert('Modifications enregistrées avec succès !')
  }, 1500)
}
</script>

<template>
  <AuthenticatedLayout>
    <div>
      <h1 class="text-3xl font-bold text-navy-800 font-serif mb-2">Mon profil</h1>
      <p class="text-gray-500 mb-8">
        Gérer vos informations personnelles et les paramètres de votre compte
      </p>

      <div class="bg-white rounded-2xl p-8 shadow-soft max-w-2xl">
        <form @submit.prevent="handleSave" class="space-y-6">
          <!-- Avatar / Name Section -->
          <div class="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div
              class="w-20 h-20 bg-navy-800 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            >
              {{ initials }}
            </div>
            <div>
              <p class="text-xl font-semibold text-navy-800">
                {{ profile.first_name }} {{ profile.last_name }}
              </p>
              <p class="text-gray-500 text-sm">{{ profile.email }}</p>
              <button type="button" class="text-teal-700 font-medium text-sm mt-1 hover:underline">
                Modifier l'avatar
              </button>
            </div>
          </div>

          <!-- First & Last Name -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-navy-800 mb-2"
                >Prénom *</label
              >
              <input
                type="text"
                id="firstName"
                v-model="profile.first_name"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-navy-800 mb-2"
                >Nom *</label
              >
              <input
                type="text"
                id="lastName"
                v-model="profile.last_name"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              />
            </div>
          </div>

          <!-- Email & Phone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="email" class="block text-sm font-medium text-navy-800 mb-2"
                >Adresse email *</label
              >
              <input
                type="email"
                id="email"
                v-model="profile.email"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              />
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-navy-800 mb-2"
                >Téléphone</label
              >
              <input
                type="tel"
                id="phone"
                v-model="profile.phone"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              />
            </div>
          </div>

          <!-- Password Section -->
          <div class="pt-4 border-t border-gray-200">
            <h3 class="font-semibold text-navy-800 mb-4">Mot de passe</h3>
            <div class="space-y-4">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2"
                  >Mot de passe actuel</label
                >
                <input
                  type="password"
                  id="currentPassword"
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                  placeholder="••••••••"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2"
                    >Nouveau mot de passe</label
                  >
                  <input
                    type="password"
                    id="newPassword"
                    class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2"
                    >Confirmer le nouveau mot de passe</label
                  >
                  <input
                    type="password"
                    id="confirmPassword"
                    class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-4 pt-4">
            <button type="button" class="px-6 py-3 text-gray-600 font-medium hover:text-navy-800">
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-8 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
