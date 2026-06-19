<template>
  <div class="min-h-screen bg-beige">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-3 group">
            <div class="w-12 h-12 bg-navy-800 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-teal-600 group-hover:scale-105">
              <span class="text-white text-2xl">📖</span>
            </div>
            <span class="text-2xl font-serif font-bold text-navy-900 tracking-tight">
              BibliNum
            </span>
          </router-link>

          <!-- Nav links -->
          <nav class="hidden md:flex items-center gap-8">
            <router-link
              to="/"
              class="text-sm font-medium text-slate-600 hover:text-navy-900 transition-all duration-200"
              :class="{ 'text-navy-900 font-semibold': $route.path === '/' }"
            >
              Accueil
            </router-link>
            <router-link
              to="/catalogue"
              class="text-sm font-medium text-slate-600 hover:text-navy-900 transition-all duration-200"
              :class="{ 'text-navy-900 font-semibold': $route.path === '/catalogue' }"
            >
              Catalogue
            </router-link>
            <router-link
              to="/recherche"
              class="text-sm font-medium text-slate-600 hover:text-navy-900 transition-all duration-200"
              :class="{ 'text-navy-900 font-semibold': $route.path === '/recherche' }"
            >
              Recherche
            </router-link>
          </nav>

          <!-- Login button -->
          <router-link
            to="/connexion"
            class="group inline-flex items-center gap-2 px-6 py-2.5 border-2 border-navy-900 text-navy-900 rounded-2xl font-semibold hover:bg-navy-900 hover:text-white transition-all duration-300"
          >
            <span>Connexion</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="pb-24">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-navy-800 text-white pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div class="md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-11 h-11 bg-teal-600 rounded-xl flex items-center justify-center">
                <span class="text-2xl">📖</span>
              </div>
              <span class="text-2xl font-serif font-bold">BibliNum</span>
            </div>
            <p class="text-slate-300 leading-relaxed mb-6 max-w-md">
              Bibliothèque Numérique du Bénin — Centraliser, sécuriser et diffuser le patrimoine documentaire académique.
            </p>
            <div class="space-y-2 text-slate-300 text-sm">
              <div class="flex items-center gap-2.5">
                <span>📍</span> Cotonou, Bénin
              </div>
              <div class="flex items-center gap-2.5">
                <span>✉️</span> contact@biblium.bj
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-semibold mb-5 text-sm tracking-wide text-slate-100">Navigation</h3>
            <ul class="space-y-3 text-sm">
              <li><router-link to="/" class="text-slate-300 hover:text-white transition-colors">Accueil</router-link></li>
              <li><router-link to="/catalogue" class="text-slate-300 hover:text-white transition-colors">Catalogue</router-link></li>
              <li><router-link to="/recherche" class="text-slate-300 hover:text-white transition-colors">Recherche</router-link></li>
              <li><router-link to="/connexion" class="text-slate-300 hover:text-white transition-colors">Connexion</router-link></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-5 text-sm tracking-wide text-slate-100">Ressources</h3>
            <ul class="space-y-3 text-sm">
              <li><a href="#" class="text-slate-300 hover:text-white transition-colors">Mentions légales</a></li>
              <li><a href="#" class="text-slate-300 hover:text-white transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" class="text-slate-300 hover:text-white transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" class="text-slate-300 hover:text-white transition-colors">Aide & FAQ</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-700 pt-6 text-center text-slate-400 text-xs">
          © 2024 BibliNum — Bibliothèque Numérique. Tous droits réservés.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup></script>
