<template>
  <RHLayout>
    <template #title>
      <div class="flex items-center gap-3">
        <span>Gestion des utilisateurs</span>
        <span v-if="usersData.total" class="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-mono">{{ usersData.total }} total</span>
      </div>
    </template>

    <!-- Top Bar: Search + Filters + Add Button -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <!-- Search -->
        <div class="relative flex-1 lg:w-96">
          <div class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">🔍</div>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            class="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
          >
        </div>
        <!-- Filter by Role -->
        <select v-model="filters.role" @change="fetchUsers" class="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50">
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateur</option>
          <option value="responsable_rh">Responsable RH</option>
          <option value="responsable_demande">Responsable — Demandes</option>
          <option value="admin">Administrateur</option>
        </select>
        <!-- Filter by Status -->
        <select v-model="filters.status" @change="fetchUsers" class="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50">
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="suspended">Suspendus</option>
        </select>
      </div>
      <router-link
        to="/rh/users/new"
        class="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
      >
        ➕ Nouvel utilisateur
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-beige">
            <tr>
              <th class="px-6 py-4 text-gray-600 font-semibold">Utilisateur</th>
              <th class="px-6 py-4 text-gray-600 font-semibold">Rôle</th>
              <th class="px-6 py-4 text-gray-600 font-semibold">Statut</th>
              <th class="px-6 py-4 text-gray-600 font-semibold">Inscrit le</th>
              <th class="px-6 py-4 text-gray-600 font-semibold">Dernière connexion</th>
              <th class="px-6 py-4 text-gray-600 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" :class="getAvatarColor(user)">
                    {{ getUserInitials(user) }}
                  </div>
                  <div>
                    <p class="font-semibold text-navy-800">{{ user.first_name }} {{ user.last_name }}</p>
                    <p class="text-gray-500 text-xs">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="getRoleClass(user.role)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(user.status)" class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full"></span>
                  {{ getStatusLabel(user.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-700 font-mono text-xs">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 text-gray-700 font-mono text-xs">
                {{ user.last_login_at ? formatDate(user.last_login_at) : 'Jamais' }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-3">
                  <router-link :to="`/rh/users/${user.id}`" class="text-gray-500 hover:text-navy-800">👁️</router-link>
                  <router-link :to="`/rh/users/${user.id}/edit`" class="text-gray-500 hover:text-navy-800">✏️</router-link>
                  <button @click="deleteUser(user.id)" class="text-gray-500 hover:text-red-600">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="usersData.last_page > 1" class="flex items-center justify-between mt-6">
      <div class="text-gray-600 text-sm">
        Affichage des utilisateurs <span class="font-semibold">{{ usersData.from }}</span> à <span class="font-semibold">{{ usersData.to }}</span> sur <span class="font-semibold">{{ usersData.total }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="changePage(usersData.current_page - 1)"
          :disabled="!usersData.prev_page_url"
          class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="page === usersData.current_page ? 'bg-navy-800 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'"
          class="px-3 py-1 rounded"
        >
          {{ page }}
        </button>
        <button
          @click="changePage(usersData.current_page + 1)"
          :disabled="!usersData.next_page_url"
          class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  </RHLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import RHLayout from '@/layouts/RHLayout.vue'
import api from '@/services/api'
import axios from 'axios'

const router = useRouter()
const users = ref([])
const usersData = ref({})
const isLoading = ref(false)
const filters = ref({
  role: '',
  status: ''
})
const currentPage = ref(1)

const visiblePages = computed(() => {
  if (!usersData.last_page) return []
  const pages = []
  const start = Math.max(1, usersData.current_page - 2)
  const end = Math.min(usersData.last_page, usersData.current_page + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const fetchUsers = async (page = 1) => {
  isLoading.value = true
  try {
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie')
    const params = { page }
    if (filters.value.role) params.role = filters.value.role
    if (filters.value.status) params.status = filters.value.status

    const response = await api.get('/users', { params })
    users.value = response.data.data
    usersData.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > usersData.last_page) return
  currentPage.value = page
  fetchUsers(page)
}

const deleteUser = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

  try {
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie')
    await api.delete(`/users/${id}`)
    fetchUsers(currentPage.value)
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const getAvatarColor = (user) => {
  const colors = ['bg-amber-600', 'bg-teal-700', 'bg-navy-700', 'bg-purple-700', 'bg-rose-700']
  const index = user.id % colors.length
  return colors[index]
}

const getUserInitials = (user) => {
  return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrateur',
    responsable_rh: 'Responsable RH',
    responsable_demande: 'Responsable — Demandes',
    user: 'Utilisateur'
  }
  return labels[role] || role
}

const getRoleClass = (role) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-700',
    responsable_rh: 'bg-amber-100 text-amber-700',
    responsable_demande: 'bg-teal-100 text-teal-700',
    user: 'bg-gray-100 text-gray-700'
  }
  return classes[role] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Actif',
    inactive: 'Inactif',
    suspended: 'Suspendu'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    suspended: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchUsers()
})
</script>
