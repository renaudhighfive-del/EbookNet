<template>
  <AdminLayout>
    <template #title>Archives</template>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'users'"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            activeTab === 'users' ? 'bg-[#0D9488] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Utilisateurs archivés
        </button>
        <button
          @click="activeTab = 'references'"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            activeTab === 'references' ? 'bg-[#0D9488] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Références archivées
        </button>
      </div>

      <!-- Utilisateurs archivés -->
      <div v-if="activeTab === 'users'" class="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 class="text-sm font-semibold text-[#1B2A4A]">Utilisateurs archivés</h3>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchUsers"
              type="text"
              placeholder="Rechercher..."
              class="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] w-64"
            />
          </div>
        </div>

        <div v-if="archivedUsers?.length === 0" class="py-10 text-center text-sm text-gray-400">
          Aucun utilisateur archivé.
        </div>

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-[#F8F7F4]">
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in archivedUsers" :key="user.id" class="hover:bg-[#F8F7F4] transition-colors">
              <td class="px-6 py-3.5">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    :class="getAvatarColor(user.id)"
                  >
                    {{ getUserInitials(user) }}
                  </div>
                  <div>
                    <p class="font-medium text-[#1B2A4A] text-sm leading-tight">
                      {{ user.first_name }} {{ user.last_name }}
                    </p>
                    <p class="text-gray-400 text-xs">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span :class="getRoleClass(user.role)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-gray-400 text-xs font-mono">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-4 py-3.5">
                <button
                  @click="confirmRestoreUser(user)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                  title="Restaurer"
                >
                  <RotateCcw class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="archivedPagination.last_page > 1" class="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
          <p class="text-xs text-gray-400">
            Page {{ archivedPagination.current_page }} sur {{ archivedPagination.last_page }}
          </p>
          <div class="flex gap-1">
            <button
              @click="fetchArchivedUsersWithParams(archivedPagination.current_page - 1)"
              :disabled="!archivedPagination.prev_page_url"
              class="px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Précédent
            </button>
            <button
              @click="fetchArchivedUsersWithParams(archivedPagination.current_page + 1)"
              :disabled="!archivedPagination.next_page_url"
              class="px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <!-- Références archivées -->
      <div v-if="activeTab === 'references'" class="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 class="text-sm font-semibold text-[#1B2A4A]">Références archivées</h3>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchReferences"
              type="text"
              placeholder="Rechercher..."
              class="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] w-64"
            />
          </div>
        </div>

        <div v-if="archivedReferences.length === 0" class="py-10 text-center text-sm text-gray-400">
          Aucune référence archivée.
        </div>

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-[#F8F7F4]">
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ajouté par</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="ref in archivedReferences" :key="ref.id" class="hover:bg-[#F8F7F4] transition-colors">
              <td class="px-6 py-3.5">
                <div>
                  <p class="font-medium text-[#1B2A4A] text-sm leading-tight">{{ ref.title }}</p>
                  <p v-if="ref.isbn" class="text-gray-400 text-xs">ISBN: {{ ref.isbn }}</p>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {{ ref.category?.name || '—' }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <span class="text-gray-600 text-xs">
                  {{ ref.uploaded_by ? `${ref.uploaded_by.first_name} ${ref.uploaded_by.last_name}` : '—' }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-gray-400 text-xs font-mono">
                {{ formatDate(ref.created_at) }}
              </td>
              <td class="px-4 py-3.5">
                <button
                  @click="confirmRestoreReference(ref)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                  title="Restaurer"
                >
                  <RotateCcw class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="refPagination.last_page > 1" class="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
          <p class="text-xs text-gray-400">
            Page {{ refPagination.current_page }} sur {{ refPagination.last_page }}
          </p>
          <div class="flex gap-1">
            <button
              @click="fetchArchivedReferencesWithParams(refPagination.current_page - 1)"
              :disabled="!refPagination.prev_page_url"
              class="px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Précédent
            </button>
            <button
              @click="fetchArchivedReferencesWithParams(refPagination.current_page + 1)"
              :disabled="!refPagination.next_page_url"
              class="px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal de confirmation -->
    <Teleport to="body">
      <div
        v-if="confirmModal.visible"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <h3 class="text-lg font-bold text-[#1B2A4A] mb-2">{{ confirmModal.title }}</h3>
          <p class="text-gray-600 text-sm mb-6">{{ confirmModal.message }}</p>
          <div class="flex gap-3 justify-end">
            <button
              @click="confirmModal.visible = false"
              class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="executeRestore"
              :disabled="isActionLoading"
              class="px-4 py-2 rounded-xl bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0a7a6f] disabled:opacity-50"
            >
              {{ isActionLoading ? 'Restauration...' : 'Restaurer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { debounce } from 'lodash-es'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useUserStore } from '@/stores/user'
import { useReferenceStore } from '@/stores/reference'
import { Search, RotateCcw } from '@lucide/vue'

const userStore = useUserStore()
const referenceStore = useReferenceStore()

const activeTab = ref('users')
const searchUsers = ref('')
const searchReferences = ref('')
const isActionLoading = ref(false)
const confirmModal = ref({ visible: false, title: '', message: '', type: '', item: null })

const { getRoleLabel, getRoleClass, getAvatarColor, getUserInitials, formatDate, archivedUsers, archivedPagination, fetchArchivedUsers } = userStore
const { archivedReferences, archivedPagination: refPagination, isLoading, fetchArchivedReferences, restoreReference } = referenceStore

const fetchArchivedUsersWithParams = async (page = 1) => {
  await fetchArchivedUsers({ page, per_page: 10, search: searchUsers.value })
}

const fetchArchivedReferencesWithParams = async (page = 1) => {
  await fetchArchivedReferences({ page, per_page: 10, search: searchReferences.value })
}

const confirmRestoreUser = (user) => {
  confirmModal.value = {
    visible: true,
    title: 'Restaurer l\'utilisateur',
    message: `Voulez-vous restaurer le compte de ${user.first_name} ${user.last_name} ?`,
    type: 'user',
    item: user
  }
}

const confirmRestoreReference = (ref) => {
  confirmModal.value = {
    visible: true,
    title: 'Restaurer la référence',
    message: `Voulez-vous restaurer la référence "${ref.title}" ?`,
    type: 'reference',
    item: ref
  }
}

const executeRestore = async () => {
  isActionLoading.value = true
  try {
    if (confirmModal.value.type === 'user') {
      await userStore.restoreUser(confirmModal.value.item.id)
      fetchArchivedUsersWithParams(archivedPagination.value?.current_page || 1)
    } else if (confirmModal.value.type === 'reference') {
      await restoreReference(confirmModal.value.item.id)
      fetchArchivedReferencesWithParams(refPagination.value?.current_page || 1)
    }
    confirmModal.value.visible = false
  } catch (error) {
    console.error('Erreur lors de la restauration:', error)
  } finally {
    isActionLoading.value = false
  }
}

const debouncedFetchUsers = debounce(() => fetchArchivedUsersWithParams(1), 300)
const debouncedFetchReferences = debounce(() => fetchArchivedReferencesWithParams(1), 300)

watch(searchUsers, debouncedFetchUsers)
watch(searchReferences, debouncedFetchReferences)

onMounted(() => {
  Promise.all([
    fetchArchivedUsersWithParams(),
    fetchArchivedReferencesWithParams()
  ])
})
</script>
