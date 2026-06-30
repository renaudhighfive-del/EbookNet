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
      <div class="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p class="text-sm text-gray-500 mb-2">Tableau de bord RH</p>
          <h1 class="text-3xl lg:text-4xl font-bold text-[#1B2A4A] font-serif">
            Bonjour {{ authStore.user?.first_name || 'Utilisateur' }}
          </h1>
          <p class="text-sm text-gray-500 mt-2">
            Aperçu des comptes utilisateurs de la plateforme.
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0a7a6f] text-white px-5 py-3 rounded-full text-sm font-semibold shadow-sm transition-colors"
        >
          <UserPlus class="w-4 h-4" />
          Créer un compte utilisateur
        </button>
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
              <div>
                <h3 class="text-sm font-semibold text-[#1B2A4A]">Derniers comptes créés</h3>
                <p class="text-xs text-gray-500">Liste des cinq derniers comptes enregistrés</p>
              </div>
              <router-link
                to="/rh/users"
                class="text-xs font-medium text-[#0D9488] hover:underline flex items-center gap-1"
              >
                Voir tous les utilisateurs <ArrowRight class="w-3.5 h-3.5" />
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
                    <button
                      @click="openEditModal(user)"
                      class="text-gray-400 hover:text-[#1B2A4A] transition-colors"
                      title="Modifier"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Panneau actions récentes -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-semibold text-[#1B2A4A]">Mes actions récentes</h3>
                <p class="text-xs text-gray-500">Résumé des dernières activités RH</p>
              </div>
              <RouterLink to="/rh/activity-logs" class="flex items-center gap-1 hover:underline">
                <ArrowRight class="w-3.5 h-3.5 text-[#0D9488]" />
                <span class="text-xs text-[#0D9488] font-semibold">Voir tout</span>
              </RouterLink>
            </div>
            <div class="space-y-4">
              <template v-if="recentActions.length > 0">
                <div
                  v-for="action in recentActions"
                  :key="action.id"
                  class="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div class="w-11 h-11 rounded-2xl bg-[#F1F5F9] flex items-center justify-center text-[#0D9488]">
                    <Clock class="w-5 h-5" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-[#1B2A4A] truncate">{{ formatActionLabel(action.action) }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDateTime(action.created_at) }}</p>
                  </div>
                </div>
              </template>
              <div v-else class="text-sm text-gray-500">Aucune action récente.</div>
            </div>
          </div>

          <div class="bg-[#F5F5EB] rounded-3xl p-6 border border-[#E8E6D3] text-sm text-gray-700">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-2xl bg-[#EEF4F0] flex items-center justify-center text-[#0D9488]">
                <FileText class="w-4 h-4" />
              </div>
              <p class="font-semibold text-[#1B2A4A]">Rappel</p>
            </div>
            <p>
              En tant que Responsable RH, vous pouvez créer des comptes Utilisateur, Responsable RH et Responsable Demandes.
              Le rôle Administrateur ne peut être attribué que par un administrateur.
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal modification utilisateur -->
    <Teleport to="body">
      <div
        v-if="userModal.visible"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-[#1B2A4A]">
              {{ userModal.isEdit ? 'Modifier le compte utilisateur' : 'Créer un compte utilisateur' }}
            </h3>
            <button
              @click="closeUserModal"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XCircle class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleUserSubmit" class="space-y-4">
            <!-- Nom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                v-model="userModal.form.last_name"
                type="text"
                required
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                :class="{ 'border-red-500': userModal.serverErrors.last_name }"
              />
              <p v-if="userModal.serverErrors.last_name" class="text-xs text-red-500 mt-1">
                {{ userModal.serverErrors.last_name[0] }}
              </p>
            </div>

            <!-- Prénom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                v-model="userModal.form.first_name"
                type="text"
                required
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                :class="{ 'border-red-500': userModal.serverErrors.first_name }"
              />
              <p v-if="userModal.serverErrors.first_name" class="text-xs text-red-500 mt-1">
                {{ userModal.serverErrors.first_name[0] }}
              </p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="userModal.form.email"
                type="email"
                required
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                :class="{ 'border-red-500': userModal.serverErrors.email }"
              />
              <p v-if="userModal.serverErrors.email" class="text-xs text-red-500 mt-1">
                {{ userModal.serverErrors.email[0] }}
              </p>
            </div>

            <!-- Téléphone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
              <input
                v-model="userModal.form.phone"
                type="tel"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                :class="{ 'border-red-500': userModal.serverErrors.phone }"
              />
              <p v-if="userModal.serverErrors.phone" class="text-xs text-red-500 mt-1">
                {{ userModal.serverErrors.phone[0] }}
              </p>
            </div>

            <!-- Mot de passe -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe (laisser vide pour ne pas changer)</label>
              <input
                v-model="userModal.form.password"
                type="password"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                :class="{ 'border-red-500': userModal.serverErrors.password }"
              />
              <p v-if="userModal.serverErrors.password" class="text-xs text-red-500 mt-1">
                {{ userModal.serverErrors.password[0] }}
              </p>
            </div>

            <!-- Rôle -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                v-model="userModal.form.role"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D9488]"
                :class="{ 'border-red-500': userModal.serverErrors.role }"
              >
                <option value="user">Utilisateur</option>
                <option value="responsable_rh">Responsable RH</option>
                <option value="responsable_demande">Resp. Demandes</option>
              </select>
              <p v-if="userModal.serverErrors.role" class="text-xs text-red-500 mt-1">
                {{ userModal.serverErrors.role[0] }}
              </p>
            </div>

            <!-- Statut -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                v-model="userModal.form.status"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D9488]"
                :class="{ 'border-red-500': userModal.serverErrors.status }"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif (en attente)</option>
                <option value="suspended">Suspendu</option>
                <option value="archived">Archivé</option>
              </select>
              <p v-if="userModal.serverErrors.status" class="text-xs text-red-500 mt-1">
                {{ userModal.serverErrors.status[0] }}
              </p>
            </div>

            <div class="flex gap-3 justify-end pt-4">
              <button
                type="button"
                @click="closeUserModal"
                class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isActionLoading"
                class="px-4 py-2 rounded-xl bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0a7a6f] disabled:opacity-50"
              >
                {{ isActionLoading ? 'Modification...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </RHLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Users, CircleCheck, CircleMinus, Ban, UserPlus, Pencil, ArrowRight, XCircle, Clock, FileText } from '@lucide/vue'
import RHLayout from '@/layouts/RHLayout.vue'
import api from '@/services/api'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

ChartJS.register(ArcElement, Tooltip, Legend)

const userStore = useUserStore()
const authStore = useAuthStore()

const activityLogs = ref([])
const isActivityLoading = ref(false)

// Modal de création / modification d'utilisateur
const userModal = ref({
  visible: false,
  isEdit: false,
  userId: null,
  form: {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
  },
  serverErrors: {},
})

const openCreateModal = () => {
  userModal.value.visible = true
  userModal.value.isEdit = false
  userModal.value.userId = null
  userModal.value.form = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
  }
  userModal.value.serverErrors = {}
}

const openEditModal = async (user) => {
  try {
    const userData = await userStore.fetchUser(user.id)
    userModal.value.visible = true
    userModal.value.isEdit = true
    userModal.value.userId = user.id
    userModal.value.form = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone || '',
      password: '',
      role: userData.role,
      status: userData.status,
    }
    userModal.value.serverErrors = {}
  } catch {
    console.error("Impossible de charger les informations de l'utilisateur.")
  }
}

const closeUserModal = () => {
  userModal.value.visible = false
}

const handleUserSubmit = async () => {
  userModal.value.serverErrors = {}
  const payload = { ...userModal.value.form }
  if (!payload.password) delete payload.password

  try {
    if (userModal.value.isEdit) {
      await userStore.updateUser(userModal.value.userId, payload)
    } else {
      await userStore.createUser(payload)
    }
    closeUserModal()
    await userStore.fetchUsers({ per_page: 100 })
  } catch (err) {
    if (err.response?.status === 422) {
      userModal.value.serverErrors = err.response.data.errors ?? {}
    }
  }
}

// Accès direct au store — pas de destructuration des computed/ref
// pour préserver la réactivité
const isLoading    = computed(() => userStore.isLoading)
const isActionLoading = computed(() => userStore.isActionLoading)
const stats        = computed(() => userStore.stats)
const recentUsers  = computed(() => userStore.recentUsers)
const recentActions = computed(() => activityLogs.value.slice(0, 5))

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

const fetchActivityLogs = async () => {
  isActivityLoading.value = true
  try {
    const res = await api.get('/hr/activity-logs', { params: { per_page: 5 } })
    activityLogs.value = res.data.data ?? []
  } catch (err) {
    console.error('Impossible de charger les actions récentes.', err)
  } finally {
    isActivityLoading.value = false
  }
}

const getActionClass = (action) => {
  if (action.includes('Création')) return 'bg-green-50 text-green-700 border-green-200'
  if (action.includes('Modification')) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (action.includes('Suspension')) return 'bg-orange-50 text-orange-700 border-orange-200'
  if (action.includes('Approbation') || action.includes('Restauration')) return 'bg-teal-50 text-teal-700 border-teal-200'
  return 'bg-gray-50 text-gray-700 border-gray-200'
}

const formatActionLabel = (action) => action.replace(/_/g, ' ')

const formatDateTime = (datetime) => {
  const date = new Date(datetime)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  await userStore.fetchUsers({ per_page: 100 })
  await fetchActivityLogs()
})
</script>
