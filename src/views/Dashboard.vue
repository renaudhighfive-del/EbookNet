<template>
  <AuthenticatedLayout>
    <div>
      <!-- State Loading -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
      
      <!-- State Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <p class="text-red-700">{{ error }}</p>
        <button 
          @click="fetchDashboardData"
          class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
      
      <!-- Dashboard Content -->
      <div v-else>
        <!-- Welcome -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[#1B2A4A] font-serif">
            Bonjour, {{ authStore.user?.first_name }} !
          </h1>
          <p class="text-gray-500 mt-1">Bienvenue dans votre espace personnel</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#0D9488]">
                <BookOpen class="w-5 h-5" />
              </div>
              <div>
                <div class="text-2xl font-bold text-[#1B2A4A] font-mono">{{ stats.totalDocuments || 0 }}</div>
                <div class="text-gray-500 text-sm">Documents consultés</div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-[#F2F4F9] rounded-xl flex items-center justify-center text-[#1B2A4A]">
                <Download class="w-5 h-5" />
              </div>
              <div>
                <div class="text-2xl font-bold text-[#1B2A4A] font-mono">{{ stats.totalDownloads || 0 }}</div>
                <div class="text-gray-500 text-sm">Documents téléchargés</div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <FileUp class="w-5 h-5" />
              </div>
              <div>
                <div class="text-2xl font-bold text-[#1B2A4A] font-mono">{{ stats.pendingDeposits || 0 }}</div>
                <div class="text-gray-500 text-sm">Demandes de dépôt</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity & Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Activity -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
            <h2 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-5">Activité récente</h2>
            <div class="space-y-4">
              <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
                Aucune activité récente
              </div>
              <div v-else class="space-y-4">
                <div class="flex items-center gap-3" v-for="activity in recentActivity.slice(0, 5)" :key="activity.id">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" 
                       :class="getActivityIconClass(activity.type)"
                       :style="getActivityIconStyle(activity.type)">
                    <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-[#1B2A4A] truncate">{{ activity.description }}</p>
                    <p class="text-xs text-gray-400">{{ formatRelativeTime(activity.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
            <h2 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-5">Actions rapides</h2>
            <div class="space-y-2.5">
              <router-link to="/catalogue"
                class="flex items-center justify-between p-3.5 bg-[#F8F7F4] rounded-xl hover:bg-teal-50 hover:text-[#0D9488] transition-colors group"
              >
                <div class="flex items-center gap-3 text-sm text-[#1B2A4A] group-hover:text-[#0D9488]">
                  <Search class="w-4 h-4" />
                  Explorer le catalogue
                </div>
                <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-[#0D9488]" />
              </router-link>
              <router-link to="/deposit-request"
                class="flex items-center justify-between p-3.5 bg-[#F8F7F4] rounded-xl hover:bg-teal-50 hover:text-[#0D9488] transition-colors group"
              >
                <div class="flex items-center gap-3 text-sm text-[#1B2A4A] group-hover:text-[#0D9488]">
                  <Upload class="w-4 h-4" />
                  Déposer un document
                </div>
                <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-[#0D9488]" />
              </router-link>
              <router-link to="/profile"
                class="flex items-center justify-between p-3.5 bg-[#F8F7F4] rounded-xl hover:bg-teal-50 hover:text-[#0D9488] transition-colors group"
              >
                <div class="flex items-center gap-3 text-sm text-[#1B2A4A] group-hover:text-[#0D9488]">
                  <UserCircle class="w-4 h-4" />
                  Modifier mon profil
                </div>
                <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-[#0D9488]" />
              </router-link>
              <router-link to="/planning-calendrier"
                class="flex items-center justify-between p-3.5 bg-[#F8F7F4] rounded-xl hover:bg-teal-50 hover:text-[#0D9488] transition-colors group"
              >
                <div class="flex items-center gap-3 text-sm text-[#1B2A4A] group-hover:text-[#0D9488]">
                  <Calendar class="w-4 h-4" />
                  Prendre un rendez-vous
                </div>
                <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-[#0D9488]" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { BookOpen, Download, FileUp, Search, Upload, UserCircle, ArrowRight, Calendar } from '@lucide/vue'

const authStore = useAuthStore()
const dashboardData = ref(null)
const isLoading = ref(true)
const error = ref(null)

const stats = computed(() => dashboardData.value?.stats || {})
const recentActivity = computed(() => dashboardData.value?.recentActivity || [])

onMounted(async () => {
  await fetchDashboardData()
})

async function fetchDashboardData() {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await api.get('/user/dashboard')
    dashboardData.value = response.data
  } catch (err) {
    error.value = 'Impossible de charger les données du tableau de bord.'
    console.error('Failed to fetch dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

// Formater le temps relatif
function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'À l\'instant'
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Il y a ${diffInHours} h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
}

// Helper functions for activity items
function getActivityIcon(type) {
  switch(type) {
    case 'view': return BookOpen
    case 'download': return Download
    case 'deposit_accepted': case 'deposit_submitted': return FileUp
    default: return FileUp
  }
}

function getActivityIconClass(type) {
  switch(type) {
    case 'view': return 'bg-teal-50 text-[#0D9488]'
    case 'download': return 'bg-[#F2F4F9] text-[#1B2A4A]'
    case 'deposit_accepted': case 'deposit_submitted': return 'bg-amber-50 text-amber-600'
    default: return 'bg-teal-50 text-[#0D9488]'
  }
}

function getActivityIconStyle(type) {
  switch(type) {
    case 'view': return { backgroundColor: '#EEFCF8', color: '#0D9488' }
    case 'download': return { backgroundColor: '#F2F4F9', color: '#1B2A4A' }
    case 'deposit_accepted': case 'deposit_submitted': return { backgroundColor: '#FEF3C7', color: '#D97706' }
    default: return { backgroundColor: '#EEFCF8', color: '#0D9488' }
  }
}
</script>
