<template>
  <div class="min-h-screen bg-beige">
    <!-- Sidebar -->
    <div class="fixed left-0 top-0 h-screen w-72 bg-navy-800 text-white border-r border-navy-700 z-40">
      <div class="p-6 border-b border-navy-700">
        <router-link to="/admin/dashboard" class="flex items-center gap-3">
          <div class="w-11 h-11 bg-teal-600 rounded-xl flex items-center justify-center">
            <span class="text-xl">📖</span>
          </div>
          <span class="text-xl font-serif font-bold">BibliNum</span>
        </router-link>
      </div>

      <!-- User profile -->
      <div class="p-6 border-b border-navy-700">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
            MA
          </div>
          <div class="flex-1">
            <p class="font-semibold">Marie Afouda</p>
            <p class="text-xs text-slate-400 uppercase tracking-wider">Administrateur</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1">
        <router-link
          to="/admin/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/admin/dashboard' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-navy-700 hover:text-white'"
        >
          <span class="text-lg">📊</span>
          <span>Tableau de bord</span>
        </router-link>
        <router-link
          to="/admin/demandes"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/admin/demandes' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-navy-700 hover:text-white'"
        >
          <span class="text-lg">📋</span>
          <span>Demandes de dépôt</span>
          <span class="ml-auto bg-amber-500 text-navy-900 text-xs font-bold px-2 py-0.5 rounded-full">5</span>
        </router-link>
        <router-link
          to="/admin/references"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/admin/references' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-navy-700 hover:text-white'"
        >
          <span class="text-lg">📚</span>
          <span>Références</span>
        </router-link>
        <router-link
          to="/admin/utilisateurs"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/admin/utilisateurs' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-navy-700 hover:text-white'"
        >
          <span class="text-lg">👥</span>
          <span>Utilisateurs</span>
        </router-link>
        <router-link
          to="/admin/parametres"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/admin/parametres' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-navy-700 hover:text-white'"
        >
          <span class="text-lg">⚙️</span>
          <span>Paramètres</span>
        </router-link>
      </nav>

      <!-- Logout button -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-700">
        <router-link
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-navy-700 hover:text-white transition-all"
        >
          <span class="text-lg">↩️</span>
          <span>Retour au site</span>
        </router-link>
        <button class="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-navy-700 hover:text-white transition-all">
          <span class="text-lg">🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>

    <!-- Main content wrapper -->
    <div class="ml-72">
      <!-- Top bar -->
      <header class="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 z-30 px-8 py-4 flex items-center justify-between">
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Administration</p>
          <h1 class="text-2xl font-serif font-bold text-navy-900">{{ pageTitle }}</h1>
        </div>
        <div class="flex items-center gap-4">
          <button class="relative w-10 h-10 rounded-xl bg-beige flex items-center justify-center hover:bg-slate-200 transition-colors">
            <span>🔔</span>
            <span class="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-navy-900 text-xs font-bold rounded-full flex items-center justify-center">3</span>
          </button>
        </div>
      </header>

      <!-- Main content -->
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('dashboard')) return 'Tableau de bord'
  if (path.includes('demandes')) return 'Demandes de dépôt'
  if (path.includes('references')) return 'Références'
  if (path.includes('utilisateurs')) return 'Utilisateurs'
  if (path.includes('parametres')) return 'Paramètres'
  return ''
})
</script>
