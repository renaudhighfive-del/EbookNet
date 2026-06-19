<template>
  <div class="min-h-screen bg-beige">
    <!-- Top Navbar for authenticated -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left: Logo + toggle mobile menu button -->
          <div class="flex items-center gap-4">
            <router-link to="/dashboard" class="flex items-center gap-2">
              <div class="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
                <span class="text-white text-xl">📚</span>
              </div>
              <span class="text-xl font-bold text-navy-800 font-serif">BibliNum</span>
            </router-link>
          </div>

          <!-- Right: User profile dropdown -->
          <div class="flex items-center gap-4">
            <!-- Notifications -->
            <button class="relative p-2 text-gray-500 hover:text-navy-800 hover:bg-gray-100 rounded-lg">
              <Bell class="w-5 h-5" />
              <span class="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full" />
            </button>
            <!-- User -->
            <button @click="toggleProfileMenu" class="flex items-center gap-2">
              <div class="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center text-white font-semibold">
                {{ initials }}
              </div>
            </button>
            <!-- Logout -->
            <button @click="handleLogout" class="text-gray-500 hover:text-navy-800 hover:bg-gray-100 rounded-lg p-2">
              <LogOut class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Sidebar -->
        <aside class="w-64 shrink-0">
          <div class="bg-white rounded-2xl shadow-soft p-4">
            <nav class="space-y-1">
              <router-link
                to="/dashboard"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-navy-800 hover:bg-beige"
                :class="{ 'bg-teal-50 text-teal-700': $route.path === '/dashboard' }"
              >
                <Home class="w-5 h-5" />
                <span class="font-medium">Tableau de bord</span>
              </router-link>
              <router-link
                to="/catalogue"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-navy-800 hover:bg-beige"
                :class="{ 'bg-teal-50 text-teal-700': $route.path === '/catalogue' }"
              >
                <BookOpen class="w-5 h-5" />
                <span class="font-medium">Catalogue</span>
              </router-link>
              <router-link
                to="/my-documents"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-navy-800 hover:bg-beige"
                :class="{ 'bg-teal-50 text-teal-700': $route.path === '/my-documents' }"
              >
                <BookMarked class="w-5 h-5" />
                <span class="font-medium">Mes documents</span>
              </router-link>
              <router-link
                to="/deposit-request"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-navy-800 hover:bg-beige"
                :class="{ 'bg-teal-50 text-teal-700': $route.path === '/deposit-request' }"
              >
                <FileUp class="w-5 h-5" />
                <span class="font-medium">Déposer un document</span>
              </router-link>
              <router-link
                to="/profile"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-navy-800 hover:bg-beige"
                :class="{ 'bg-teal-50 text-teal-700': $route.path === '/profile' }"
              >
                <User class="w-5 h-5" />
                <span class="font-medium">Mon profil</span>
              </router-link>
            </nav>
          </div>
        </aside>
        <!-- Main Content -->
        <main class="flex-1">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Home, BookOpen, BookMarked, FileUp, User, Bell, LogOut } from '@lucide/vue'

const router = useRouter()

const user = ref({
  first_name: 'Jean',
  last_name: 'Dupont',
  email: 'jean.dupont@example.com',
  role: 'user'
})

const initials = computed(() => {
  return (user.value.first_name[0] + user.value.last_name[0]).toUpperCase()
})

const toggleProfileMenu = () => {
  // Placeholder for future dropdown
}

const handleLogout = () => {
  router.push('/')
}
</script>
