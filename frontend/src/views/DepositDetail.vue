<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { userService } from '@/services/api/user.service'
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
} from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const deposit = ref(null)
const isLoading = ref(true)
const error = ref(null)

const statusConfig = {
  pending:             { label: 'En attente',        cls: 'bg-gray-100 text-gray-600',      icon: Clock },
  assigned:            { label: 'Assignée',           cls: 'bg-blue-100 text-blue-700',       icon: Send },
  approved_by_manager: { label: 'Validée (resp.)',   cls: 'bg-teal-100 text-teal-700',       icon: CheckCircle },
  rejected_by_manager: { label: 'Refusée (resp.)',   cls: 'bg-orange-100 text-orange-700',   icon: XCircle },
  second_review:       { label: 'Second avis',        cls: 'bg-purple-100 text-purple-700',   icon: Eye },
  approved:            { label: 'Approuvée',          cls: 'bg-green-100 text-green-700',     icon: CheckCircle },
  rejected:            { label: 'Rejetée',            cls: 'bg-red-100 text-red-700',         icon: XCircle },
  published:           { label: 'Publiée',            cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
}

function getStatus(s) {
  return statusConfig[s] ?? { label: s, cls: 'bg-gray-100 text-gray-500', icon: AlertCircle }
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

onMounted(async () => {
  try {
    const data = await userService.getDepositById(route.params.id)
    deposit.value = data.deposit_request
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les détails de la demande.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <AuthenticatedLayout>
    <div>
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <router-link
          to="/my-documents"
          class="text-gray-500 hover:text-navy-800 flex items-center gap-1 text-sm"
        >
          <ArrowLeft class="w-4 h-4" />
          Retour à mes dépôts
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Content -->
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
          <!-- Main Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">Description</h2>
              <p class="text-gray-700 leading-relaxed">{{ deposit.description || 'Aucune description fournie.' }}</p>
            </div>

            <!-- Reviews Timeline -->
            <div v-if="deposit.reviews && deposit.reviews.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MessageSquare class="w-4 h-4" />
                Avis des examinateurs
              </h2>
              <div class="space-y-4">
                <div
                  v-for="review in deposit.reviews"
                  :key="review.id"
                  class="flex gap-3 p-4 bg-gray-50 rounded-xl"
                >
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    :class="review.decision === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    <component :is="review.decision === 'approved' ? CheckCircle : XCircle" class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-navy-800">
                        {{ review.reviewer?.first_name }} {{ review.reviewer?.last_name }}
                      </span>
                      <span class="text-xs text-gray-400">({{ review.reviewer_role }})</span>
                    </div>
                    <p class="text-sm text-gray-600" v-if="review.justification">
                      {{ review.justification }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">{{ formatDateTime(review.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Linked Reference -->
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

            <!-- Rejection Reason -->
            <div v-if="deposit.rejection_reason" class="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h2 class="text-sm font-bold text-red-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <XCircle class="w-4 h-4" />
                Motif du rejet
              </h2>
              <p class="text-red-700">{{ deposit.rejection_reason }}</p>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Metadata -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
              <h2 class="text-sm font-bold text-navy-800 uppercase tracking-wide mb-4">Informations</h2>
              <div class="space-y-4 text-sm">
                <div>
                  <span class="text-gray-500 block text-xs">Titre</span>
                  <span class="text-navy-800 font-medium">{{ deposit.title }}</span>
                </div>
                <div v-if="deposit.author">
                  <span class="text-gray-500 block text-xs">Auteur(s)</span>
                  <span class="text-navy-800">{{ deposit.author }}</span>
                </div>
                <div v-if="deposit.category">
                  <span class="text-gray-500 block text-xs">Catégorie</span>
                  <span class="inline-block bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ deposit.category.name }}
                  </span>
                </div>
                <div v-if="deposit.publication_year">
                  <span class="text-gray-500 block text-xs">Année de publication</span>
                  <span class="text-navy-800 font-mono">{{ deposit.publication_year }}</span>
                </div>
                <div v-if="deposit.proposed_file">
                  <span class="text-gray-500 block text-xs">Fichier proposé</span>
                  <span class="text-navy-800 text-xs break-all">{{ deposit.proposed_file }}</span>
                </div>
              </div>
            </div>

            <!-- Timeline -->
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
                    <p class="text-sm text-navy-800">{{ formatDateTime(deposit.created_at) }}</p>
                  </div>
                </div>
                <div v-if="deposit.assignedManager" class="flex items-start gap-3">
                  <div class="w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0"></div>
                  <div>
                    <p class="text-xs text-gray-500">Assignée à</p>
                    <p class="text-sm text-navy-800">
                      {{ deposit.assignedManager.first_name }} {{ deposit.assignedManager.last_name }}
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

            <!-- Applicant Info -->
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
  </AuthenticatedLayout>
</template>