<template>
  <PublicLayout>
    <!-- Hero Section -->
    <section class="relative bg-navy-gradient overflow-hidden">
      <!-- Star pattern overlay -->
      <div class="absolute inset-0 bg-star-pattern opacity-80" />

      <div class="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
            Explorez notre <span class="text-amber-500">catalogue</span><br />documentaire
          </h1>
          <p class="text-slate-300 text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
            1 248 références académiques, mémoires et thèses disponibles en ligne pour étudiants, chercheurs et professionnels.
          </p>

          <!-- Search Bar -->
          <div class="max-w-2xl mx-auto mb-8">
            <div class="bg-white rounded-3xl p-3 shadow-2xl flex items-center gap-3 border-2 border-white">
              <span class="text-slate-400 text-xl ml-3">🔍</span>
              <input
                type="text"
                placeholder="Rechercher un titre, auteur, mot-clé..."
                class="flex-1 px-4 py-4 text-slate-700 bg-transparent border-0 focus:ring-0 focus:outline-none text-base"
              />
              <button class="bg-navy-800 text-white px-7 py-4 rounded-2xl font-semibold hover:bg-navy-900 transition-all duration-300">
                Rechercher
              </button>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap justify-center gap-4">
            <router-link
              to="/catalogue"
              class="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-teal-700 transition-all duration-300"
            >
              Parcourir le catalogue
              <span>→</span>
            </router-link>
            <router-link
              to="/connexion"
              class="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-white hover:text-navy-900 transition-all duration-300 backdrop-blur-sm"
            >
              S'inscrire gratuitement
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div class="p-4">
            <div class="flex items-center justify-center gap-4 mb-2">
              <div class="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 text-2xl">
                📖
              </div>
              <div class="text-left">
                <div class="text-3xl font-mono font-bold text-navy-900 mb-1">1 248</div>
                <div class="text-slate-600 text-xs uppercase tracking-widest font-semibold">Références</div>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-center gap-4 mb-2">
              <div class="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 text-2xl">
                🧑‍🏫
              </div>
              <div class="text-left">
                <div class="text-3xl font-mono font-bold text-navy-900 mb-1">342</div>
                <div class="text-slate-600 text-xs uppercase tracking-widest font-semibold">Auteurs</div>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-center gap-4 mb-2">
              <div class="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 text-2xl">
                🏷️
              </div>
              <div class="text-left">
                <div class="text-3xl font-mono font-bold text-navy-900 mb-1">18</div>
                <div class="text-slate-600 text-xs uppercase tracking-widest font-semibold">Catégories</div>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-center gap-4 mb-2">
              <div class="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 text-2xl">
                ⬇️
              </div>
              <div class="text-left">
                <div class="text-3xl font-mono font-bold text-navy-900 mb-1">5 621</div>
                <div class="text-slate-600 text-xs uppercase tracking-widest font-semibold">Téléchargements</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Categories -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-3xl font-serif font-bold text-navy-900 mb-2">Catégories populaires</h2>
            <p class="text-slate-600 text-sm">Parcourez les domaines les plus consultés.</p>
          </div>
          <router-link
            to="/catalogue"
            class="text-teal-600 font-medium hover:underline text-sm flex items-center gap-1"
          >
            Voir toutes les catégories →
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="group bg-white rounded-2xl p-6 shadow-soft hover:shadow-xl border border-gray-100 hover:border-teal-200 transition-all duration-300 cursor-pointer"
          >
            <div class="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center text-navy-800 text-xl mb-4 group-hover:bg-teal-50 group-hover:text-teal-700 transition-all duration-300">
              {{ cat.icon }}
            </div>
            <h3 class="font-semibold text-navy-900 mb-1">{{ cat.name }}</h3>
            <p class="text-slate-600 text-xs">{{ cat.count }} documents</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent documents -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between mb-10">
          <h2 class="text-3xl font-serif font-bold text-navy-900">Dernières références ajoutées</h2>
          <router-link
            to="/catalogue"
            class="text-teal-600 font-medium hover:underline text-sm flex items-center gap-1"
          >
            Voir tout →
          </router-link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          <DocumentCard v-for="doc in recentDocs" :key="doc.id" :document="doc" />
        </div>
      </div>
    </section>

    <!-- Featured document -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 class="text-3xl font-serif font-bold text-navy-900 mb-8">À la une</h2>

        <div class="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
          <div class="grid md:grid-cols-2">
            <div class="aspect-[4/3] bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center relative overflow-hidden">
              <span class="text-8xl text-white/10">📖</span>
              <div class="absolute top-6 left-6">
                <span class="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  ⭐ À la une
                </span>
              </div>
            </div>
            <div class="p-10 flex flex-col justify-between">
              <div>
                <span class="inline-block bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                  Droit
                </span>
                <h3 class="text-3xl font-serif font-bold text-navy-900 mb-4 leading-tight">
                  Introduction au Droit Constitutionnel Béninois
                </h3>
                <p class="text-slate-600 mb-5 text-sm">
                  Par <span class="text-navy-900 font-medium">Prof. Koffi Adanlété</span>, <span class="text-slate-500">Dr. Marie Zannou</span> ·
                  <span class="text-slate-500">2021</span>
                </p>
                <p class="text-slate-600 mb-6 leading-relaxed text-sm">
                  Une analyse approfondie des principes du droit constitutionnel béninois, depuis l'indépendance jusqu'à la Constitution de 1990. Cet ouvrage de référence accompagne étudiants en droit, magistrats et chercheurs dans l'étude des institutions de la République.
                </p>
                <div class="flex items-center gap-7 text-slate-500 text-xs mb-8">
                  <div class="flex items-center gap-2">
                    <span>👁️</span>
                    <span class="font-mono">1 247 vues</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span>⬇️</span>
                    <span class="font-mono">389 téléchargements</span>
                  </div>
                </div>
              </div>
              <router-link
                to="/catalogue/1"
                class="inline-flex items-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-navy-950 transition-all duration-300 w-fit"
              >
                Voir la fiche complète
                <span>→</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup>
import { ref } from 'vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import DocumentCard from '../components/DocumentCard.vue'

const categories = ref([
  { id: 1, name: 'Droit & Législation', slug: 'droit', count: 124, icon: '⚖️' },
  { id: 2, name: 'Informatique', slug: 'informatique', count: 89, icon: '🤖' },
  { id: 3, name: 'Sciences de la Santé', slug: 'sante', count: 76, icon: '🩺' },
  { id: 4, name: 'Littérature', slug: 'litterature', count: 65, icon: '🪶' },
  { id: 5, name: 'Histoire & Géographie', slug: 'histoire', count: 58, icon: '🌍' },
  { id: 6, name: 'Économie', slug: 'economie', count: 47, icon: '📈' },
])

const recentDocs = ref([
  {
    id: 1,
    title: 'Introduction au Droit Constitutionnel Béninois',
    authors: ['Prof. Koffi Adanlété'],
    category: 'Droit',
    categorySlug: 'droit',
    type: 'Livre',
    year: 2021,
    access: 'restricted',
    coverColor: 'from-navy-800 to-blue-900',
  },
  {
    id: 2,
    title: 'Algorithmique et Structures de Données',
    authors: ['Dr. Akeh Boko'],
    category: 'Informatique',
    categorySlug: 'informatique',
    type: 'Manuel',
    year: 2022,
    access: 'public',
    coverColor: 'from-teal-700 to-teal-900',
  },
  {
    id: 3,
    title: 'Histoire du Bénin Précolonial',
    authors: ['Prof. Yves Houngbédji'],
    category: 'Histoire',
    categorySlug: 'histoire',
    type: 'Livre',
    year: 2019,
    access: 'public',
    coverColor: 'from-amber-800 to-amber-950',
  },
  {
    id: 4,
    title: 'Mémoire sur la Santé Publique en Afrique',
    authors: ['Dr. Afi Agossou'],
    category: 'Santé',
    categorySlug: 'sante',
    type: 'Mémoire',
    year: 2024,
    access: 'restricted',
    coverColor: 'from-green-700 to-green-900',
  },
])
</script>
