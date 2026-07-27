<script setup>
import { ref, computed, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import api from '@/services/api'

const authStore = useAuthStore()
const toast = useToastStore()

const isLoading = ref(true)
const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const profileForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
})

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const initials = computed(() => {
  if (!profileForm.value.first_name || !profileForm.value.last_name) return '??'
  return (profileForm.value.first_name[0] + profileForm.value.last_name[0]).toUpperCase()
})

async function fetchUserProfile() {
  isLoading.value = true

  try {
    const response = await api.get('/profile')
    profileForm.value = {
      first_name: response.data.user.first_name || '',
      last_name: response.data.user.last_name || '',
      email: response.data.user.email || '',
      phone: response.data.user.phone || '',
    }
    authStore.user = response.data.user
  } catch (err) {
    toast.error('Impossible de charger le profil utilisateur')
    console.error('Erreur chargement profil:', err)
  } finally {
    isLoading.value = false
  }
}

async function handleSaveProfile() {
  isSavingProfile.value = true

  if (!authStore.user?.id) {
    toast.error('Utilisateur non authentifié')
    isSavingProfile.value = false
    return
  }

  try {
    const response = await api.put('/profile', profileForm.value)
    authStore.user = response.data.user
    profileForm.value = {
      first_name: response.data.user.first_name || '',
      last_name: response.data.user.last_name || '',
      email: response.data.user.email || '',
      phone: response.data.user.phone || '',
    }
    toast.success('Profil mis à jour avec succès.')
  } catch (err) {
    toast.error(err.response?.data?.message || "Impossible d'enregistrer les modifications")
    console.error('Erreur sauvegarde profil:', err)
  } finally {
    isSavingProfile.value = false
  }
}

async function handleSavePassword() {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    toast.error('La confirmation du mot de passe ne correspond pas.')
    return
  }

  isSavingPassword.value = true

  try {
    await api.patch('/password', passwordForm.value)
    passwordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: '',
    }
    toast.success('Mot de passe mis à jour avec succès.')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Impossible de mettre à jour le mot de passe')
    console.error('Erreur sauvegarde mot de passe:', err)
  } finally {
    isSavingPassword.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated && authStore.user?.id) {
    fetchUserProfile()
  }
})
</script>

<template>
  <AuthenticatedLayout>
    <div>
      <h1 class="text-3xl font-bold text-navy-800 font-serif mb-2">Mon profil</h1>
      <p class="text-gray-500 mb-8">
        Gérer vos informations personnelles et les paramètres de votre compte
      </p>

      <div class="space-y-6 max-w-2xl">
        <!-- Profile Information -->
        <div class="bg-white rounded-2xl p-8 shadow-soft">
          <form @submit.prevent="handleSaveProfile" class="space-y-6">
            <!-- Avatar / Name Section -->
            <div class="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div
                class="w-20 h-20 bg-navy-800 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              >
                {{ initials }}
              </div>
              <div>
                <p class="text-xl font-semibold text-navy-800">
                  {{ profileForm.first_name }} {{ profileForm.last_name }}
                </p>
                <p class="text-gray-500 text-sm">{{ profileForm.email }}</p>
                <button
                  type="button"
                  class="text-teal-700 font-medium text-sm mt-1 hover:underline"
                >
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
                  v-model="profileForm.first_name"
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
                  v-model="profileForm.last_name"
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
                  v-model="profileForm.email"
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
                  v-model="profileForm.phone"
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                />
              </div>
            </div>

            <!-- Buttons for Profile -->
            <div class="flex justify-end pt-4">
              <button
                type="submit"
                :disabled="isSavingProfile || isLoading"
                class="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                <span
                  v-if="isSavingProfile"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                {{
                  isSavingProfile
                    ? 'Enregistrement...'
                    : isLoading
                      ? 'Chargement...'
                      : 'Enregistrer le profil'
                }}
              </button>
            </div>
          </form>
        </div>

        <!-- Password Change -->
        <div class="bg-white rounded-2xl p-8 shadow-soft">
          <h3 class="font-semibold text-navy-800 mb-4">Changer le mot de passe</h3>
          <form @submit.prevent="handleSavePassword" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2"
                >Mot de passe actuel *</label
              >
              <input
                type="password"
                id="currentPassword"
                v-model="passwordForm.current_password"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                placeholder="••••••••"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2"
                  >Nouveau mot de passe *</label
                >
                <input
                  type="password"
                  id="newPassword"
                  v-model="passwordForm.password"
                  required
                  minlength="8"
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2"
                  >Confirmer le nouveau mot de passe *</label
                >
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="passwordForm.password_confirmation"
                  required
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button
                type="submit"
                :disabled="isSavingPassword"
                class="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                <span
                  v-if="isSavingPassword"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                {{ isSavingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
