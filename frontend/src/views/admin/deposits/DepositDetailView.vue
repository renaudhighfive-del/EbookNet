<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useDepositsStore } from '@/stores/deposits'
import { useToastStore } from '@/stores/toast'
import { adminService } from '@/services/api/admin.service'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Globe,
  Hash,
  Building,
  Image,
  FileText,
  Download,
  Loader2,
  X,
} from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const store = useDepositsStore()
const toast = useToastStore()

const deposit = ref(null)
const isLoading = ref(true)
const error = ref(null)
const isSubmitting = ref(false)
const resultBanner = ref(null)

// Icônes associées à chaque clé d'action (le store ne gère que les données)
const ACTION_ICONS = {
  assign: User,
  reassign: User,
  remind: AlertCircle,
  reject_direct: XCircle,
  approve_publish: CheckCircle,
  second_opinion_req: Eye,
  reject_definitive: XCircle,
  confirm_reject: XCircle,
  override_publish: CheckCircle,
  unpublish: XCircle,
}

const VARIANT_CLASSES = {
  green: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
  red: 'bg-red-600 text-white hover:bg-red-700',
  blue: 'bg-blue-600 text-white hover:bg-blue-700',
  amber: 'bg-amber-600 text-white hover:bg-amber-700',
  orange: 'bg-orange-500 text-white hover:bg-orange-600',
  white: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  'red-outline': 'bg-white text-red-600 border-2 border-red-500 hover:bg-red-50',
}

// Dialogue générique de confirmation (couvre toutes les actions sauf assign/reassign)
const showConfirmDialog = ref(false)
const confirmDef = ref(null) // { key, label, variant, requiresComment, minLength }
const actionComment = ref('')
const showZoomModal = ref(false)

// Dialogue d'assignation / réassignation
const showAssignDialog = ref(false)
const assignManagerId = ref('')
const isSecondOpinion = ref(false)
const secondOpinionComment = ref('')
const availableManagers = computed(() =>
  store.getAvailableManagers(deposit.value?.assignedManagerId || null),
)

const steps = computed(() => store.getStepsForStatus(deposit.value?.status))

const fileUrl = computed(() => {
  if (!deposit.value?.id) return null
  return adminService.getDepositFileUrl(deposit.value.id)
})

const fileUrlInline = computed(() => {
  if (!deposit.value?.id) return null
  return adminService.getDepositFileUrl(deposit.value.id, true)
})

const commentValid = computed(() => {
  if (!confirmDef.value?.requiresComment) return true
  return actionComment.value.length >= (confirmDef.value.minLength || 0)
})

function getTypeLabel(type) {
  return store.getTypeLabel(type)
}
function getLanguageLabel(lang) {
  return store.getLanguageLabel(lang)
}
function formatDate(d) {
  return store.formatDate(d)
}
function formatDateTime(d) {
  return store.formatDateTime(d)
}
function getAssignee() {
  if (!deposit.value?.assignedManagerId) return null
  return store.getManagerById(deposit.value.assignedManagerId)
}

// Helpers for file viewing
function getFileExtension(url) {
  if (!url) return ''
  try {
    const pathname = new URL(url).pathname
    const ext = pathname.split('.').pop()
    return ext ? ext.toLowerCase() : ''
  } catch {
    return ''
  }
}

function isPdf(url) {
  return getFileExtension(url) === 'pdf'
}

function isViewableFile(url) {
  const ext = getFileExtension(url)
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
}

function getViewerUrl(url) {
  if (!url) return '#'
  const ext = getFileExtension(url)
  if (
    ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(
      getFileExtension(url),
    )
  ) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }
  return url
}

function getPdfViewerUrl(url) {
  if (!url) return '#'
  return `${url}#toolbar=1&navpanes=1&scrollbar&view=FitH`
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return 'Taille inconnue'
  const sizes = ['o', 'Ko', 'Mo', 'Go', 'To']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

// Actions affichées, construites depuis le registre unique du store —
// impossible désormais qu'un bouton n'ait pas de handler correspondant.
const actionButtons = computed(() => {
  if (!deposit.value) return []
  return store.getActionsForStatus(deposit.value.status).map((def) => ({
    ...def,
    icon: ACTION_ICONS[def.key],
  }))
})

const statusInfoBanner = computed(() => {
  if (!deposit.value) return null
  const s = deposit.value.status
  if (s === 'pending')
    return { text: "Cette demande n'est pas encore assignée.", cls: 'bg-gray-100 text-gray-600' }
  if (s === 'assigned') {
    const mgr = getAssignee()
    return {
      text: `Assignée à ${mgr?.first_name} ${mgr?.last_name} — en attente de revue.`,
      cls: 'bg-blue-50 text-blue-700',
    }
  }
  if (s === 'second_opinion')
    return { text: 'En attente du second avis.', cls: 'bg-purple-50 text-purple-700' }
  if (s === 'rejected')
    return { text: 'Demande rejetée — lecture seule.', cls: 'bg-gray-100 text-gray-600' }
  return null
})

function openAssignDialog(forSecondOpinion = false) {
  isSecondOpinion.value = forSecondOpinion
  secondOpinionComment.value = ''
  assignManagerId.value = deposit.value.assignedManagerId || ''
  showAssignDialog.value = true
}

async function confirmAssign() {
  if (!assignManagerId.value) return
  isSubmitting.value = true
  try {
    await store.assignManager(deposit.value.id, parseInt(assignManagerId.value))
    if (isSecondOpinion.value) {
      await store.updateDepositStatus(deposit.value.id, 'second_opinion', {
        comment: secondOpinionComment.value,
      })
      showResultBanner('info', 'Second avis demandé.')
    }
    await refresh()
    showAssignDialog.value = false
  } catch {
    toast.error("Erreur lors de l'assignation.")
  } finally {
    isSubmitting.value = false
  }
}

function openConfirmDialog(def) {
  confirmDef.value = def
  actionComment.value = ''
  showConfirmDialog.value = true
}

// Point d'entrée unique des boutons d'action du panneau
function runAction(def) {
  if (def.key === 'assign' || def.key === 'reassign') openAssignDialog()
  else if (def.key === 'second_opinion_req') openAssignDialog(true)
  else openConfirmDialog(def)
}

async function executeConfirm() {
  if (!commentValid.value) return
  isSubmitting.value = true
  const { key } = confirmDef.value
  const id = deposit.value.id
  try {
    if (key === 'remind') {
      await store.remindManager(id)
      showResultBanner('info', 'Relance envoyée au responsable.')
    } else if (key === 'approve_publish') {
      await store.approveAndPublish(id)
      showResultBanner('success', 'Demande approuvée et publiée avec succès.')
    } else if (key === 'override_publish') {
      await store.approveAndPublish(id, { comment: actionComment.value, adminOverride: true })
      showResultBanner('success', 'Décision passée outre : demande publiée.')
    } else if (key === 'second_opinion_req') {
      await store.updateDepositStatus(id, 'second_opinion', { comment: actionComment.value })
      showResultBanner('info', 'Second avis demandé.')
    } else if (key === 'reject_direct' || key === 'reject_definitive') {
      await store.updateDepositStatus(id, 'rejected', { comment: actionComment.value })
      showResultBanner('error', 'Demande rejetée.')
    } else if (key === 'confirm_reject') {
      await store.updateDepositStatus(id, 'rejected', { comment: actionComment.value })
      showResultBanner('error', 'Rejet confirmé.')
    } else if (key === 'unpublish') {
      await store.updateDepositStatus(id, 'pending', { comment: actionComment.value })
      showResultBanner('info', 'Demande dépubliée.')
    }
    showConfirmDialog.value = false
    confirmDef.value = null
    await refresh()
  } catch {
    toast.error("Erreur lors de l'exécution de l'action.")
  } finally {
    isSubmitting.value = false
  }
}

async function refresh() {
  await store.fetchDeposit(route.params.id)
  deposit.value = store.currentDeposit
}

function showResultBanner(type, message) {
  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-purple-600' }
  resultBanner.value = { message, color: colors[type] }
  setTimeout(() => {
    resultBanner.value = null
    router.push('/admin/demandes')
  }, 2500)
}

onMounted(async () => {
  try {
    store.fetchManagers()
    await refresh()
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

      <div
        v-if="resultBanner"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium flex items-center gap-3"
        :class="resultBanner.color"
      >
        <span>{{ resultBanner.message }}</span>
        <span class="text-sm opacity-80">Redirection...</span>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"
        ></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
        <p class="text-red-700">{{ error }}</p>
        <button
          @click="router.push('/admin/demandes')"
          class="mt-4 text-teal-600 font-medium hover:underline text-sm"
        >
          Retour à la liste
        </button>
      </div>

      <template v-else-if="deposit">
        <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 class="text-2xl font-bold text-navy-800 font-serif mb-1">{{ deposit.title }}</h1>
            <p class="text-sm text-gray-500">
              DEP-{{ deposit.id }} · {{ getTypeLabel(deposit.type) }}
            </p>
          </div>
          <span
            class="px-4 py-2 rounded-full text-sm font-semibold shrink-0"
            :class="store.getStatusConfig(deposit.status).cls"
          >
            {{ store.getStatusConfig(deposit.status).label }}
          </span>
        </div>

        <!-- Progression -->
        <div class="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 mb-6">
          <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-6">Progression</h2>
          <div
            v-if="deposit.status === 'rejected'"
            class="flex items-center gap-2 text-red-600 text-sm font-medium"
          >
            <XCircle class="w-5 h-5" /> Cette demande a été définitivement rejetée.
          </div>
          <div v-else class="flex items-center justify-between">
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
              <div
                v-if="i < steps.length - 1"
                class="flex-1 h-px mx-2"
                :class="step.completed ? 'bg-teal-500' : 'bg-gray-200'"
              ></div>
            </template>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div class="lg:col-span-2 space-y-6">
            <div
              v-if="deposit.adminOverride"
              class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <span class="text-amber-600 font-bold">⚠️</span>
              <p class="text-amber-800 text-sm font-medium">
                Cette demande a été approuvée par passage outre administratif.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">
                Description
              </h2>
              <p class="text-gray-700 leading-relaxed">
                {{ deposit.summary || 'Aucune description fournie.' }}
              </p>
            </div>

            <div
              v-if="deposit.keywords?.length"
              class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft"
            >
              <h2
                class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2"
              >
                <Tag class="w-4 h-4" /> Mots-clés
              </h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="kw in deposit.keywords"
                  :key="kw"
                  class="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium"
                  >{{ kw }}</span
                >
              </div>
            </div>

            <div v-if="fileUrl" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2
                class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2"
              >
                <FileText class="w-4 h-4" /> Fichier
              </h2>
              <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FileText class="w-10 h-10 text-teal-600 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-navy-800 truncate">
                      {{ (deposit.file || '').split('/').pop() || 'Document joint' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ (getFileExtension(fileUrl) || '').toUpperCase() }} ·
                      {{ formatFileSize(deposit.fileSize) }}
                    </p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <a
                    :href="fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                  >
                    <Download class="w-4 h-4" /> Télécharger
                  </a>
                  <a
                    :href="getViewerUrl(fileUrlInline)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-xl text-sm font-medium hover:bg-navy-900 transition-colors"
                  >
                    <Eye class="w-4 h-4" /> Voir en ligne
                  </a>
                </div>
                <div v-if="isPdf(fileUrl)" class="mt-4">
                  <iframe
                    :src="fileUrlInline"
                    class="w-full h-96 rounded-xl border border-gray-200"
                    title="Aperçu PDF"
                  ></iframe>
                </div>
                <div
                  v-else-if="isViewableFile(fileUrl)"
                  class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <p class="text-sm text-amber-800">
                    <Eye class="w-4 h-4 inline mr-1" />
                    Ce format de fichier ne peut pas être prévisualisé directement.
                    <a
                      :href="getViewerUrl(fileUrlInline)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="underline hover:text-amber-600"
                    >
                      Cliquez ici pour l'ouvrir
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2
                class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2"
              >
                <MessageSquare class="w-4 h-4" /> Commentaire du responsable
              </h2>
              <p v-if="deposit.managerComment" class="text-gray-700">
                {{ deposit.managerComment }}
              </p>
              <p v-else class="text-gray-400 italic">Aucun commentaire.</p>
            </div>

            <div
              v-if="deposit.history?.length"
              class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft"
            >
              <h2
                class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2"
              >
                <Clock class="w-4 h-4" /> Historique
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
                    <p v-if="entry.comment" class="text-sm text-gray-500 italic mt-0.5">
                      « {{ entry.comment }} »
                    </p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ formatDateTime(entry.at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">
                Informations
              </h2>
              <div class="space-y-4 text-sm">
                <div v-if="deposit.authors?.length">
                  <span class="text-gray-500 block text-xs">Auteur(s)</span>
                  <span class="text-navy-800">{{ deposit.authors.join(', ') }}</span>
                </div>
                <div v-if="deposit.type">
                  <span class="text-gray-500 block text-xs">Type de document</span>
                  <span class="text-navy-800">{{ getTypeLabel(deposit.type) }}</span>
                </div>
                <div v-if="deposit.category">
                  <span class="text-gray-500 text-xs">Catégorie</span>
                  <span class="text-navy-800">{{ deposit.category.name }}</span>
                </div>
                <div v-if="deposit.publisher">
                  <span class="text-gray-500 text-xs flex items-center gap-1"
                    ><Building class="w-3 h-3" /> Éditeur</span
                  >
                  <span class="text-navy-800">{{ deposit.publisher }}</span>
                </div>
                <div v-if="deposit.isbn">
                  <span class="text-gray-500 text-xs flex items-center gap-1"
                    ><Hash class="w-3 h-3" /> ISBN</span
                  >
                  <span class="text-navy-800 font-mono">{{ deposit.isbn }}</span>
                </div>
                <div v-if="deposit.language">
                  <span class="text-gray-500 text-xs flex items-center gap-1"
                    ><Globe class="w-3 h-3" /> Langue</span
                  >
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

            <div
              v-if="deposit.cover_image"
              class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft"
            >
              <h2
                class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2"
              >
                <Image class="w-4 h-4" /> Couverture
              </h2>
              <img
                :src="deposit.cover_image"
                alt="Couverture"
                @click="showZoomModal = true"
                class="cursor-zoom-in w-full rounded-xl object-cover border border-gray-200 max-h-48"
              />
            </div>

            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2
                class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2"
              >
                <Calendar class="w-4 h-4" /> Chronologie
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
              <h2
                class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2"
              >
                <User class="w-4 h-4" /> Déposant
              </h2>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold"
                >
                  {{ deposit.submittedBy?.first_name?.charAt(0)
                  }}{{ deposit.submittedBy?.last_name?.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-navy-800">
                    {{ deposit.submittedBy?.first_name }} {{ deposit.submittedBy?.last_name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ deposit.submittedBy?.email }}</p>
                </div>
              </div>
            </div>

            <div
              v-if="deposit.assignedManagerId"
              class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft"
            >
              <h2
                class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2"
              >
                <User class="w-4 h-4" /> Responsable assigné
              </h2>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold"
                >
                  {{ getAssignee()?.first_name?.charAt(0)
                  }}{{ getAssignee()?.last_name?.charAt(0) }}
                </div>
                <p class="text-sm font-medium text-navy-800">
                  {{ getAssignee()?.first_name }} {{ getAssignee()?.last_name }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Zoom Image Modal -->
        <div
          v-if="showZoomModal"
          class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          @click="showZoomModal = false"
        >
          <div class="relative max-w-4xl max-h-[90vh]" @click.stop>
            <img
              :src="deposit.cover_image || deposit.cover_image_preview"
              alt="Couverture agrandie"
              class="max-w-full max-h-[85vh] rounded-xl object-contain border border-white/10 shadow-2xl"
            />
            <button
              class="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors cursor-pointer"
              @click="showZoomModal = false"
              title="Fermer"
            >
              <X class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">Actions</h2>

          <div
            v-if="statusInfoBanner"
            class="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            :class="statusInfoBanner.cls"
          >
            {{ statusInfoBanner.text }}
          </div>

          <div v-if="actionButtons.length" class="flex flex-wrap gap-3">
            <button
              v-for="act in actionButtons"
              :key="act.key"
              @click="runAction(act)"
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :class="VARIANT_CLASSES[act.variant]"
            >
              <component :is="act.icon" class="w-4 h-4" v-if="act.icon" />
              {{ act.label }}
            </button>
          </div>
          <p v-else class="text-sm text-gray-400 italic">
            Aucune action disponible pour ce statut.
          </p>
        </div>

        <Teleport to="body">
          <div
            v-if="showConfirmDialog"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            @click.self="isSubmitting ? null : (showConfirmDialog = false)"
          >
            <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
              <h3 class="text-lg font-semibold text-navy-800 mb-2">Confirmation</h3>
              <p class="text-sm text-gray-600 mb-4">
                Êtes-vous sûr de vouloir {{ confirmDef?.label?.toLowerCase() }} ?
              </p>

              <div v-if="confirmDef?.requiresComment" class="space-y-3">
                <label class="block text-sm font-medium text-navy-800"
                  >Justification <span class="text-red-600">*</span></label
                >
                <textarea
                  v-model="actionComment"
                  rows="4"
                  class="w-full bg-beige border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                  :class="
                    actionComment.length < confirmDef.minLength
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-teal-500'
                  "
                  :placeholder="`Justification (minimum ${confirmDef.minLength} caractères)...`"
                ></textarea>
                <div class="flex items-center justify-between text-sm">
                  <span
                    :class="
                      actionComment.length < confirmDef.minLength
                        ? 'text-red-600'
                        : 'text-green-600'
                    "
                    >{{ actionComment.length }} / {{ confirmDef.minLength }}</span
                  >
                  <span
                    v-if="actionComment.length < confirmDef.minLength"
                    class="text-red-600 text-xs"
                    >Minimum {{ confirmDef.minLength }} caractères requis</span
                  >
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
                  :disabled="isSubmitting || !commentValid"
                  class="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  :class="VARIANT_CLASSES[confirmDef?.variant]"
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
                {{
                  isSecondOpinion
                    ? 'Demander un 2ème avis'
                    : deposit.assignedManagerId
                      ? 'Réassigner'
                      : 'Assigner'
                }}
                à un responsable
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
                  {{ m.first_name }} {{ m.last_name }} ({{ m.open_deposits }} demande(s) ouverte(s))
                </option>
              </select>
              <div v-if="isSecondOpinion" class="space-y-3 mb-4">
                <label class="block text-sm font-medium text-navy-800"
                  >Justification <span class="text-red-600">*</span></label
                >
                <textarea
                  v-model="secondOpinionComment"
                  rows="4"
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="Justification (minimum 20 caractères)..."
                ></textarea>
                <div class="flex items-center justify-between text-sm">
                  <span
                    :class="secondOpinionComment.length < 20 ? 'text-red-600' : 'text-green-600'"
                    >{{ secondOpinionComment.length }} / 20</span
                  >
                  <span v-if="secondOpinionComment.length < 20" class="text-red-600 text-xs"
                    >Minimum 20 caractères requis</span
                  >
                </div>
              </div>
              <div
                v-if="availableManagers.length === 0"
                class="text-sm text-amber-600 mb-4 flex items-center gap-2"
              >
                <AlertCircle class="w-4 h-4" /> Aucun responsable disponible (tous ont des demandes
                en cours).
              </div>
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
                  :disabled="
                    isSubmitting ||
                    !assignManagerId ||
                    availableManagers.length === 0 ||
                    (isSecondOpinion && secondOpinionComment.length < 20)
                  "
                  class="px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
                  :class="isSecondOpinion ? 'bg-purple-600' : 'bg-green-600'"
                >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                  {{ isSubmitting ? 'Traitement...' : isSecondOpinion ? 'Demander' : 'Assigner' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      </template>
    </div>
  </AdminLayout>
</template>
