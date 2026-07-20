<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReferenceStore } from '@/stores/reference'
import { useCategoryStore } from '@/stores/category'
import { usePublisherStore } from '@/stores/publisher'
import { useAuthorStore } from '@/stores/author'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, BookOpen, X, Upload, FileText } from '@lucide/vue'

const referenceStore = useReferenceStore()
const categoryStore = useCategoryStore()
const publisherStore = usePublisherStore()
const authorStore = useAuthorStore()

// ─── State ──────────────────────�...

const searchQuery = ref('')
const filterStatus = ref('')
const filterDocumentType = ref('')
const filterLanguage = ref('')
const currentPage = ref(1)
const perPage = ref(25)
const perPageOptions = [10, 25, 50, 100]
const searchTimeout = ref(null)

const toast = ref({ message: '', type: 'success' })

// Data for dropdowns
const categories = ref([])
const publishers = ref([])
const authors = ref([])

const modal = ref({
  visible: false,
  title: '',
  message: '',
  confirmLabel: '',
  danger: false,
  action: null,
  data: null,
})

const referenceModal = ref({
  visible: false,
  isEdit: false,
  referenceId: null,
  form: {
    title: '',
    subtitle: '',
    abstract: '',
    isbn: '',
    publication_year: null,
    document_type: 'livre',
    language: 'fr',
    pages: null,
    category_id: null,
    publisher_id: null,
    cover_image: '',
    file_path: '',
    status: 'draft',
    authors: [],
    keywords: [],
  },
  newKeyword: '',
})

// Fichiers upload
const coverImageFile = ref(null)
const filePathFile = ref(null)
const coverImagePreview = ref('')

const handleCoverImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    coverImageFile.value = file
    const reader = new FileReader()
    reader.onload = (ev) => { coverImagePreview.value = ev.target.result }
    reader.readAsDataURL(file)
  }
}

const handleFilePathChange = (e) => {
  filePathFile.value = e.target.files[0] || null
}

const removeCoverImage = () => {
  coverImageFile.value = null
  coverImagePreview.value = ''
  referenceModal.value.form.cover_image = ''
}

const removeFilePath = () => {
  filePathFile.value = null
  referenceModal.value.form.file_path = ''
}

const detailsModal = ref({
  visible: false,
  reference: null,
})

// ─── Computed ─────────────────────�...

const filteredReferences = computed(() => {
  if (!referenceStore.references) return []
  let filtered = [...referenceStore.references]

  if (filterStatus.value) {
    filtered = filtered.filter((r) => r.status === filterStatus.value)
  }

  if (filterDocumentType.value) {
    filtered = filtered.filter((r) => r.document_type === filterDocumentType.value)
  }

  if (filterLanguage.value) {
    filtered = filtered.filter((r) => r.language === filterLanguage.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((r) =>
      r.title.toLowerCase().includes(query) ||
      (r.subtitle && r.subtitle.toLowerCase().includes(query)) ||
      (r.isbn && r.isbn.toLowerCase().includes(query))
    )
  }

  return filtered
})

const paginatedReferences = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredReferences.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredReferences.value.length / perPage.value))

const visiblePages = computed(() => {
  const c = currentPage.value
  const l = totalPages.value
  const pages = []

  if (l <= 7) {
    for (let i = 1; i <= l; i++) pages.push(i)
  } else {
    if (c > 3) pages.push(1)
    if (c > 4) pages.push('...')
    for (let i = Math.max(2, c - 1); i <= Math.min(l - 1, c + 1); i++) pages.push(i)
    if (c < l - 3) pages.push('...')
    if (l > 1 && c < l - 1) pages.push(l)
  }

  return pages
})

// ─── Actions ──────────────────────...

const fetchAllReferences = () => {
  referenceStore.fetchReferences({ per_page: 9999 }).catch(() => showToast('Erreur lors du chargement.', 'error'))
}

const onSearchInput = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const resetPage = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  currentPage.value = page
}

const showToast = (message, type = 'success') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = { message: '', type: 'success' }), 3500)
}

// ─── Modals ──────────────────────�...

const openCreateModal = () => {
  referenceModal.value = {
    visible: true,
    isEdit: false,
    referenceId: null,
    form: {
      title: '',
      subtitle: '',
      abstract: '',
      isbn: '',
      publication_year: null,
      document_type: 'livre',
      language: 'fr',
      pages: null,
      category_id: null,
      publisher_id: null,
      cover_image: '',
      file_path: '',
      status: 'draft',
      authors: [],
      keywords: [],
    },
    newKeyword: '',
  }
  coverImageFile.value = null
  filePathFile.value = null
  coverImagePreview.value = ''
}

const openEditModal = async (reference) => {
  try {
    const data = await referenceStore.fetchReference(reference.id)
    referenceModal.value = {
      visible: true,
      isEdit: true,
      referenceId: reference.id,
      form: {
        title: data.title,
        subtitle: data.subtitle || '',
        abstract: data.abstract || '',
        isbn: data.isbn || '',
        publication_year: data.publication_year,
        document_type: data.document_type,
        language: data.language,
        pages: data.pages,
        category_id: data.category_id,
        publisher_id: data.publisher_id,
        cover_image: data.cover_image || '',
        file_path: data.file_path || '',
        status: data.status,
        authors: data.authors?.map(a => a.id) || [],
        keywords: data.keywords?.map(k => k.keyword) || [],
      },
      newKeyword: '',
    }
    coverImageFile.value = null
    filePathFile.value = null
    coverImagePreview.value = data.cover_image || ''
  } catch (err) {
    showToast('Erreur lors du chargement des détails.', 'error', err)
  }
}

const openViewModal = async (reference) => {
  try {
    const data = await referenceStore.fetchReference(reference.id)
    detailsModal.value = {
      visible: true,
      reference: data,
    }
  } catch (err) {
    showToast('Erreur lors du chargement des détails.', 'error', err)
  }
}

const closeReferenceModal = () => {
  referenceModal.value.visible = false
}

const addKeyword = () => {
  const trimmedKeyword = referenceModal.value.newKeyword.trim()
  if (trimmedKeyword && !referenceModal.value.form.keywords.includes(trimmedKeyword)) {
    referenceModal.value.form.keywords.push(trimmedKeyword)
    referenceModal.value.newKeyword = ''
  }
}

const removeKeyword = (index) => {
  referenceModal.value.form.keywords.splice(index, 1)
}

const confirmDelete = (reference) => {
  modal.value = {
    visible: true,
    title: 'Supprimer la référence',
    message: `Êtes-vous sûr de vouloir supprimer "${reference.title}" ?`,
    confirmLabel: 'Supprimer',
    danger: true,
    action: 'delete',
    data: reference,
  }
}

const executeModal = async () => {
  try {
    if (modal.value.action === 'delete') {
      await referenceStore.deleteReference(modal.value.data.id)
      showToast('Référence supprimée avec succès.')
    }
    modal.value.visible = false
    fetchAllReferences()
  } catch (err) {
    showToast('Erreur lors de l\'action.', 'error', err)
  }
}

const submitReferenceForm = async () => {
  try {
    const form = referenceModal.value.form
    const hasFiles = coverImageFile.value || filePathFile.value

    let data
    if (hasFiles) {
      const fd = new FormData()

      const scalarFields = ['title', 'subtitle', 'abstract', 'isbn', 'publication_year',
                            'document_type', 'language', 'pages', 'category_id',
                            'publisher_id', 'status']

      for (const key of scalarFields) {
        const val = form[key]
        if (val !== null && val !== '' && val !== undefined) {
          fd.append(key, val)
        }
      }

      for (const authorId of form.authors) {
        fd.append('authors[]', authorId)
      }

      for (const keyword of form.keywords) {
        fd.append('keywords[]', keyword)
      }

      if (coverImageFile.value) {
        fd.append('cover_image', coverImageFile.value)
      }

      if (filePathFile.value) {
        fd.append('file_path', filePathFile.value)
      }

      data = fd
    } else {
      data = { ...form }
      if (!data.cover_image) delete data.cover_image
      if (!data.file_path) delete data.file_path
    }

    if (referenceModal.value.isEdit) {
      await referenceStore.updateReference(referenceModal.value.referenceId, data)
      showToast('Référence mise à jour avec succès.')
    } else {
      await referenceStore.createReference(data)
      showToast('Référence créée avec succès.')
    }
    closeReferenceModal()
    fetchAllReferences()
  } catch (err) {
    showToast('Erreur lors de l\'enregistrement.', 'error', err)
  }
}

// ─── Lifecycle ─────────────────────�...

onMounted(async () => {
  try {
    // Charger les références, catégories, éditeurs et auteurs en parallèle
    await Promise.all([
      fetchAllReferences(),
      (async () => {
        const cats = await categoryStore.fetchAllCategories()
        categories.value = cats || []
      })(),
      (async () => {
        const pubs = await publisherStore.fetchAllPublishers()
        publishers.value = pubs || []
      })(),
      (async () => {
        const auths = await authorStore.fetchAllAuthors()
        authors.value = auths || []
      })(),
    ])
  } catch (err) {
    showToast('Erreur lors du chargement des données.', 'error', err)
  }
})
</script>

<template>
  <AdminLayout>
    <template #title>
      Références
      <span
        v-if="referenceStore.references.length"
        class="ml-2 text-xs font-mono font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"
      >
        {{ referenceStore.references.length }}
      </span>
    </template>

    <!-- Toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="toast.message"
          :class="toast.type === 'success' ? 'bg-teal-600' : 'bg-red-600'"
          class="fixed top-4 right-4 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg z-50"
        >
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="relative flex-1 min-w-50">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="Rechercher une référence..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
        />
      </div>
      <select
        v-model="filterStatus"
        @change="resetPage"
        class="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]"
      >
        <option value="">Tous les statuts</option>
        <option value="draft">Brouillon</option>
        <option value="published">Publié</option>
        <option value="archived">Archivé</option>
      </select>
      <select
        v-model="filterDocumentType"
        @change="resetPage"
        class="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]"
      >
        <option value="">Tous les types</option>
        <option value="livre">Livre</option>
        <option value="memoire">Mémoire</option>
        <option value="these">Thèse</option>
        <option value="article">Article</option>
        <option value="revue">Revue</option>
        <option value="rapport">Rapport</option>
        <option value="guide">Guide</option>
        <option value="autre">Autre</option>
      </select>
      <select
        v-model="filterLanguage"
        @change="resetPage"
        class="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]"
      >
        <option value="">Toutes les langues</option>
        <option value="fr">Français</option>
        <option value="en">Anglais</option>
        <option value="autre">Autre</option>
      </select>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a7a6f] transition-colors shrink-0"
      >
        <Plus class="w-4 h-4" />
        Nouvelle référence
      </button>
    </div>

    <!-- Loading -->
    <div v-if="referenceStore.isLoading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Cards Grid -->
    <div v-else-if="referenceStore.references && paginatedReferences.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="reference in paginatedReferences"
        :key="reference.id"
        class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-gray-100"
      >
        <!-- Cover -->
        <div class="relative aspect-[2/3] bg-gradient-to-br from-[#1B2A4A] to-[#1E3368] overflow-hidden">
          <img
            v-if="reference.cover_image"
            :src="reference.cover_image"
            class="w-full h-full object-cover"
            alt="Couverture"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <BookOpen class="w-16 h-16 text-white/20" />
          </div>
          <!-- Status Badge -->
          <div class="absolute top-3 left-3">
            <span
              :class="referenceStore.getStatusClass(reference.status)"
              class="px-2.5 py-1 rounded-full text-[10px] font-medium shadow-sm"
            >
              {{ referenceStore.getStatusLabel(reference.status) }}
            </span>
          </div>
          <!-- Actions Overlay -->
          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <button
              @click="openViewModal(reference)"
              class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white hover:text-[#0D9488] transition-all"
              title="Voir les détails"
            >
              <Eye class="w-4 h-4" />
            </button>
            <button
              @click="openEditModal(reference)"
              class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-all"
              title="Modifier"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="confirmDelete(reference)"
              class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white hover:text-red-600 transition-all"
              title="Supprimer"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <!-- Content -->
        <div class="p-4">
          <div class="flex items-center gap-2 mb-2">
            <span
              v-if="reference.category"
              class="inline-block px-2 py-1 bg-[#ECFFFD] text-[#0D9488] rounded text-xs font-medium"
            >
              {{ reference.category.name }}
            </span>
            <span
              v-else
              class="inline-block px-2 py-1 bg-gray-100 text-gray-400 rounded text-xs font-medium"
            >
              Non catégorisé
            </span>
          </div>
          <h3 class="font-semibold text-[#1B2A4A] text-sm line-clamp-2 group-hover:text-[#0D9488] transition-colors mb-1">
            {{ reference.title }}
          </h3>
          <p v-if="reference.subtitle" class="text-xs text-gray-500 line-clamp-1 mb-2">
            {{ reference.subtitle }}
          </p>
          <div class="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <span class="bg-[#F1F0EC] px-2 py-1 rounded">
              {{ referenceStore.getDocumentTypeLabel(reference.document_type) }}
            </span>
            <span>{{ referenceStore.getLanguageLabel(reference.language) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 py-16 text-center">
      <BookOpen class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="font-medium text-[#1B2A4A]">Aucune référence trouvée</p>
      <p class="text-sm text-gray-400 mt-1">Modifiez vos filtres ou créez une nouvelle référence.</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages >= 1" class="flex items-center justify-between mt-5">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">Afficher</span>
        <select
          v-model="perPage"
          @change="resetPage"
          class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
        >
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span class="text-sm text-gray-500">par page</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="typeof page === 'number' ? changePage(page) : null"
          class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
          :class="page === currentPage
            ? 'bg-[#0D9488] text-white border-[#0D9488]'
            : typeof page === 'number'
              ? 'border border-gray-200 text-gray-500 hover:bg-gray-50'
              : 'border-transparent text-gray-400 cursor-default'"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </button>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <Teleport to="body">
      <div
        v-if="modal.visible"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="modal.visible = false"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-[#1B2A4A] mb-2">{{ modal.title }}</h3>
          <p class="text-sm text-gray-600 mb-6">{{ modal.message }}</p>
          <div class="flex gap-3 justify-end">
            <button
              @click="modal.visible = false"
              class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="executeModal"
              :disabled="referenceStore.isActionLoading"
              :class="modal.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0D9488] hover:bg-[#0a7a6f]'"
              class="px-4 py-2 rounded-xl text-sm text-white font-semibold disabled:opacity-50"
            >
              {{ referenceStore.isActionLoading ? 'En cours...' : modal.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal création/modification -->
    <Teleport to="body">
      <div
        v-if="referenceModal.visible"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4"
        @click.self="closeReferenceModal"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-4xl mx-auto my-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold text-[#1B2A4A] mb-6 flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-[#0D9488]" />
            {{ referenceModal.isEdit ? 'Modifier la référence' : 'Nouvelle référence' }}
          </h3>
          <form @submit.prevent="submitReferenceForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  v-model="referenceModal.form.title"
                  type="text"
                  required
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
                <input
                  v-model="referenceModal.form.subtitle"
                  type="text"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Résumé</label>
                <textarea
                  v-model="referenceModal.form.abstract"
                  rows="4"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all resize-none"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                <input
                  v-model="referenceModal.form.isbn"
                  type="text"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Année de publication</label>
                <input
                  v-model="referenceModal.form.publication_year"
                  type="number"
                  min="1000"
                  max="9999"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type de document *</label>
                <select
                  v-model="referenceModal.form.document_type"
                  required
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                >
                  <option value="livre">Livre</option>
                  <option value="memoire">Mémoire</option>
                  <option value="these">Thèse</option>
                  <option value="article">Article</option>
                  <option value="revue">Revue</option>
                  <option value="rapport">Rapport</option>
                  <option value="guide">Guide</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Langue *</label>
                <select
                  v-model="referenceModal.form.language"
                  required
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de pages</label>
                <input
                  v-model="referenceModal.form.pages"
                  type="number"
                  min="1"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  v-model="referenceModal.form.category_id"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                >
                  <option :value="null">-- Sélectionner une catégorie --</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Éditeur</label>
                <select
                  v-model="referenceModal.form.publisher_id"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                >
                  <option :value="null">-- Sélectionner un éditeur --</option>
                  <option v-for="pub in publishers" :key="pub.id" :value="pub.id">
                    {{ pub.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                <select
                  v-model="referenceModal.form.status"
                  required
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Image de couverture</label>
                <div class="border border-gray-200 rounded-xl p-4">
                  <!-- Preview -->
                  <div v-if="coverImagePreview || referenceModal.form.cover_image" class="relative mb-4">
                    <img
                      :src="coverImagePreview || referenceModal.form.cover_image"
                      class="w-full h-48 object-cover rounded-xl"
                      alt="Aperçu couverture"
                    />
                    <button
                      @click="removeCoverImage"
                      type="button"
                      class="absolute top-3 right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                  <!-- Upload -->
                  <label class="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-[#0D9488] transition-colors">
                    <Upload class="w-6 h-6 text-gray-400" />
                    <span class="text-sm text-gray-500">
                      {{ coverImageFile ? coverImageFile.name : 'Cliquez pour sélectionner une image' }}
                    </span>
                    <input type="file" @change="handleCoverImageChange" accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" class="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                <div class="border border-gray-200 rounded-xl p-4">
                  <!-- Fichier existant -->
                  <div v-if="referenceModal.form.file_path && !filePathFile" class="flex items-center justify-between mb-4 bg-gray-50 rounded-xl px-4 py-3">
                    <span class="text-sm text-gray-700 truncate flex-1 flex items-center gap-2">
                      <FileText class="w-4 h-4 shrink-0" />
                      {{ referenceModal.form.file_path }}
                    </span>
                    <button @click="removeFilePath" type="button" class="text-red-500 hover:text-red-700 transition-colors">
                      <X class="w-5 h-5" />
                    </button>
                  </div>
                  <!-- Upload -->
                  <label class="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-[#0D9488] transition-colors">
                    <Upload class="w-6 h-6 text-gray-400" />
                    <span class="text-sm text-gray-500">
                      {{ filePathFile ? filePathFile.name : 'Cliquez pour sélectionner un fichier (PDF, EPUB, DOCX)' }}
                    </span>
                    <input type="file" @change="handleFilePathChange" accept=".pdf,.epub,.docx" class="hidden" />
                  </label>
                </div>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Auteurs</label>
                <div class="border border-gray-200 rounded-xl p-4 max-h-52 overflow-y-auto">
                  <div v-if="authors.length === 0" class="text-sm text-gray-400 text-center py-6">
                    Aucun auteur disponible
                  </div>
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label v-for="author in authors" :key="author.id" class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors">
                      <input
                        type="checkbox"
                        :value="author.id"
                        v-model="referenceModal.form.authors"
                        class="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span class="text-sm text-gray-700">{{ author.first_name }} {{ author.last_name }}</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Mots-clés</label>
                <div class="border border-gray-200 rounded-xl p-4">
                  <div class="flex gap-3 mb-4">
                    <input
                      v-model="referenceModal.newKeyword"
                      @keyup.enter="addKeyword"
                      type="text"
                      placeholder="Ajouter un mot-clé..."
                      class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 transition-all"
                    />
                    <button
                      @click="addKeyword"
                      type="button"
                      class="bg-[#0D9488] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#0a7a6f] transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div v-if="referenceModal.form.keywords.length === 0" class="text-sm text-gray-400 text-center py-3">
                    Aucun mot-clé ajouté
                  </div>
                  <div v-else class="flex flex-wrap gap-2">
                    <div
                      v-for="(keyword, index) in referenceModal.form.keywords"
                      :key="index"
                      class="bg-[#0D9488] text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
                    >
                      {{ keyword }}
                      <button
                        @click="removeKeyword(index)"
                        type="button"
                        class="ml-1 hover:opacity-70 transition-opacity"
                      >
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                @click="closeReferenceModal"
                class="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="referenceStore.isActionLoading"
                class="px-6 py-3 rounded-xl bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0a7a6f] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="referenceStore.isActionLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ referenceStore.isActionLoading ? (referenceModal.isEdit ? 'Modification...' : 'Création...') : (referenceModal.isEdit ? 'Enregistrer' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal détails (Side Drawer) -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-in-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in-out duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div
          v-if="detailsModal.visible"
          class="fixed inset-0 bg-black/50 z-50"
          @click.self="detailsModal.visible = false"
        >
        </div>
      </Transition>
      <Transition enter-active-class="transition ease-in-out duration-300" enter-from-class="translate-x-full" enter-to-class="translate-x-0" leave-active-class="transition ease-in-out duration-200" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
        <div
          v-if="detailsModal.visible"
          class="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[60] overflow-y-auto"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-[#1B2A4A] flex items-center gap-2">
                <BookOpen class="w-6 h-6 text-[#0D9488]" />
                Détails de la référence
              </h3>
              <button @click="detailsModal.visible = false" class="text-gray-400 hover:text-[#1B2A4A] transition-colors">
                <X class="w-6 h-6" />
              </button>
            </div>

            <div v-if="detailsModal.reference" class="space-y-6">
              <!-- Cover + Title Section -->
              <div class="flex gap-6">
                <div v-if="detailsModal.reference.cover_image" class="shrink-0">
                  <img :src="detailsModal.reference.cover_image" class="w-40 h-56 object-cover rounded-xl shadow-md border border-gray-100" alt="Couverture">
                </div>
                <div v-else class="shrink-0 w-40 h-56 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
                  <BookOpen class="w-10 h-10 text-gray-300" />
                </div>
                <div class="flex-1 space-y-3">
                  <h4 class="text-lg font-bold text-[#1B2A4A]">{{ detailsModal.reference.title }}</h4>
                  <p v-if="detailsModal.reference.subtitle" class="text-gray-600">{{ detailsModal.reference.subtitle }}</p>
                  <span :class="referenceStore.getStatusClass(detailsModal.reference.status)" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium">
                    {{ referenceStore.getStatusLabel(detailsModal.reference.status) }}
                  </span>
                </div>
              </div>

              <!-- Info Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-sm font-medium text-gray-500">Type de document</span>
                  <p class="text-sm text-gray-900 mt-1">{{ referenceStore.getDocumentTypeLabel(detailsModal.reference.document_type) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Langue</span>
                  <p class="text-sm text-gray-900 mt-1">{{ referenceStore.getLanguageLabel(detailsModal.reference.language) }}</p>
                </div>
                <div v-if="detailsModal.reference.publication_year">
                  <span class="text-sm font-medium text-gray-500">Année de publication</span>
                  <p class="text-sm text-gray-900 mt-1">{{ detailsModal.reference.publication_year }}</p>
                </div>
                <div v-if="detailsModal.reference.pages">
                  <span class="text-sm font-medium text-gray-500">Nombre de pages</span>
                  <p class="text-sm text-gray-900 mt-1">{{ detailsModal.reference.pages }} pages</p>
                </div>
                <div v-if="detailsModal.reference.isbn">
                  <span class="text-sm font-medium text-gray-500">ISBN</span>
                  <p class="text-sm text-gray-900 mt-1 font-mono">{{ detailsModal.reference.isbn }}</p>
                </div>
                <div v-if="detailsModal.reference.category">
                  <span class="text-sm font-medium text-gray-500">Catégorie</span>
                  <p class="text-sm text-gray-900 mt-1">{{ detailsModal.reference.category.name }}</p>
                </div>
                <div v-if="detailsModal.reference.publisher">
                  <span class="text-sm font-medium text-gray-500">Éditeur</span>
                  <p class="text-sm text-gray-900 mt-1">{{ detailsModal.reference.publisher.name }}</p>
                </div>
              </div>

              <!-- Résumé -->
              <div v-if="detailsModal.reference.abstract" class="bg-gray-50 p-4 rounded-xl">
                <span class="text-sm font-medium text-gray-500">Résumé</span>
                <p class="text-sm text-gray-900 mt-2 leading-relaxed">{{ detailsModal.reference.abstract }}</p>
              </div>

              <!-- Auteurs -->
              <div v-if="detailsModal.reference.authors && detailsModal.reference.authors.length">
                <span class="text-sm font-medium text-gray-500">Auteurs</span>
                <div class="flex flex-wrap gap-2 mt-2">
                  <span v-for="author in detailsModal.reference.authors" :key="author.id" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {{ author.first_name }} {{ author.last_name }}
                  </span>
                </div>
              </div>

              <!-- Mots-clés -->
              <div v-if="detailsModal.reference.keywords && detailsModal.reference.keywords.length">
                <span class="text-sm font-medium text-gray-500">Mots-clés</span>
                <div class="flex flex-wrap gap-2 mt-2">
                  <span v-for="kw in detailsModal.reference.keywords" :key="kw.id" class="bg-[#0D9488]/10 text-[#0D9488] px-3 py-1 rounded-full text-xs font-medium">
                    {{ kw.keyword }}
                  </span>
                </div>
              </div>

              <!-- Téléchargement fichier -->
              <div v-if="detailsModal.reference.file_path" class="pt-4 border-t border-gray-100">
                <a
                  :href="detailsModal.reference.file_path"
                  download
                  class="flex items-center gap-3 px-4 py-3 bg-[#0D9488] text-white rounded-xl hover:bg-[#0E5F56] transition-colors font-medium"
                >
                  <FileText class="w-5 h-5" />
                  Télécharger le fichier
                </a>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>
