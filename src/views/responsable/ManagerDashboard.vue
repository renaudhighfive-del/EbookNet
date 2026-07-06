<template>
  <ResponsableLayout>
    <template #title>Tableau de bord</template>

    <!-- Banner rôle -->
    <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <Info class="w-4 h-4 text-teal-600 shrink-0" />
      <p class="text-sm text-teal-800">
        Votre rôle : Examiner les demandes de dépôt qui vous sont assignées et émettre un avis motivé.
      </p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <div class="bg-[#1B2A4A] text-white rounded-2xl p-5 border border-white/5">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ClipboardList class="w-5 h-5" />
          </div>
          <div>
            <div class="text-3xl font-bold font-mono">5</div>
            <div class="text-white/60 text-sm">Demandes assignées</div>
          </div>
        </div>
      </div>
      <div class="bg-amber-500 text-white rounded-2xl p-5">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <div class="text-3xl font-bold font-mono">3</div>
            <div class="text-amber-100 text-sm">À examiner</div>
          </div>
        </div>
      </div>
      <div class="bg-green-600 text-white rounded-2xl p-5">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle class="w-5 h-5" />
          </div>
          <div>
            <div class="text-3xl font-bold font-mono">2</div>
            <div class="text-green-100 text-sm">Traitées</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Table priorité -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50">
          <h2 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide">Demandes à traiter en priorité</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[#F8F7F4]">
              <tr>
                <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Déposant</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Urgence</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr class="hover:bg-[#F8F7F4] transition-colors">
                <td class="px-5 py-3.5 font-medium text-[#1B2A4A] truncate max-w-[160px]">Étude sur le Commerce...</td>
                <td class="px-4 py-3.5 text-gray-600">Marie Zannou</td>
                <td class="px-4 py-3.5 hidden md:table-cell">
                  <span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">Mémoire</span>
                </td>
                <td class="px-4 py-3.5">
                  <span class="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                    <AlertTriangle class="w-3 h-3" /> 4 jours
                  </span>
                </td>
                <td class="px-4 py-3.5">
                  <router-link to="/manager/deposits/7/review" class="flex items-center gap-1 text-[#0D9488] text-sm font-medium hover:underline whitespace-nowrap">
                    Examiner <ArrowRight class="w-3.5 h-3.5" />
                  </router-link>
                </td>
              </tr>
              <tr class="hover:bg-[#F8F7F4] transition-colors">
                <td class="px-5 py-3.5 font-medium text-[#1B2A4A] truncate max-w-[160px]">Guide Pratique de...</td>
                <td class="px-4 py-3.5 text-gray-600">Kofi Mensah</td>
                <td class="px-4 py-3.5 hidden md:table-cell">
                  <span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">Guide</span>
                </td>
                <td class="px-4 py-3.5 text-gray-400 text-xs">—</td>
                <td class="px-4 py-3.5">
                  <router-link to="/manager/deposits/8/review" class="flex items-center gap-1 text-[#0D9488] text-sm font-medium hover:underline whitespace-nowrap">
                    Examiner <ArrowRight class="w-3.5 h-3.5" />
                  </router-link>
                </td>
              </tr>
              <tr class="hover:bg-[#F8F7F4] transition-colors">
                <td class="px-5 py-3.5 font-medium text-[#1B2A4A] truncate max-w-[160px]">Rapport Économique...</td>
                <td class="px-4 py-3.5 text-gray-600">Afi Dossou</td>
                <td class="px-4 py-3.5 hidden md:table-cell">
                  <span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">Rapport</span>
                </td>
                <td class="px-4 py-3.5 text-gray-400 text-xs">—</td>
                <td class="px-4 py-3.5">
                  <router-link to="/manager/deposits/9/review" class="flex items-center gap-1 text-[#0D9488] text-sm font-medium hover:underline whitespace-nowrap">
                    Examiner <ArrowRight class="w-3.5 h-3.5" />
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Colonne droite -->
      <div class="space-y-5">
        <!-- Décisions récentes -->
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-4">Traitées récemment</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-50">
              <span class="text-sm text-[#1B2A4A] truncate max-w-[120px]">Introduction au Droit...</span>
              <span class="flex items-center gap-1 text-xs text-green-600 font-medium whitespace-nowrap">
                <CheckCircle class="w-3.5 h-3.5" /> Validée
              </span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-[#1B2A4A] truncate max-w-[120px]">Analyse du Marché...</span>
              <span class="flex items-center gap-1 text-xs text-red-600 font-medium whitespace-nowrap">
                <XCircle class="w-3.5 h-3.5" /> Refusée
              </span>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-4">Notifications</h3>
          <div class="space-y-3 text-sm">
            <div class="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400 text-amber-800">
              Nouvelle demande assignée : "Guide Pratique de Comptabilité Appliquée"
            </div>
            <div class="p-3 bg-gray-50 rounded-lg text-gray-600">
              Rappel : "Étude sur le Commerce..." en attente depuis 4 jours
            </div>
          </div>
        </div>
      </div>
    </div>
  </ResponsableLayout>
</template>

<script setup>
import { Info, ClipboardList, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight } from '@lucide/vue'
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'
</script>
