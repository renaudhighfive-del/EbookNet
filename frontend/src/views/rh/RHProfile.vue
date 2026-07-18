<template>
  <RHLayout>
    <template #title>Mon profil</template>

    <div v-if="isLoading" class="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
      Chargement...
    </div>

    <div v-else class="max-w-2xl mx-auto space-y-5">
      <!-- Carte avatar + infos rapides -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
          style="background: linear-gradient(135deg, #92400e, #d97706)"
        >
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-[#1B2A4A]">
            {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
          </h2>
          <p class="text-sm text-gray-400 mt-0.5">{{ authStore.user?.email }}</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full"
              >Responsable RH</span
            >
            <span v-if="authStore.user?.status" class="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full"
              >Actif</span
            >
          </div>
        </div>
        <!-- Déconnexion depuis le profil -->
        <button
          @click="confirmLogout = true"
          class="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors shrink-0"
        >
          <LogOut class="w-4 h-4" />
          Se déconnecter
        </button>
      </div>

      <!-- Formulaire infos personnelles -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-5">
          Informations personnelles
        </h3>
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Nom *</label
              >
              <input
                v-model="form.last_name"
                type="text"
                required
                class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1B2A4A] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Prénom *</label
              >
              <input
                v-model="form.first_name"
                type="text"
                required
                class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1B2A4A] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >Adresse e-mail *</label
            >
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1B2A4A] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >Téléphone</label
            >
            <input
              v-model="form.phone"
              type="tel"
              placeholder="+229 XX XX XX XX"
              class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1B2A4A] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
            />
          </div>
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="profileLoading"
              class="inline-flex items-center gap-2 bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a7a6f] transition-colors disabled:opacity-50"
            >
              <span v-if="profileLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <Save v-else class="w-4 h-4" />
              {{ profileLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Formulaire changement mot de passe -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-[#1B2A4A] uppercase tracking-wide mb-5">
          Changer le mot de passe
        </h3>
        <form @submit.prevent="savePassword" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >Mot de passe actuel *</label
            >
            <input
              v-model="pwdForm.current"
              type="password"
              required
              class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1B2A4A] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Nouveau mot de passe *</label
              >
              <input
                v-model="pwdForm.new"
                type="password"
                required
                minlength="8"
                class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1B2A4A] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-teal-50"
              />
              <!-- Indicateur de force -->
              <div class="flex gap-1 mt-1.5">
                <div
                  v-for="i in 3"
                  :key="i"
                  class="flex-1 h-1 rounded-full transition-colors"
                  :class="
                    pwdStrength >= i
                      ? i === 1
                        ? 'bg-red-400'
                        : i === 2
                          ? 'bg-amber-400'
                          : 'bg-[#0D9488]'
                      : 'bg-gray-200'
                  "
                />
              </div>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Confirmer *</label
              >
              <input
                v-model="pwdForm.confirm"
                type="password"
                required
                class="w-full bg-[#F8F7F4] border rounded-xl px-4 py-2.5 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2"
                :class="
                  pwdForm.confirm && pwdForm.new !== pwdForm.confirm
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                    : 'border-gray-200 focus:border-[#0D9488] focus:ring-teal-50'
                "
              />
              <p
                v-if="pwdForm.confirm && pwdForm.new !== pwdForm.confirm"
                class="text-xs text-red-500 mt-1"
              >
                Les mots de passe ne correspondent pas.
              </p>
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="pwdLoading || (pwdForm.confirm && pwdForm.new !== pwdForm.confirm)"
              class="inline-flex items-center gap-2 bg-[#1B2A4A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162040] transition-colors disabled:opacity-50"
            >
              <span v-if="pwdLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <KeyRound v-else class="w-4 h-4" />
              {{ pwdLoading ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Infos compte (lecture seule) -->
      <div class="bg-[#F8F7F4] rounded-2xl border border-gray-200 p-5">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
          Informations du compte
        </h3>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-xs text-gray-400">Membre depuis</dt>
            <dd class="text-[#1B2A4A] font-mono text-xs mt-0.5">
              {{ formatDate(authStore.user?.created_at) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-gray-400">Dernière connexion</dt>
            <dd class="text-[#1B2A4A] font-mono text-xs mt-0.5">
              {{ authStore.user?.last_login_at ? timeAgo(authStore.user.last_login_at) : '—' }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Modal confirmation déconnexion -->
    <Teleport to="body">
      <div
        v-if="confirmLogout"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
          <h3 class="text-base font-bold text-[#1B2A4A] mb-2">Se déconnecter</h3>
          <p class="text-sm text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
          <div class="flex gap-3 justify-end">
            <button
              @click="confirmLogout = false"
              class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="handleLogout"
              class="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </RHLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import RHLayout from '@/layouts/RHLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { LogOut, Save, KeyRound } from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const toast = useToastStore()

const { formatDate, timeAgo } = userStore

const isLoading = ref(true)
const confirmLogout = ref(false)
const profileLoading = ref(false)
const pwdLoading = ref(false)

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
})

const pwdForm = ref({ current: '', new: '', confirm: '' })

const initials = computed(() => {
  const u = authStore.user
  return u ? `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() : '?'
})

const pwdStrength = computed(() => {
  const p = pwdForm.value.new
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++
  return s
})

async function fetchProfile() {
  isLoading.value = true
  try {
    const response = await api.get('/profile')
    form.value = {
      first_name: response.data.user.first_name || '',
      last_name: response.data.user.last_name || '',
      email: response.data.user.email || '',
      phone: response.data.user.phone || '',
    }
    authStore.user = response.data.user
  } catch (err) {
    toast.error('Impossible de charger le profil')
  } finally {
    isLoading.value = false
  }
}

const saveProfile = async () => {
  profileLoading.value = true
  try {
    const response = await api.put('/profile', {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      phone: form.value.phone,
    })
    if (authStore.user) {
      authStore.user.first_name = response.data.user.first_name
      authStore.user.last_name = response.data.user.last_name
      authStore.user.email = response.data.user.email
      authStore.user.phone = response.data.user.phone
    }
    form.value = {
      first_name: response.data.user.first_name || '',
      last_name: response.data.user.last_name || '',
      email: response.data.user.email || '',
      phone: response.data.user.phone || '',
    }
    toast.success('Profil mis à jour avec succès.')
  } catch (err) {
    toast.error(err.response?.data?.message ?? 'Erreur lors de la mise à jour.')
  } finally {
    profileLoading.value = false
  }
}

const savePassword = async () => {
  if (pwdForm.value.new !== pwdForm.value.confirm) return
  if (!pwdForm.value.current) {
    toast.error('Le mot de passe actuel est obligatoire.')
    return
  }
  pwdLoading.value = true
  try {
    await api.patch('/password', {
      current_password: pwdForm.value.current,
      password: pwdForm.value.new,
      password_confirmation: pwdForm.value.confirm,
    })
    pwdForm.value = { current: '', new: '', confirm: '' }
    toast.success('Mot de passe mis à jour.')
  } catch (err) {
    toast.error(err.response?.data?.message ?? 'Erreur lors de la mise à jour.')
  } finally {
    pwdLoading.value = false
  }
}

const handleLogout = async () => {
  confirmLogout.value = false
  await authStore.logout()
  router.push('/')
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchProfile()
  }
})
</script>
