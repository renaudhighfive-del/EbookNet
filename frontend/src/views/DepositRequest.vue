<script setup>
import { ref } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { UploadCloud } from '@lucide/vue'

const isSubmitting = ref(false)

const form = ref({
  title: '',
  authors: '',
  category: '',
  type: '',
  year: '',
  language: 'fr',
  abstract: '',
  keywords: '',
  file: null
})

function handleFileChange(event) {
  if (event.target.files.length > 0) {
    form.value.file = event.target.files[0]
  }
}

async function handleSubmit() {
  isSubmitting.value = true
  // TODO: submit to backend
  console.log('Form data', form.value)
  setTimeout(() => {
    isSubmitting.value = false
    alert('Votre demande a été soumise avec succès !')
  }, 2000)
}
</script>



<template>
  <AuthenticatedLayout>
    <div>
      <h1 class="text-3xl font-bold text-navy-800 font-serif mb-2">
        Déposer un document
      </h1>
      <p class="text-gray-500 mb-8">
        Soumettez une nouvelle référence documentaire au catalogue
      </p>
      <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl p-8 shadow-soft max-w-2xl">
        <div class="space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-navy-800 mb-2">
              Titre du document *
            </label>
            <input
              type="text"
              id="title"
              v-model="form.title"
              required
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              placeholder="Entrez le titre complet du document"
            />
          </div>
          <!-- Authors -->
          <div>
            <label for="authors" class="block text-sm font-medium text-navy-800 mb-2">
              Auteur(s) *
            </label>
            <input
              type="text"
              id="authors"
              v-model="form.authors"
              required
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              placeholder="Ex: Jean Dupont, Marie Martin"
            />
          </div>
          <!-- Category & Type -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="category" class="block text-sm font-medium text-navy-800 mb-2">
                Catégorie *
              </label>
              <select
                id="category"
                v-model="form.category"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
                <option disabled value="">Sélectionnez une catégorie</option>
                <option>Droit & Législation</option>
                <option>Informatique</option>
                <option>Sciences de la Santé</option>
                <option>Littérature</option>
                <option>Histoire & Géographie</option>
                <option>Économie</option>
              </select>
            </div>
            <div>
              <label for="type" class="block text-sm font-medium text-navy-800 mb-2">
                Type de document *
              </label>
              <select
                id="type"
                v-model="form.type"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
                <option disabled value="">Sélectionnez un type</option>
                <option>Livre</option>
                <option>Mémoire</option>
                <option>Thèse</option>
                <option>Article</option>
                <option>Revue</option>
                <option>Rapport</option>
                <option>Guide</option>
              </select>
            </div>
          </div>
          <!-- Year & Language -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="year" class="block text-sm font-medium text-navy-800 mb-2">
                Année de publication
              </label>
              <input
                type="number"
                id="year"
                v-model="form.year"
                min="1900"
                max="2030"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                placeholder="2024"
              />
            </div>
            <div>
              <label for="language" class="block text-sm font-medium text-navy-800 mb-2">
                Langue *
              </label>
              <select
                id="language"
                v-model="form.language"
                required
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
          <!-- Abstract -->
          <div>
            <label for="abstract" class="block text-sm font-medium text-navy-800 mb-2">
              Résumé / Description *
            </label>
            <textarea
              id="abstract"
              v-model="form.abstract"
              required
              rows="5"
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              placeholder="Donnez une brève description du contenu du document..."
            ></textarea>
          </div>
          <!-- File Upload -->
          <div>
            <label for="file" class="block text-sm font-medium text-navy-800 mb-2">
              Fichier du document (PDF, EPUB, DOCX) *
            </label>
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-beige">
              <UploadCloud class="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p class="text-gray-500 mb-2">
                Glissez-déposez votre fichier ici, ou
              </p>
              <label for="file" class="text-teal-600 font-medium cursor-pointer hover:underline">
                cliquez pour sélectionner
              </label>
              <input
                type="file"
                id="file"
                @change="handleFileChange"
                accept=".pdf,.epub,.docx"
                required
                class="hidden"
              />
              <p v-if="form.file" class="text-teal-700 mt-2">
                ✅ {{ form.file.name }}
              </p>
            </div>
          </div>
          <!-- Keywords -->
          <div>
            <label for="keywords" class="block text-sm font-medium text-navy-800 mb-2">
              Mots-clés
            </label>
            <input
              type="text"
              id="keywords"
              v-model="form.keywords"
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              placeholder="Séparez les mots-clés par des virgules"
            />
          </div>
          <!-- Submit -->
          <div class="flex justify-end gap-4 pt-4">
            <button type="button" class="px-6 py-3 text-gray-600 font-medium hover:text-navy-800">
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-8 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Soumission en cours...' : 'Soumettre la demande' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </AuthenticatedLayout>
</template>

