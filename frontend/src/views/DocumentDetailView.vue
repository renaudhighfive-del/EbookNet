<script setup>
import PublicLayout from '../layouts/PublicLayout.vue'
import DocumentCard from '../components/DocumentCard.vue'
import { ChevronRight, BookOpen, Lock, Eye, Download } from '@lucide/vue'

const similarDocs = [
  {
    id: 2,
    title: 'Droit Constitutionnel Comparé',
    authors: ['Dr. Léon Houessou'],
    category: 'Droit & Législation',
    type: 'Livre',
    year: 2019,
    access: 'public',
  },
  {
    id: 3,
    title: 'Histoire du Droit Béninois',
    authors: ['Prof. Albert Dossou'],
    category: 'Histoire & Géographie',
    type: 'Livre',
    year: 2020,
    access: 'public',
  },
  {
    id: 4,
    title: 'Thèse sur la Jurisprudence Constitutionnelle',
    authors: ['Dr. Afi Agossou'],
    category: 'Droit & Législation',
    type: 'Thèse',
    year: 2022,
    access: 'restricted',
  },
  {
    id: 5,
    title: 'Guide Pratique du Droit Béninois',
    authors: ['Marie Dossou'],
    category: 'Droit & Législation',
    type: 'Guide',
    year: 2023,
    access: 'public',
  },
]
</script>



<template>
  <PublicLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
        <router-link to="/" class="hover:text-[#0D9488]">Accueil</router-link>
        <ChevronRight class="w-4 h-4" />
        <router-link to="/catalogue" class="hover:text-[#0D9488]">Catalogue</router-link>
        <ChevronRight class="w-4 h-4" />
        <span class="text-[#1B2A4A]">Introduction au Droit Constitutionnel Béninois</span>
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
          <router-link
            to="/connexion"
            class="px-5 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0F766E] transition-colors"
          >
            Se connecter
          </router-link>
          <router-link
            to="/connexion"
            class="px-5 py-2 border border-[#1B2A4A] text-[#1B2A4A] rounded-lg font-medium hover:bg-[#1B2A4A]/5 transition-colors"
          >
            S'inscrire
          </router-link>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Left Column -->
        <aside class="w-full lg:w-80 flex-shrink-0">
          <!-- Cover -->
          <div class="sticky top-24">
            <div class="bg-gradient-to-br from-[#1B2A4A] to-[#2D4A7A] rounded-xl aspect-[3/4] shadow-lg flex items-center justify-center mb-4">
              <BookOpen class="w-32 h-32 text-white/30" />
            </div>
            <div class="text-center mb-4">
              <span class="inline-flex items-center gap-2 bg-[#E8A020] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                <Lock class="w-4 h-4" />
                Réservé aux membres inscrits
              </span>
            </div>
            <!-- Stats -->
            <div class="flex items-center justify-center gap-6 text-[#6B7280]">
              <div class="flex items-center gap-2">
                <Eye class="w-5 h-5" />
                <span>1 247 vues</span>
              </div>
              <div class="flex items-center gap-2">
                <Download class="w-5 h-5" />
                <span>389 téléchargements</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Column -->
        <main class="flex-1">
          <h1 class="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-2" style="font-family: 'Playfair Display', serif;">
            Introduction au Droit Constitutionnel Béninois
          </h1>
          <p class="text-lg text-[#6B7280] italic mb-6">Principes fondamentaux et jurisprudence</p>

          <!-- Authors -->
          <div class="flex items-center gap-3 mb-6">
            <div class="flex -space-x-2">
              <div class="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-medium text-sm border-2 border-white">
                PA
              </div>
              <div class="w-10 h-10 rounded-full bg-[#2D4A7A] flex items-center justify-center text-white font-medium text-sm border-2 border-white">
                MZ
              </div>
            </div>
            <span class="text-[#1A1A2E]">Prof. Koffi Adanlété, Dr. Marie Zannou</span>
          </div>

          <!-- Metadata Grid -->
          <div class="grid sm:grid-cols-2 gap-4 mb-6">
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">Éditeur:</span>
              <span class="text-[#1A1A2E] font-mono">Les Presses Universitaires du Bénin</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">Année:</span>
              <span class="text-[#1A1A2E] font-mono">2021</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">ISBN:</span>
              <span class="text-[#1A1A2E] font-mono">978-99919-0-467-3</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">Langue:</span>
              <span class="text-[#1A1A2E] font-mono">Français</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">Type:</span>
              <span class="bg-[#F1F0EC] px-3 py-1 rounded-full text-sm text-[#1B2A4A]">Livre</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">Catégorie:</span>
              <span class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-sm">Droit & Législation</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">Pages:</span>
              <span class="text-[#1A1A2E] font-mono">342</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">Téléchargements:</span>
              <span class="text-[#1A1A2E] font-mono">389</span>
            </div>
          </div>

          <!-- Keywords -->
          <div class="flex flex-wrap gap-2 mb-6">
            <span class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-sm border border-[#0D9488]/30">droit constitutionnel</span>
            <span class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-sm border border-[#0D9488]/30">Bénin</span>
            <span class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-sm border border-[#0D9488]/30">juridique</span>
            <span class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-sm border border-[#0D9488]/30">constitution</span>
            <span class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-sm border border-[#0D9488]/30">jurisprudence</span>
          </div>

          <!-- Abstract -->
          <div class="bg-[#F1F0EC] rounded-xl p-6 mb-6">
            <h2 class="font-semibold text-[#1B2A4A] mb-3">Résumé</h2>
            <p class="text-[#1A1A2E] leading-relaxed">
              Cet ouvrage propose une analyse approfondie des principes du droit constitutionnel béninois, depuis l'indépendance jusqu'à la Constitution de 1990.
            </p>
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
          <section class="border-t border-[#E5E7EB] pt-10">
            <h2 class="text-2xl font-bold text-[#1B2A4A] mb-6" style="font-family: 'Playfair Display', serif;">
              Documents similaires
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DocumentCard
                v-for="doc in similarDocs"
                :key="doc.id"
                :document="doc"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  </PublicLayout>
</template>

