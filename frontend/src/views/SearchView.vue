<script setup>
import { ref, onMounted } from 'vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import { Search, BookOpen, ChevronLeft, ChevronRight } from '@lucide/vue'
import api from '@/services/api'

const showAdvanced = ref(false)
const searchQuery = ref('')
const hasSearched = ref(false)
const isLoading = ref(false)
const hasError = ref(false)

const searchResults = ref([])
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

const fields = ref(['title', 'abstract'])
const categoryId = ref('')
const documentType = ref('')
const language = ref('')
const yearFrom = ref('')
const yearTo = ref('')
const access = ref('all')

const categories = ref([])
const currentPage = ref(1)

async function loadCategories() {
  try {
    const res = await api.get('/public/categories')
    categories.value = res.data
  } catch {
    // silent
  }
}

async function performSearch(page = 1) {
  if (!searchQuery.value.trim()) return
  isLoading.value = true
  hasError.value = false
  hasSearched.value = true
  currentPage.value = page

  try {
    const params = { q: searchQuery.value, page, per_page: 12 }
    if (fields.value.length) params.fields = fields.value
    if (categoryId.value) params.category_id = categoryId.value
    if (documentType.value) params.document_type = documentType.value
    if (language.value) params.language = language.value
    if (yearFrom.value) params.year_from = yearFrom.value
    if (yearTo.value) params.year_to = yearTo.value

    const res = await api.get('/public/search', { params })
    searchResults.value = res.data.data ?? res.data
    pagination.value = {
      current_page: res.data.current_page ?? 1,
      last_page: res.data.last_page ?? 1,
      total: res.data.total ?? 0,
    }
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

function toggleField(field) {
  const idx = fields.value.indexOf(field)
  if (idx >= 0) fields.value.splice(idx, 1)
  else fields.value.push(field)
}

onMounted(loadCategories)
</script>

<template>
  <PublicLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Page Title -->
      <h1 class="text-3xl font-bold text-[#1B2A4A] mb-8 text-center" style="font-family: 'Playfair Display', serif">
        Recherche documentaire
      </h1>

      <!-- Search Bar -->
      <div class="bg-white rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4">
        <Search class="w-6 h-6 text-[#6B7280]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher dans le catalogue..."
          class="flex-1 text-lg text-[#1A1A2E] focus:outline-none"
          @keyup.enter="performSearch()"
        />
        <button
          @click="performSearch()"
          :disabled="isLoading"
          class="bg-[#0D9488] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#0F766E] transition-colors disabled:opacity-50"
        >
          <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span v-else>Rechercher</span>
        </button>
      </div>

      <!-- Simple / Advanced Toggle -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <button
          @click="showAdvanced = false"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          :class="!showAdvanced ? 'bg-[#1B2A4A] text-white' : 'bg-transparent text-[#6B7280] hover:text-[#1B2A4A]'"
        >
          Recherche simple
        </button>
        <button
          @click="showAdvanced = true"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          :class="showAdvanced ? 'bg-[#1B2A4A] text-white' : 'bg-transparent text-[#6B7280] hover:text-[#1B2A4A]'"
        >
          Recherche avancée
        </button>
      </div>

      <!-- Advanced Filters -->
      <div v-if="showAdvanced" class="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h3 class="font-semibold text-[#1B2A4A] mb-4">Filtres avancés</h3>

        <!-- Search In -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-[#1A1A2E] mb-3">Rechercher dans</h4>
          <div class="flex flex-wrap gap-3">
            <label v-for="f in [{ key: 'title', label: 'Titre' }, { key: 'abstract', label: 'Résumé' }, { key: 'authors', label: 'Auteurs' }, { key: 'keywords', label: 'Mots-clés' }, { key: 'isbn', label: 'ISBN' }, { key: 'subtitle', label: 'Sous-titre' }]" :key="f.key" class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="fields.includes(f.key)"
                class="rounded border-[#6B7280] text-[#0D9488] focus:ring-[#0D9488]"
                @change="toggleField(f.key)"
              />
              <span class="text-[#6B7280]">{{ f.label }}</span>
            </label>
          </div>
        </div>

        <!-- Category & Type & Language -->
        <div class="grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Catégorie</h4>
            <select v-model="categoryId" class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]">
              <option value="">Toutes les catégories</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Type de document</h4>
            <select v-model="documentType" class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]">
              <option value="">Tous les types</option>
              <option value="livre">Livre</option>
              <option value="memoire">Mémoire</option>
              <option value="these">Thèse</option>
              <option value="article">Article</option>
              <option value="revue">Revue</option>
              <option value="rapport">Rapport</option>
              <option value="guide">Guide</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Langue</h4>
            <select v-model="language" class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]">
              <option value="">Toutes les langues</option>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>

        <!-- Year & Access -->
        <div class="grid sm:grid-cols-4 gap-4 mb-6">
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Année de</h4>
            <input v-model="yearFrom" type="number" placeholder="1950" class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]" />
          </div>
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">à</h4>
            <input v-model="yearTo" type="number" placeholder="2024" class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]" />
          </div>
        </div>

        <!-- Search Button -->
        <button
          @click="performSearch()"
          :disabled="isLoading"
          class="w-full bg-[#0D9488] text-white py-3 rounded-xl font-medium hover:bg-[#0F766E] transition-colors disabled:opacity-50"
        >
          <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          Lancer la recherche
        </button>
      </div>

      <!-- Results -->
      <div v-if="hasSearched && !isLoading">
        <div v-if="hasError" class="text-center py-10 text-gray-400">
          <p>Une erreur est survenue lors de la recherche.</p>
        </div>

        <template v-else>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-[#1B2A4A]">
              {{ pagination.total }} résultat{{ pagination.total > 1 ? 's' : '' }}{{ searchQuery ? ` pour "${searchQuery}"` : '' }}
            </h2>
          </div>

          <!-- Results List -->
          <div v-if="searchResults.length" class="space-y-4">
            <template v-for="doc in searchResults" :key="doc.id">
              <div class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                <!-- Cover Thumb -->
                <div class="w-20 h-28 bg-gradient-to-br from-[#1B2A4A] to-[#2D4A7A] rounded-lg flex-shrink-0 flex items-center justify-center">
                  <BookOpen class="w-8 h-8 text-white/30" />
                </div>
                <!-- Content -->
                <div class="flex-1">
                  <router-link
                    :to="`/catalogue/${doc.id}`"
                    class="text-lg font-semibold text-[#1B2A4A] hover:text-[#0D9488] transition-colors block mb-1"
                  >
                    {{ doc.title }}
                  </router-link>
                  <p class="text-[#6B7280] text-sm mb-2">{{ doc.authors?.map(a => `${a.first_name} ${a.last_name}`).join(', ') ?? '' }}</p>
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span class="bg-[#0D9488]/10 text-[#0D9488] px-2 py-0.5 rounded-full text-xs">
                      {{ doc.category?.name ?? '' }}
                    </span>
                    <span class="bg-[#F1F0EC] text-[#6B7280] px-2 py-0.5 rounded-full text-xs">
                      {{ doc.document_type ?? '' }}
                    </span>
                    <span class="text-[#6B7280] text-xs font-mono">{{ doc.publication_year }}</span>
                  </div>
                  <p class="text-[#1A1A2E] text-sm line-clamp-2">{{ doc.abstract }}</p>
                </div>
              </div>
            </template>
          </div>

          <div v-else class="text-center py-16 text-gray-400">
            <BookOpen class="w-12 h-12 mx-auto mb-3" />
            <p class="text-lg">Aucun résultat trouvé</p>
            <p class="text-sm mt-1">Essayez de modifier vos critères de recherche.</p>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.last_page > 1" class="flex items-center justify-center gap-2 mt-10">
            <button
              :disabled="currentPage <= 1"
              class="p-2 rounded-lg hover:bg-[#F1F0EC] text-[#6B7280] disabled:opacity-30"
              @click="performSearch(currentPage - 1)"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <button
              v-for="p in pagination.last_page"
              :key="p"
              :class="p === currentPage ? 'px-4 py-2 rounded-lg bg-[#0D9488] text-white font-medium' : 'px-4 py-2 rounded-lg hover:bg-[#F1F0EC] text-[#6B7280]'"
              @click="performSearch(p)"
            >
              {{ p }}
            </button>
            <button
              :disabled="currentPage >= pagination.last_page"
              class="p-2 rounded-lg hover:bg-[#F1F0EC] text-[#6B7280] disabled:opacity-30"
              @click="performSearch(currentPage + 1)"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </template>
      </div>

      <!-- Initial state (no search yet) -->
      <div v-else-if="!hasSearched" class="text-center py-16 text-gray-400">
        <Search class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p class="text-lg text-gray-500">Effectuez une recherche dans le catalogue</p>
        <p class="text-sm mt-1">Plus de {{ categories.length }} catégories disponibles</p>
      </div>
    </div>
  </PublicLayout>
</template>
