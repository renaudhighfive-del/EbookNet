<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import {
  Search,
  UserPlus,
  Pencil,
  UserX,
  UserCheck,
  Ban,
  Archive,
  Users,
  CheckCircle,
  XCircle,
  Shield,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Link,
} from '@lucide/vue'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

const currentUserId = computed(() => authStore.user?.id)
const isCurrentUser = (userId) => currentUserId.value === userId

// ── State ──────────────────────────────────────────────────────────────────

const searchQuery   = ref('')
const searchTimeout = ref(null)
const filterRole    = ref('')
const filterStatus  = ref('')
const activeTab     = ref('') // '' = Tous
const perPage       = ref(10)

const toast     = ref({ message: '', type: 'success' })
const roleModal = ref({ user: null, newRole: '' })
const modal     = ref({
  visible: false, title: '', message: '',
  confirmLabel: '', danger: false, action: null,
})
const userModal = ref({
  visible: false, isEdit: false, userId: null,
  form: { first_name: '', last_name: '', email: '', phone: '', password: '', role: 'user', status: 'active' },
  serverErrors: {},
})

// ── Tabs ───────────────────────────────────────────────────────────────────

const tabs = computed(() => [
  { key: '',                    label: 'Tous',           count: userStore.pagination.value?.total ?? 0 },
  { key: 'admin',               label: 'Admins',         count: userStore.pagination.value?.counts?.admin ?? 0 },
  { key: 'responsable_rh',      label: 'Resp. RH',       count: userStore.pagination.value?.counts?.responsable_rh ?? 0 },
  { key: 'responsable_demande', label: 'Resp. Demandes', count: userStore.pagination.value?.counts?.responsable_demande ?? 0 },
  { key: 'user',                label: 'Utilisateurs',   count: userStore.pagination.value?.counts?.user ?? 0 },
])

const selectTab = (key) => {
  activeTab.value  = key
  filterRole.value = key
  fetchUsers(1)
}

// ── Pagination ─────────────────────────────────────────────────────────────

const perPageOptions = [10, 25, 50, 100]

const visiblePages = computed(() => {
  if (!userStore.pagination.value?.last_page) return []
  const c = userStore.pagination.value.current_page
  const l = userStore.pagination.value.last_page
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

// ── Fetch ──────────────────────────────────────────────────────────────────

const fetchUsers = (page = 1) => {
  const params = { page, per_page: perPage.value }
  if (filterRole.value)   params.role   = filterRole.value
  if (filterStatus.value) params.status = filterStatus.value
  if (searchQuery.value)  params.search = searchQuery.value
  userStore.fetchUsers(params).catch(() => showToast('Erreur lors du chargement.', 'error'))
}

const onSearchInput = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => fetchUsers(1), 400)
}

// ── Modals ─────────────────────────────────────────────────────────────────

const openCreateModal = () => {
  userModal.value = {
    visible: true, isEdit: false, userId: null,
    form: { first_name: '', last_name: '', email: '', phone: '', password: '', role: 'user', status: 'active' },
    serverErrors: {},
  }
}

const openEditModal = async (user) => {
  try {
    const userData = await userStore.fetchUser(user.id)
    userModal.value = {
      visible: true, isEdit: true, userId: user.id,
      form: {
        first_name: userData.first_name,
        last_name:  userData.last_name,
        email:      userData.email,
        phone:      userData.phone || '',
        password:   '',
        role:       userData.role,
        status:     userData.status,
      },
      serverErrors: {},
    }
  } catch {
    showToast("Impossible de charger les informations de l'utilisateur.", 'error')
  }
}

const closeUserModal = () => { userModal.value.visible = false }

const handleUserSubmit = async () => {
  userModal.value.serverErrors = {}
  const payload = { ...userModal.value.form }
  if (userModal.value.isEdit && !payload.password) delete payload.password
  try {
    if (userModal.value.isEdit) {
      await userStore.updateUser(userModal.value.userId, payload)
      showToast('Modifications enregistrées avec succès.')
    } else {
      await userStore.createUser(payload)
      showToast('Compte créé avec succès.')
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

// ── Actions avec confirmation ───────────────────────────────────────────────

const confirmAction = ({ type, user }) => {
  const name = `${user.first_name} ${user.last_name}`
  const cfgs = {
    approve:          { title: 'Approuver le compte',         message: `Activer le compte de ${name} ? L'utilisateur pourra se connecter immédiatement.`,                    confirmLabel: 'Approuver',             danger: false, fn: () => userStore.approveUser(user.id) },
    'validate-suspend': { title: 'Valider la suspension',     message: `Confirmer la suspension proposée par le RH pour ${name} ?`,                                          confirmLabel: 'Valider la suspension', danger: true,  fn: () => userStore.validateSuspend(user.id) },
    deactivate:       { title: 'Désactiver le compte',        message: `Désactiver le compte de ${name} ?`,                                                                   confirmLabel: 'Désactiver',            danger: true,  fn: () => userStore.updateStatus(user.id, 'inactive') },
    restore:          { title: 'Restaurer le compte',         message: `Restaurer et activer le compte de ${name} ?`,                                                        confirmLabel: 'Restaurer',             danger: false, fn: () => userStore.restoreUser(user.id) },
    suspend:          { title: 'Suspendre le compte',         message: `Suspendre le compte de ${name} ? Cette action bloquera immédiatement l'accès.`,                     confirmLabel: 'Suspendre',             danger: true,  fn: () => userStore.suspendUser(user.id) },
    archive:          { title: 'Archiver le compte',          message: `Archiver définitivement le compte de ${name} ?`,                                                     confirmLabel: 'Archiver',              danger: true,  fn: () => userStore.archiveUser(user.id) },
  }
  const cfg = cfgs[type]
  if (!cfg) return
  modal.value = { visible: true, ...cfg, action: cfg.fn }
}

const executeModal = async () => {
  try {
    await modal.value.action()
    showToast('Action effectuée avec succès.')
    modal.value.visible = false
  } catch {
    showToast("Erreur lors de l'action.", 'error')
  }
}

const openRoleModal   = (user) => { roleModal.value = { user, newRole: user.role } }
const applyRoleChange = async () => {
  try {
    await userStore.updateRole(roleModal.value.user.id, roleModal.value.newRole)
    showToast(`Rôle mis à jour : ${userStore.getRoleLabel(roleModal.value.newRole)}`)
    roleModal.value.user = null
  } catch {
    showToast('Erreur lors de la mise à jour du rôle.', 'error')
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────

const showToast = (message, type = 'success') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = { message: '', type: 'success' }), 3500)
}

onMounted(() => fetchUsers())
</script>

<template>
  <AdminLayout>

    <!-- ── Toast ──────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="toast.message"
          class="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
          :class="toast.type === 'success' ? 'bg-[#0D9488]' : 'bg-red-500'"
        >
          <component :is="toast.type === 'success' ? CheckCircle : XCircle" class="w-4 h-4 shrink-0" />
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>

    <!-- ── Page header ────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-serif font-bold text-[#1B2A4A]">Utilisateurs</h1>
        <p class="text-sm text-gray-400 mt-0.5 font-mono">
          {{ userStore.pagination?.total ?? 0 }} comptes enregistrés
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0a7a6f] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
      >
        <UserPlus class="w-4 h-4" />
        Créer un compte
      </button>
    </div>

    <!-- ── Tabs par rôle ──────────────────────────────────────────────── -->
    <div class="flex items-center gap-1 mb-6 border-b border-gray-100">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="selectTab(tab.key)"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
        :class="activeTab === tab.key
          ? 'text-[#0D9488] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0D9488] after:rounded-full'
          : 'text-gray-400 hover:text-[#1B2A4A]'"
      >
        {{ tab.label }}
        <span
          class="text-[11px] font-mono px-1.5 py-0.5 rounded-md"
          :class="activeTab === tab.key
            ? 'bg-teal-50 text-[#0D9488]'
            : 'bg-gray-100 text-gray-400'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- ── Toolbar : recherche + filtres ─────────────────────────────── -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <!-- Recherche -->
      <div class="relative flex-1 min-w-[220px]">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="Rechercher par nom ou email..."
          class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-colors"
        />
      </div>

      <!-- Filtre rôle -->
      <!-- <div class="relative">
        <select
          v-model="filterRole"
          @change="fetchUsers(1)"
          class="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-[#0D9488] cursor-pointer"
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Administrateur</option>
          <option value="responsable_rh">Responsable RH</option>
          <option value="responsable_demande">Resp. Demandes</option>
          <option value="user">Utilisateur</option>
        </select>
        <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </div> -->

      <!-- Filtre statut -->
      <div class="relative">
        <select
          v-model="filterStatus"
          @change="fetchUsers(1)"
          class="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-[#0D9488] cursor-pointer"
        >
          <option value="">Tous les statuts</option>
          <option value="inactive">Inactif</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="pending_suspension">Suspension en attente</option>
          <option value="archived">Archivé</option>
        </select>
        <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </div>
    </div>

    <!-- ── Loading ────────────────────────────────────────────────────── -->
    <div v-if="userStore.isLoading" class="flex justify-center py-20">
      <div class="w-9 h-9 rounded-full border-2 border-t-[#0D9488] border-gray-100 animate-spin"></div>
    </div>

    <!-- ── Empty ──────────────────────────────────────────────────────── -->
    <div
      v-else-if="userStore.users.value.length === 0"
      class="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center"
    >
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
        <Users class="w-7 h-7 text-gray-300" />
      </div>
      <p class="font-semibold text-[#1B2A4A] mb-1">Aucun utilisateur trouvé</p>
      <p class="text-sm text-gray-400">Modifiez vos filtres ou créez un nouveau compte.</p>
    </div>

    <!-- ── Table ──────────────────────────────────────────────────────── -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <!-- Head -->
          <thead>
            <tr class="border-b border-gray-100">
              <!-- <th class="w-10 px-5 py-3.5 text-left">
                <input type="checkbox" class="w-4 h-4 rounded border-gray-300 accent-[#0D9488]" />
              </th> -->
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Utilisateur</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rôle</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Dernière connexion</th>
              <th class="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden xl:table-cell">Inscription</th>
              <th class="px-5 py-3.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="user in userStore.users.value"
              :key="user.id"
              class="group hover:bg-[#F8F7F4] transition-colors"
              :class="{ 'bg-red-50/30': user.status === 'suspended', 'opacity-60': user.status === 'archived' }"
            >
              <!-- Checkbox -->
              <!-- <td class="w-10 px-5 py-4">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300 accent-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity"
                  :disabled="isCurrentUser(user.id)"
                />
              </td> -->

              <!-- Utilisateur -->
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ring-2 ring-white"
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
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                  :class="userStore.getRoleClass(user.role)"
                >
                  {{ userStore.getRoleLabel(user.role) }}
                </span>
              </td>

              <!-- Statut -->
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                  :class="userStore.getStatusClass(user.status)"
                >
                  {{ userStore.getStatusLabel(user.status) }}
                </span>
              </td>

              <!-- Dernière connexion -->
              <td class="px-4 py-4 text-xs text-gray-400 font-mono hidden lg:table-cell">
                {{ user.last_login_at ? userStore.formatDate(user.last_login_at) : '—' }}
              </td>

              <!-- Inscription -->
              <td class="px-4 py-4 text-xs text-gray-400 font-mono hidden xl:table-cell">
                {{ userStore.formatDate(user.created_at) }}
              </td>

              <!-- Actions -->
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-0.5">

                  <!-- Modifier (toujours visible) -->
                  <button
                    @click="openEditModal(user)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1B2A4A] transition-colors"
                    title="Modifier"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <!-- Séparateur -->
                  <span class="w-px h-4 bg-gray-100 mx-0.5"></span>

                  <!-- Approuver (inactive) -->
                  <button
                    v-if="user.status === 'inactive'"
                    @click="confirmAction({ type: 'approve', user })"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                    title="Approuver le compte"
                  >
                    <CheckCircle class="w-3.5 h-3.5" />
                  </button>

                  <!-- Valider suspension pending -->
                  <button
                    v-if="user.status === 'pending_suspension'"
                    @click="confirmAction({ type: 'validate-suspend', user })"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                    title="Valider la suspension"
                  >
                    <ShieldAlert class="w-3.5 h-3.5" />
                  </button>

                  <!-- Désactiver (actif) -->
                  <button
                    v-if="user.status === 'active' && !isCurrentUser(user.id)"
                    @click="confirmAction({ type: 'deactivate', user })"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-500 transition-colors"
                    title="Désactiver"
                  >
                    <UserX class="w-3.5 h-3.5" />
                  </button>

                  <!-- Restaurer -->
                  <button
                    v-if="['inactive','pending_suspension','suspended','archived'].includes(user.status)"
                    @click="confirmAction({ type: 'restore', user })"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-50 hover:text-[#0D9488] transition-colors"
                    title="Restaurer / Réactiver"
                  >
                    <UserCheck class="w-3.5 h-3.5" />
                  </button>

                  <!-- Suspendre -->
                  <button
                    v-if="!['suspended','archived'].includes(user.status) && !isCurrentUser(user.id)"
                    @click="confirmAction({ type: 'suspend', user })"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Suspendre"
                  >
                    <Ban class="w-3.5 h-3.5" />
                  </button>

                  <!-- Changer rôle -->
                  <button
                    v-if="!isCurrentUser(user.id)"
                    @click="openRoleModal(user)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    title="Changer le rôle"
                  >
                    <Shield class="w-3.5 h-3.5" />
                  </button>

                  <!-- Archiver -->
                  <button
                    v-if="!isCurrentUser(user.id)"
                    @click="confirmAction({ type: 'archive', user })"
                    :disabled="user.status === 'archived'"
                    :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      user.status === 'archived' 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                    ]"
                    title="Archiver"
                  >
                    <Archive class="w-3.5 h-3.5" />
                  </button>

                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Pagination ──────────────────────────────────────────────────── -->
    <div v-if="userStore.pagination?.last_page && userStore.pagination.last_page >= 1" class="flex items-center justify-between mt-5">
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

    <!-- ── Modal confirmation ──────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0 scale-95">
        <div v-if="modal.visible" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div class="flex items-start gap-4 mb-5">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                :class="modal.danger ? 'bg-red-50' : 'bg-teal-50'"
              >
                <component :is="modal.danger ? Ban : CheckCircle" class="w-5 h-5" :class="modal.danger ? 'text-red-500' : 'text-[#0D9488]'" />
              </div>
              <div>
                <h3 class="text-base font-bold text-[#1B2A4A] mb-1">{{ modal.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ modal.message }}</p>
              </div>
            </div>
            <div class="flex gap-2.5 justify-end">
              <button @click="modal.visible = false" class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button
                @click="executeModal"
                :disabled="userStore.isActionLoading"
                class="px-4 py-2 rounded-xl text-sm text-white font-semibold transition-colors disabled:opacity-50"
                :class="modal.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0D9488] hover:bg-[#0a7a6f]'"
              >
                {{ userStore.isActionLoading ? 'En cours...' : modal.confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Modal changement de rôle ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0 scale-95">
        <div v-if="roleModal.user" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <Shield class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 class="text-base font-bold text-[#1B2A4A]">Changer le rôle</h3>
                <p class="text-sm text-gray-400">{{ roleModal.user.first_name }} {{ roleModal.user.last_name }}</p>
              </div>
            </div>
            <div class="relative mb-5">
              <select
                v-model="roleModal.newRole"
                class="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
              >
                <option value="user">Utilisateur</option>
                <option value="responsable_rh">Responsable RH</option>
                <option value="responsable_demande">Resp. Demandes</option>
                <option value="admin">Administrateur</option>
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </div>
            <div class="flex gap-2.5 justify-end">
              <button @click="roleModal.user = null" class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button @click="applyRoleChange" :disabled="userStore.isActionLoading" class="px-4 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#162040] text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                {{ userStore.isActionLoading ? 'Enregistrement...' : 'Confirmer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Modal création / modification ──────────────────────────────── -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0 scale-95">
        <div v-if="userModal.visible" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <!-- Header modal -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 class="text-base font-bold text-[#1B2A4A]">
                {{ userModal.isEdit ? 'Modifier le compte' : 'Nouveau compte' }}
              </h3>
              <button @click="closeUserModal" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                <XCircle class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleUserSubmit" class="px-6 py-5 space-y-4">

              <!-- Prénom + Nom -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prénom *</label>
                  <input
                    v-model="userModal.form.first_name"
                    type="text" required
                    class="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-50 transition-colors"
                    :class="userModal.serverErrors.first_name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#0D9488]'"
                  />
                  <p v-if="userModal.serverErrors.first_name" class="text-xs text-red-500 mt-1">{{ userModal.serverErrors.first_name[0] }}</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom *</label>
                  <input
                    v-model="userModal.form.last_name"
                    type="text" required
                    class="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-50 transition-colors"
                    :class="userModal.serverErrors.last_name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#0D9488]'"
                  />
                  <p v-if="userModal.serverErrors.last_name" class="text-xs text-red-500 mt-1">{{ userModal.serverErrors.last_name[0] }}</p>
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input
                  v-model="userModal.form.email"
                  type="email" required
                  class="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-50 transition-colors"
                  :class="userModal.serverErrors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#0D9488]'"
                />
                <p v-if="userModal.serverErrors.email" class="text-xs text-red-500 mt-1">{{ userModal.serverErrors.email[0] }}</p>
              </div>

              <!-- Téléphone -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Téléphone <span class="normal-case font-normal text-gray-400">(optionnel)</span></label>
                <input
                  v-model="userModal.form.phone"
                  type="tel"
                  class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-colors"
                />
              </div>

              <!-- Mot de passe -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mot de passe
                  <span v-if="userModal.isEdit" class="normal-case font-normal text-gray-400">(laisser vide pour ne pas changer)</span>
                  <span v-else class="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  v-model="userModal.form.password"
                  type="password"
                  :required="!userModal.isEdit"
                  class="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-50 transition-colors"
                  :class="userModal.serverErrors.password ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#0D9488]'"
                />
                <p v-if="userModal.serverErrors.password" class="text-xs text-red-500 mt-1">{{ userModal.serverErrors.password[0] }}</p>
              </div>

              <!-- Rôle + Statut -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Rôle *</label>
                  <div class="relative">
                    <select
                      v-model="userModal.form.role"
                      class="w-full appearance-none border border-gray-200 rounded-xl pl-3.5 pr-8 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="responsable_rh">Responsable RH</option>
                      <option value="responsable_demande">Resp. Demandes</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Statut *</label>
                  <div class="relative">
                    <select
                      v-model="userModal.form.status"
                      class="w-full appearance-none border border-gray-200 rounded-xl pl-3.5 pr-8 py-2.5 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="suspended">Suspendu</option>
                      <option value="archived">Archivé</option>
                    </select>
                    <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>

              <!-- Footer modal -->
              <div class="flex gap-2.5 justify-end pt-2">
                <button type="button" @click="closeUserModal" class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="px-5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0a7a6f] text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {{ isLoading
                    ? (userModal.isEdit ? 'Modification...' : 'Création...')
                    : (userModal.isEdit ? 'Enregistrer' : 'Créer le compte') }}
                </button>
              </div>

            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

  </AdminLayout>
</template>