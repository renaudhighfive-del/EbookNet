<template>
  <RHLayout>
    <template #title>
      <div class="flex items-center gap-2">
        <button
          @click="goBack"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span>Fiche utilisateur</span>
      </div>
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
          class="fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2"
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

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div
        class="w-10 h-10 rounded-full border-2 border-t-[#0D9488] border-gray-200 animate-spin"
      ></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <AlertCircle class="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p class="font-semibold text-red-700">Impossible de charger cet utilisateur.</p>
      <p class="text-sm text-red-500 mt-1">{{ error }}</p>
      <button
        @click="fetchUser"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700"
      >
        Réessayer
      </button>
    </div>

    <template v-else-if="user">
      <!-- Header utilisateur -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
              :class="getAvatarColor(user.id)"
            >
              {{ getUserInitials(user) }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-[#1B2A4A]">
                {{ user.first_name }} {{ user.last_name }}
              </h2>
              <p class="text-sm text-gray-400 mt-0.5">{{ user.email }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span
                  :class="getRoleClass(user.role)"
                  class="px-2 py-0.5 rounded-full text-xs font-semibold"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
                <span
                  :class="getStatusClass(user.status)"
                  class="px-2 py-0.5 rounded-full text-xs font-semibold"
                >
                  {{ getStatusLabel(user.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions contextuelles selon rôle et statut -->
          <div class="flex flex-wrap gap-2">
            <!-- Modifier -->
            <router-link
              :to="`/rh/users/${user.id}/edit`"
              class="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[#1B2A4A] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Pencil class="w-3.5 h-3.5" />
              Modifier
            </router-link>

            <!-- Approuver (compte inactif) -->
            <button
              v-if="user.status === 'inactive'"
              @click="doAction('approve')"
              :disabled="isActionLoading"
              class="flex items-center gap-1.5 px-3 py-2 border border-green-300 text-green-700 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <CheckCircle class="w-3.5 h-3.5" />
              Approuver
            </button>

            <!-- Réactiver (inactif ou pending_suspension) -->
            <button
              v-if="['inactive', 'pending_suspension'].includes(user.status)"
              @click="doAction('activate')"
              :disabled="isActionLoading"
              class="flex items-center gap-1.5 px-3 py-2 border border-teal-300 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors disabled:opacity-50"
            >
              <UserCheck class="w-3.5 h-3.5" />
              Réactiver
            </button>

            <!-- Désactiver (actif) -->
            <button
              v-if="user.status === 'active'"
              @click="openConfirm('deactivate')"
              :disabled="isActionLoading"
              class="flex items-center gap-1.5 px-3 py-2 border border-amber-300 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              <UserX class="w-3.5 h-3.5" />
              Désactiver
            </button>

            <!-- Proposer suspension (RH, actif) -->
            <button
              v-if="!isAdmin && user.status === 'active'"
              @click="openConfirm('request-suspend')"
              :disabled="isActionLoading"
              class="flex items-center gap-1.5 px-3 py-2 border border-orange-300 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              <Ban class="w-3.5 h-3.5" />
              Demander suspension
            </button>

            <!-- Suspendre directement (Admin) -->
            <button
              v-if="isAdmin && !['suspended', 'archived'].includes(user.status)"
              @click="openConfirm('suspend')"
              :disabled="isActionLoading"
              class="flex items-center gap-1.5 px-3 py-2 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Ban class="w-3.5 h-3.5" />
              Suspendre
            </button>

            <!-- Valider suspension pending (Admin) -->
            <button
              v-if="isAdmin && user.status === 'pending_suspension'"
              @click="openConfirm('validate-suspend')"
              :disabled="isActionLoading"
              class="flex items-center gap-1.5 px-3 py-2 border border-orange-300 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              <ShieldAlert class="w-3.5 h-3.5" />
              Valider suspension
            </button>

            <!-- Restaurer (Admin : suspendu/archivé) -->
            <button
              v-if="isAdmin && ['suspended', 'archived'].includes(user.status)"
              @click="doAction('restore')"
              :disabled="isActionLoading"
              class="flex items-center gap-1.5 px-3 py-2 border border-teal-300 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors disabled:opacity-50"
            >
              <UserCheck class="w-3.5 h-3.5" />
              Restaurer
            </button>

            <!-- Badge lecture seule (RH sur compte suspendu) -->
            <span
              v-if="!isAdmin && user.status === 'suspended'"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-medium border border-red-200"
            >
              <Ban class="w-3.5 h-3.5" />
              Suspendu par l'admin
            </span>
          </div>
        </div>
      </div>

      <!-- Grille contenu -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Infos (2/3) -->
        <div class="lg:col-span-2 space-y-5">
          <!-- Infos personnelles -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-4">
              Informations personnelles
            </h3>
            <dl class="space-y-3 text-sm">
              <div class="flex gap-4">
                <dt class="w-32 text-gray-400 shrink-0">Nom complet</dt>
                <dd class="text-[#1B2A4A] font-medium">
                  {{ user.first_name }} {{ user.last_name }}
                </dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-32 text-gray-400 shrink-0">E-mail</dt>
                <dd class="text-[#1B2A4A]">{{ user.email }}</dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-32 text-gray-400 shrink-0">Téléphone</dt>
                <dd class="text-gray-700">{{ user.phone || '—' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Infos compte -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-4">
              Informations du compte
            </h3>
            <dl class="space-y-3 text-sm">
              <div class="flex gap-4 items-center">
                <dt class="w-32 text-gray-400 shrink-0">Statut</dt>
                <dd>
                  <span
                    :class="getStatusClass(user.status)"
                    class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  >
                    {{ getStatusLabel(user.status) }}
                  </span>
                </dd>
              </div>
              <div class="flex gap-4 items-center">
                <dt class="w-32 text-gray-400 shrink-0">Rôle</dt>
                <dd>
                  <span
                    :class="getRoleClass(user.role)"
                    class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  >
                    {{ getRoleLabel(user.role) }}
                  </span>
                </dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-32 text-gray-400 shrink-0">Inscrit le</dt>
                <dd class="text-gray-700 font-mono text-xs">
                  {{ formatDateTime(user.created_at) }}
                </dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-32 text-gray-400 shrink-0">Dernière connexion</dt>
                <dd class="text-gray-700 font-mono text-xs">
                  {{ user.last_login_at ? formatDateTime(user.last_login_at) : '—' }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Demandes de dépôt -->
          <div
            v-if="user.deposit_requests?.length"
            class="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-4">
              Demandes de dépôt
              <span class="ml-1 text-xs font-normal text-gray-400"
                >({{ user.deposit_requests.length }})</span
              >
            </h3>
            <div class="space-y-2.5">
              <div
                v-for="dep in user.deposit_requests.slice(0, 5)"
                :key="dep.id"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-[#1B2A4A] truncate max-w-xs">{{ dep.title }}</span>
                <span
                  :class="getDepositStatusClass(dep.status)"
                  class="px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2"
                >
                  {{ getDepositStatusLabel(dep.status) }}
                </span>
              </div>
            </div>
            <p v-if="user.deposit_requests.length > 5" class="text-xs text-gray-400 mt-3">
              + {{ user.deposit_requests.length - 5 }} autre(s)
            </p>
          </div>
        </div>

        <!-- Activité (1/3) -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-4">
              Activité récente
            </h3>
            <div v-if="user.activity_logs?.length" class="space-y-4">
              <div v-for="log in user.activity_logs.slice(0, 8)" :key="log.id" class="flex gap-3">
                <div
                  class="w-1.5 h-1.5 mt-2 rounded-full shrink-0"
                  :class="getLogDotColor(log.action)"
                ></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-[#1B2A4A]">
                    {{ formatLogAction(log.action) }}
                  </p>
                  <p v-if="log.target_table" class="text-xs text-gray-400">
                    {{ log.target_table }} #{{ log.target_id }}
                  </p>
                  <p class="text-xs text-gray-300 mt-0.5">{{ timeAgo(log.created_at) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="py-8 text-center text-gray-300">
              <Activity class="w-8 h-8 mx-auto mb-2" />
              <p class="text-sm">Aucune activité enregistrée.</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal confirmation -->
    <Teleport to="body">
      <div
        v-if="confirm.visible"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <h3 class="text-base font-bold text-[#1B2A4A] mb-2">{{ confirm.title }}</h3>
          <p class="text-sm text-gray-600 mb-6">{{ confirm.message }}</p>
          <div class="flex gap-3 justify-end">
            <button
              @click="confirm.visible = false"
              class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="executeConfirm"
              :disabled="isActionLoading"
              :class="
                confirm.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0D9488] hover:bg-[#0a7a6f]'
              "
              class="px-4 py-2 rounded-xl text-sm text-white font-semibold disabled:opacity-50"
            >
              {{ isActionLoading ? 'En cours...' : confirm.label }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </RHLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RHLayout from '@/layouts/RHLayout.vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import {
  ChevronLeft,
  Pencil,
  UserCheck,
  UserX,
  Ban,
  CheckCircle,
  XCircle,
  ShieldAlert,
  AlertCircle,
  Activity,
} from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const authStore = useAuthStore()

const {
  getRoleLabel,
  getRoleClass,
  getStatusLabel,
  getStatusClass,
  getAvatarColor,
  getUserInitials,
  formatDateTime,
  timeAgo,
} = userStore

const user = computed(() => userStore.currentUser)
const error = computed(() => userStore.error)
const isLoading = computed(() => userStore.isLoading)
const isActionLoading = computed(() => userStore.isActionLoading)
const isAdmin = computed(() => authStore.userRole === 'admin')

const toast = ref({ message: '', type: 'success' })
const confirm = ref({ visible: false, title: '', message: '', label: '', danger: false, fn: null })

const goBack = () => router.push('/rh/users')
const fetchUser = () => userStore.fetchUser(route.params.id).catch(() => {})

/* Actions sans confirmation */
const doAction = async (type) => {
  try {
    if (type === 'activate') await userStore.updateStatus(user.value.id, 'active')
    else if (type === 'approve') await userStore.approveUser(user.value.id)
    else if (type === 'restore') await userStore.restoreUser(user.value.id)
    showToast('Action effectuée avec succès.', 'success')
  } catch {
    showToast("Erreur lors de l'action.", 'error')
  }
}

/* Actions avec confirmation */
const openConfirm = (type) => {
  const cfgs = {
    deactivate: {
      title: 'Désactiver le compte',
      message: `Désactiver le compte de ${user.value.first_name} ${user.value.last_name} ?`,
      label: 'Désactiver',
      danger: true,
      fn: () => userStore.updateStatus(user.value.id, 'inactive'),
    },
    'request-suspend': {
      title: 'Demande de suspension',
      message: `Proposer la suspension de ${user.value.first_name} ${user.value.last_name} à l'administrateur ?`,
      label: 'Soumettre',
      danger: true,
      fn: () => userStore.requestSuspend(user.value.id),
    },
    suspend: {
      title: 'Suspendre le compte',
      message: `Suspendre le compte de ${user.value.first_name} ${user.value.last_name} ? Cette action bloquera l'accès immédiatement.`,
      label: 'Suspendre',
      danger: true,
      fn: () => userStore.suspendUser(user.value.id),
    },
    'validate-suspend': {
      title: 'Valider la suspension',
      message: `Confirmer la suspension demandée par le RH pour ${user.value.first_name} ${user.value.last_name} ?`,
      label: 'Valider',
      danger: true,
      fn: () => userStore.validateSuspend(user.value.id),
    },
  }
  const cfg = cfgs[type]
  if (!cfg) return
  confirm.value = { visible: true, ...cfg, fn: cfg.fn }
}

const executeConfirm = async () => {
  try {
    await confirm.value.fn()
    showToast('Action effectuée avec succès.', 'success')
    confirm.value.visible = false
  } catch {
    showToast("Erreur lors de l'action.", 'error')
  }
}

const showToast = (message, type = 'success') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = { message: '', type: 'success' }), 3500)
}

/* Helpers locaux */
const getDepositStatusLabel = (s) =>
  ({
    pending: 'En attente',
    approved_by_manager: 'Validée',
    rejected_by_manager: 'Refusée',
    second_review: 'Second avis',
    approved: 'Approuvée',
    rejected: 'Rejetée',
    published: 'Publiée',
  })[s] ?? s

const getDepositStatusClass = (s) =>
  ({
    pending: 'bg-gray-100 text-gray-600',
    approved_by_manager: 'bg-teal-100 text-teal-700',
    rejected_by_manager: 'bg-orange-100 text-orange-700',
    second_review: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    published: 'bg-green-200 text-green-800',
  })[s] ?? 'bg-gray-100 text-gray-600'

const getLogDotColor = (action) => {
  if (action === 'login') return 'bg-teal-500'
  if (action === 'logout') return 'bg-gray-300'
  if (action?.includes('delete')) return 'bg-red-500'
  if (action?.includes('create')) return 'bg-blue-500'
  return 'bg-amber-400'
}

const formatLogAction = (action) =>
  ({
    login: 'Connexion',
    logout: 'Déconnexion',
    create_reference: 'Référence créée',
    delete_user: 'Compte supprimé',
    publish_deposit: 'Dépôt publié',
    download_file: 'Téléchargement',
  })[action] ?? action

onMounted(fetchUser)
onUnmounted(() => userStore.clearCurrentUser())
</script>
