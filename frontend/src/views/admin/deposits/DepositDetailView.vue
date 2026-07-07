<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useDepositsStore } from '@/stores/deposits'
import { useToastStore } from '@/stores/toast'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  AlertCircle,
  FileText,
  User,
  Calendar,
  BookOpen,
  Tag,
  MessageSquare,
  Globe,
  Hash,
  Building,
  BookMarked,
  Image,
  ChevronRight,
  Loader2,
} from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const store = useDepositsStore()
const toast = useToastStore()

const deposit = ref(null)
const isLoading = ref(true)
const error = ref(null)

const actionComment = ref('')
const showConfirmDialog = ref(false)
const confirmAction = ref(null)
const confirmLabel = ref('')
const confirmVariant = ref('teal')
const isSubmitting = ref(false)
const resultBanner = ref(null)

const showAssignDialog = ref(false)
const assignManagerId = ref('')
const availableManagers = computed(() => store.getAvailableManagers())

const statusConfig = {
  pending:             { label: 'En attente',        cls: 'bg-gray-100 text-gray-600' },
  assigned:            { label: 'Assignée',           cls: 'bg-blue-100 text-blue-700' },
  manager_approved:    { label: 'Validée (resp.)',   cls: 'bg-teal-100 text-teal-700' },
  manager_rejected:    { label: 'Refusée (resp.)',   cls: 'bg-orange-100 text-orange-700' },
  second_opinion:      { label: 'Second avis',        cls: 'bg-purple-100 text-purple-700' },
  approved_published:  { label: 'Publiée',            cls: 'bg-emerald-100 text-emerald-800' },
  rejected:            { label: 'Rejetée',            cls: 'bg-red-100 text-red-700' },
}

const steps = computed(() => store.getStepsForStatus(deposit.value?.status))

const requiresComment = computed(() => {
  if (!confirmAction.value) return false
  return ['reject_definitive', 'override_publish', 'second_opinion_req', 'unpublish'].includes(confirmAction.value)
})

const commentValid = computed(() => {
  if (!requiresComment.value) return true
  return actionComment.value.length >= 50
})

const commentCounterClass = computed(() => {
  if (!requiresComment.value) return ''
  return actionComment.value.length < 50 ? 'text-red-600' : 'text-green-600'
})

function getTypeLabel(type) {
  const labels = {
    livre: 'Livre', memoire: 'Mémoire', these: 'Thèse', article: 'Article',
    revue: 'Revue', rapport: 'Rapport', guide: 'Guide', autre: 'Autre',
  }
  return labels[type] || type || 'Non spécifié'
}

function getLanguageLabel(lang) {
  const labels = {
    fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand',
    it: 'Italien', pt: 'Portugais', nl: 'Néerlandais', ru: 'Russe',
    zh: 'Chinois', ar: 'Arabe', ja: 'Japonais', ko: 'Coréen',
  }
  return labels[lang] || lang || 'Non spécifié'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function getAssignee() {
  if (!deposit.value?.assignedManagerId) return null
  return store.getManagerById(deposit.value.assignedManagerId)
}

function openAssignDialog() {
  assignManagerId.value = deposit.value.assignedManagerId || ''
  showAssignDialog.value = true
}

async function confirmAssign() {
  if (!assignManagerId.value) return
  isSubmitting.value = true
  try {
    if (deposit.value.assignedManagerId) {
      await store.reassignManager(deposit.value.id, parseInt(assignManagerId.value))
    } else {
      await store.assignManager(deposit.value.id, parseInt(assignManagerId.value))
    }
    await store.fetchDeposit(route.params.id)
    deposit.value = store.currentDeposit
    showAssignDialog.value = false
    toast.success('Demande assignée avec succès.')
  } catch {
    toast.error("Erreur lors de l'assignation.")
  } finally {
    isSubmitting.value = false
  }
}

async function confirmUnassign() {
  isSubmitting.value = true
  try {
    await store.unassignManager(deposit.value.id)
    await store.fetchDeposit(route.params.id)
    deposit.value = store.currentDeposit
    toast.success('Assignation annulée.')
  } catch {
    toast.error("Erreur lors de l'annulation.")
  } finally {
    isSubmitting.value = false
  }
}

async function confirmRemind() {
  isSubmitting.value = true
  try {
    await store.remindManager(deposit.value.id)
    await store.fetchDeposit(route.params.id)
    deposit.value = store.currentDeposit
    toast.success('Relance envoyée.')
  } catch {
    toast.error('Erreur lors de la relance.')
  } finally {
    isSubmitting.value = false
  }
}

function prepareAction(action, label, variant = 'teal') {
  confirmAction.value = action
  confirmLabel.value = label
  confirmVariant.value = variant
  actionComment.value = ''
  showConfirmDialog.value = true
}

async function executeConfirm() {
  if (requiresComment.value && actionComment.value.length < 50) return
  isSubmitting.value = true
  try {
    const actions = {
      assign: () => openAssignDialog(),
      approve_publish: async () => {
        await store.approveAndPublish(deposit.value.id)
        showResultBanner('success', '✅ Demande approuvée et publiée avec succès.')
      },
      second_opinion_req: async () => {
        await store.updateDepositStatus(deposit.value.id, 'second_opinion', {
          comment: actionComment.value,
        })
        showResultBanner('info', '🟣 Second avis demandé.')
      },
      reject_definitive: async () => {
        await store.updateDepositStatus(deposit.value.id, 'rejected', {
          comment: actionComment.value,
        })
        showResultBanner('error', '❌ Demande rejetée définitivement.')
      },
      confirm_reject: async () => {
        await store.updateDepositStatus(deposit.value.id, 'rejected', {
          comment: 'Rejet confirmé par l\'administrateur.',
        })
        showResultBanner('error', '❌ Rejet confirmé.')
      },
      override_publish: async () => {
        await store.updateDepositStatus(deposit.value.id, 'approved_published', {
          comment: actionComment.value,
          adminOverride: true,
        })
        await store.approveAndPublish(deposit.value.id)
        showResultBanner('success', '✅ Passé outre et publié avec succès.')
      },
      unpublish: async () => {
        await store.updateDepositStatus(deposit.value.id, 'pending', {
          comment: actionComment.value,
        })
        showResultBanner('info', '📄 Demande dépubliée.')
      },
      reject_direct: async () => {
        await store.updateDepositStatus(deposit.value.id, 'rejected', {
          comment: actionComment.value,
        })
        showResultBanner('error', '❌ Demande rejetée.')
      },
    }

    await actions[confirmAction.value]()
    showConfirmDialog.value = false
    confirmAction.value = null

    await store.fetchDeposit(route.params.id)
    deposit.value = store.currentDeposit
  } catch {
    toast.error("Erreur lors de l'action.")
  } finally {
    isSubmitting.value = false
  }
}

function showResultBanner(type, message) {
  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-purple-600' }
  resultBanner.value = { type, message, color: colors[type] }
  setTimeout(() => {
    resultBanner.value = null
    router.push('/admin/demandes')
  }, 3000)
}

const actionGroups = computed(() => {
  if (!deposit.value) return []
  const s = deposit.value.status
  const actions = []

  if (s === 'pending') {
    actions.push(
      { label: 'Assigner', action: () => prepareAction('assign', 'Assigner'), variant: 'blue', icon: Send, disabled: false },
      { label: 'Rejeter', action: () => prepareAction('reject_direct', 'Rejeter la demande', 'red'), variant: 'red', icon: XCircle, requiresComment: true, disabled: false },
    )
  } else if (s === 'assigned') {
    const mgr = getAssignee()
    actions.push(
      { label: 'Réassigner', action: () => openAssignDialog(), variant: 'blue', icon: Send, disabled: false },
      { label: 'Annuler l\'assignation', action: () => prepareAction('unassign', 'Annuler l\'assignation', 'orange'), variant: 'orange', icon: XCircle, disabled: false },
      { label: 'Relancer', action: () => prepareAction('remind', 'Relancer', 'amber'), variant: 'amber', icon: Send, disabled: false },
    )
    if (mgr) {
      actions.push({
        label: `Responsable : ${mgr.first_name} ${mgr.last_name}`,
        action: null,
        variant: 'info',
        icon: User,
        disabled: true,
      })
    }
  } else if (s === 'manager_approved') {
    actions.push(
      { label: 'Approuver et publier', action: () => prepareAction('approve_publish', 'Approuver et publier', 'teal'), variant: 'teal', icon: CheckCircle, disabled: false },
      { label: 'Demander un deuxième avis', action: () => prepareAction('second_opinion_req', 'Demander un deuxième avis', 'purple'), variant: 'purple', icon: Eye, requiresComment: true, disabled: false },
      { label: 'Rejeter définitivement', action: () => prepareAction('reject_definitive', 'Rejeter définitivement', 'red'), variant: 'red', icon: XCircle, requiresComment: true, disabled: false },
    )
  } else if (s === 'manager_rejected') {
    actions.push(
      { label: 'Confirmer le rejet', action: () => prepareAction('confirm_reject', 'Confirmer le rejet', 'red'), variant: 'red', icon: XCircle, disabled: false },
      { label: 'Passer outre et publier', action: () => prepareAction('override_publish', 'Passer outre et publier', 'teal'), variant: 'teal', icon: CheckCircle, requiresComment: true, disabled: false },
      { label: 'Demander un deuxième avis', action: () => prepareAction('second_opinion_req', 'Demander un deuxième avis', 'purple'), variant: 'purple', icon: Eye, requiresComment: true, disabled: false },
    )
  } else if (s === 'second_opinion') {
    actions.push(
      { label: 'En attente du second avis', action: null, variant: 'info', icon: Eye, disabled: true },
    )
  } else if (s === 'approved_published') {
    actions.push(
      { label: 'Dépublier', action: () => prepareAction('unpublish', 'Dépublier', 'red'), variant: 'red', icon: XCircle, requiresComment: true, disabled: false },
    )
  } else if (s === 'rejected') {
    actions.push(
      { label: 'Lecture seule', action: null, variant: 'info', icon: Eye, disabled: true },
    )
  }

  return actions
})

onMounted(async () => {
  try {
    await store.fetchDeposit(route.params.id)
    deposit.value = store.currentDeposit
  } catch (err) {
    error.value = err.message || 'Impossible de charger la demande.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <AdminLayout>
    <div>
      <div class="flex items-center gap-4 mb-6">
        <router-link
          to="/admin/demandes"
          class="text-gray-500 hover:text-navy-800 flex items-center gap-1 text-sm"
        >
          <ArrowLeft class="w-4 h-4" />
          Retour aux demandes
        </router-link>
      </div>

      <div v-if="resultBanner" class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium flex items-center gap-3" :class="resultBanner.color">
        <span>{{ resultBanner.message }}</span>
        <span class="text-sm opacity-80">Redirection dans 3s...</span>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
        <p class="text-red-700">{{ error }}</p>
        <button @click="router.push('/admin/demandes')" class="mt-4 text-teal-600 font-medium hover:underline text-sm">
          Retour à la liste
        </button>
      </div>

      <template v-else-if="deposit">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-navy-800 font-serif mb-1">{{ deposit.title }}</h1>
            <p class="text-sm text-gray-500">{{ deposit.id }} · {{ getTypeLabel(deposit.type) }}</p>
          </div>
          <span
            :class="`px-4 py-2 rounded-full text-sm font-semibold shrink-0 ${statusConfig[deposit.status]?.cls || 'bg-gray-100 text-gray-500'}`"
          >
            {{ statusConfig[deposit.status]?.label || deposit.status }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div class="lg:col-span-2 space-y-6">
            <div v-if="deposit.adminOverride" class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span class="text-amber-600 font-bold">⚠️</span>
              <p class="text-amber-800 text-sm font-medium">Cette demande a été approuvée par passage outre administratif.</p>
            </div>

            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">Description</h2>
              <p class="text-gray-700 leading-relaxed">{{ deposit.summary || 'Aucune description fournie.' }}</p>
            </div>

            <div v-if="deposit.keywords?.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Tag class="w-4 h-4" />
                Mots-clés
              </h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="kw in deposit.keywords"
                  :key="kw"
                  class="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ kw }}
                </span>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MessageSquare class="w-4 h-4" />
                Commentaire du responsable
              </h2>
              <p v-if="deposit.managerComment" class="text-gray-700">{{ deposit.managerComment }}</p>
              <p v-else class="text-gray-400 italic">Aucun commentaire.</p>
            </div>

            <div v-if="deposit.history?.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Clock class="w-4 h-4" />
                Historique
              </h2>
              <div class="space-y-3">
                <div
                  v-for="(entry, i) in [...deposit.history].reverse()"
                  :key="i"
                  class="flex gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div class="w-2 h-2 mt-2 rounded-full bg-teal-600 shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="text-sm font-medium text-navy-800">{{ entry.actor }}</span>
                      <span class="text-xs text-gray-400">({{ entry.role }})</span>
                    </div>
                    <p class="text-sm text-gray-600">{{ entry.action }}</p>
                    <p v-if="entry.comment" class="text-sm text-gray-500 italic mt-0.5">"{{ entry.comment }}"</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ formatDateTime(entry.at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">Informations</h2>
              <div class="space-y-4 text-sm">
                <div>
                  <span class="text-gray-500 block text-xs">Titre</span>
                  <span class="text-navy-800 font-medium">{{ deposit.title }}</span>
                </div>
                <div v-if="deposit.authors?.length">
                  <span class="text-gray-500 block text-xs">Auteur(s)</span>
                  <span class="text-navy-800">{{ deposit.authors.join(', ') }}</span>
                </div>
                <div v-if="deposit.type">
                  <span class="text-gray-500 block text-xs">Type</span>
                  <span class="inline-block bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">{{ getTypeLabel(deposit.type) }}</span>
                </div>
                <div v-if="deposit.category">
                  <span class="text-gray-500 block text-xs">Catégorie</span>
                  <span class="text-navy-800">{{ deposit.category.name }}</span>
                </div>
                <div v-if="deposit.publisher">
                  <span class="text-gray-500 block text-xs flex items-center gap-1"><Building class="w-3 h-3" /> Éditeur</span>
                  <span class="text-navy-800">{{ deposit.publisher }}</span>
                </div>
                <div v-if="deposit.isbn">
                  <span class="text-gray-500 block text-xs flex items-center gap-1"><Hash class="w-3 h-3" /> ISBN</span>
                  <span class="text-navy-800 font-mono">{{ deposit.isbn }}</span>
                </div>
                <div v-if="deposit.language">
                  <span class="text-gray-500 block text-xs flex items-center gap-1"><Globe class="w-3 h-3" /> Langue</span>
                  <span class="text-navy-800">{{ getLanguageLabel(deposit.language) }}</span>
                </div>
                <div v-if="deposit.year">
                  <span class="text-gray-500 block text-xs">Année</span>
                  <span class="text-navy-800 font-mono">{{ deposit.year }}</span>
                </div>
                <div v-if="deposit.pages">
                  <span class="text-gray-500 block text-xs">Pages</span>
                  <span class="text-navy-800 font-mono">{{ deposit.pages }}</span>
                </div>
              </div>
            </div>

            <div v-if="deposit.cover_image || deposit.cover_image_preview" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Image class="w-4 h-4" />
                Couverture
              </h2>
              <img :src="deposit.cover_image || deposit.cover_image_preview" alt="Couverture" class="w-full rounded-xl object-cover border border-gray-200 max-h-48" />
            </div>

            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                Chronologie
              </h2>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 mt-1.5 rounded-full bg-teal-600 shrink-0"></div>
                  <div>
                    <p class="text-xs text-gray-500">Soumise le</p>
                    <p class="text-sm text-navy-800">{{ formatDateTime(deposit.submittedAt) }}</p>
                  </div>
                </div>
                <div v-if="deposit.assignedAt" class="flex items-start gap-3">
                  <div class="w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0"></div>
                  <div>
                    <p class="text-xs text-gray-500">Assignée le</p>
                    <p class="text-sm text-navy-800">{{ formatDateTime(deposit.assignedAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <User class="w-4 h-4" />
                Déposant
              </h2>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                  {{ deposit.submittedBy?.first_name?.charAt(0) }}{{ deposit.submittedBy?.last_name?.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-navy-800">
                    {{ deposit.submittedBy?.first_name }} {{ deposit.submittedBy?.last_name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ deposit.submittedBy?.email }}</p>
                </div>
              </div>
            </div>

            <div v-if="deposit.assignedManagerId" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <User class="w-4 h-4" />
                Responsable assigné
              </h2>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                  {{ getAssignee()?.first_name?.charAt(0) }}{{ getAssignee()?.last_name?.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-navy-800">
                    {{ getAssignee()?.first_name }} {{ getAssignee()?.last_name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 mb-6">
          <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-6">Progression</h2>
          <div class="flex items-center justify-between">
            <template v-for="(step, i) in steps" :key="step.key">
              <div class="flex flex-col items-center flex-1">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  :class="{
                    'bg-teal-600 text-white': step.active || step.completed,
                    'bg-gray-200 text-gray-400': step.future,
                    'ring-4 ring-teal-100': step.active,
                  }"
                >
                  <CheckCircle v-if="step.completed" class="w-5 h-5" />
                  <template v-else>{{ i + 1 }}</template>
                </div>
                <p
                  class="text-xs mt-2 font-medium text-center"
                  :class="{
                    'text-teal-700': step.active,
                    'text-gray-400': step.future,
                    'text-gray-600': step.completed,
                  }"
                >
                  {{ step.label }}
                </p>
              </div>
              <div v-if="i < steps.length - 1" class="flex-1 h-px mx-2" :class="step.completed ? 'bg-teal-500' : 'bg-gray-200'"></div>
            </template>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">Actions</h2>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="act in actionGroups"
              :key="act.label"
              @click="act.action"
              :disabled="act.disabled || isSubmitting"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{
                'bg-teal-600 text-white hover:bg-teal-700': act.variant === 'teal',
                'bg-red-600 text-white hover:bg-red-700': act.variant === 'red',
                'bg-blue-600 text-white hover:bg-blue-700': act.variant === 'blue',
                'bg-purple-600 text-white hover:bg-purple-700': act.variant === 'purple',
                'bg-amber-600 text-white hover:bg-amber-700': act.variant === 'amber',
                'bg-orange-600 text-white hover:bg-orange-700': act.variant === 'orange',
                'bg-gray-200 text-gray-500 cursor-default': act.variant === 'info',
              }"
            >
              <component :is="act.icon" class="w-4 h-4" v-if="act.icon" />
              {{ act.label }}
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            </button>
          </div>
        </div>

        <Teleport to="body">
          <div
            v-if="showConfirmDialog"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            @click.self="isSubmitting ? null : (showConfirmDialog = false)"
          >
            <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
              <h3 class="text-lg font-semibold text-navy-800 mb-2">Confirmation</h3>
              <p class="text-sm text-gray-600 mb-4">Êtes-vous sûr de vouloir {{ confirmLabel.toLowerCase() }} ?</p>

              <div v-if="requiresComment" class="space-y-3">
                <label class="block text-sm font-medium text-navy-800">
                  Justification <span class="text-red-600">*</span>
                </label>
                <textarea
                  v-model="actionComment"
                  rows="4"
                  class="w-full bg-beige border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                  :class="actionComment.length < 50 ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'"
                  :placeholder="`Justification (minimum 50 caractères)...`"
                ></textarea>
                <div class="flex items-center justify-between text-sm">
                  <span :class="commentCounterClass">{{ actionComment.length }} / 50</span>
                  <span v-if="actionComment.length < 50" class="text-red-600 text-xs">Minimum 50 caractères requis</span>
                </div>
              </div>

              <div class="flex gap-3 justify-end mt-6">
                <button
                  @click="showConfirmDialog = false"
                  :disabled="isSubmitting"
                  class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  @click="executeConfirm"
                  :disabled="isSubmitting || (requiresComment && actionComment.length < 50)"
                  class="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  :class="{
                    'bg-teal-600 hover:bg-teal-700': confirmVariant === 'teal',
                    'bg-red-600 hover:bg-red-700': confirmVariant === 'red',
                    'bg-purple-600 hover:bg-purple-700': confirmVariant === 'purple',
                    'bg-blue-600 hover:bg-blue-700': confirmVariant === 'blue',
                    'bg-amber-600 hover:bg-amber-700': confirmVariant === 'amber',
                    'bg-orange-600 hover:bg-orange-700': confirmVariant === 'orange',
                  }"
                >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                  {{ isSubmitting ? 'Traitement...' : 'Confirmer' }}
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="showAssignDialog"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            @click.self="showAssignDialog = false"
          >
            <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 class="text-lg font-semibold text-navy-800 mb-4">
                {{ deposit.assignedManagerId ? 'Réassigner' : 'Assigner' }} à un responsable
              </h3>
              <select
                v-model="assignManagerId"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 mb-4"
              >
                <option value="">Sélectionnez un responsable</option>
                <option
                  v-for="m in availableManagers"
                  :key="m.id"
                  :value="m.id"
                  :disabled="m.id === deposit.assignedManagerId"
                >
                  {{ m.first_name }} {{ m.last_name }} ({{ m.open_deposits }} demandes ouvertes)
                </option>
              </select>
              <div class="flex gap-3 justify-end">
                <button
                  @click="showAssignDialog = false"
                  :disabled="isSubmitting"
                  class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  @click="confirmAssign"
                  :disabled="isSubmitting || !assignManagerId"
                  class="px-4 py-2.5 rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-900 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                  {{ isSubmitting ? 'Assignation...' : 'Assigner' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      </template>
    </div>
  </AdminLayout>
</template>
