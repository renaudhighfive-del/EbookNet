<template>
  <RHLayout>
    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div
        class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"
      ></div>
    </div>

    <template v-else>
      <!-- ── Welcome Banner ──────────────────────────────────────────────────── -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[#1B2A4A] font-serif">
          Bonjour, {{ authStore.user?.first_name || 'Utilisateur' }} !
        </h1>
        <p class="text-gray-500 mt-1">Bienvenue dans votre espace personnel</p>
      </div>

      <!-- ── KPI Cards ──────────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total -->
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Utilisateurs inscrits
              </p>
              <p class="text-3xl font-bold font-mono text-[#1B2A4A]">{{ stats.total }}</p>
            </div>
            <div class="w-11 h-11 rounded-xl bg-[#F1F0EC] flex items-center justify-center">
              <Users class="w-5 h-5 text-[#1B2A4A]/50" />
            </div>
          </div>
        </div>
        <!-- Actifs -->
        <div
          class="bg-white rounded-2xl p-5 border-l-4 border-l-[#0D9488] border border-gray-100 shadow-soft"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Comptes actifs
              </p>
              <p class="text-3xl font-bold font-mono text-[#0D9488]">{{ stats.active }}</p>
            </div>
            <div class="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
              <CircleCheck class="w-5 h-5 text-[#0D9488]" />
            </div>
          </div>
        </div>
        <!-- Inactifs -->
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Comptes inactifs
              </p>
              <p class="text-3xl font-bold font-mono text-gray-500">{{ stats.inactive }}</p>
            </div>
            <div class="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">
              <CircleMinus class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        <!-- Suspendus -->
        <div
          class="bg-white rounded-2xl p-5 border-l-4 border-l-red-500 border border-gray-100 shadow-soft"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Comptes suspendus
              </p>
              <p class="text-3xl font-bold font-mono text-red-600">{{ stats.suspended }}</p>
            </div>
            <div class="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <Ban class="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Contenu principal ──────────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Graphique + tableau -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Graphique répartition -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
            <h3 class="text-sm font-semibold text-[#1B2A4A] mb-5">Répartition des comptes</h3>
            <div class="h-48 flex items-center justify-center">
              <Doughnut :data="chartData" :options="chartOptions" />
            </div>
          </div>

          <!-- Derniers comptes créés -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h3 class="text-sm font-semibold text-[#1B2A4A]">Derniers comptes créés</h3>
              <router-link
                to="/rh/users"
                class="text-xs font-medium text-[#0D9488] hover:underline flex items-center gap-1"
              >
                Voir tous <ArrowRight class="w-3.5 h-3.5" />
              </router-link>
            </div>

            <div v-if="recentUsers.length === 0" class="py-10 text-center text-sm text-gray-400">
              Aucun utilisateur trouvé.
            </div>

            <table v-else class="w-full text-sm">
              <thead>
                <tr class="bg-[#F8F7F4]">
                  <th
                    class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Utilisateur
                  </th>
                  <th
                    class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Rôle
                  </th>
                  <th
                    class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Inscrit le
                  </th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="user in recentUsers"
                  :key="user.id"
                  class="hover:bg-[#F8F7F4] transition-colors"
                >
                  <td class="px-6 py-3.5">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                        :class="getAvatarColor(user.id)"
                      >
                        {{ getUserInitials(user) }}
                      </div>
                      <div>
                        <p class="font-medium text-[#1B2A4A] text-sm leading-tight">
                          {{ user.first_name }} {{ user.last_name }}
                        </p>
                        <p class="text-gray-400 text-xs">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3.5">
                    <span
                      :class="getRoleClass(user.role)"
                      class="px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span
                      :class="getStatusClass(user.status)"
                      class="px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ getStatusLabel(user.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5 text-gray-400 text-xs font-mono">
                    {{ formatDate(user.created_at) }}
                  </td>
                  <td class="px-4 py-3.5">
                    <router-link
                      :to="`/rh/users/${user.id}/edit`"
                      class="text-gray-400 hover:text-[#1B2A4A] transition-colors"
                      title="Modifier"
                    >
                      <Pencil class="w-4 h-4" />
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-soft flex flex-col">
          <div class="px-6 py-4 border-b border-gray-50">
            <h3 class="text-sm font-semibold text-[#1B2A4A]">Actions rapides</h3>
          </div>
          <div class="p-5 space-y-3 flex-1">
            <div class="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4]">
              <div class="flex items-center gap-2.5 text-sm text-gray-700">
                <Users class="w-4 h-4 text-gray-400" />
                <span>Total</span>
              </div>
              <span class="font-bold font-mono text-[#1B2A4A]">{{ stats.total }}</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-xl bg-teal-50">
              <div class="flex items-center gap-2.5 text-sm text-teal-700">
                <CircleCheck class="w-4 h-4" />
                <span>Actifs</span>
              </div>
              <span class="font-bold font-mono text-[#0D9488]">{{ stats.active }}</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div class="flex items-center gap-2.5 text-sm text-gray-600">
                <CircleMinus class="w-4 h-4 text-gray-400" />
                <span>Inactifs</span>
              </div>
              <span class="font-bold font-mono text-gray-600">{{ stats.inactive }}</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-xl bg-red-50">
              <div class="flex items-center gap-2.5 text-sm text-red-600">
                <Ban class="w-4 h-4" />
                <span>Suspendus</span>
              </div>
              <span class="font-bold font-mono text-red-600">{{ stats.suspended }}</span>
            </div>
          </div>

          <div class="p-5 border-t border-gray-50">
            <router-link
              to="/rh/users/new"
              class="w-full flex items-center justify-center gap-2 bg-[#0D9488] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a7a6f] transition-colors"
            >
              <UserPlus class="w-4 h-4" />
              Créer un compte
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </RHLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Users, CircleCheck, CircleMinus, Ban, UserPlus, Pencil, ArrowRight } from '@lucide/vue'
import RHLayout from '@/layouts/RHLayout.vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

ChartJS.register(ArcElement, Tooltip, Legend)

const userStore = useUserStore()
const authStore = useAuthStore()

// Accès direct au store — pas de destructuration des computed/ref
// pour préserver la réactivité
const isLoading    = computed(() => userStore.isLoading)
const stats        = computed(() => userStore.stats)
const recentUsers  = computed(() => userStore.recentUsers)

const { getRoleLabel, getRoleClass, getStatusLabel, getStatusClass,
        getAvatarColor, getUserInitials, formatDate } = userStore

const chartData = computed(() => ({
  labels: ['Actifs', 'Inactifs', 'Suspendus'],
  datasets: [{
    data: [stats.value.active, stats.value.inactive, stats.value.suspended],
    backgroundColor: ['#0D9488', '#D1D5DB', '#EF4444'],
    borderColor:     ['#0a7a6f', '#9CA3AF', '#DC2626'],
    borderWidth: 2,
    hoverOffset: 6,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: 'Inter', size: 12 }, padding: 16, boxWidth: 12, color: '#6B7280' },
    },
    tooltip: {
      callbacks: { label: (ctx) => ` ${ctx.label} : ${ctx.parsed}` },
    },
  },
  cutout: '68%',
}

onMounted(() => userStore.fetchUsers({ per_page: 100 }))
</script>
