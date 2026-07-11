<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useDepositStore } from '@/stores/deposit'
import { useToastStore } from '@/stores/toast'
import { publicService } from '@/services/api/public.service'
import { adminService } from '@/services/api/admin.service'
import { UploadCloud, X, GripVertical } from '@lucide/vue'

const router = useRouter()
const depositStore = useDepositStore()
const toast = useToastStore()

const categories = ref([])
const publishers = ref([])
const publisherSearch = ref('')
const showPublisherDropdown = ref(false)
const isSubmitting = ref(false)

const ISO_LANGUAGES = {
  fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand',
  it: 'Italien', pt: 'Portugais', nl: 'Néerlandais', ru: 'Russe',
  zh: 'Chinois', ar: 'Arabe', ja: 'Japonais', ko: 'Coréen',
}

const DOCUMENT_TYPES = [
  { value: 'livre', label: 'Livre' },
  { value: 'memoire', label: 'Mémoire' },
  { value: 'these', label: 'Thèse' },
  { value: 'article', label: 'Article' },
  { value: 'revue', label: 'Revue' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'guide', label: 'Guide' },
  { value: 'autre', label: 'Autre' },
]

const form = ref({
  title: '',
  author: '',
  publication_year: '',
  category_id: '',
  description: '',
  proposed_file: null,
  cover_image: null,
  cover_image_preview: null,
  publisher: '',
  isbn: '',
  language: 'fr',
  type: '',
  keywords: [],
  pages: '',
})

const keywordInput = ref('')

const coverImageError = ref('')
const isbnError = ref('')
const publisherDebounce = ref(null)

const filteredPublishers = computed(() => {
  if (!publisherSearch.value) return publishers.value
  const q = publisherSearch.value.toLowerCase()
  return publishers.value.filter(p =>
    p.name?.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    const data = await publicService.getCategories()
    categories.value = Array.isArray(data) ? data : []
  } catch {
    categories.value = []
  }
  try {
    const data = await adminService.getAllPublishers()
    publishers.value = Array.isArray(data) ? data : (data?.publishers ?? [])
  } catch {
    publishers.value = []
  }
})

function handleCoverFileChange(event) {
  coverImageError.value = ''
  if (event.target.files.length > 0) {
    const file = event.target.files[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      coverImageError.value = 'Format non supporté. Utilisez JPG, PNG ou WebP.'
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      coverImageError.value = 'Le fichier ne doit pas dépasser 5 Mo.'
      return
    }
    form.value.cover_image = file
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.cover_image_preview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function removeCoverImage() {
  form.value.cover_image = null
  form.value.cover_image_preview = null
}

function handleFileChange(event) {
  if (event.target.files.length > 0) {
    form.value.proposed_file = event.target.files[0]
  }
}

function selectPublisher(name) {
  form.value.publisher = name
  publisherSearch.value = name
  showPublisherDropdown.value = false
}

function onPublisherInput() {
  showPublisherDropdown.value = true
}

// function validateISBN(value) {
//   if (!value) return ''
//   const cleaned = value.replace(/[-\s]/g, '')
//   if (cleaned.length === 10) {
//     let sum = 0
//     for (let i = 0; i < 10; i++) {
//       const c = cleaned[i]
//       if (i < 9 && !/\d/.test(c)) return 'Format ISBN-10 invalide.'
//       if (i === 9 && c !== 'X' && !/\d/.test(c)) return 'Format ISBN-10 invalide.'
//       sum += (i === 9 && c === 'X') ? 10 : (i === 9 ? parseInt(c) : (i + 1) * parseInt(c))
//     }
//     if (sum % 11 !== 0) return 'ISBN-10 invalide (somme de contrôle).'
//     return ''
//   }
//   if (cleaned.length === 13) {
//     if (!/^\d{13}$/.test(cleaned)) return 'Format ISBN-13 invalide.'
//     let sum = 0
//     for (let i = 0; i < 13; i++) {
//       sum += parseInt(cleaned[i]) * (i % 2 === 0 ? 1 : 3)
//     }
//     if (sum % 10 !== 0) return 'ISBN-13 invalide (somme de contrôle).'
//     return ''
//   }
//   return 'L\'ISBN doit contenir 10 ou 13 chiffres.'
// }

// function onIsbnInput() {
//   isbnError.value = validateISBN(form.value.isbn)
// }

function addKeyword() {
  const kw = keywordInput.value.trim().toLowerCase()
  if (!kw) return
  if (form.value.keywords.length >= 15) {
    toast.error('Maximum 15 mots-clés autorisés.')
    return
  }
  if (form.value.keywords.includes(kw)) {
    toast.error('Ce mot-clé existe déjà.')
    return
  }
  form.value.keywords.push(kw)
  keywordInput.value = ''
}

function removeKeyword(index) {
  form.value.keywords.splice(index, 1)
}

function moveKeyword(from, to) {
  if (to < 0 || to >= form.value.keywords.length) return
  const item = form.value.keywords.splice(from, 1)[0]
  form.value.keywords.splice(to, 0, item)
}

function onKeywordKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addKeyword()
  }
  if (e.key === ',' || e.key === ';') {
    e.preventDefault()
    addKeyword()
  }
}

async function handleSubmit() {
  if (!form.value.title) {
    toast.error('Le titre est obligatoire.')
    return
  }
  if (form.value.isbn && isbnError.value) {
    toast.error('Veuillez corriger l\'ISBN avant de soumettre.')
    return
  }
  isSubmitting.value = true
  try {
    const payload = new FormData()
    payload.append('title', form.value.title)
    if (form.value.author) payload.append('author', form.value.author)
    if (form.value.publication_year) payload.append('publication_year', String(parseInt(form.value.publication_year)))
    if (form.value.category_id) payload.append('category_id', String(form.value.category_id))
    if (form.value.description) payload.append('description', form.value.description)
    if (form.value.proposed_file instanceof File) payload.append('proposed_file', form.value.proposed_file)
    if (form.value.publisher) payload.append('publisher', form.value.publisher)
    if (form.value.isbn) payload.append('isbn', form.value.isbn)
    if (form.value.pages) payload.append('pages', String(parseInt(form.value.pages)))
    payload.append('language', form.value.language)
    if (form.value.type) payload.append('type', form.value.type)
    if (form.value.keywords.length) {
      form.value.keywords.forEach(kw => payload.append('keywords[]', kw))
    }
    if (form.value.cover_image_preview) payload.append('cover_image', form.value.cover_image_preview)
    await depositStore.createDeposit(payload)
    router.push('/my-documents')
  } catch {
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

      <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl p-8 shadow-soft max-w-3xl">
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
              <label class="block text-sm font-medium text-navy-800 mb-2">Type de document</label>
              <select
                v-model="form.type"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
                <option value="">Sélectionnez un type</option>
                <option v-for="dt in DOCUMENT_TYPES" :key="dt.value" :value="dt.value">
                  {{ dt.label }}
                </option>
              </select>
            </div>
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
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-navy-800 mb-2">Éditeur</label>
              <div class="relative">
                <input
                  v-model="publisherSearch"
                  @input="onPublisherInput"
                  @focus="showPublisherDropdown = true"
                  @blur="setTimeout(() => showPublisherDropdown = false, 200)"
                  class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                  placeholder="Recherchez un éditeur"
                />
                <div
                  v-if="showPublisherDropdown && filteredPublishers.length > 0"
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="p in filteredPublishers"
                    :key="p.id"
                    type="button"
                    @mousedown.prevent="selectPublisher(p.name)"
                    class="w-full text-left px-4 py-2.5 text-sm text-navy-800 hover:bg-beige transition-colors"
                  >
                    {{ p.name }}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-navy-800 mb-2">ISBN</label>
              <input
                v-model="form.isbn"
                @input="onIsbnInput"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                :class="{ 'border-red-400': isbnError }"
                placeholder="978-2-1234-5680-1"
              />
              <p v-if="isbnError" class="text-red-600 text-xs mt-1">{{ isbnError }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-navy-800 mb-2">Langue</label>
              <select
                v-model="form.language"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
                <option v-for="(label, code) in ISO_LANGUAGES" :key="code" :value="code">
                  {{ label }}
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
            <div>
              <label class="block text-sm font-medium text-navy-800 mb-2">Nombre de pages</label>
              <input
                type="number"
                v-model="form.pages"
                min="1"
                class="w-full bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                placeholder="Ex: 150"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-navy-800 mb-2">Mots-clés</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <div
                v-for="(kw, index) in form.keywords"
                :key="index"
                class="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <span class="cursor-grab text-teal-400">
                  <GripVertical class="w-3.5 h-3.5" />
                </span>
                <span>{{ kw }}</span>
                <button type="button" @click="removeKeyword(index)" class="text-teal-500 hover:text-teal-700">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <input
                v-model="keywordInput"
                @keydown="onKeywordKeydown"
                class="flex-1 bg-beige border border-gray-200 rounded-xl px-4 py-3 text-navy-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                placeholder="Tapez un mot-clé puis Entrée"
                :disabled="form.keywords.length >= 15"
              />
              <button
                type="button"
                @click="addKeyword"
                :disabled="form.keywords.length >= 15"
                class="px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ form.keywords.length }} / 15 mots-clés</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-navy-800 mb-2">Image de couverture</label>
            <div v-if="!form.cover_image_preview" class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-beige">
              <UploadCloud class="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p class="text-gray-500 mb-2">Téléversez une image de couverture</p>
              <label for="cover" class="text-teal-600 font-medium cursor-pointer hover:underline">
                Formats acceptés : JPG, PNG, WebP (max 5 Mo)
              </label>
              <input
                type="file"
                id="cover"
                @change="handleCoverFileChange"
                accept=".jpg,.jpeg,.png,.webp"
                class="hidden"
              />
            </div>
            <div v-else class="relative inline-block">
              <img
                :src="form.cover_image_preview"
                alt="Aperçu couverture"
                class="h-40 rounded-xl object-cover border border-gray-200"
              />
              <button
                type="button"
                @click="removeCoverImage"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <p v-if="coverImageError" class="text-red-600 text-xs mt-1">{{ coverImageError }}</p>
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
