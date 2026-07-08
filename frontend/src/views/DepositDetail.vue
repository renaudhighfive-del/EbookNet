<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { userService } from '@/services/api/user.service'
import { useDepositsStore } from '@/stores/deposits'
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
  Download,
} from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const depositsStore = useDepositsStore()
const deposit = ref(null)
const isLoading = ref(true)
const error = ref(null)
const isAdmin = ref(false)

const statusConfig = {
  pending:             { label: 'En attente',        cls: 'bg-gray-100 text-gray-600',      icon: Clock },
  assigned:            { label: 'Assignée',           cls: 'bg-blue-100 text-blue-700',       icon: Send },
  manager_approved:    { label: 'Validée (resp.)',   cls: 'bg-teal-100 text-teal-700',       icon: CheckCircle },
  manager_rejected:    { label: 'Refusée (resp.)',   cls: 'bg-orange-100 text-orange-700',   icon: XCircle },
  second_opinion:      { label: 'Second avis',        cls: 'bg-purple-100 text-purple-700',   icon: Eye },
  approved_published:  { label: 'Publiée',            cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  rejected:            { label: 'Rejetée',            cls: 'bg-red-100 text-red-700',         icon: XCircle },
}

function getStatus(s) {
  return statusConfig[s] ?? { label: s, cls: 'bg-gray-100 text-gray-500', icon: AlertCircle }
}

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
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function viewReference() {
  if (deposit.value.reference?.id) {
    router.push(`/catalogue/${deposit.value.reference.id}`)
  }
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
  // For office documents, use Google Docs Viewer
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(getFileExtension(url))) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }
  // For other files, direct link
  return url
}

function getPdfViewerUrl(url) {
  if (!url) return '#'
  // Use browser's built-in PDF viewer with a nice UI
  return `${url}#toolbar=1&navpanes=1&scrollbar&view=FitH`
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return 'Taille inconnue'
  const sizes = ['o', 'Ko', 'Mo', 'Go', 'To']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const isUserAdmin = authStore.userRole === 'admin'

onMounted(async () => {
  isAdmin.value = authStore.userRole === 'admin'
  try {
    if (isAdmin.value && route.params.id?.startsWith('DEP-')) {
      const data = await depositsStore.fetchDeposit(route.params.id)
      deposit.value = data
    } else {
      const data = await userService.getDepositById(route.params.id)
      deposit.value = data.deposit_request
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Impossible de charger les détails de la demande.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <component :is="isAdmin ? AdminLayout : AuthenticatedLayout">
    <div>
      <div class="flex items-center gap-4 mb-6">
        <router-link
          :to="isAdmin ? '/admin/demandes' : '/my-documents'"
          class="text-gray-500 hover:text-navy-800 flex items-center gap-1 text-sm"
        >
          <ArrowLeft class="w-4 h-4" />
          {{ isAdmin ? 'Retour aux demandes' : 'Retour à mes dépôts' }}
        </router-link>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <template v-else-if="deposit">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-navy-800 font-serif mb-2">{{ deposit.title }}</h1>
            <p class="text-gray-500">Demande de dépôt documentaire</p>
          </div>
          <span
            :class="`px-4 py-2 rounded-full text-sm font-semibold shrink-0 ${getStatus(deposit.status).cls}`"
          >
            {{ getStatus(deposit.status).label }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">Description</h2>
              <p class="text-gray-700 leading-relaxed">{{ deposit.summary || deposit.description || 'Aucune description fournie.' }}</p>
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
                    <p v-if="entry.comment" class="text-sm text-gray-500 italic mt-0.5">{{ entry.comment }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ formatDateTime(entry.at) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="deposit.reference" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <BookOpen class="w-4 h-4" />
                Référence associée
              </h2>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-navy-800 font-medium">{{ deposit.reference.title }}</p>
                  <p class="text-sm text-gray-500 mt-1">Publiée dans le catalogue</p>
                </div>
                <button
                  @click="viewReference"
                  class="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  Voir dans le catalogue
                </button>
              </div>
            </div>

            <div v-if="deposit.adminDecisionComment && deposit.status === 'rejected'" class="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h2 class="text-sm font-bold text-red-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <XCircle class="w-4 h-4" />
                Motif du rejet
              </h2>
              <p class="text-red-700">{{ deposit.adminDecisionComment }}</p>
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
                <div v-if="deposit.authors?.length || deposit.author">
                  <span class="text-gray-500 block text-xs">Auteur(s)</span>
                  <span class="text-navy-800">
                    {{ deposit.authors?.join(', ') || deposit.author }}
                  </span>
                </div>
                <div v-if="deposit.type">
                  <span class="text-gray-500 block text-xs">Type de document</span>
                  <span class="inline-block bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ getTypeLabel(deposit.type) }}
                  </span>
                </div>
                <div v-if="deposit.category">
                  <span class="text-gray-500 block text-xs">Catégorie</span>
                  <span class="inline-block bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ deposit.category.name }}
                  </span>
                </div>
                <div v-if="deposit.publisher">
                  <span class="text-gray-500 block text-xs flex items-center gap-1">
                    <Building class="w-3 h-3" />
                    Éditeur
                  </span>
                  <span class="text-navy-800">{{ deposit.publisher }}</span>
                </div>
                <div v-if="deposit.isbn">
                  <span class="text-gray-500 block text-xs flex items-center gap-1">
                    <Hash class="w-3 h-3" />
                    ISBN
                  </span>
                  <span class="text-navy-800 font-mono">{{ deposit.isbn }}</span>
                </div>
                <div v-if="deposit.language">
                  <span class="text-gray-500 block text-xs flex items-center gap-1">
                    <Globe class="w-3 h-3" />
                    Langue
                  </span>
                  <span class="text-navy-800">{{ getLanguageLabel(deposit.language) }}</span>
                </div>
                <div v-if="deposit.year || deposit.publication_year">
                  <span class="text-gray-500 block text-xs">Année de publication</span>
                  <span class="text-navy-800 font-mono">{{ deposit.year || deposit.publication_year }}</span>
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
              <img
                :src="deposit.cover_image || deposit.cover_image_preview"
                alt="Couverture du document"
                class="w-full rounded-xl object-cover border border-gray-200 max-h-60"
              />
            </div>

            <div v-if="deposit.proposed_file_url || deposit.fileUrl" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <FileText class="w-4 h-4" />
                Fichier
              </h2>
              <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FileText class="w-10 h-10 text-teal-600 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-navy-800 truncate">
                      {{ (deposit.proposed_file || deposit.file || '').split('/').pop() || 'Document joint' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ getFileExtension(deposit.proposed_file_url || deposit.fileUrl || '') | upper }} ·
                      {{ formatFileSize(deposit.file_size) }}
                    </p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <a
                    :href="deposit.proposed_file_url || deposit.fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                  >
                    <Download class="w-4 h-4" />
                    Télécharger
                  </a>
                  <a
                    :href="getViewerUrl(deposit.proposed_file_url || deposit.fileUrl)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-xl text-sm font-medium hover:bg-navy-900 transition-colors"
                  >
                    <Eye class="w-4 h-4" />
                    Voir en ligne
                  </a>
                </div>
                <div v-if="isPdf(deposit.proposed_file_url || deposit.fileUrl)" class="mt-4">
                  <iframe
                    :src="getPdfViewerUrl(deposit.proposed_file_url || deposit.fileUrl)"
                    class="w-full h-96 rounded-xl border border-gray-200"
                    title="Aperçu PDF"
                  ></iframe>
                </div>
                <div v-else-if="isViewableFile(deposit.proposed_file_url || deposit.fileUrl)" class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p class="text-sm text-amber-800">
                    <Eye class="w-4 h-4 inline mr-1" />
                    Ce format de fichier ne peut pas être prévisualisé directement. 
                    <a :href="getViewerUrl(deposit.proposed_file_url || deposit.fileUrl)" target="_blank" rel="noopener noreferrer" class="underline hover:text-amber-600">
                      Cliquez ici pour l'ouvrir
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                Chronologie
              </h2>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 mt-1.5 rounded-full bg-teal-600 shrink-0"></div>
                  <div>
                    <p class="text-xs text-gray-500">Soumise le</p>
                    <p class="text-sm text-navy-800">{{ formatDateTime(deposit.submittedAt || deposit.created_at) }}</p>
                  </div>
                </div>
                <div v-if="deposit.assignedManagerId || deposit.assignedManager" class="flex items-start gap-3">
                  <div class="w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0"></div>
                  <div>
                    <p class="text-xs text-gray-500">Assignée à</p>
                    <p class="text-sm text-navy-800">
                      {{ deposit.assignedManager?.first_name }} {{ deposit.assignedManager?.last_name }}
                    </p>
                  </div>
                </div>
                <div v-if="deposit.updated_at !== deposit.created_at" class="flex items-start gap-3">
                  <div class="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0"></div>
                  <div>
                    <p class="text-xs text-gray-500">Dernière mise à jour</p>
                    <p class="text-sm text-navy-800">{{ formatDateTime(deposit.updated_at) }}</p>
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
                  {{ deposit.applicant?.first_name?.charAt(0) }}{{ deposit.applicant?.last_name?.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-navy-800">
                    {{ deposit.applicant?.first_name }} {{ deposit.applicant?.last_name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ deposit.applicant?.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </component>
</template>
