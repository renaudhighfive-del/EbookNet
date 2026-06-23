<template>
  <AuthenticatedLayout>
    <div>
      <!-- Welcome -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[#1B2A4A] font-serif">
          Bonjour, {{ authStore.user?.first_name }} !
        </h1>
        <p class="text-gray-500 mt-1">Bienvenue dans votre espace personnel</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#0D9488]">
              <BookOpen class="w-5 h-5" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[#1B2A4A] font-mono">12</div>
              <div class="text-gray-500 text-sm">Documents consultés</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#F2F4F9] rounded-xl flex items-center justify-center text-[#1B2A4A]">
              <Download class="w-5 h-5" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[#1B2A4A] font-mono">8</div>
              <div class="text-gray-500 text-sm">Documents téléchargés</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <FileUp class="w-5 h-5" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[#1B2A4A] font-mono">3</div>
              <div class="text-gray-500 text-sm">Demandes de dépôt</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activity -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
          <h2 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-5">Activité récente</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-[#0D9488] shrink-0">
                <BookOpen class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-[#1B2A4A] truncate">Vous avez consulté « Introduction au Droit Constitutionnel Béninois »</p>
                <p class="text-xs text-gray-400">Il y a 2 heures</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-[#F2F4F9] rounded-xl flex items-center justify-center text-[#1B2A4A] shrink-0">
                <Download class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-[#1B2A4A] truncate">Vous avez téléchargé « Algorithmique et Structures de Données »</p>
                <p class="text-xs text-gray-400">Il y a 1 jour</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <FileUp class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-[#1B2A4A] truncate">Votre demande de dépôt « Mon mémoire » a été acceptée</p>
                <p class="text-xs text-gray-400">Il y a 3 jours</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
          <h2 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-5">Actions rapides</h2>
          <div class="space-y-2.5">
            <router-link to="/catalogue"
              class="flex items-center justify-between p-3.5 bg-[#F8F7F4] rounded-xl hover:bg-teal-50 hover:text-[#0D9488] transition-colors group"
            >
              <div class="flex items-center gap-3 text-sm text-[#1B2A4A] group-hover:text-[#0D9488]">
                <Search class="w-4 h-4" />
                Explorer le catalogue
              </div>
              <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-[#0D9488]" />
            </router-link>
            <router-link to="/deposit-request"
              class="flex items-center justify-between p-3.5 bg-[#F8F7F4] rounded-xl hover:bg-teal-50 hover:text-[#0D9488] transition-colors group"
            >
              <div class="flex items-center gap-3 text-sm text-[#1B2A4A] group-hover:text-[#0D9488]">
                <Upload class="w-4 h-4" />
                Déposer un document
              </div>
              <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-[#0D9488]" />
            </router-link>
            <router-link to="/profile"
              class="flex items-center justify-between p-3.5 bg-[#F8F7F4] rounded-xl hover:bg-teal-50 hover:text-[#0D9488] transition-colors group"
            >
              <div class="flex items-center gap-3 text-sm text-[#1B2A4A] group-hover:text-[#0D9488]">
                <UserCircle class="w-4 h-4" />
                Modifier mon profil
              </div>
              <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-[#0D9488]" />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { BookOpen, Download, FileUp, Search, Upload, UserCircle, ArrowRight } from '@lucide/vue'

const authStore = useAuthStore()
</script>
