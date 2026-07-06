<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useDepositStore } from '@/stores/deposit'
import { useToastStore } from '@/stores/toast'
import { publicService } from '@/services/api/public.service'
import { UploadCloud } from '@lucide/vue'

const router = useRouter()
const depositStore = useDepositStore()
const toast = useToastStore()

const categories = ref([])
const isSubmitting = ref(false)

const form = ref({
  title: '',
  author: '',
  publication_year: '',
  category_id: '',
  description: '',
  proposed_file: null,
})

onMounted(async () => {
  try {
    const data = await publicService.getCategories()
    categories.value = Array.isArray(data) ? data : []
  } catch {
    categories.value = []
  }
})

function handleFileChange(event) {
  if (event.target.files.length > 0) {
    form.value.proposed_file = event.target.files[0]
  }
}

async function handleSubmit() {
  if (!form.value.title) {
    toast.error('Le titre est obligatoire.')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      title: form.value.title,
      author: form.value.author || null,
      publication_year: form.value.publication_year ? parseInt(form.value.publication_year) : null,
      category_id: form.value.category_id || null,
      description: form.value.description || null,
      proposed_file: form.value.proposed_file?.name || null,
    }
    await depositStore.createDeposit(payload)
    router.push('/my-documents')
  } catch {
    // error handled in store
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <div>
      <div class="flex items-center gap-4 mb-6">
        <router-link
          to="/my-documents"
          class="text-gray-500 hover:text-navy-800 flex items-center gap-1 text-sm"
        >
          ← Retour à mes dépôts
        </router-link>
      </div>
      <h1 class="text-3xl font-bold text-navy-800 font-serif mb-2">Déposer un document</h1>
      <p class="text-gray-500 mb-8">Soumettez une nouvelle référence documentaire au catalogue</p>

      <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl p-8 shadow-soft max-w-2xl">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-navy-800 mb-2">Titre du document *</label>
            <input
              v-model="form.title"
              required
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              placeholder="Entrez le titre complet du document"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-navy-800 mb-2">Auteur(s)</label>
            <input
              v-model="form.author"
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              placeholder="Ex: Jean Dupont, Marie Martin"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-navy-800 mb-2">Catégorie</label>
              <select
                v-model="form.category_id"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
                <option value="">Sélectionnez une catégorie</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-navy-800 mb-2">Année de publication</label>
              <input
                type="number"
                v-model="form.publication_year"
                min="1000"
                max="2099"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                placeholder="2024"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-navy-800 mb-2">Résumé / Description</label>
            <textarea
              v-model="form.description"
              rows="5"
              class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              placeholder="Donnez une brève description du contenu du document..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-navy-800 mb-2">Fichier du document (PDF, EPUB, DOCX)</label>
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-beige">
              <UploadCloud class="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p class="text-gray-500 mb-2">Glissez-déposez votre fichier ici, ou</p>
              <label for="file" class="text-teal-600 font-medium cursor-pointer hover:underline">
                cliquez pour sélectionner
              </label>
              <input
                type="file"
                id="file"
                @change="handleFileChange"
                accept=".pdf,.epub,.docx"
                class="hidden"
              />
              <p v-if="form.proposed_file" class="text-teal-700 mt-2">✅ {{ form.proposed_file.name }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <router-link
              to="/my-documents"
              class="px-6 py-3 text-gray-600 font-medium hover:text-navy-800"
            >
              Annuler
            </router-link>
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
