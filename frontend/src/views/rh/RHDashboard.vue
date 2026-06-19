<template>
  <RHLayout>
    <template #title>Tableau de bord RH</template>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-navy-800 text-white rounded-2xl p-6 shadow-soft">
        <div class="flex items-center gap-4">
          <span class="text-3xl">👥</span>
          <div>
            <div class="text-3xl font-bold font-mono">248</div>
            <div class="text-navy-200 text-sm">Utilisateurs inscrits</div>
          </div>
        </div>
      </div>
      <div class="bg-green-600 text-white rounded-2xl p-6 shadow-soft">
        <div class="flex items-center gap-4">
          <span class="text-3xl">✅</span>
          <div>
            <div class="text-3xl font-bold font-mono">231</div>
            <div class="text-green-200 text-sm">Comptes actifs</div>
          </div>
        </div>
      </div>
      <div class="bg-gray-500 text-white rounded-2xl p-6 shadow-soft">
        <div class="flex items-center gap-4">
          <span class="text-3xl">⏸️</span>
          <div>
            <div class="text-3xl font-bold font-mono">12</div>
            <div class="text-gray-200 text-sm">Comptes inactifs</div>
          </div>
        </div>
      </div>
      <div class="bg-red-600 text-white rounded-2xl p-6 shadow-soft">
        <div class="flex items-center gap-4">
          <span class="text-3xl">🚫</span>
          <div>
            <div class="text-3xl font-bold font-mono">5</div>
            <div class="text-red-200 text-sm">Comptes suspendus</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Recent Users Table -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-navy-800">Derniers comptes créés</h3>
          <router-link to="/rh/users" class="text-teal-600 font-medium hover:underline text-sm">
            Voir tous les utilisateurs →
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-gray-500 border-b border-gray-200">
              <tr>
                <th class="pb-3 pr-4"></th>
                <th class="pb-3 pr-4">Nom & Prénom</th>
                <th class="pb-3 pr-4">Email</th>
                <th class="pb-3 pr-4">Rôle</th>
                <th class="pb-3 pr-4">Date inscription</th>
                <th class="pb-3">Statut</th>
                <th class="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in recentUsers" :key="user.id" class="border-b border-gray-100">
                <td class="py-4 pr-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" :class="user.avatarColor">
                    {{ user.initials }}
                  </div>
                </td>
                <td class="py-4 pr-4 text-navy-800 font-medium">{{ user.name }}</td>
                <td class="py-4 pr-4 text-gray-600">{{ user.email }}</td>
                <td class="py-4 pr-4">
                  <span :class="user.roleClass" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ user.role }}
                  </span>
                </td>
                <td class="py-4 pr-4 text-gray-600 font-mono">{{ user.createdAt }}</td>
                <td class="py-4 pr-4">
                  <span :class="user.statusClass" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ user.status }}
                  </span>
                </td>
                <td class="py-4">
                  <button class="text-gray-500 hover:text-navy-800 mr-3">✏️</button>
                  <button class="text-gray-500 hover:text-red-600">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: Recent Actions -->
      <div class="bg-white rounded-2xl p-6 shadow-soft">
        <h3 class="text-lg font-semibold text-navy-800 mb-4">Mes actions récentes</h3>
        <div class="space-y-4 text-sm">
          <div class="flex gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">+</div>
            <div class="flex-1">
              <p class="text-navy-800">Créé compte pour Kofi Mensah</p>
              <p class="text-gray-500 text-xs">Il y a 1 heure</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">✏️</div>
            <div class="flex-1">
              <p class="text-navy-800">Réinitialisé mot de passe pour Marie Dossou</p>
              <p class="text-gray-500 text-xs">Il y a 3 heures</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">⏸️</div>
            <div class="flex-1">
              <p class="text-navy-800">Suspendu compte de Yao Gbédji</p>
              <p class="text-gray-500 text-xs">Hier</p>
            </div>
          </div>
        </div>

        <!-- Quick Action Button -->
        <div class="mt-6 pt-4 border-t border-gray-200">
          <router-link
            to="/rh/users/new"
            class="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            ➕ Créer un compte utilisateur
          </router-link>
        </div>
      </div>
    </div>
  </RHLayout>
</template>

<script setup>
import { ref } from 'vue'
import RHLayout from '@/layouts/RHLayout.vue'

const recentUsers = ref([
  {
    id: 1,
    name: 'Kofi Mensah',
    initials: 'KM',
    avatarColor: 'bg-navy-700',
    email: 'kofi.mensah@email.com',
    role: 'Utilisateur',
    roleClass: 'bg-gray-100 text-gray-700',
    createdAt: '13 juin 2024',
    status: 'Actif',
    statusClass: 'bg-green-100 text-green-700'
  },
  {
    id: 2,
    name: 'Afi Agossou',
    initials: 'AA',
    avatarColor: 'bg-teal-700',
    email: 'afi.agossou@email.com',
    role: 'Utilisateur',
    roleClass: 'bg-gray-100 text-gray-700',
    createdAt: '12 juin 2024',
    status: 'Actif',
    statusClass: 'bg-green-100 text-green-700'
  },
  {
    id: 3,
    name: 'Brice Tokplo',
    initials: 'BT',
    avatarColor: 'bg-amber-700',
    email: 'brice.tokplo@email.com',
    role: 'Responsable — Demandes',
    roleClass: 'bg-teal-100 text-teal-700',
    createdAt: '10 juin 2024',
    status: 'Actif',
    statusClass: 'bg-green-100 text-green-700'
  },
  {
    id: 4,
    name: 'Marie Dossou',
    initials: 'MD',
    avatarColor: 'bg-purple-700',
    email: 'marie.dossou@email.com',
    role: 'Utilisateur',
    roleClass: 'bg-gray-100 text-gray-700',
    createdAt: '08 juin 2024',
    status: 'Inactif',
    statusClass: 'bg-gray-100 text-gray-700'
  },
  {
    id: 5,
    name: 'Yao Gbédji',
    initials: 'YG',
    avatarColor: 'bg-red-700',
    email: 'yao.gbedji@email.com',
    role: 'Utilisateur',
    roleClass: 'bg-gray-100 text-gray-700',
    createdAt: '05 juin 2024',
    status: 'Suspendu',
    statusClass: 'bg-red-100 text-red-700'
  }
])
</script>
