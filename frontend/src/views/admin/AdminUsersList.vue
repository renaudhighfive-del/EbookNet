<template>
  <AdminLayout>
    <!-- Top bar: search + add button -->
    <div class="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full md:w-96">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un utilisateur..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
        />
      </div>
      <button class="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2">
        <span>+</span>
        Ajouter un utilisateur
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600 font-medium">Rôle:</label>
        <select v-model="filterRole" class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-teal-600 outline-none">
          <option value="">Tous</option>
          <option value="admin">Administrateur</option>
          <option value="responsable">Responsable</option>
          <option value="user">Utilisateur</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600 font-medium">Statut:</label>
        <select v-model="filterStatus" class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-teal-600 outline-none">
          <option value="">Tous</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
              <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</th>
              <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
              <th class="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
              <th class="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-beige/50 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div :class="['w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg', user.color]">
                    {{ user.initials }}
                  </div>
                  <div>
                    <p class="font-medium text-navy-900">{{ user.name }}</p>
                    <p class="text-xs text-slate-500">Inscrit le {{ user.date }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 text-sm text-slate-600">{{ user.email }}</td>
              <td class="p-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                    user.role === 'admin' ? 'bg-navy-100 text-navy-700' :
                    user.role === 'responsable' ? 'bg-teal-100 text-teal-700' :
                    'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ user.roleLabel }}
                </span>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                    user.status === 'Actif' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'
                  ]"
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button class="text-slate-500 hover:text-navy-900 transition-colors mr-3">
                  ✏️
                </button>
                <button class="text-slate-500 hover:text-red-700 transition-colors">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'

const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const users = ref([
  {
    id: 1,
    name: 'Marie Afouda',
    initials: 'MA',
    color: 'bg-teal-600',
    email: 'marie@biblium.bj',
    role: 'admin',
    roleLabel: 'Administrateur',
    status: 'Actif',
    date: '15 Jan 2023',
  },
  {
    id: 2,
    name: 'Paul Kiki',
    initials: 'PK',
    color: 'bg-amber-600',
    email: 'paul@biblium.bj',
    role: 'responsable',
    roleLabel: 'Responsable',
    status: 'Actif',
    date: '20 Mar 2023',
  },
  {
    id: 3,
    name: 'Fatou Agbodje',
    initials: 'FA',
    color: 'bg-navy-700',
    email: 'fatou@biblium.bj',
    role: 'responsable',
    roleLabel: 'Responsable',
    status: 'Actif',
    date: '05 Mai 2023',
  },
  {
    id: 4,
    name: 'Jean Dossa',
    initials: 'JD',
    color: 'bg-slate-600',
    email: 'jean@gmail.com',
    role: 'user',
    roleLabel: 'Utilisateur',
    status: 'Actif',
    date: '10 Juin 2024',
  },
])

const filteredUsers = computed(() => {
  let result = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  }

  if (filterRole.value) {
    result = result.filter(u => u.role === filterRole.value)
  }

  if (filterStatus.value) {
    result = result.filter(u => u.status.toLowerCase() === filterStatus.value)
  }

  return result
})
</script>
