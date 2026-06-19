<template>
  <div class="min-h-screen bg-beige flex">
    <!-- Left Sidebar -->
    <aside class="w-72 bg-navy-800 text-white shrink-0 flex flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-navy-700">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-navy-800 text-2xl">📚</div>
          <span class="text-xl font-bold font-serif">BibliNum</span>
        </div>
      </div>

      <!-- User Info -->
      <div class="p-6 border-b border-navy-700">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center font-bold text-lg">LH</div>
          <div>
            <p class="font-medium">Dr. Léon Houessou</p>
            <span class="inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded-full mt-1">
              <span>Responsable — Demandes</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-4 space-y-1">
        <router-link
          to="/manager/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-navy-700/50 transition-colors"
          :class="{ 'bg-teal-600 text-white': $route.path === '/manager/dashboard' }"
        >
          <span>🏠</span>
          <span class="font-medium">Tableau de bord</span>
        </router-link>
        <router-link
          to="/manager/deposits"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-navy-700/50 transition-colors"
          :class="{ 'bg-teal-600 text-white': $route.path === '/manager/deposits' }"
        >
          <span>📋</span>
          <span class="font-medium">Mes demandes assignées</span>
        </router-link>
        <router-link
          to="/manager/profile"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-navy-700/50 transition-colors"
          :class="{ 'bg-teal-600 text-white': $route.path === '/manager/profile' }"
        >
          <span>👤</span>
          <span class="font-medium">Mon profil</span>
        </router-link>
      </nav>

      <!-- Bottom Logout -->
      <div class="p-4 border-t border-navy-700">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-700/50 transition-colors"
        >
          <span>🚪</span>
          <span class="font-medium">Se déconnecter</span>
        </button>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 class="text-xl font-semibold text-navy-800 font-serif">
            <slot name="title">Tableau de bord</slot>
          </h1>
          <div class="flex items-center gap-4">
            <button class="relative text-gray-600 hover:text-navy-800">
              <span class="text-2xl">🔔</span>
              <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
            </button>
            <div class="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
              LH
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const handleLogout = () => {
  router.push('/')
}
</script>
