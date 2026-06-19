<script setup>
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'
</script>

<template>
  <ResponsableLayout>
    <template #title>Tableau de bord</template>

    <!-- Role Description Banner -->
    <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <span class="text-2xl">📋</span>
      <p class="text-teal-800">
        Votre rôle : Examiner les demandes de dépôt qui vous sont assignées et émettre un avis motivé.
      </p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-navy-800 text-white rounded-2xl p-6 shadow-soft">
        <div class="flex items-center gap-4">
          <span class="text-3xl">📋</span>
          <div>
            <div class="text-3xl font-bold font-mono">5</div>
            <div class="text-teal-200 text-sm">Demandes assignées</div>
          </div>
        </div>
      </div>
      <div class="bg-amber-500 text-white rounded-2xl p-6 shadow-soft">
        <div class="flex items-center gap-4">
          <span class="text-3xl">⏳</span>
          <div>
            <div class="text-3xl font-bold font-mono">3</div>
            <div class="text-amber-100 text-sm">À examiner</div>
          </div>
        </div>
      </div>
      <div class="bg-green-600 text-white rounded-2xl p-6 shadow-soft">
        <div class="flex items-center gap-4">
          <span class="text-3xl">✅</span>
          <div>
            <div class="text-3xl font-bold font-mono">2</div>
            <div class="text-green-100 text-sm">Traitées</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Priority Table (2/3 width) -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl p-6 shadow-soft">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-navy-800">Demandes à traiter en priorité</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="text-gray-500 text-sm border-b border-gray-200">
                <tr>
                  <th class="pb-3 pr-4">Titre</th>
                  <th class="pb-3 pr-4">Déposant</th>
                  <th class="pb-3 pr-4">Assignée le</th>
                  <th class="pb-3 pr-4">Type</th>
                  <th class="pb-3 pr-4">Urgence</th>
                  <th class="pb-3">Action</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                <tr class="border-b border-gray-100">
                  <td class="py-4 pr-4">Étude sur le Commerce...</td>
                  <td class="py-4 pr-4">Marie Zannou</td>
                  <td class="py-4 pr-4 text-gray-600">10 juin 2024</td>
                  <td class="py-4 pr-4">
                    <span class="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs">Mémoire</span>
                  </td>
                  <td class="py-4 pr-4">
                    <span class="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      ⚠️ 4 jours
                    </span>
                  </td>
                  <td class="py-4">
                    <router-link
                      to="/manager/deposits/7/review"
                      class="text-teal-600 font-medium hover:underline"
                    >
                      Examiner →
                    </router-link>
                  </td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-4 pr-4">Guide Pratique de...</td>
                  <td class="py-4 pr-4">Kofi Mensah</td>
                  <td class="py-4 pr-4 text-gray-600">12 juin 2024</td>
                  <td class="py-4 pr-4">
                    <span class="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs">Guide</span>
                  </td>
                  <td class="py-4 pr-4">
                    <span class="text-gray-400 text-xs">—</span>
                  </td>
                  <td class="py-4">
                    <router-link
                      to="/manager/deposits/8/review"
                      class="text-teal-600 font-medium hover:underline"
                    >
                      Examiner →
                    </router-link>
                  </td>
                </tr>
                <tr>
                  <td class="py-4 pr-4">Rapport Économique...</td>
                  <td class="py-4 pr-4">Afi Dossou</td>
                  <td class="py-4 pr-4 text-gray-600">13 juin 2024</td>
                  <td class="py-4 pr-4">
                    <span class="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs">Rapport</span>
                  </td>
                  <td class="py-4 pr-4">
                    <span class="text-gray-400 text-xs">—</span>
                  </td>
                  <td class="py-4">
                    <router-link
                      to="/manager/deposits/9/review"
                      class="text-teal-600 font-medium hover:underline"
                    >
                      Examiner →
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Recent Decisions & Notifications -->
      <div class="space-y-6">
        <!-- Recent Decisions -->
        <div class="bg-white rounded-2xl p-6 shadow-soft">
          <h3 class="text-sm font-semibold text-navy-800 mb-4">Traitées récemment</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <div class="text-sm text-gray-800">Introduction au Droit...</div>
              <div class="flex items-center gap-2">
                <span class="text-green-600">✅ Validée</span>
                <span class="text-xs text-gray-400">08 juin 2024</span>
              </div>
            </div>
            <div class="flex items-center justify-between py-2">
              <div class="text-sm text-gray-800">Analyse du Marché...</div>
              <div class="flex items-center gap-2">
                <span class="text-red-600">❌ Refusée</span>
                <span class="text-xs text-gray-400">05 juin 2024</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-white rounded-2xl p-6 shadow-soft">
          <h3 class="text-sm font-semibold text-navy-800 mb-4">Notifications</h3>
          <div class="space-y-3 text-sm">
            <div class="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
              Nouvelle demande assignée : "Guide Pratique de Comptabilité Appliquée"
            </div>
            <div class="p-3 bg-gray-50 rounded-lg">
              Rappel : "Étude sur le Commerce..." en attente depuis 4 jours
            </div>
          </div>
        </div>
      </div>
    </div>
  </ResponsableLayout>
</template>


