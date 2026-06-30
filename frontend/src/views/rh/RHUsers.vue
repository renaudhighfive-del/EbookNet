<script setup>
import { ref, computed, onMounted } from 'vue'
import RHLayout from '@/layouts/RHLayout.vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Ban,
  Archive,
  Users,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from '@lucide/vue'

const userStore = useUserStore()
const authStore = useAuthStore()

const currentUserId = computed(() => authStore.user?.id)

const isCurrentUser = (userId) => currentUserId.value === userId

const searchQuery = ref('')
const searchTimeout = ref(null)
const filters = ref({ role: '', status: '' })
const toast = ref({ message: '', type: 'success' })
const perPage = ref(10)

const modal = ref({
  visible: false,
  title: '',
  message: '',
  confirmLabel: '',
  danger: false,
  action: null,
})

// Modal de création/modification d'utilisateur
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
    showToast("Impossible de charger les informations de l'utilisateur.", 'error')
  }
}

const closeUserModal = () => {
  userModal.value.visible = false
}

const handleUserSubmit = async () => {
  userModal.value.serverErrors = {}
  const payload = { ...userModal.value.form }
  if (userModal.value.isEdit && !payload.password) delete payload.password

  try {
    if (userModal.value.isEdit) {
      await userStore.updateUser(userModal.value.userId, payload)
      showToast('Modifications enregistrées avec succès.', 'success')
    } else {
      await userStore.createUser(payload)
      showToast('Compte créé avec succès.', 'success')
    }
    closeUserModal()
    fetchUsers(1)
  } catch (err) {
    if (err.response?.status === 422) {
      userModal.value.serverErrors = err.response.data.errors ?? {}
      showToast('Veuillez corriger les erreurs dans le formulaire.', 'error')
    } else {
      showToast(err.response?.data?.message ?? 'Une erreur est survenue.', 'error')
    }
  }
}

const perPageOptions = [10, 25, 50, 100]

const visiblePages = computed(() => {
  if (!userStore.pagination.last_page) return []
  const c = userStore.pagination.current_page,
    l = userStore.pagination.last_page
  const pages = []
  
  // Toujours afficher la première page
  if (c > 3) pages.push(1)
  
  // Ellipsis après la première page si nécessaire
  if (c > 4) pages.push('...')
  
  // Pages autour de la page courante
  for (let i = Math.max(2, c - 1); i <= Math.min(l - 1, c + 1); i++) pages.push(i)
  
  // Ellipsis avant la dernière page si nécessaire
  if (c < l - 3) pages.push('...')
  
  // Toujours afficher la dernière page
  if (l > 1 && c < l - 1) pages.push(l)
  
  // Si peu de pages, afficher toutes
  if (l <= 7) {
    pages.length = 0
    for (let i = 1; i <= l; i++) pages.push(i)
  }
  
  return pages
})

const fetchUsers = (page = 1) => {
  const params = { page, per_page: perPage.value }
  if (filters.value.role) params.role = filters.value.role
  if (filters.value.status) params.status = filters.value.status
  if (searchQuery.value) params.search = searchQuery.value
  userStore.fetchUsers(params).catch(() => showToast('Erreur lors du chargement.', 'error'))
}

const onSearchInput = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => fetchUsers(1), 400)
}

/* Actions rapides sans confirmation */
const quickAction = async (type, user) => {
  try {
    if (type === 'activate') {
      await userStore.updateStatus(user.id, 'active')
      showToast('Compte réactivé.', 'success')
    }
  } catch {
    showToast("Erreur lors de l'action.", 'error')
  }
}

/* Ouvrir modal de confirmation */
const confirmAction = ({ type, user }) => {
  const configs = {
    approve: {
      title: 'Approuver le compte',
      message: `Activer le compte de ${user.first_name} ${user.last_name} ? L'utilisateur pourra se connecter.`,
      confirmLabel: 'Approuver',
      danger: false,
      fn: () => userStore.approveUser(user.id),
    },
    deactivate: {
      title: 'Désactiver le compte',
      message: `Désactiver le compte de ${user.first_name} ${user.last_name} ? L'utilisateur ne pourra plus se connecter.`,
      confirmLabel: 'Désactiver',
      danger: true,
      fn: () => userStore.updateStatus(user.id, 'inactive'),
    },
    'request-suspend': {
      title: 'Demande de suspension',
      message: `Proposer la suspension de ${user.first_name} ${user.last_name} ? L'administrateur devra valider cette décision.`,
      confirmLabel: 'Soumettre la demande',
      danger: true,
      fn: () => userStore.requestSuspend(user.id),
    },
    archive: {
      title: 'Archiver le compte',
      message: `Archiver définitivement le compte de ${user.first_name} ${user.last_name} ? Cette action n'est réversible que par l'admin.`,
      confirmLabel: 'Archiver',
      danger: true,
      fn: () => userStore.archiveUser(user.id),
    },
  }
  const cfg = configs[type]
  if (!cfg) return
  modal.value = { visible: true, ...cfg, action: cfg.fn }
}

const executeModal = async () => {
  try {
    await modal.value.action()
    showToast('Action effectuée avec succès.', 'success')
    modal.value.visible = false
  } catch {
    showToast("Erreur lors de l'action.", 'error')
  }
}

const showToast = (message, type = 'success') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = { message: '', type: 'success' }), 3500)
}

onMounted(() => fetchUsers())
</script>


<template>
  <RHLayout>
    <template #title>
      Gestion des utilisateurs
      <span
        v-if="userStore.pagination.total"
        class="ml-2 text-xs font-mono font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"
      >
        {{ userStore.pagination.total }}
      </span>
    </template>

    <!-- Toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="toast.message"
          class="fixed bottom-6 right-6 z-60 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2"
          :class="toast.type === 'success' ? 'bg-[#0D9488]' : 'bg-red-600'"
        >
          <component
            :is="toast.type === 'success' ? CheckCircle : XCircle"
            class="w-4 h-4 shrink-0"
          />
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div class="flex flex-wrap items-center gap-3 flex-1 min-w-0">
        <!-- Recherche -->
        <div class="relative w-full sm:w-72">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            @input="onSearchInput"
            type="text"
            placeholder="Rechercher..."
            class="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
          />
        </div>
        <!-- Filtre rôle -->
        <select
          v-model="filters.role"
          @change="fetchUsers(1)"
          class="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]"
        >
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateur</option>
          <option value="responsable_rh">Responsable RH</option>
          <option value="responsable_demande">Resp. Demandes</option>
        </select>
        <!-- Filtre statut -->
        <select
          v-model="filters.status"
          @change="fetchUsers(1)"
          class="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]"
        >
          <option value="">Tous les statuts</option>
          <option value="inactive">Inactifs (en attente)</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
          <option value="pending_suspension">Suspension en attente</option>
          <option value="archived">Archivés</option>
        </select>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a7a6f] transition-colors shrink-0"
      >
        <UserPlus class="w-4 h-4" />
        Nouveau compte
      </button>
    </div>

    <!-- Loading -->
    <div v-if="userStore.isLoading" class="flex justify-center py-16">
      <div
        class="w-10 h-10 rounded-full border-2 border-t-[#0D9488] border-gray-200 animate-spin"
      ></div>
    </div>

    <!-- Table -->
    <div v-else-if="userStore.users && userStore.users.length > 0" class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-[#F8F7F4] border-b border-gray-100">
            <tr>
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Utilisateur
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Rôle
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell"
              >
                Inscrit le
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell"
              >
                Dernière connexion
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in userStore.users || []" :key="user.id" class="hover:bg-[#F8F7F4] transition-colors">
              <!-- Utilisateur -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    :class="userStore.getAvatarColor(user.id)"
                  >
                    {{ userStore.getUserInitials(user) }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-semibold text-[#1B2A4A] truncate">
                        {{ user.first_name }} {{ user.last_name }}
                      </p>
                      <span
                        v-if="isCurrentUser(user.id)"
                        class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EEF1F7] text-[#1B2A4A] uppercase tracking-wide shrink-0"
                      >vous</span>
                    </div>
                    <p class="text-xs text-gray-400 font-mono truncate">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <!-- Rôle -->
              <td class="px-4 py-3.5">
                <span
                  :class="userStore.getRoleClass(user.role)"
                  class="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                >
                  {{ userStore.getRoleLabel(user.role) }}
                </span>
              </td>
              <!-- Statut -->
              <td class="px-4 py-3.5">
                <span
                  :class="userStore.getStatusClass(user.status)"
                  class="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                >
                  {{ userStore.getStatusLabel(user.status) }}
                </span>
              </td>
              <!-- Date -->
              <td class="px-4 py-3.5 text-xs text-gray-400 font-mono hidden lg:table-cell">
                {{ userStore.formatDate(user.created_at) }}
              </td>
              <!-- Connexion -->
              <td class="px-4 py-3.5 text-xs text-gray-400 font-mono hidden xl:table-cell">
                {{ user.last_login_at ? userStore.formatDate(user.last_login_at) : '—' }}
              </td>
              <!-- Actions -->
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <!-- Voir -->
                  <router-link
                    :to="`/rh/users/${user.id}`"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1B2A4A] transition-colors"
                    title="Voir le profil"
                  >
                    <Eye class="w-4 h-4" />
                  </router-link>
                  <!-- Modifier -->
                  <button
                    @click="openEditModal(user)"
                    :disabled="userStore.isActionLoading"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1B2A4A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Modifier"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>

                  <!-- Approuver inscription inactive (admin uniquement) -->
                  <button
                    v-if="user.status === 'inactive' && ['admin','responsable_rh'].includes(authStore.userRole)"
                    @click="confirmAction({ type: 'approve', user })"
                    :disabled="userStore.isActionLoading"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Approuver le compte"
                  >
                    <CheckCircle class="w-4 h-4" />
                  </button>

                  <!-- Désactiver compte actif -->
                  <button
                    v-if="user.status === 'active' && !isCurrentUser(user.id)"
                    @click="confirmAction({ type: 'deactivate', user })"
                    :disabled="userStore.isActionLoading"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Désactiver"
                  >
                    <UserX class="w-4 h-4" />
                  </button>

                  <!-- Réactiver compte inactif/pending_suspension -->
                  <button
                    v-if="['inactive', 'pending_suspension'].includes(user.status)"
                    @click="quickAction('activate', user)"
                    :disabled="userStore.isActionLoading"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-50 hover:text-[#0D9488] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Réactiver"
                  >
                    <UserCheck class="w-4 h-4" />
                  </button>

                  <!-- Proposer suspension (RH) — si compte actif -->
                  <button
                    v-if="user.status === 'active' && !isCurrentUser(user.id)"
                    @click="confirmAction({ type: 'request-suspend', user })"
                    :disabled="userStore.isActionLoading"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Proposer une suspension"
                  >
                    <Ban class="w-4 h-4" />
                  </button>

                  <!-- Archiver -->
                  <button
                    v-if="!isCurrentUser(user.id)"
                    @click="confirmAction({ type: 'archive', user })"
                    :disabled="user.status === 'archived' || userStore.isActionLoading"
                    :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      user.status === 'archived'
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                    ]"
                    title="Archiver le compte"
                  >
                    <Archive class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else
      class="bg-white rounded-2xl border border-gray-100 py-16 text-center"
    >
      <Users class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="font-medium text-[#1B2A4A]">Aucun utilisateur trouvé</p>
      <p class="text-sm text-gray-400 mt-1">Modifiez vos filtres ou créez un nouveau compte.</p>
    </div>

    <!-- Pagination -->
    <div v-if="userStore.pagination.last_page && userStore.pagination.last_page >= 1" class="flex items-center justify-between mt-5">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">Afficher</span>
        <select
          v-model="perPage"
          @change="fetchUsers(1)"
          class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
        >
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span class="text-sm text-gray-500">par page</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          @click="fetchUsers(userStore.pagination.current_page - 1)"
          :disabled="!userStore.pagination.prev_page_url"
          class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="typeof page === 'number' ? fetchUsers(page) : null"
          class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
          :class="page === userStore.pagination.current_page
            ? 'bg-[#0D9488] text-white border-[#0D9488]'
            : typeof page === 'number'
              ? 'border border-gray-200 text-gray-500 hover:bg-gray-50'
              : 'border-transparent text-gray-400 cursor-default'"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </button>
        <button
          @click="fetchUsers(userStore.pagination.current_page + 1)"
          :disabled="!userStore.pagination.next_page_url"
          class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <Teleport to="body">
      <div
        v-if="modal.visible"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <h3 class="text-base font-bold text-[#1B2A4A] mb-2">{{ modal.title }}</h3>
          <p class="text-sm text-gray-600 mb-6">{{ modal.message }}</p>
          <div class="flex gap-3 justify-end">
            <button
              @click="modal.visible = false"
              class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="executeModal"
              :disabled="userStore.isActionLoading"
              :class="
                modal.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0D9488] hover:bg-[#0a7a6f]'
              "
              class="px-4 py-2 rounded-xl text-sm text-white font-semibold disabled:opacity-50"
            >
              {{ userStore.isActionLoading ? 'En cours...' : modal.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal création/modification utilisateur -->
    <Teleport to="body">
      <div
        v-if="userModal.visible"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-[#1B2A4A]">
              {{ userModal.isEdit ? 'Modifier le compte utilisateur' : 'Nouveau compte utilisateur' }}
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
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {{ userModal.isEdit ? '(laisser vide pour ne pas changer)' : '' }}
              </label>
              <input
                v-model="userModal.form.password"
                type="password"
                :required="!userModal.isEdit"
                :minlength="userModal.isEdit ? undefined : 8"
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
                :disabled="userStore.isActionLoading"
                class="px-4 py-2 rounded-xl bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0a7a6f] disabled:opacity-50"
              >
                {{ userStore.isActionLoading ? (userModal.isEdit ? 'Modification...' : 'Création...') : (userModal.isEdit ? 'Enregistrer' : 'Créer le compte') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </RHLayout>
</template>

