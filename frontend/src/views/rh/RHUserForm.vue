<template>
  <RHLayout>
    <template #title>
      <div class="flex items-center gap-2">
        <button @click="goBack" class="text-gray-600 hover:text-navy-800">←</button>
        <span>{{ isEdit ? 'Modifier le compte utilisateur' : 'Créer un compte utilisateur' }}</span>
      </div>
    </template>

    <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-soft p-8">
      <!-- Info Banner -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span class="text-2xl">💡</span>
        <p class="text-blue-800 text-sm">
          Un e-mail de bienvenue avec les identifiants sera envoyé automatiquement à l'adresse spécifiée.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Personal Information -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-navy-800 mb-4">Informations personnelles</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="lastName" class="block text-sm font-medium text-navy-800 mb-2">Nom *</label>
              <input
                id="lastName"
                v-model="form.last_name"
                type="text"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
            </div>
            <div>
              <label for="firstName" class="block text-sm font-medium text-navy-800 mb-2">Prénoms *</label>
              <input
                id="firstName"
                v-model="form.first_name"
                type="text"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
            </div>
          </div>
          <div class="mt-4">
            <label for="email" class="block text-sm font-medium text-navy-800 mb-2">Adresse e-mail *</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
            >
          </div>
          <div class="mt-4">
            <label for="phone" class="block text-sm font-medium text-navy-800 mb-2">Numéro de téléphone</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              placeholder="+229 XX XX XX XX"
            >
          </div>
          <div v-if="!isEdit" class="mt-4">
            <label for="password" class="block text-sm font-medium text-navy-800 mb-2">Mot de passe *</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="8"
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
            >
          </div>
        </div>

        <!-- Role -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-navy-800 mb-4">Rôle et permissions</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-xl p-4">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="radio" v-model="form.role" value="user" class="mt-1">
                <div class="flex-1">
                  <p class="font-semibold text-navy-800">Utilisateur standard</p>
                  <p class="text-gray-500 text-sm mt-1">
                    Peut consulter les documents, lire en ligne et soumettre des demandes de dépôt.
                  </p>
                </div>
              </label>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="radio" v-model="form.role" value="responsable_rh" class="mt-1">
                <div class="flex-1">
                  <p class="font-semibold text-navy-800">Responsable RH</p>
                  <p class="text-gray-500 text-sm mt-1">
                    Gère les comptes utilisateurs, crée et désactive les accès.
                  </p>
                </div>
              </label>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="radio" v-model="form.role" value="responsable_demande" class="mt-1">
                <div class="flex-1">
                  <p class="font-semibold text-navy-800">Responsable — Demandes</p>
                  <p class="text-gray-500 text-sm mt-1">
                    Vérifie et valide les demandes de dépôt de documents.
                  </p>
                </div>
              </label>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="radio" v-model="form.role" value="admin" class="mt-1">
                <div class="flex-1">
                  <p class="font-semibold text-navy-800">Administrateur</p>
                  <p class="text-gray-500 text-sm mt-1">
                    Accès complet à la plateforme et à toutes les fonctionnalités.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-navy-800 mb-4">Statut du compte</h3>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <input type="radio" v-model="form.status" value="active" id="status-active">
              <label for="status-active" class="text-gray-800 font-medium">Actif</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="radio" v-model="form.status" value="inactive" id="status-inactive">
              <label for="status-inactive" class="text-gray-800 font-medium">Inactif</label>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex items-center justify-between pt-4">
          <button type="button" @click="goBack" class="text-gray-600 hover:text-navy-800 font-medium">
            Annuler
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="bg-teal-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {{ isLoading ? 'Enregistrement en cours...' : (isEdit ? 'Enregistrer les modifications' : 'Créer le compte') }}
          </button>
        </div>
      </form>
    </div>
  </RHLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RHLayout from '@/layouts/RHLayout.vue'
import api from '@/services/api'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const isEdit = ref(false)
const isLoading = ref(false)

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'user',
  status: 'active'
})

const goBack = () => {
  router.push('/rh/users')
}

const fetchUser = async () => {
  isLoading.value = true
  try {
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie')
    const response = await api.get(`/users/${route.params.id}`)
    const user = response.data.user
    form.value = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
      status: user.status
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  isLoading.value = true
  try {
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie')
    if (isEdit.value) {
      await api.put(`/users/${route.params.id}`, form.value)
    } else {
      await api.post('/users', form.value)
    }
    alert(isEdit.value ? 'Modifications enregistrées !' : 'Compte créé avec succès !')
    goBack()
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('Une erreur est survenue.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (route.params.id) {
    isEdit.value = true
    fetchUser()
  }
})
</script>
