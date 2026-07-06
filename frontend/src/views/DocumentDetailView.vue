<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import DocumentCard from '../components/DocumentCard.vue'
import { ChevronRight, BookOpen, Lock, Eye, Download } from '@lucide/vue'
import api from '@/services/api'

const route = useRoute()

const isLoading = ref(true)
const hasError = ref(false)
const doc = ref(null)
const similarDocs = ref([])

const coverColors = [
  'from-[#1B2A4A] to-[#1E3368]',
  'from-[#0D9488] to-[#114F47]',
  'from-[#A1570F] to-[#6C3611]',
  'from-[#0E5F56] to-[#114038]',
  'from-[#7C3AED] to-[#5B21B6]',
  'from-[#DC2626] to-[#991B1B]',
  'from-[#E8A020] to-[#B8860B]',
  'from-[#6366F1] to-[#4338CA]',
]

function normalizeDoc(d) {
  return {
    id: d.id,
    title: d.title,
    authors: d.authors?.map(a => `${a.first_name} ${a.last_name}`) ?? [],
    category: d.category?.name ?? '',
    type: d.document_type ?? '',
    year: d.publication_year,
    access: d.status === 'published' ? 'public' : 'restricted',
    coverColor: coverColors[d.id % coverColors.length],
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/public/references/${route.params.id}`)
    doc.value = res.data.reference
    similarDocs.value = (res.data.similar ?? []).map(normalizeDoc)
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <PublicLayout>
    <div v-if="isLoading" class="flex justify-center py-32">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
    </div>

    <div v-else-if="hasError" class="flex flex-col items-center justify-center py-32 text-gray-400">
      <BookOpen class="w-16 h-16 mb-4 text-gray-300" />
      <p class="text-lg text-gray-500">Document introuvable</p>
      <p class="text-sm text-gray-400">Cette référence n'existe pas ou n'est pas encore publiée.</p>
    </div>

    <template v-else-if="doc">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
          <router-link to="/" class="hover:text-[#0D9488]">Accueil</router-link>
          <ChevronRight class="w-4 h-4" />
          <router-link to="/catalogue" class="hover:text-[#0D9488]">Catalogue</router-link>
          <ChevronRight class="w-4 h-4" />
          <span class="text-[#1B2A4A]">{{ doc.title }}</span>
        </nav>

        <!-- Login Banner -->
        <div class="bg-[#E8A020]/10 border-l-4 border-[#E8A020] p-4 rounded-r-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <BookOpen class="w-6 h-6 text-[#E8A020]" />
            <span class="text-[#E8A020] font-medium">
              Connectez-vous pour accéder à la lecture en ligne et au téléchargement
            </span>
          </div>
          <div class="flex gap-3">
            <router-link to="/connexion" class="px-5 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0F766E] transition-colors">
              Se connecter
            </router-link>
            <router-link to="/connexion" class="px-5 py-2 border border-[#1B2A4A] text-[#1B2A4A] rounded-lg font-medium hover:bg-[#1B2A4A]/5 transition-colors">
              S'inscrire
            </router-link>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Left Column -->
          <aside class="w-full lg:w-80 shrink-0">
            <div class="sticky top-24">
              <div class="bg-linear-to-br from-[#1B2A4A] to-[#2D4A7A] rounded-xl aspect-3/4 shadow-lg flex items-center justify-center mb-4">
                <BookOpen class="w-32 h-32 text-white/30" />
              </div>
              <div class="text-center mb-4">
                <span class="inline-flex items-center gap-2 bg-[#E8A020] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  <Lock class="w-4 h-4" />
                  Réservé aux membres inscrits
                </span>
              </div>
              <div class="flex items-center justify-center gap-6 text-[#6B7280]">
                <div class="flex items-center gap-2">
                  <Eye class="w-5 h-5" />
                  <span>{{ (doc.view_count ?? 0).toLocaleString('fr-FR') }} vues</span>
                </div>
                <div class="flex items-center gap-2">
                  <Download class="w-5 h-5" />
                  <span>{{ (doc.download_count ?? 0).toLocaleString('fr-FR') }} téléchargements</span>
                </div>
              </div>
            </div>
          </aside>

          <!-- Right Column -->
          <main class="flex-1">
            <h1 class="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-2" style="font-family: 'Playfair Display', serif">
              {{ doc.title }}
            </h1>
            <p v-if="doc.subtitle" class="text-lg text-[#6B7280] italic mb-6">{{ doc.subtitle }}</p>

            <!-- Authors -->
            <div v-if="doc.authors?.length" class="flex items-center gap-3 mb-6">
              <span class="text-[#1A1A2E]">
                {{ doc.authors.map(a => `${a.first_name} ${a.last_name}`).join(', ') }}
              </span>
            </div>

            <!-- Metadata Grid -->
            <div class="grid sm:grid-cols-2 gap-4 mb-6">
              <div v-if="doc.publisher" class="flex items-center gap-2">
                <span class="text-[#6B7280]">Éditeur:</span>
                <span class="text-[#1A1A2E] font-mono">{{ doc.publisher.name }}</span>
              </div>
              <div v-if="doc.publication_year" class="flex items-center gap-2">
                <span class="text-[#6B7280]">Année:</span>
                <span class="text-[#1A1A2E] font-mono">{{ doc.publication_year }}</span>
              </div>
              <div v-if="doc.isbn" class="flex items-center gap-2">
                <span class="text-[#6B7280]">ISBN:</span>
                <span class="text-[#1A1A2E] font-mono">{{ doc.isbn }}</span>
              </div>
              <div v-if="doc.language" class="flex items-center gap-2">
                <span class="text-[#6B7280]">Langue:</span>
                <span class="text-[#1A1A2E] font-mono">{{ { fr: 'Français', en: 'Anglais', autre: 'Autre' }[doc.language] ?? doc.language }}</span>
              </div>
              <div v-if="doc.document_type" class="flex items-center gap-2">
                <span class="text-[#6B7280]">Type:</span>
                <span class="bg-[#F1F0EC] px-3 py-1 rounded-full text-sm text-[#1B2A4A] capitalize">{{ doc.document_type }}</span>
              </div>
              <div v-if="doc.category" class="flex items-center gap-2">
                <span class="text-[#6B7280]">Catégorie:</span>
                <span class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-sm">{{ doc.category.name }}</span>
              </div>
              <div v-if="doc.pages" class="flex items-center gap-2">
                <span class="text-[#6B7280]">Pages:</span>
                <span class="text-[#1A1A2E] font-mono">{{ doc.pages }}</span>
              </div>
            </div>

            <!-- Keywords -->
            <div v-if="doc.keywords?.length" class="flex flex-wrap gap-2 mb-6">
              <span v-for="kw in doc.keywords" :key="kw.id" class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-sm border border-[#0D9488]/30">
                {{ kw.keyword }}
              </span>
            </div>

            <!-- Abstract -->
            <div v-if="doc.abstract" class="bg-[#F1F0EC] rounded-xl p-6 mb-6">
              <h2 class="font-semibold text-[#1B2A4A] mb-3">Résumé</h2>
              <p class="text-[#1A1A2E] leading-relaxed">{{ doc.abstract }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 mb-10">
              <button disabled class="flex-1 flex items-center justify-center gap-2 bg-[#E5E7EB] text-[#9CA3AF] px-6 py-3 rounded-xl font-medium cursor-not-allowed">
                <Lock class="w-5 h-5" />
                Lire en ligne
              </button>
              <button disabled class="flex-1 flex items-center justify-center gap-2 bg-[#E5E7EB] text-[#9CA3AF] px-6 py-3 rounded-xl font-medium cursor-not-allowed">
                <Lock class="w-5 h-5" />
                Télécharger
              </button>
            </div>

            <!-- Similar Documents -->
            <section v-if="similarDocs.length" class="border-t border-[#E5E7EB] pt-10">
              <h2 class="text-2xl font-bold text-[#1B2A4A] mb-6" style="font-family: 'Playfair Display', serif">
                Documents similaires
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DocumentCard v-for="d in similarDocs" :key="d.id" :document="d" />
              </div>
            </section>
          </main>
        </div>
      </div>
    </template>
  </PublicLayout>
</template>
