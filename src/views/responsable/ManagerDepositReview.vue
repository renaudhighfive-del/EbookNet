<script setup>
import { ref, computed } from 'vue'
import ResponsableLayout from '@/layouts/ResponsableLayout.vue'

const decision = ref(null)
const justification = ref('')
const isSubmitting = ref(false)

const canSubmit = computed(() => {
  if (!decision.value) return false
  if (decision.value === 'reject' && justification.value.length < 50) return false
  return true
})

const handleSubmit = async () => {
  isSubmitting.value = true
  // TODO: submit to backend
  console.log('Decision:', decision.value, 'Justification:', justification.value)
  setTimeout(() => {
    isSubmitting.value = false
    alert('Votre décision a été soumise avec succès !')
  }, 2000)
}
</script>

<template>
  <ResponsableLayout>
    <template #title>
      <div class="flex items-center gap-2">
        <router-link
          to="/manager/deposits"
          class="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
        >
          ← Retour
        </router-link>
        <span>|</span>
        <span>Examiner une demande</span>
      </div>
    </template>

    <!-- Status Banner -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center gap-3">
      <span class="text-2xl">📋</span>
      <p class="text-blue-800">Demande assignée le 10 juin 2024 — En attente de votre examen</p>
    </div>

    <!-- Warning Banner -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <span class="text-2xl">⚠️</span>
      <p class="text-amber-800">Cette demande est en attente depuis 4 jours</p>
    </div>

    <!-- Split View -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Left Panel: Request Info -->
      <div class="bg-white rounded-2xl overflow-hidden shadow-soft">
        <div class="bg-navy-50 px-6 py-4 border-b border-navy-100">
          <h3 class="text-navy-800 font-semibold flex items-center gap-2">
            <span class="text-xl">📄</span> Détails de la demande
          </h3>
        </div>
        <div class="p-6 space-y-6">
          <!-- Cover Placeholder -->
          <div
            class="bg-gradient-to-br from-navy-100 to-navy-200 rounded-xl w-full h-56 flex items-center justify-center mb-6"
          >
            <span class="text-6xl text-navy-600/60">📗</span>
          </div>

          <!-- Metadata List -->
          <div class="space-y-4 text-sm">
            <div>
              <span class="text-gray-500 block">Titre</span>
              <span class="text-navy-800 font-medium"
                >Étude sur le Commerce Transfrontalier au Bénin</span
              >
            </div>
            <div>
              <span class="text-gray-500 block">Type</span>
              <span class="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs">Mémoire</span>
            </div>
            <div>
              <span class="text-gray-500 block">Auteurs</span>
              <span class="text-navy-800">Marie Zannou</span>
            </div>
            <div>
              <span class="text-gray-500 block">Éditeur</span>
              <span class="text-gray-700">—</span>
            </div>
            <div>
              <span class="text-gray-500 block">Année</span>
              <span class="text-gray-700 font-mono">2024</span>
            </div>
            <div>
              <span class="text-gray-500 block">Langue</span>
              <span class="text-gray-700">Français</span>
            </div>
            <div>
              <span class="text-gray-500 block">Pages</span>
              <span class="text-gray-700 font-mono">187</span>
            </div>
            <div>
              <span class="text-gray-500 block">Catégorie</span>
              <span class="text-gray-700">Économie</span>
            </div>
            <div>
              <span class="text-gray-500 block">Mots-clés</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span class="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs"
                  >commerce</span
                >
                <span class="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs"
                  >transfrontalier</span
                >
                <span class="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">Bénin</span>
              </div>
            </div>
            <div>
              <span class="text-gray-500 block">Résumé</span>
              <p class="text-gray-700 leading-relaxed mt-1">
                Cette étude examine les dynamiques du commerce transfrontalier entre le Bénin et ses
                voisins, en analysant les défis et opportunités pour les acteurs économiques locaux.
              </p>
            </div>
            <div>
              <span class="text-gray-500 block">Déposant</span>
              <span class="text-navy-800">Marie Zannou</span>
            </div>
            <div>
              <span class="text-gray-500 block">Soumis le</span>
              <span class="text-gray-700 font-mono">07 juin 2024</span>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200">
            <button
              class="w-full flex items-center justify-center gap-2 border border-navy-700 text-navy-700 py-3 rounded-xl font-medium hover:bg-navy-50 transition-colors"
            >
              📥 Télécharger le fichier pour examen (PDF • 4.2 Mo)
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: PDF Preview -->
      <div class="bg-white rounded-2xl overflow-hidden shadow-soft">
        <div
          class="bg-navy-50 px-6 py-4 border-b border-navy-100 flex items-center justify-between"
        >
          <h3 class="text-navy-800 font-semibold flex items-center gap-2">
            <span class="text-xl">📖</span> Prévisualisation
          </h3>
          <div class="flex items-center gap-3 text-sm text-gray-600">
            <span class="font-mono">3 / 187</span>
            <div class="flex items-center gap-2">
              <button class="hover:text-navy-800">-</button>
              <span class="font-mono">85%</span>
              <button class="hover:text-navy-800">+</button>
            </div>
            <button class="hover:text-navy-800">⛶</button>
          </div>
        </div>
        <div class="p-6 bg-gray-50 h-[600px] flex items-center justify-center">
          <div class="text-center text-gray-500">
            <div class="text-6xl mb-3">📄</div>
            <p class="text-sm">Prévisualisation du document PDF</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Decision Section -->
    <div class="bg-white rounded-2xl shadow-soft border-t-4 border-teal-600 p-8">
      <div class="mb-6">
        <h3 class="text-xl font-bold text-navy-800 font-serif mb-2">⚖️ Votre décision</h3>
        <p class="text-gray-600 text-sm">
          Votre avis sera transmis à l'administrateur pour la finalisation de la publication ou du
          rejet.
        </p>
      </div>

      <!-- Decision Buttons -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <button
          @click="decision = 'approve'"
          class="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors"
          :class="{ 'ring-4 ring-green-200': decision === 'approve' }"
        >
          ✅ Valider cette demande
        </button>
        <button
          @click="decision = 'reject'"
          class="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors"
          :class="{ 'ring-4 ring-red-200': decision === 'reject' }"
        >
          ❌ Refuser cette demande
        </button>
      </div>

      <!-- Rejection Justification -->
      <div v-if="decision === 'reject'" class="animate-pulse">
        <div class="space-y-3">
          <label for="justification" class="block text-sm font-medium text-navy-800">
            Justification du refus <span class="text-red-600">*</span>
          </label>
          <p class="text-gray-500 text-sm">
            La justification est obligatoire et doit être clairement formulée pour le déposant.
          </p>
          <textarea
            id="justification"
            v-model="justification"
            :class="[
              'w-full rounded-xl px-4 py-3 text-gray-800 focus:outline-none',
              justification.length < 50 ? 'border-2 border-red-300' : 'border-2 border-gray-200',
            ]"
            rows="6"
            placeholder="Expliquez les raisons du refus de cette demande..."
          ></textarea>
          <div class="flex items-center justify-between text-sm">
            <span :class="justification.length < 50 ? 'text-red-600' : 'text-gray-500'">
              {{ justification.length }} / minimum 50 caractères
            </span>
          </div>
          <p v-if="justification.length < 50" class="text-red-600 text-sm flex items-center gap-1">
            ⚠️ La justification doit contenir au moins 50 caractères
          </p>
        </div>
      </div>

      <!-- Submit -->
      <div class="mt-6">
        <button
          @click="handleSubmit"
          :disabled="!canSubmit || isSubmitting"
          class="w-full py-3 rounded-xl font-semibold text-lg"
          :class="
            canSubmit && !isSubmitting
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          "
        >
          {{ isSubmitting ? '...' : 'Soumettre ma décision' }}
        </button>
      </div>
    </div>
  </ResponsableLayout>
</template>
