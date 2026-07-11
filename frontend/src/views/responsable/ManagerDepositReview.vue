<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'
import { useDepositsStore } from '@/stores/deposits'
import { useToastStore } from '@/stores/toast'
import { managerService } from '@/services/api/manager.service'
import { X } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const store = useDepositsStore()
const toast = useToastStore()

const deposit = ref(null)
const isLoading = ref(true)
const error = ref(null)
const isSubmitting = ref(false)
const showZoomModal = ref(false)

const decision = ref(null)
const justification = ref('')

const fetchDetails = async () => {
  try {
    deposit.value = await store.fetchDeposit(route.params.id)
    // S'assurer que le statut de départ est cohérent pour l'examen
    if (deposit.value && !['assigned', 'second_opinion'].includes(deposit.value.status)) {
      decision.value = deposit.value.status === 'manager_approved' ? 'approve' : 'reject'
      justification.value = deposit.value.managerComment || ''
    }
  } catch (err) {
    error.value = err.message || 'Impossible de charger la demande.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDetails()
})

const fileUrl = computed(() => {
  if (!deposit.value) return null
  return managerService.getDepositFileUrl(deposit.value.id)
})

const fileUrlInline = computed(() => {
  if (!deposit.value) return null
  return managerService.getDepositFileUrl(deposit.value.id, true)
})

const isReadOnly = computed(() => {
  return deposit.value && !['assigned', 'second_opinion'].includes(deposit.value.status)
})

const canSubmit = computed(() => {
  if (isReadOnly.value) return false
  if (!decision.value) return false
  if (decision.value === 'reject' && justification.value.length < 50) return false
  return true
})

function getFileExtension(file) {
  if (!file) return ''
  const ext = file.split('.').pop()
  return ext ? ext.toLowerCase() : ''
}

function isPdf(file) {
  return getFileExtension(file) === 'pdf'
}

function getPdfViewerUrl(url) {
  if (!url) return '#'
  return `${url}#toolbar=1&navpanes=1&scrollbar&view=FitH`
}

function getViewerUrl(url) {
  if (!url) return '#'
  const ext = getFileExtension(url)
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }
  return url
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  isSubmitting.value = true
  try {
    if (decision.value === 'approve') {
      await managerService.approveDeposit(deposit.value.id)
      toast.success('Demande validée avec succès.')
    } else {
      await managerService.rejectDeposit(deposit.value.id, justification.value)
      toast.success('Demande refusée avec succès.')
    }
    router.push('/manager/deposits')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la soumission de la décision.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <ResponsableLayout>
    <template #title>
      <div class="flex items-center gap-2">
        <router-link
          to="/manager/deposits"
          class="text-gray-300 hover:text-white flex items-center gap-1 text-sm font-medium"
        >
          ← Retour
        </router-link>
        <span>|</span>
        <span>Examiner une demande</span>
      </div>
    </template>

    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <p class="text-red-700">{{ error }}</p>
      <router-link to="/manager/deposits" class="mt-4 inline-block text-teal-600 font-medium hover:underline text-sm">
        Retour à la liste
      </router-link>
    </div>

    <template v-else-if="deposit">
      <!-- Status Banner -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center gap-3">
        <span class="text-2xl">📋</span>
        <p class="text-blue-800 font-medium">
          {{ isReadOnly ? 'Cette demande a déjà été examinée.' : 'Cette demande vous est assignée pour examen.' }}
          <span class="text-xs opacity-75 font-normal block">Statut actuel : {{ store.getStatusConfig(deposit.status).label }}</span>
        </p>
      </div>

      <!-- Warning Banner -->
      <div v-if="store.getAgingDays(deposit.submittedAt) >= 3 && !isReadOnly" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span class="text-2xl">⚠️</span>
        <p class="text-amber-800 font-medium">
          Cette demande est en attente depuis {{ store.getAgingDays(deposit.submittedAt) }} jours.
        </p>
      </div>

      <!-- Split View -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Left Panel: Request Info -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-soft border border-gray-100">
          <div class="bg-navy-50 px-6 py-4 border-b border-navy-100">
            <h3 class="text-navy-800 font-semibold flex items-center gap-2">
              <span class="text-xl">📄</span> Détails de la demande
            </h3>
          </div>
          <div class="p-6 space-y-6">
            <!-- Cover or Placeholder -->
            <div v-if="deposit.cover_image" class="w-full flex justify-center mb-6">
              <img :src="deposit.cover_image" alt="Couverture" @click="showZoomModal = true" class="cursor-zoom-in rounded-xl h-56 object-cover border border-gray-200 shadow-sm" />
            </div>
            <div
              v-else
              class="bg-gradient-to-br from-navy-100 to-navy-200 rounded-xl w-full h-56 flex items-center justify-center mb-6"
            >
              <span class="text-6xl text-navy-600/60">📗</span>
            </div>

            <!-- Metadata List -->
            <div class="space-y-4 text-sm">
              <div>
                <span class="text-gray-500 block text-xs">Titre</span>
                <span class="text-navy-800 font-medium text-base">{{ deposit.title }}</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-gray-500 block text-xs">Type</span>
                  <span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ store.getTypeLabel(deposit.type) }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 block text-xs">Catégorie</span>
                  <span class="text-gray-700 font-medium">{{ deposit.category?.name || '—' }}</span>
                </div>
              </div>
              <div>
                <span class="text-gray-500 block text-xs">Auteurs</span>
                <span class="text-navy-800 font-medium">{{ deposit.authors?.join(', ') || '—' }}</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-gray-500 block text-xs">Éditeur</span>
                  <span class="text-gray-700">{{ deposit.publisher || '—' }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block text-xs">Année</span>
                  <span class="text-gray-700 font-mono font-medium">{{ deposit.year || '—' }}</span>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <span class="text-gray-500 block text-xs">Langue</span>
                  <span class="text-gray-700">{{ store.getLanguageLabel(deposit.language) }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block text-xs">Pages</span>
                  <span class="text-gray-700 font-mono">{{ deposit.pages || '—' }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block text-xs">ISBN</span>
                  <span class="text-gray-700 font-mono">{{ deposit.isbn || '—' }}</span>
                </div>
              </div>
              <div v-if="deposit.keywords?.length">
                <span class="text-gray-500 block text-xs mb-1">Mots-clés</span>
                <div class="flex flex-wrap gap-2">
                  <span v-for="kw in deposit.keywords" :key="kw" class="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">
                    {{ kw }}
                  </span>
                </div>
              </div>
              <div>
                <span class="text-gray-500 block text-xs">Résumé</span>
                <p class="text-gray-700 leading-relaxed mt-1 whitespace-pre-line">
                  {{ deposit.summary || 'Aucun résumé ou description fourni.' }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <span class="text-gray-500 block text-xs">Déposant</span>
                  <span class="text-navy-800 font-medium">
                    {{ deposit.submittedBy ? `${deposit.submittedBy.first_name} ${deposit.submittedBy.last_name}` : '—' }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 block text-xs">Soumis le</span>
                  <span class="text-gray-700 font-mono">{{ store.formatDate(deposit.submittedAt) }}</span>
                </div>
              </div>
            </div>

            <div v-if="fileUrl" class="pt-4 border-t border-gray-200">
              <a
                :href="fileUrl"
                target="_blank"
                download
                class="w-full flex items-center justify-center gap-2 border border-navy-700 text-navy-700 py-3 rounded-xl font-medium hover:bg-navy-50 transition-colors"
              >
                📥 Télécharger le fichier pour examen
              </a>
            </div>
          </div>
        </div>

         <div v-if="showZoomModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-300" @click="showZoomModal = false">
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

        <!-- Right Panel: PDF Preview -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-soft border border-gray-100 flex flex-col">
          <div
            class="bg-navy-50 px-6 py-4 border-b border-navy-100 flex items-center justify-between"
          >
            <h3 class="text-navy-800 font-semibold flex items-center gap-2">
              <span class="text-xl">📖</span> Prévisualisation
            </h3>
            <a v-if="fileUrl" :href="getViewerUrl(fileUrl)" target="_blank" class="text-xs text-teal-600 hover:underline">
              Ouvrir dans un nouvel onglet
            </a>
          </div>
          <div class="p-6 bg-gray-50 flex-1 min-h-[450px] flex items-center justify-center">
            <iframe v-if="fileUrlInline && isPdf(deposit.file)" :src="fileUrlInline"
              class="w-full h-full min-h-[500px] rounded-xl border border-gray-200" title="Aperçu PDF"></iframe>
            <div v-else class="text-center text-gray-500 p-8">
              <div class="text-6xl mb-3">📄</div>
              <p class="text-sm font-medium">Prévisualisation du document</p>
              <p class="text-xs text-gray-400 mt-2">Le document n'est pas au format PDF ou aucun fichier n'a été joint.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Decision Section -->
      <div class="bg-white rounded-2xl shadow-soft border-t-4 border-teal-600 p-8 border border-gray-100">
        <div class="mb-6">
          <h3 class="text-xl font-bold text-navy-800 font-serif mb-2">⚖️ Votre décision</h3>
          <p class="text-gray-600 text-sm">
            Votre avis sera transmis à l'administrateur pour la publication ou le rejet final.
          </p>
        </div>

        <!-- Decision Buttons -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <button
            @click="isReadOnly ? null : decision = 'approve'"
            :disabled="isReadOnly"
            class="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-colors border"
            :class="[
              decision === 'approve'
                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
              isReadOnly ? 'opacity-80 cursor-not-allowed' : ''
            ]"
          >
            ✅ Valider cette demande
          </button>
          <button
            @click="isReadOnly ? null : decision = 'reject'"
            :disabled="isReadOnly"
            class="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-colors border"
            :class="[
              decision === 'reject'
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
              isReadOnly ? 'opacity-80 cursor-not-allowed' : ''
            ]"
          >
            ❌ Refuser cette demande
          </button>
        </div>

        <!-- Rejection Justification -->
        <div v-if="decision === 'reject'" class="mt-4">
          <div class="space-y-3">
            <label for="justification" class="block text-sm font-medium text-navy-800">
              Justification du refus <span class="text-red-600">*</span>
            </label>
            <p class="text-gray-500 text-sm">
              La justification est obligatoire et doit être clairement formulée pour le déposant.
            </p>
            <textarea
              id="justification"
              v-model="justification"
              :disabled="isReadOnly"
              :class="[
                'w-full rounded-xl px-4 py-3 text-gray-800 focus:outline-none border-2',
                justification.length < 50 && !isReadOnly ? 'border-red-300' : 'border-gray-200',
                isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
              ]"
              rows="6"
              placeholder="Expliquez les raisons du refus de cette demande..."
            ></textarea>
            <div class="flex items-center justify-between text-sm" v-if="!isReadOnly">
              <span :class="justification.length < 50 ? 'text-red-600' : 'text-gray-500'">
                {{ justification.length }} / minimum 50 caractères
              </span>
            </div>
            <p v-if="justification.length < 50 && !isReadOnly" class="text-red-600 text-sm flex items-center gap-1">
              ⚠️ La justification doit contenir au moins 50 caractères
            </p>
          </div>
        </div>

        <!-- Submit -->
        <div class="mt-6" v-if="!isReadOnly">
          <button
            @click="handleSubmit"
            :disabled="!canSubmit || isSubmitting"
            class="w-full py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
            :class="
              canSubmit && !isSubmitting
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            "
          >
            <span v-if="isSubmitting" class="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></span>
            <span>{{ isSubmitting ? 'Soumission...' : 'Soumettre ma décision' }}</span>
          </button>
        </div>
      </div>
    </template>
  </ResponsableLayout>
</template>
