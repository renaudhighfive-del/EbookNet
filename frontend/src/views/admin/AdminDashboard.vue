<template>
  <AdminLayout>
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 text-xl">
            📋
          </div>
          <span class="text-teal-700 text-xs font-semibold flex items-center gap-1">
            <span>↑</span> +12%
          </span>
        </div>
        <div class="text-3xl font-mono font-bold text-navy-900 mb-1">24</div>
        <p class="text-slate-600 text-sm">Demandes en attente</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 text-xl">
            📚
          </div>
          <span class="text-teal-700 text-xs font-semibold flex items-center gap-1">
            <span>↑</span> +5%
          </span>
        </div>
        <div class="text-3xl font-mono font-bold text-navy-900 mb-1">1 248</div>
        <p class="text-slate-600 text-sm">Références publiées</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 text-xl">
            👥
          </div>
          <span class="text-slate-500 text-xs font-semibold">
            Stable
          </span>
        </div>
        <div class="text-3xl font-mono font-bold text-navy-900 mb-1">342</div>
        <p class="text-slate-600 text-sm">Utilisateurs actifs</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 text-xl">
            ⬇️
          </div>
          <span class="text-teal-700 text-xs font-semibold flex items-center gap-1">
            <span>↑</span> +18%
          </span>
        </div>
        <div class="text-3xl font-mono font-bold text-navy-900 mb-1">5 621</div>
        <p class="text-slate-600 text-sm">Téléchargements (30j)</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Requests -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-navy-900">Dernières demandes de dépôt</h3>
          <router-link
            to="/admin/demandes"
            class="text-teal-600 text-sm font-medium hover:underline"
          >
            Voir tout
          </router-link>
        </div>
        <div class="space-y-4">
          <div v-for="request in recentRequests" :key="request.id" class="flex items-center gap-4 p-4 rounded-xl hover:bg-beige transition-colors">
            <div class="w-11 h-11 bg-navy-50 rounded-xl flex items-center justify-center text-navy-800 text-lg">
              📖
            </div>
            <div class="flex-1">
              <p class="font-medium text-navy-900">{{ request.title }}</p>
              <p class="text-sm text-slate-600">Par {{ request.author }} · {{ request.date }}</p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                request.status === 'En attente' ? 'bg-amber-100 text-amber-700' :
                request.status === 'En révision' ? 'bg-blue-100 text-blue-700' :
                'bg-teal-100 text-teal-700'
              ]"
            >
              {{ request.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
        <h3 class="text-lg font-semibold text-navy-900 mb-6">Actions rapides</h3>
        <div class="space-y-3">
          <router-link
            to="/admin/demandes"
            class="flex items-center gap-3 p-4 rounded-xl hover:bg-beige transition-colors group"
          >
            <div class="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
              ✅
            </div>
            <div class="flex-1">
              <p class="font-medium text-navy-900">Réviser les demandes</p>
              <p class="text-xs text-slate-600">5 demandes en attente</p>
            </div>
            <span class="text-slate-400 group-hover:text-teal-700">→</span>
          </router-link>
          <router-link
            to="/admin/utilisateurs"
            class="flex items-center gap-3 p-4 rounded-xl hover:bg-beige transition-colors group"
          >
            <div class="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center">
              +
            </div>
            <div class="flex-1">
              <p class="font-medium text-navy-900">Ajouter un utilisateur</p>
              <p class="text-xs text-slate-600">Créer un nouveau compte</p>
            </div>
            <span class="text-slate-400 group-hover:text-teal-700">→</span>
          </router-link>
          <router-link
            to="/admin/references"
            class="flex items-center gap-3 p-4 rounded-xl hover:bg-beige transition-colors group"
          >
            <div class="w-10 h-10 bg-navy-100 text-navy-700 rounded-xl flex items-center justify-center">
              ➕
            </div>
            <div class="flex-1">
              <p class="font-medium text-navy-900">Ajouter une référence</p>
              <p class="text-xs text-slate-600">Publier directement</p>
            </div>
            <span class="text-slate-400 group-hover:text-teal-700">→</span>
          </router-link>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'

const recentRequests = ref([
  {
    id: 1,
    title: 'Droit constitutionnel béninois',
    author: 'Jean Dossa',
    date: 'Il y a 2h',
    status: 'En attente',
  },
  {
    id: 2,
    title: 'Algorithmique avancée',
    author: 'Aïcha Kpodje',
    date: 'Il y a 4h',
    status: 'En révision',
  },
  {
    id: 3,
    title: 'Santé publique en Afrique',
    author: 'Pierre Yayi',
    date: 'Hier',
    status: 'Validée',
  },
])
</script>
