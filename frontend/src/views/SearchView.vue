<script setup>
import { ref } from 'vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import { Search, BookOpen, ChevronLeft, ChevronRight } from '@lucide/vue'

const showAdvanced = ref(true)
const searchQuery = ref('droit')
const hasSearched = ref(true)

const searchResults = ref([
  {
    id: 1,
    title: 'Introduction au Droit Constitutionnel Béninois',
    authors: ['Prof. Koffi Adanlété'],
    category: 'Droit & Législation',
    type: 'Livre',
    year: 2021,
    abstract:
      'Cet ouvrage propose une analyse approfondie des principes du droit constitutionnel béninois.',
  },
  {
    id: 2,
    title: 'Droit Constitutionnel Comparé',
    authors: ['Dr. Léon Houessou'],
    category: 'Droit & Législation',
    type: 'Livre',
    year: 2019,
    abstract: "Une comparaison des systèmes constitutionnels d'Afrique de l'Ouest.",
  },
])
</script>

<template>
  <PublicLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Page Title -->
      <h1
        class="text-3xl font-bold text-[#1B2A4A] mb-8 text-center"
        style="font-family: 'Playfair Display', serif"
      >
        Recherche avancée
      </h1>

      <!-- Search Bar -->
      <div class="bg-white rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4">
        <Search class="w-6 h-6 text-[#6B7280]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher dans le catalogue..."
          class="flex-1 text-lg text-[#1A1A2E] focus:outline-none"
          @keyup.enter="performSearch"
        />
        <button
          @click="performSearch"
          class="bg-[#0D9488] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#0F766E] transition-colors"
        >
          Rechercher
        </button>
      </div>

      <!-- Simple / Advanced Toggle -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <button
          @click="showAdvanced = false"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          :class="
            !showAdvanced
              ? 'bg-[#1B2A4A] text-white'
              : 'bg-transparent text-[#6B7280] hover:text-[#1B2A4A]'
          "
        >
          Recherche simple
        </button>
        <button
          @click="showAdvanced = true"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          :class="
            showAdvanced
              ? 'bg-[#1B2A4A] text-white'
              : 'bg-transparent text-[#6B7280] hover:text-[#1B2A4A]'
          "
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
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked
                class="rounded border-[#6B7280] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span class="text-[#6B7280]">Titre</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked
                class="rounded border-[#6B7280] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span class="text-[#6B7280]">Auteurs</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked
                class="rounded border-[#6B7280] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span class="text-[#6B7280]">Résumé</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked
                class="rounded border-[#6B7280] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span class="text-[#6B7280]">Mots-clés</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                class="rounded border-[#6B7280] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span class="text-[#6B7280]">Éditeur</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                class="rounded border-[#6B7280] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span class="text-[#6B7280]">ISBN</span>
            </label>
          </div>
        </div>

        <!-- Category & Type & Language -->
        <div class="grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Catégorie</h4>
            <select
              class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            >
              <option>Toutes les catégories</option>
              <option>Droit & Législation</option>
              <option>Informatique</option>
              <option>Sciences de la Santé</option>
              <option>Littérature</option>
            </select>
          </div>
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Type de document</h4>
            <select
              class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            >
              <option>Tous les types</option>
              <option>Livre</option>
              <option>Mémoire</option>
              <option>Thèse</option>
              <option>Article</option>
            </select>
          </div>
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Langue</h4>
            <select
              class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            >
              <option>Toutes les langues</option>
              <option>Français</option>
              <option>Anglais</option>
            </select>
          </div>
        </div>

        <!-- Year & Access -->
        <div class="grid sm:grid-cols-4 gap-4 mb-6">
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Année de</h4>
            <input
              type="number"
              placeholder="1950"
              class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>
          <div>
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">à</h4>
            <input
              type="number"
              placeholder="2024"
              class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>
          <div class="sm:col-span-2">
            <h4 class="text-sm font-medium text-[#1A1A2E] mb-2">Accès</h4>
            <div class="flex items-center gap-4 h-[42px]">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="access"
                  value="all"
                  checked
                  class="text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span class="text-[#6B7280]">Tous</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="access"
                  value="public"
                  class="text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span class="text-[#6B7280]">Public</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="access"
                  value="registered"
                  class="text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span class="text-[#6B7280]">Inscrits</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Search Button -->
        <button
          @click="performSearch"
          class="w-full bg-[#0D9488] text-white py-3 rounded-xl font-medium hover:bg-[#0F766E] transition-colors"
        >
          Lancer la recherche
        </button>
      </div>

      <!-- Results -->
      <div v-if="hasSearched">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-[#1B2A4A]">
            {{ searchResults.length }} résultat{{ searchResults.length > 1 ? 's' : '' }} pour "{{
              searchQuery
            }}"
          </h2>
        </div>

        <!-- Results List -->
        <div class="space-y-4">
          <template v-for="doc in searchResults" :key="doc.id">
            <div
              class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4"
            >
              <!-- Cover Thumb -->
              <div
                class="w-20 h-28 bg-gradient-to-br from-[#1B2A4A] to-[#2D4A7A] rounded-lg flex-shrink-0 flex items-center justify-center"
              >
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
                <p class="text-[#6B7280] text-sm mb-2">{{ doc.authors.join(', ') }}</p>
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="bg-[#0D9488]/10 text-[#0D9488] px-2 py-0.5 rounded-full text-xs">
                    {{ doc.category }}
                  </span>
                  <span class="bg-[#F1F0EC] text-[#6B7280] px-2 py-0.5 rounded-full text-xs">
                    {{ doc.type }}
                  </span>
                  <span class="text-[#6B7280] text-xs font-mono">{{ doc.year }}</span>
                </div>
                <p class="text-[#1A1A2E] text-sm line-clamp-2">{{ doc.abstract }}</p>
              </div>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-center gap-2 mt-10">
          <button class="p-2 rounded-lg hover:bg-[#F1F0EC] text-[#6B7280]">
            <ChevronLeft class="w-5 h-5" />
          </button>
          <button class="px-4 py-2 rounded-lg bg-[#0D9488] text-white font-medium">1</button>
          <button class="px-4 py-2 rounded-lg hover:bg-[#F1F0EC] text-[#6B7280]">2</button>
          <button class="p-2 rounded-lg hover:bg-[#F1F0EC] text-[#6B7280]">
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
