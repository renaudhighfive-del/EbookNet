<template>
  <AdminLayout>
    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
    </div>

    <template v-else>
      <!-- Alert Banner -->
      <div v-if="stats.pending_deposits > 0" class="bg-[#FFF9E6] border border-[#FCD34D] rounded-2xl p-5 mb-8 flex items-center gap-4">
        <AlertTriangle class="w-7 h-7 text-[#D97706]" />
        <span class="text-[#92400E] text-sm"
          >{{ stats.pending_deposits }} demandes de dépôt sont en attente d'affectation.
          <router-link to="/admin/demandes" class="font-semibold underline">Affecter maintenant →</router-link></span
        >
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 mx-auto bg-[#F2F4F9] rounded-xl flex items-center justify-center mb-3"
          >
            <Book class="w-6 h-6 text-[#1B2A4A]" />
          </div>
          <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-1">{{ stats.total_references }}</div>
          <p class="text-[#64748B] text-xs">Références</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#FCD34D] text-center hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 mx-auto bg-[#FFF9E6] rounded-xl flex items-center justify-center mb-3"
          >
            <FileClock class="w-6 h-6 text-[#D97706]" />
          </div>
          <div class="text-2xl font-mono font-bold text-[#D97706] mb-1">{{ stats.pending_deposits }}</div>
          <p class="text-[#64748B] text-xs">Dépôts en attente</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 mx-auto bg-[#ECFFFD] rounded-xl flex items-center justify-center mb-3"
          >
            <Users class="w-6 h-6 text-[#0D9488]" />
          </div>
          <div class="text-2xl font-mono font-bold text-[#0D9488] mb-1">{{ stats.active_users }}</div>
          <p class="text-[#64748B] text-xs">Utilisateurs actifs</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 mx-auto bg-[#F2F4F9] rounded-xl flex items-center justify-center mb-3"
          >
            <FileDown class="w-6 h-6 text-[#0D9488]" />
          </div>
          <div class="text-2xl font-mono font-bold text-[#0D9488] mb-1">{{ stats.total_downloads }}</div>
          <p class="text-[#64748B] text-xs">Téléchargements</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 mx-auto bg-[#F2F4F9] rounded-xl flex items-center justify-center mb-3"
          >
            <Eye class="w-6 h-6 text-[#0284C7]" />
          </div>
          <div class="text-2xl font-mono font-bold text-[#0284C7] mb-1">{{ stats.total_views }}</div>
          <p class="text-[#64748B] text-xs">Consultations</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-[#DC2626] text-center hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 mx-auto bg-[#FEE2E2] rounded-xl flex items-center justify-center mb-3"
          >
            <Bell class="w-6 h-6 text-[#DC2626]" />
          </div>
          <div class="text-2xl font-mono font-bold text-[#DC2626] mb-1">{{ stats.unread_notifications }}</div>
          <p class="text-[#64748B] text-xs">Notifications</p>
        </div>
      </div>
    </template>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Monthly Deposits Bar Chart -->
      <div class="bg-white rounded-2xl p-7 shadow-sm border border-[#E5E7EB]">
        <h3 class="text-xl font-serif font-semibold text-[#1B2A4A] mb-6">
          Demandes de dépôt par mois
        </h3>
        <div v-if="depositsByMonth.length > 0" class="h-52 flex items-end justify-around gap-3 px-2">
          <div v-for="(deposit, index) in depositsByMonth" :key="deposit.month" class="flex flex-col items-center gap-2">
            <div class="w-12 bg-[#0D9488] rounded-t-md" :style="{ height: getBarHeight(deposit.approved) + '%' }"></div>
            <div class="w-12 bg-[#DC2626] rounded-t-md" :style="{ height: getBarHeight(deposit.rejected) + '%' }"></div>
            <span class="text-xs text-[#64748B]">{{ getMonthLabel(deposit.month) }}</span>
          </div>
        </div>
        <div v-else class="h-52 flex items-center justify-center text-gray-400 text-sm">
          Aucune donnée disponible
        </div>
      </div>

      <!-- References by Category Donut Chart -->
      <div class="bg-white rounded-2xl p-7 shadow-sm border border-[#E5E7EB]">
        <h3 class="text-xl font-serif font-semibold text-[#1B2A4A] mb-6">
          Références par catégorie
        </h3>
        <div v-if="referencesByCategory.length > 0" class="flex items-center justify-center gap-10">
          <!-- Donut Chart -->
          <div class="relative w-52 h-52">
            <div
              class="absolute inset-0 rounded-full"
              :style="{
                background: `conic-gradient(
                  ${referencesByCategory.map((cat, i) => {
                    const start = referencesByCategory.slice(0, i).reduce((sum, c) => sum + getCategoryPercentage(c.references_count), 0)
                    const end = start + getCategoryPercentage(cat.references_count)
                    return `${getCategoryColor(i)} ${start}% ${end}%`
                  }).join(', ')}
                )`
              }"
            ></div>
            <div class="absolute inset-7 bg-white rounded-full"></div>
          </div>

          <!-- Legend -->
          <div class="space-y-3">
            <div v-for="(category, index) in referencesByCategory" :key="category.id" class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: getCategoryColor(index) }"></div>
              <span class="text-sm" :style="{ color: getCategoryColor(index) }">{{ category.references_count }}</span>
              <span class="text-sm text-gray-600">{{ category.name }}</span>
            </div>
          </div>
        </div>
        <div v-else class="h-52 flex items-center justify-center text-gray-400 text-sm">
          Aucune donnée disponible
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { AlertTriangle, Book, FileClock, Users, FileDown, Eye, Bell } from '@lucide/vue'
import api from '@/services/api'

const stats = ref({
  total_references: 0,
  pending_deposits: 0,
  active_users: 0,
  total_downloads: 0,
  total_views: 0,
  unread_notifications: 0,
})

const isLoading = ref(true)
const depositsByMonth = ref([])
const referencesByCategory = ref([])

const fetchStats = async () => {
  try {
    const response = await api.get('/admin/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

const fetchDepositsByMonth = async () => {
  try {
    const response = await api.get('/admin/stats/deposits-by-month')
    depositsByMonth.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des dépôts par mois:', error)
  }
}

const fetchReferencesByCategory = async () => {
  try {
    const response = await api.get('/admin/stats/references-by-category')
    referencesByCategory.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des références par catégorie:', error)
  }
}

const monthLabels = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Juin',
  '07': 'Juil', '08': 'Août', '09': 'Sept', '10': 'Oct', '11': 'Nov', '12': 'Déc'
}

const getMonthLabel = (monthStr) => {
  const month = monthStr.split('-')[1]
  return monthLabels[month] || monthStr
}

const maxDeposits = computed(() => {
  if (depositsByMonth.value.length === 0) return 1
  return Math.max(...depositsByMonth.value.map(d => d.total))
})

const getBarHeight = (value) => {
  return maxDeposits.value > 0 ? (value / maxDeposits.value) * 100 : 0
}

const totalReferences = computed(() => {
  return referencesByCategory.value.reduce((sum, cat) => sum + cat.references_count, 0)
})

const getCategoryPercentage = (count) => {
  return totalReferences.value > 0 ? (count / totalReferences.value) * 100 : 0
}

const categoryColors = [
  '#1B2A4A', '#6B7280', '#DC2626', '#0D9488', '#E79F1F', '#0891B2'
]

const getCategoryColor = (index) => {
  return categoryColors[index % categoryColors.length]
}

onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchDepositsByMonth(),
    fetchReferencesByCategory()
  ])
  isLoading.value = false
})
</script>
