<script setup>
import { ref } from 'vue'
import {
  Search, BookOpen, Library, UserPlus, Users, Tag, Download,
  ArrowRight, Eye, Star, Scale, Cpu, HeartPulse, Feather, Globe, TrendingUp,
} from '@lucide/vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import DocumentCard from '../components/DocumentCard.vue'

const categories = ref([
  { id: 1, name: 'Droit & Législation',    count: 124, icon: Scale     },
  { id: 2, name: 'Informatique',           count: 89,  icon: Cpu       },
  { id: 3, name: 'Sciences de la Santé',   count: 76,  icon: HeartPulse},
  { id: 4, name: 'Littérature',            count: 65,  icon: Feather   },
  { id: 5, name: 'Histoire & Géographie',  count: 58,  icon: Globe     },
  { id: 6, name: 'Économie',               count: 47,  icon: TrendingUp},
])

const recentDocs = ref([
  { id: 1, title: 'Introduction au Droit Constitutionnel Béninois', authors: ['Prof. Koffi Adanlété'], category: 'Droit', type: 'Livre', year: 2021, access: 'restricted', coverColor: 'from-[#1B2A4A] to-[#1E3368]' },
  { id: 2, title: 'Algorithmique et Structures de Données', authors: ['Dr. Akeh Boko'], category: 'Informatique', type: 'Manuel', year: 2022, access: 'public', coverColor: 'from-[#0D9488] to-[#114F47]' },
  { id: 3, title: 'Histoire du Bénin Précolonial', authors: ['Prof. Yves Houngbédji'], category: 'Histoire', type: 'Livre', year: 2019, access: 'public', coverColor: 'from-[#A1570F] to-[#6C3611]' },
  { id: 4, title: 'Mémoire sur la Santé Publique en Afrique', authors: ['Dr. Afi Agossou'], category: 'Santé', type: 'Mémoire', year: 2024, access: 'restricted', coverColor: 'from-[#0E5F56] to-[#114038]' },
])
</script>

<template>
  <PublicLayout>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-b from-[#1B2A4A] via-[#1B2A4A] to-[#0D6B76] overflow-hidden">
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
            1 248 références académiques, mémoires et thèses disponibles en ligne pour étudiants,
            chercheurs et professionnels.
          </p>

          <!-- Search Bar -->
          <div class="max-w-2xl mx-auto mb-8">
            <div class="bg-white rounded-xl p-2 shadow-xl flex items-center gap-2">
              <Search class="w-4 h-4 text-slate-400 ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher un titre, auteur, mot-clé..."
                class="flex-1 px-3 py-3 text-slate-700 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm"
              />
              <button class="bg-[#1B2A4A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0F1322] transition-all duration-300 text-sm cursor-pointer">
                Rechercher
              </button>
            </div>
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
                <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-0.5">1 248</div>
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
                <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-0.5">342</div>
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
                <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-0.5">18</div>
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
                <div class="text-2xl font-mono font-bold text-[#1B2A4A] mb-0.5">5 621</div>
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
          >
            <div class="w-9 h-9 bg-[#F2F4F9] rounded-lg flex items-center justify-center text-[#1B2A4A] mb-3 group-hover:bg-[#ECFFFD] group-hover:text-[#0D9488] transition-all duration-300">
              <component :is="cat.icon" class="w-4 h-4" />
            </div>
            <h3 class="font-semibold text-[#1B2A4A] mb-1 text-sm">{{ cat.name }}</h3>
            <p class="text-slate-500 text-xs">{{ cat.count }} documents</p>
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DocumentCard v-for="doc in recentDocs" :key="doc.id" :document="doc" />
        </div>
      </div>
    </section>

    <!-- Featured document -->
    <section class="py-14 bg-[#F8F7F4]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 class="text-2xl font-serif font-bold text-[#1B2A4A] mb-7">À la une</h2>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="grid md:grid-cols-5">
            <div class="md:col-span-2 aspect-[4/3] bg-gradient-to-br from-[#1B2A4A] to-[#1E3368] flex items-center justify-center relative overflow-hidden">
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
                  Droit
                </span>
                <h3 class="text-2xl font-serif font-bold text-[#1B2A4A] mb-3 leading-tight">
                  Introduction au Droit Constitutionnel Béninois
                </h3>
                <p class="text-slate-600 mb-3 text-sm">
                  Par <span class="text-[#1B2A4A] font-medium">Prof. Koffi Adanlété</span>,
                  <span class="text-slate-500">Dr. Marie Zannou</span> ·
                  <span class="text-slate-500">2021</span>
                </p>
                <p class="text-slate-600 mb-5 leading-relaxed text-sm">
                  Une analyse approfondie des principes du droit constitutionnel béninois, depuis
                  l'indépendance jusqu'à la Constitution de 1990.
                </p>
                <div class="flex items-center gap-6 text-slate-500 text-xs mb-6">
                  <div class="flex items-center gap-1.5">
                    <Eye class="w-3.5 h-3.5" />
                    <span class="font-mono">1 247 vues</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Download class="w-3.5 h-3.5" />
                    <span class="font-mono">389 téléchargements</span>
                  </div>
                </div>
              </div>
              <router-link
                to="/catalogue/1"
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
  </PublicLayout>
</template>


