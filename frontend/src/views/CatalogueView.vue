<script setup>
import { ref, computed, onMounted } from 'vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import DocumentCard from '../components/DocumentCard.vue'
import { X, SlidersHorizontal, Search, ChevronLeft, ChevronRight, BookOpen } from '@lucide/vue'
import api from '@/services/api'

const isLoading = ref(true)
const hasError = ref(false)

const categories = ref([])
const allDocuments = ref([])

const searchQuery = ref('')
const selectedCategory = ref(null)
const selectedType = ref(null)
const selectedLanguage = ref(null)
const sortOrder = ref('year')
const currentPage = ref(1)
const perPage = ref(12)

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
    subtitle: doc.subtitle,
    authors: doc.authors?.map((a) => `${a.first_name} ${a.last_name}`) ?? [],
    rawAuthors: doc.authors ?? [],
    category: doc.category?.name ?? '',
    categoryId: doc.category_id,
    type: doc.document_type ?? '',
    language: doc.language ?? '',
    year: doc.publication_year,
    abstract: doc.abstract,
    pages: doc.pages,
    isbn: doc.isbn,
    downloadCount: doc.download_count ?? 0,
    viewCount: doc.view_count ?? 0,
    access: doc.status === 'published' ? 'public' : 'restricted',
    coverColor: coverColors[doc.id % coverColors.length],
  }
}

const filteredDocuments = computed(() => {
  let docs = allDocuments.value

  if (selectedCategory.value) {
    docs = docs.filter((d) => d.categoryId === selectedCategory.value)
  }

  if (selectedType.value) {
    docs = docs.filter((d) => d.type === selectedType.value)
  }

  if (selectedLanguage.value) {
    docs = docs.filter((d) => d.language === selectedLanguage.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.authors.some((a) => a.toLowerCase().includes(q)) ||
        (d.abstract && d.abstract.toLowerCase().includes(q)) ||
        (d.subtitle && d.subtitle.toLowerCase().includes(q)),
    )
  }

  const sorted = [...docs]
  switch (sortOrder.value) {
    case 'year':
      sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      break
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'views':
      sorted.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      break
    case 'downloads':
      sorted.sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
      break
  }

  return sorted
})

const totalReferences = computed(() => filteredDocuments.value.length)
const lastPage = computed(() => Math.max(1, Math.ceil(totalReferences.value / perPage.value)))

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredDocuments.value.slice(start, start + perPage.value)
})

const pages = computed(() => {
  const p = []
  const lp = lastPage.value
  const cp = currentPage.value
  for (let i = 1; i <= lp; i++) {
    if (i <= 3 || i > lp - 2 || Math.abs(i - cp) <= 1) {
      p.push(i)
    }
  }
  return p
})

function goToPage(page) {
  if (page < 1 || page > lastPage.value) return
  currentPage.value = page
}

function setFilter(key, value) {
  currentPage.value = 1
  if (key === 'category') selectedCategory.value = selectedCategory.value === value ? null : value
  if (key === 'type') selectedType.value = selectedType.value === value ? null : value
  if (key === 'language') selectedLanguage.value = selectedLanguage.value === value ? null : value
}

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
  selectedType.value = null
  selectedLanguage.value = null
  sortOrder.value = 'year'
  currentPage.value = 1
}

function clearFilter(key) {
  currentPage.value = 1
  if (key === 'category') selectedCategory.value = null
  if (key === 'type') selectedType.value = null
  if (key === 'language') selectedLanguage.value = null
}

async function loadData() {
  isLoading.value = true
  hasError.value = false
  try {
    const [catRes, refRes] = await Promise.all([
      api.get('/public/categories'),
      api.get('/public/references', { params: { per_page: 999 } }),
    ])
    categories.value = catRes.data
    allDocuments.value = (refRes.data.data ?? refRes.data).map(normalizeDoc)
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <PublicLayout>
    <div class="flex-1 flex flex-col">
      <div v-if="isLoading" class="flex-1 flex justify-center items-center py-20">
        <div
          class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"
        ></div>
      </div>

      <template v-else-if="hasError" class="flex-1 flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
          <BookOpen class="w-16 h-16 mb-4 text-gray-300" />
          <p class="text-lg text-gray-500">Impossible de charger le catalogue</p>
          <p class="text-sm text-gray-400">
            Vérifiez que le serveur backend est en cours d'exécution.
          </p>
        </div>
      </template>

      <template v-else>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <!-- Page Title -->
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-bold text-[#1B2A4A] font-serif">Catalogue documentaire</h1>
              <p class="text-gray-500 text-sm mt-1">
                Explorez l'intégralité de notre fonds numérique.
              </p>
            </div>
            <span
              class="inline-block bg-[#0D9488]/10 text-[#0D9488] px-4 py-2 rounded-full text-sm font-semibold"
            >
              {{ totalReferences.toLocaleString('fr-FR') }} référence{{
                totalReferences > 1 ? 's' : ''
              }}
            </span>
          </div>

          <div class="flex flex-col lg:flex-row gap-8">
            <!-- Filters Sidebar -->
            <aside class="w-full lg:w-72 shrink-0">
              <div class="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 class="font-semibold text-[#1B2A4A] mb-5 flex items-center gap-2">
                  <SlidersHorizontal class="w-4 h-4 text-[#0D9488]" />
                  Filtres
                </h3>

                <!-- Search in filters -->
                <div class="mb-6">
                  <div class="relative">
                    <Search
                      class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Rechercher..."
                      class="w-full bg-[#F8F7F4] border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]"
                      @input="currentPage = 1"
                    />
                  </div>
                </div>

                <!-- Category Filter -->
                <div class="mb-6 pb-6 border-b border-gray-100">
                  <h4 class="font-semibold text-[#1B2A4A] mb-3 text-sm">Catégorie</h4>
                  <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
                    <template v-for="cat in categories" :key="cat.id">
                      <label
                        class="flex items-center gap-3 cursor-pointer hover:bg-[#F8F7F4] p-2 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          :checked="selectedCategory === cat.id"
                          class="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                          @change="setFilter('category', cat.id)"
                        />
                        <span class="text-gray-700 text-sm flex-1">{{ cat.name }}</span>
                        <span class="text-gray-400 text-xs font-mono"
                          >({{ cat.references_count }})</span
                        >
                      </label>
                    </template>
                  </div>
                </div>

                <!-- Type Filter -->
                <div class="mb-6 pb-6 border-b border-gray-100">
                  <h4 class="font-semibold text-[#1B2A4A] mb-3 text-sm">Type de document</h4>
                  <div class="space-y-2">
                    <label
                      v-for="type in [
                        'livre',
                        'memoire',
                        'these',
                        'article',
                        'revue',
                        'rapport',
                        'guide',
                        'autre',
                      ]"
                      :key="type"
                      class="flex items-center gap-3 cursor-pointer hover:bg-[#F8F7F4] p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        :checked="selectedType === type"
                        class="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        @change="setFilter('type', type)"
                      />
                      <span class="text-gray-700 text-sm flex-1 capitalize">{{ type }}</span>
                    </label>
                  </div>
                </div>

                <!-- Language Filter -->
                <div class="mb-6 pb-6 border-b border-gray-100">
                  <h4 class="font-semibold text-[#1B2A4A] mb-3 text-sm">Langue</h4>
                  <div class="space-y-2">
                    <label
                      v-for="lang in [
                        { value: 'fr', label: 'Français' },
                        { value: 'en', label: 'Anglais' },
                        { value: 'autre', label: 'Autre' },
                      ]"
                      :key="lang.value"
                      class="flex items-center gap-3 cursor-pointer hover:bg-[#F8F7F4] p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        :checked="selectedLanguage === lang.value"
                        class="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        @change="setFilter('language', lang.value)"
                      />
                      <span class="text-gray-700 text-sm flex-1">{{ lang.label }}</span>
                    </label>
                  </div>
                </div>

                <!-- Reset Button -->
                <button
                  @click="resetFilters"
                  class="w-full text-center text-[#0D9488] font-medium text-sm hover:underline"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            </aside>

            <!-- Main content -->
            <main class="flex-1">
              <!-- Top Bar -->
              <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <!-- Active Filter Chips -->
                <div class="flex flex-wrap gap-2">
                  <span
                    v-if="selectedCategory"
                    class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-xs flex items-center gap-2"
                  >
                    {{ categories.find((c) => c.id === selectedCategory)?.name ?? 'Catégorie' }}
                    <X
                      class="w-3 h-3 cursor-pointer hover:text-[#0D9488]"
                      @click="clearFilter('category')"
                    />
                  </span>
                  <span
                    v-if="selectedType"
                    class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-xs flex items-center gap-2"
                  >
                    {{ selectedType }}
                    <X
                      class="w-3 h-3 cursor-pointer hover:text-[#0D9488]"
                      @click="clearFilter('type')"
                    />
                  </span>
                  <span
                    v-if="selectedLanguage"
                    class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-xs flex items-center gap-2"
                  >
                    {{
                      { fr: 'Français', en: 'Anglais', autre: 'Autre' }[selectedLanguage] ??
                      selectedLanguage
                    }}
                    <X
                      class="w-3 h-3 cursor-pointer hover:text-[#0D9488]"
                      @click="clearFilter('language')"
                    />
                  </span>
                  <span
                    v-if="searchQuery"
                    class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-xs flex items-center gap-2"
                  >
                    "{{ searchQuery }}"
                    <X
                      class="w-3 h-3 cursor-pointer hover:text-[#0D9488]"
                      @click="
                        searchQuery = ''
                        currentPage = 1
                      "
                    />
                  </span>
                </div>

                <!-- Sort Dropdown -->
                <div class="flex items-center gap-2">
                  <span class="text-gray-600 text-sm">Trier par:</span>
                  <select
                    v-model="sortOrder"
                    class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] shadow-sm"
                  >
                    <option value="year">Plus récent</option>
                    <option value="title">Titre A-Z</option>
                    <option value="views">Plus consulté</option>
                    <option value="downloads">Plus téléchargé</option>
                  </select>
                </div>
              </div>

              <!-- Documents Grid -->
              <div
                v-if="paginatedDocuments.length"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <DocumentCard v-for="doc in paginatedDocuments" :key="doc.id" :document="doc" />
              </div>
              <div v-else class="text-center py-16 text-gray-400">
                <BookOpen class="w-12 h-12 mx-auto mb-3" />
                <p class="text-lg font-medium">Aucun document trouvé</p>
                <p class="text-sm mt-1">Essayez de modifier vos filtres de recherche.</p>
              </div>

              <!-- Pagination -->
              <div v-if="lastPage > 1" class="flex items-center justify-between mt-12">
                <div class="text-sm text-gray-500">Page {{ currentPage }} sur {{ lastPage }}</div>
                <div class="flex items-center gap-1">
                  <button
                    :disabled="currentPage <= 1"
                    class="p-2 rounded-lg hover:bg-white text-gray-500 hover:text-[#1B2A4A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    @click="goToPage(currentPage - 1)"
                  >
                    <ChevronLeft class="w-5 h-5" />
                  </button>
                  <template v-for="p in pages" :key="p">
                    <button
                      v-if="p === currentPage"
                      class="px-3 py-1.5 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium"
                    >
                      {{ p }}
                    </button>
                    <button
                      v-else
                      class="px-3 py-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-[#1B2A4A] transition-colors text-sm"
                      @click="goToPage(p)"
                    >
                      {{ p }}
                    </button>
                    <span
                      v-if="
                        p < lastPage &&
                        pages.indexOf(p) < pages.length - 1 &&
                        pages[pages.indexOf(p) + 1] !== p + 1
                      "
                      class="px-1 text-gray-400 text-sm"
                      >...</span
                    >
                  </template>
                  <button
                    :disabled="currentPage >= lastPage"
                    class="p-2 rounded-lg hover:bg-white text-gray-500 hover:text-[#1B2A4A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    @click="goToPage(currentPage + 1)"
                  >
                    <ChevronRight class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </template>
    </div>
  </PublicLayout>
</template>
