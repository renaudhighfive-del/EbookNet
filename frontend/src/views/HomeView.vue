<script setup>
import { ref, onMounted } from 'vue'
import {
  Search, BookOpen, Library, UserPlus, Users, Tag, Download,
  ArrowRight, Eye, Star, Scale, Cpu, HeartPulse, Feather, Globe, TrendingUp,
} from '@lucide/vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import DocumentCard from '../components/DocumentCard.vue'
import api from '@/services/api'

const isLoading = ref(true)
const hasError = ref(false)

const stats = ref({
  total_references: 0,
  total_authors: 0,
  total_categories: 0,
  total_downloads: 0,
})

const categories = ref([])
const recentDocs = ref([])
const featured = ref(null)

const categoryIcons = {
  'Droit': Scale,
  'Législation': Scale,
  'Informatique': Cpu,
  'Santé': HeartPulse,
  'Littérature': Feather,
  'Histoire': Globe,
  'Géographie': Globe,
  'Économie': TrendingUp,
}

function getCategoryIcon(name) {
  return categoryIcons[name] ?? BookOpen
}

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

function normalizeDoc(doc) {
  return {
    id: doc.id,
    title: doc.title,
    authors: doc.authors?.map(a => `${a.first_name} ${a.last_name}`) ?? [],
    category: doc.category?.name ?? '',
    type: doc.document_type ?? '',
    year: doc.publication_year,
    access: doc.status === 'published' ? 'public' : 'restricted',
    coverColor: coverColors[doc.id % coverColors.length],
  }
}

async function loadData() {
  try {
    const [statsRes, categoriesRes, latestRes, featuredRes] = await Promise.all([
      api.get('/public/stats'),
      api.get('/public/categories'),
      api.get('/public/references/latest'),
      api.get('/public/references/featured'),
    ])
    stats.value = statsRes.data
    categories.value = categoriesRes.data
    recentDocs.value = (latestRes.data ?? []).map(normalizeDoc)
    featured.value = featuredRes.data.reference ? normalizeDoc(featuredRes.data.reference) : null
  } catch (e) {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  setTimeout(() => {
    loadData()
  }, 1500)
})
</script>

<template>
  <PublicLayout>
    <div v-if="isLoading" class="flex justify-center py-32">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
    </div>

    <template v-else-if="hasError">
      <div class="flex flex-col items-center justify-center py-32 text-gray-400">
        <BookOpen class="w-16 h-16 mb-4 text-gray-300" />
        <p class="text-lg text-gray-500">Impossible de charger la page d'accueil</p>
        <p class="text-sm text-gray-400 mb-6">Vérifiez que le serveur backend est en cours d'exécution.</p>
        <router-link
          to="/catalogue"
          class="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-xl font-medium hover:bg-[#0F1322] transition-colors text-sm"
        >
          Accéder au catalogue
        </router-link>
      </div>
    </template>

    <template v-else>
      <!-- Hero Section -->
      <section class="relative bg-linear-to-b from-[#1B2A4A] via-[#1B2A4A] to-[#0D6B76] overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="stars" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
                <circle cx="35" cy="25" r="0.5" fill="white" />
                <circle cx="50" cy="5" r="1" fill="white" />
                <circle cx="20" cy="45" r="0.5" fill="white" />
                <circle cx="45" cy="40" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#stars)" />
          </svg>
        </div>

        <div class="relative max-w-6xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div class="text-center">
            <div class="mb-6">
              <span class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/80 font-medium">
                <Library class="w-3.5 h-3.5" />
                BIBLIOTHÈQUE NUMÉRIQUE DU BÉNIN
              </span>
            </div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Explorez notre <span class="text-[#E79F1F]">catalogue</span><br />documentaire
            </h1>
            <p class="text-slate-300 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
              {{ stats.total_references.toLocaleString('fr-FR') }} références académiques, mémoires et thèses disponibles en ligne pour étudiants, chercheurs et professionnels.
            </p>

            <!-- Search Bar -->
            <div class="max-w-2xl mx-auto mb-8">
              <router-link
                to="/recherche"
                class="flex bg-white rounded-xl p-2 shadow-xl items-center gap-2"
              >
               <!-- <Search class="w-4 h-4 text-slate-400 ml-2 shrink-0" /> -->
                <span class="flex-1 px-3 py-3 text-slate-400 text-sm text-left">Cliquez ici sur la bouton pour rechercher toutes les références publiées...</span>
                <span class="bg-[#1B2A4A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0F1322] transition-all duration-300 text-sm cursor-pointer">
                  Rechercher
                </span>
              </router-link>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap justify-center gap-3">
              <router-link
                to="/catalogue"
                class="inline-flex items-center gap-2 bg-[#0D9488] text-white px-7 py-3 rounded-lg font-semibold hover:bg-[#0E5F56] transition-all duration-300 text-sm"
              >
                <BookOpen class="w-4 h-4" />
                Parcourir le catalogue
              </router-link>
              <router-link
                to="/connexion"
                class="inline-flex items-center gap-2 border-2 border-white text-white px-7 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1B2A4A] active:scale-95 transition-all duration-200 text-sm"
              >
                <UserPlus class="w-4 h-4" />
                S'inscrire gratuitement
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Bar -->
      <section class="bg-[#F8F7F4] border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div class="p-4">
              <div class="flex items-center justify-center gap-3">
                <div class="w-10 h-10 bg-[#F2F4F9] rounded-xl flex items-center justify-center text-[#1B2A4A]">
                  <BookOpen class="w-5 h-5" />
                </div>
                <div class="text-left">
                  <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-0.5">{{ stats.total_references.toLocaleString('fr-FR') }}</div>
                  <div class="text-slate-500 text-[10px] uppercase tracking-wide font-semibold">Références</div>
                </div>
              </div>
            </div>
            <div class="p-4">
              <div class="flex items-center justify-center gap-3">
                <div class="w-10 h-10 bg-[#F2F4F9] rounded-xl flex items-center justify-center text-[#1B2A4A]">
                  <Users class="w-5 h-5" />
                </div>
                <div class="text-left">
                  <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-0.5">{{ stats.total_authors.toLocaleString('fr-FR') }}</div>
                  <div class="text-slate-500 text-[10px] uppercase tracking-wide font-semibold">Auteurs</div>
                </div>
              </div>
            </div>
            <div class="p-4">
              <div class="flex items-center justify-center gap-3">
                <div class="w-10 h-10 bg-[#F2F4F9] rounded-xl flex items-center justify-center text-[#1B2A4A]">
                  <Tag class="w-5 h-5" />
                </div>
                <div class="text-left">
                  <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-0.5">{{ stats.total_categories.toLocaleString('fr-FR') }}</div>
                  <div class="text-slate-500 text-[10px] uppercase tracking-wide font-semibold">Catégories</div>
                </div>
              </div>
            </div>
            <div class="p-4">
              <div class="flex items-center justify-center gap-3">
                <div class="w-10 h-10 bg-[#F2F4F9] rounded-xl flex items-center justify-center text-[#1B2A4A]">
                  <Download class="w-5 h-5" />
                </div>
                <div class="text-left">
                  <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-0.5">{{ stats.total_downloads.toLocaleString('fr-FR') }}</div>
                  <div class="text-slate-500 text-[10px] uppercase tracking-wide font-semibold">Téléchargements</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Popular Categories -->
      <section class="py-14 bg-[#F8F7F4]">
        <div class="max-w-6xl mx-auto px-6 lg:px-8">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-serif font-bold text-[#1B2A4A]">Catégories populaires</h2>
            <router-link to="/catalogue" class="text-[#0D9488] font-medium hover:underline text-xs flex items-center gap-1">
              Voir toutes <ArrowRight class="w-3 h-3" />
            </router-link>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              v-for="cat in categories" :key="cat.id"
              class="group bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 cursor-pointer"
              @click="$router.push(`/catalogue?category_id=${cat.id}`)"
            >
              <div class="w-9 h-9 bg-[#F2F4F9] rounded-lg flex items-center justify-center text-[#1B2A4A] mb-3 group-hover:bg-[#ECFFFD] group-hover:text-[#0D9488] transition-all duration-300">
                <component :is="getCategoryIcon(cat.name)" class="w-4 h-4" />
              </div>
              <h3 class="font-semibold text-[#1B2A4A] mb-1 text-sm">{{ cat.name }}</h3>
              <p class="text-slate-500 text-xs">{{ cat.references_count }} documents</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent documents -->
      <section class="py-14 bg-[#F8F7F4]">
        <div class="max-w-6xl mx-auto px-6 lg:px-8">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-serif font-bold text-[#1B2A4A]">Dernières références ajoutées</h2>
            <router-link to="/catalogue" class="text-[#0D9488] font-medium hover:underline text-xs flex items-center gap-1">
              Voir tout <ArrowRight class="w-3 h-3" />
            </router-link>
          </div>
          <div v-if="recentDocs.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DocumentCard v-for="doc in recentDocs" :key="doc.id" :document="doc" />
          </div>
          <div v-else class="text-center py-10 text-gray-400 text-sm">Aucune référence publiée pour le moment.</div>
        </div>
      </section>

      <!-- Featured document -->
      <section v-if="featured" class="py-14 bg-[#F8F7F4]">
        <div class="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 class="text-2xl font-serif font-bold text-[#1B2A4A] mb-7">À la une</h2>
          <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div class="grid md:grid-cols-5">
              <div class="md:col-span-2 aspect-4/3 bg-linear-to-br from-[#1B2A4A] to-[#1E3368] flex items-center justify-center relative overflow-hidden">
                <BookOpen class="w-20 h-20 text-white/10" />
                <div class="absolute top-4 left-4">
                  <span class="bg-[#E79F1F] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                    <Star class="w-3 h-3" /> À la une
                  </span>
                </div>
              </div>
              <div class="md:col-span-3 p-8 flex flex-col justify-between">
                <div>
                  <span class="inline-block bg-[#ECFFFD] text-[#0D9488] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
                    {{ featured.category }}
                  </span>
                  <h3 class="text-2xl font-serif font-bold text-[#1B2A4A] mb-3 leading-tight">
                    {{ featured.title }}
                  </h3>
                  <p class="text-slate-600 mb-3 text-sm">
                    Par <span class="text-[#1B2A4A] font-medium">{{ featured.authors.join(', ') }}</span>
                    <span class="text-slate-500"> · {{ featured.year }}</span>
                  </p>
                </div>
                <router-link
                  :to="`/catalogue/${featured.id}`"
                  class="inline-flex items-center gap-2 bg-[#1B2A4A] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#0F1322] transition-all duration-300 w-fit text-sm"
                >
                  Voir la fiche complète
                  <ArrowRight class="w-4 h-4" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </PublicLayout>
</template>
