<template>
  <RHLayout>
    <template #title>
      <div class="flex items-center gap-3">
        <span>Gestion des utilisateurs</span>
        <span class="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-mono">248 total</span>
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
        <!-- Filter -->
        <select class="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50">
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateur</option>
          <option value="rh">Responsable RH</option>
          <option value="manager">Responsable — Demandes</option>
          <option value="admin">Administrateur</option>
        </select>
        <select class="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50">
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

    <!-- Users Table -->
    <div class="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-beige">
            <tr>
              <th class="px-6 py-4 text-gray-600 font-semibold">
                <input type="checkbox" class="w-4 h-4 rounded border-gray-300">
              </th>
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
                <input type="checkbox" class="w-4 h-4 rounded border-gray-300">
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" :class="user.avatarColor">
                    {{ user.initials }}
                  </div>
                  <div>
                    <p class="font-semibold text-navy-800">{{ user.name }}</p>
                    <p class="text-gray-500 text-xs">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="user.roleClass" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="user.statusClass" class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full"></span>
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-700 font-mono text-xs">
                {{ user.createdAt }}
              </td>
              <td class="px-6 py-4 text-gray-700 font-mono text-xs">
                {{ user.lastLogin }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-3">
                  <button class="text-gray-500 hover:text-navy-800">✏️</button>
                  <button class="text-gray-500 hover:text-red-600">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-6">
      <div class="text-gray-600 text-sm">
        Affichage des utilisateurs <span class="font-semibold">1</span> à <span class="font-semibold">10</span> sur <span class="font-semibold">248</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">Précédent</button>
        <button class="px-3 py-1 rounded bg-navy-800 text-white">1</button>
        <button class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">2</button>
        <span class="text-gray-500 px-2">...</span>
        <button class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">25</button>
        <button class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">Suivant</button>
      </div>
    </div>
  </RHLayout>
</template>

<script setup>
import { ref } from 'vue'
import RHLayout from '@/layouts/RHLayout.vue'

const users = ref([
  {
    id: 1,
    name: 'Fatou Agbodji',
    initials: 'FA',
    avatarColor: 'bg-amber-600',
    email: 'fatou.agbodji@bibli.num.bj',
    role: 'Responsable RH',
    roleClass: 'bg-amber-100 text-amber-700',
    status: 'Actif',
    statusClass: 'bg-green-100 text-green-700',
    createdAt: '15 janv 2024',
    lastLogin: 'Il y a 10 min'
  },
  {
    id: 2,
    name: 'Dr. Léon Houessou',
    initials: 'LH',
    avatarColor: 'bg-teal-700',
    email: 'leon.houessou@bibli.num.bj',
    role: 'Responsable — Demandes',
    roleClass: 'bg-teal-100 text-teal-700',
    status: 'Actif',
    statusClass: 'bg-green-100 text-green-700',
    createdAt: '15 janv 2024',
    lastLogin: 'Il y a 2 heures'
  },
  {
    id: 3,
    name: 'Kofi Mensah',
    initials: 'KM',
    avatarColor: 'bg-navy-700',
    email: 'kofi.mensah@email.com',
    role: 'Utilisateur',
    roleClass: 'bg-gray-100 text-gray-700',
    status: 'Actif',
    statusClass: 'bg-green-100 text-green-700',
    createdAt: '13 juin 2024',
    lastLogin: 'Il y a 4 heures'
  },
  {
    id: 4,
    name: 'Afi Agossou',
    initials: 'AA',
    avatarColor: 'bg-purple-700',
    email: 'afi.agossou@email.com',
    role: 'Utilisateur',
    roleClass: 'bg-gray-100 text-gray-700',
    status: 'Inactif',
    statusClass: 'bg-gray-100 text-gray-700',
    createdAt: '12 juin 2024',
    lastLogin: 'Il y a 5 jours'
  }
])
</script>
