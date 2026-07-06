<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  XCircle,
  Eye,
} from '@lucide/vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { useAuthorStore } from '../../stores/author'

const authorStore = useAuthorStore()

// ─── State ──────────────────────────────────────────────────────────────────

const searchQuery = ref('')
const filterNationality = ref('')
const perPage = ref(10)
const perPageOptions = [10, 25, 50, 100]

const toast = ref({ message: '', type: 'success' })
const modal = ref({
  visible: false,
  isEdit: false,
  authorId: null,
  form: { first_name: '', last_name: '', biography: '', nationality: '', birth_date: '', death_date: '' },
})
const deleteModal = ref({ visible: false, author: null })
const detailsModal = ref({ visible: false, author: null })

// ─── Filtrage frontend ─────────────────────────────────────────────────────────

const filteredAuthors = computed(() => {
  if (!authorStore.authors) return []
  let filtered = [...authorStore.authors]

  // Filtrer par nationalité
  if (filterNationality.value) {
    filtered = filtered.filter(a => a.nationality === filterNationality.value)
  }

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.first_name.toLowerCase().includes(query) ||
      a.last_name.toLowerCase().includes(query) ||
      (a.nationality && a.nationality.toLowerCase().includes(query))
    )
  }

  return filtered
})

// ─── Pagination locale ───────────────────────────────────────────────────────

const currentPage = ref(1)

const paginatedAuthors = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredAuthors.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredAuthors.value.length / perPage.value))

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

// ─── Fetch ──────────────────────────────────────────────────────────────────

const fetchAuthorsWithParams = () => {
  // Charger tous les auteurs sans pagination ni filtre (filtrage frontend)
  authorStore.fetchAuthors({ per_page: 1000 }).catch(() => showToast('Erreur lors du chargement.', 'error'))
}

// ─── Watchers ───────────────────────────────────────────────────────────────

const resetPage = () => {
  currentPage.value = 1
}

// ─── Actions ───────────────────────────────────────────────────────────────

const openCreateModal = () => {
  modal.value = {
    visible: true,
    isEdit: false,
    authorId: null,
    form: { first_name: '', last_name: '', biography: '', nationality: '', birth_date: '', death_date: '' },
  }
}

const openEditModal = (author) => {
  modal.value = {
    visible: true,
    isEdit: true,
    authorId: author.id,
    form: { 
      first_name: author.first_name, 
      last_name: author.last_name, 
      biography: author.biography || '', 
      nationality: author.nationality || '', 
      birth_date: author.birth_date || '', 
      death_date: author.death_date || '' 
    },
  }
}

const closeModal = () => {
  modal.value.visible = false
}

const submitForm = async () => {
  try {
    if (modal.value.isEdit) {
      await authorStore.updateAuthor(modal.value.authorId, modal.value.form)
      showToast('Auteur mis à jour avec succès.', 'success')
    } else {
      await authorStore.createAuthor(modal.value.form)
      showToast('Auteur créé avec succès.', 'success')
    }
    closeModal()
  } catch (err) {
    showToast(err.response?.data?.message || 'Une erreur est survenue.', 'error')
  }
}

const openDeleteModal = (author) => {
  deleteModal.value = { visible: true, author }
}

const closeDeleteModal = () => {
  deleteModal.value.visible = false
}

const confirmDelete = async () => {
  try {
    await authorStore.deleteAuthor(deleteModal.value.author.id)
    showToast('Auteur supprimé avec succès.', 'success')
    closeDeleteModal()
  } catch (err) {
    showToast(err.response?.data?.message || 'Une erreur est survenue.', 'error')
  }
}

const openDetailsModal = async (author) => {
  try {
    const authorData = await authorStore.fetchAuthor(author.id)
    detailsModal.value = { visible: true, author: authorData }
  } catch (err) {
    showToast(err.response?.data?.message || 'Erreur lors du chargement des détails.', 'error')
  }
}

const closeDetailsModal = () => {
  detailsModal.value.visible = false
}

const showToast = (message, type) => {
  toast.value = { message, type }
  setTimeout(() => (toast.value.message = ''), 3000)
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(() => {
  fetchAuthorsWithParams()
})
</script>

<template>
  <AdminLayout>
    <div class="bg-white rounded-2xl p-7 shadow-sm border border-[#E5E7EB]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <User class="w-6 h-6 text-[#0D9488]" />
          <h2 class="text-xl font-serif font-bold text-[#1B2A4A]">Gestion des auteurs</h2>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2.5 rounded-xl hover:bg-[#0B847A] transition-colors font-medium"
        >
          <Plus class="w-4 h-4" />
          Nouvel auteur
        </button>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 mb-5">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            @input="resetPage"
            type="text"
            placeholder="Rechercher un auteur..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
          />
        </div>
        <select
          v-model="filterNationality"
          @change="resetPage"
          class="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]"
        >
          <option value="">Toutes les nationalités</option>
          <option v-for="nationality in [...new Set(authorStore.authors?.map(a => a.nationality).filter(Boolean) || [])]" :key="nationality" :value="nationality">
            {{ nationality }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="authorStore.isLoading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Table -->
      <div v-else-if="authorStore.authors && paginatedAuthors.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 pb-3">
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Nom complet</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Nationalité</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Biographie</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Dates</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Références</th>
              <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="author in paginatedAuthors" :key="author.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-4">
                <div class="font-semibold text-[#1B2A4A]">{{ author.first_name }} {{ author.last_name }}</div>
              </td>
              <td class="py-4">
                <span class="text-sm text-gray-600">{{ author.nationality || '-' }}</span>
              </td>
              <td class="py-4">
                <div class="text-sm text-gray-600 max-w-xs truncate">{{ author.biography || '-' }}</div>
              </td>
              <td class="py-4">
                <div class="text-sm text-gray-600">
                  {{ author.birth_date || '-' }}{{ author.death_date ? ` - ${author.death_date}` : '' }}
                </div>
              </td>
              <td class="py-4">
                <span class="text-sm font-medium text-gray-700">{{ author.references_count || 0 }}</span>
              </td>
              <td class="py-4">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openDetailsModal(author)"
                    title="Voir détails"
                    class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0D9488] transition-colors"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditModal(author)"
                    title="Modifier"
                    class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0D9488] transition-colors"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    @click="openDeleteModal(author)"
                    title="Supprimer"
                    class="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-gray-500">
        <User class="w-12 h-12 mb-3 text-gray-300" />
        <p>Aucun auteur trouvé</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-5">
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
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="typeof page === 'number' ? currentPage = page : null"
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
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <Teleport to="body">
      <div
        v-if="modal.visible"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-[#1B2A4A]">
              {{ modal.isEdit ? 'Modifier l\'auteur' : 'Nouvel auteur' }}
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
                <input
                  v-model="modal.form.first_name"
                  type="text"
                  placeholder="Ex: Jean"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                <input
                  v-model="modal.form.last_name"
                  type="text"
                  placeholder="Ex: Dupont"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Nationalité</label>
              <input
                v-model="modal.form.nationality"
                type="text"
                placeholder="Ex: Française"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
                <input
                  v-model="modal.form.birth_date"
                  type="date"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Date de décès</label>
              <input
                  v-model="modal.form.death_date"
                  type="date"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Biographie</label>
              <textarea
                v-model="modal.form.biography"
                rows="3"
                placeholder="Biographie de l'auteur..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50 resize-none"
              />
            </div>
          </div>
          <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              @click="closeModal"
              class="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              @click="submitForm"
              :disabled="authorStore.isActionLoading"
              class="px-4 py-2.5 rounded-xl bg-[#0D9488] text-white hover:bg-[#0B847A] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ authorStore.isActionLoading ? 'En cours...' : modal.isEdit ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Delete -->
    <Teleport to="body">
      <div
        v-if="deleteModal.visible"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div class="bg-white rounded-2xl w-full max-w-md shadow-xl">
          <div class="p-6">
            <h3 class="text-lg font-bold text-[#1B2A4A] mb-2">Supprimer l'auteur</h3>
            <p class="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'auteur <strong>{{ deleteModal.author?.first_name }} {{ deleteModal.author?.last_name }}</strong> ?
              <span v-if="deleteModal.author?.references_count > 0" class="block mt-2 text-red-600">
                Cet auteur est associé à {{ deleteModal.author.references_count }} référence(s) et ne peut pas être supprimé.
              </span>
            </p>
            <div class="flex justify-end gap-3">
              <button
                @click="closeDeleteModal"
                class="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                @click="confirmDelete"
                :disabled="authorStore.isActionLoading || deleteModal.author?.references_count > 0"
                class="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ authorStore.isActionLoading ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Details -->
    <Teleport to="body">
      <div
        v-if="detailsModal.visible"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-bold text-[#1B2A4A]">Détails de l'auteur</h3>
            <button
              @click="closeDetailsModal"
              class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XCircle class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6 overflow-y-auto flex-1">
            <div v-if="detailsModal.author" class="space-y-6">
              <!-- Info auteur -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Prénom</label>
                  <p class="text-sm font-medium text-[#1B2A4A]">{{ detailsModal.author.first_name }}</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom</label>
                  <p class="text-sm font-medium text-[#1B2A4A]">{{ detailsModal.author.last_name }}</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nationalité</label>
                  <p class="text-sm text-gray-600">{{ detailsModal.author.nationality || '-' }}</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre de références</label>
                  <p class="text-sm font-medium text-[#1B2A4A]">{{ detailsModal.author.references_count || 0 }}</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date de naissance</label>
                  <p class="text-sm text-gray-600">{{ detailsModal.author.birth_date || '-' }}</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date de décès</label>
                  <p class="text-sm text-gray-600">{{ detailsModal.author.death_date || '-' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Biographie</label>
                  <p class="text-sm text-gray-600">{{ detailsModal.author.biography || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-100 flex justify-end">
            <button
              @click="closeDetailsModal"
              class="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <div
        v-if="toast.message"
        :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
        class="fixed bottom-4 right-4 px-4 py-3 rounded-xl text-white shadow-lg z-50 flex items-center gap-2"
      >
        <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
        <XCircle v-else class="w-5 h-5" />
        {{ toast.message }}
      </div>
    </Teleport>
  </AdminLayout>
</template>
