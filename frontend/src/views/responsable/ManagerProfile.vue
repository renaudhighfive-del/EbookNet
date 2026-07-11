<script setup>
import { ref, computed, onMounted } from 'vue'
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

defineOptions({ name: 'ManagerProfile' })

const authStore = useAuthStore()
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
})

const initials = computed(() => {
  if (!form.value.first_name || !form.value.last_name) return '??'
  return (form.value.first_name[0] + form.value.last_name[0]).toUpperCase()
})

async function fetchProfile() {
  isLoading.value = true
  error.value = null

  if (!authStore.user?.id) {
    error.value = 'Utilisateur non authentifié'
    isLoading.value = false
    return
  }

  try {
    const response = await api.get(`/hr/users/${authStore.user.id}`)
    form.value = {
      first_name: response.data.user.first_name || '',
      last_name: response.data.user.last_name || '',
      email: response.data.user.email || '',
      phone: response.data.user.phone || '',
    }
  } catch (err) {
    error.value = 'Impossible de charger le profil'
    console.error('Erreur chargement profil:', err)
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  isSaving.value = true
  error.value = null

  if (!authStore.user?.id) {
    error.value = 'Utilisateur non authentifié'
    isSaving.value = false
    return
  }

  try {
    const response = await api.put(`/hr/users/${authStore.user.id}`, form.value)
    authStore.user = response.data.user
    form.value = {
      first_name: response.data.user.first_name || '',
      last_name: response.data.user.last_name || '',
      email: response.data.user.email || '',
      phone: response.data.user.phone || '',
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible d\'enregistrer les modifications'
    console.error('Erreur sauvegarde profil:', err)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated && authStore.user?.id) {
    fetchProfile()
  }
})
</script>

<template>
  <ResponsableLayout>
    <template #title>Mon profil</template>

    <div class="max-w-2xl mx-auto">
      <div v-if="isLoading" class="bg-white rounded-2xl shadow-soft p-8 text-center text-gray-500">
        Chargement...
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {{ error }}
      </div>

      <div v-else class="bg-white rounded-2xl shadow-soft p-8">
        <div class="text-center mb-8">
          <div
            class="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-4xl font-bold"
          >
            {{ initials }}
          </div>
          <h2 class="text-2xl font-bold text-navy-800 mb-1">{{ form.first_name }} {{ form.last_name }}</h2>
          <span
            class="inline-block bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium mb-4"
          >
            Responsable — Demandes
          </span>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6">
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-semibold text-navy-800 mb-4">Informations personnelles</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-navy-800 mb-2">Prénom *</label>
                <input
                  id="firstName"
                  v-model="form.first_name"
                  type="text"
                  required
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-navy-800 mb-2">Nom *</label>
                <input
                  id="lastName"
                  v-model="form.last_name"
                  type="text"
                  required
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                />
              </div>
            </div>
            <div class="mt-4">
              <label for="email" class="block text-sm font-medium text-gray-500 mb-2">Adresse e-mail</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                disabled
                class="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-600"
              />
            </div>
            <div class="mt-4">
              <label for="phone" class="block text-sm font-medium text-navy-800 mb-2">Téléphone</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                placeholder="+229 97 XX XX XX"
              />
            </div>
          </div>

          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-semibold text-navy-800 mb-4">Sécurité</h3>
            <div class="space-y-4">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-600 mb-2">Mot de passe actuel</label>
                <input id="currentPassword" type="password" class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-600 mb-2">Nouveau mot de passe</label>
                  <input id="newPassword" type="password" class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50" />
                </div>
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-600 mb-2">Confirmer le nouveau mot de passe</label>
                  <input id="confirmPassword" type="password" class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50" />
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-4">Informations du compte</h4>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Rôle</span>
                <span class="text-navy-800 font-medium">Responsable — Demandes</span>
              </div>
            </div>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {{ error }}
          </div>

          <div class="flex items-center justify-between pt-4">
            <button type="button" class="text-gray-600 hover:text-navy-800 font-medium">Annuler</button>
            <button
              type="submit"
              :disabled="isSaving"
              class="bg-teal-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </ResponsableLayout>
</template>
