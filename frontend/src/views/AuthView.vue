<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Eye, EyeOff } from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const isLoading = ref(false)

const loginForm = ref({
  email: '',
  password: '',
})

const registerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  terms: false,
})

const passwordStrength = computed(() => {
  const pwd = registerForm.value.password
  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++
  return score
})

const handleLogin = async () => {
  isLoading.value = true
  try {
    await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
    })
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  isLoading.value = true
  try {
    await authStore.register({
      first_name: registerForm.value.firstName,
      last_name: registerForm.value.lastName,
      email: registerForm.value.email,
      phone: registerForm.value.phone,
      password: registerForm.value.password,
    })
    router.push('/')
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script>


<template>
  <div class="min-h-screen flex">
    <!-- Left Panel -->
    <div class="hidden lg:flex lg:w-2/5 bg-[#1B2A4A] flex-col justify-between p-12">
      <div>
        <div class="flex items-center gap-2 mb-12">
          <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span class="text-[#1B2A4A] font-bold text-xl">B</span>
          </div>
          <span class="text-2xl font-bold text-white">BibliNum</span>
        </div>
        <h1 class="text-4xl font-bold text-white mb-4" style="font-family: 'Playfair Display', serif;">
          Accédez à des milliers de références documentaires
        </h1>
        <div class="mt-20 space-y-6">
          <div class="flex items-center gap-3 text-white">
            <span class="text-2xl">📚</span>
            <span class="text-lg">Catalogue de 1 248 références</span>
          </div>
          <div class="flex items-center gap-3 text-white">
            <span class="text-2xl">📖</span>
            <span class="text-lg">Lecture en ligne disponible</span>
          </div>
          <div class="flex items-center gap-3 text-white">
            <span class="text-2xl">⬇️</span>
            <span class="text-lg">Téléchargement des ressources</span>
          </div>
        </div>
      </div>
      <div class="text-gray-400">
        © 2024 BibliNum — Bibliothèque Numérique
      </div>
    </div>

    <!-- Right Panel -->
    <div class="flex-1 flex items-center justify-center p-8 bg-white">
      <div class="w-full max-w-md">
        <!-- Tab Switcher -->
        <div class="flex border-b border-[#E5E7EB] mb-8">
          <button
            @click="activeTab = 'login'"
            class="flex-1 pb-3 text-center font-medium transition-colors"
            :class="activeTab === 'login' ? 'text-[#1B2A4A] border-b-2 border-[#1B2A4A]' : 'text-[#6B7280] hover:text-[#1B2A4A]'"
          >
            Connexion
          </button>
          <button
            @click="activeTab = 'register'"
            class="flex-1 pb-3 text-center font-medium transition-colors"
            :class="activeTab === 'register' ? 'text-[#1B2A4A] border-b-2 border-[#1B2A4A]' : 'text-[#6B7280] hover:text-[#1B2A4A]'"
          >
            Inscription
          </button>
        </div>

        <!-- Login Form -->
        <div v-if="activeTab === 'login'">
          <h2 class="text-2xl font-bold text-[#1B2A4A] mb-8" style="font-family: 'Playfair Display', serif;">
            Connexion à votre espace
          </h2>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-[#1A1A2E] mb-2">Adresse e-mail</label>
              <input
                v-model="loginForm.email"
                type="email"
                required
                class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-4 py-3 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                placeholder="email@exemple.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1A1A2E] mb-2">Mot de passe</label>
              <div class="relative">
                <input
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  required
                  class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-4 py-3 pr-12 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  placeholder="••••••••"
                >
                <button
                  type="button"
                  @click="showLoginPassword = !showLoginPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2A4A]"
                >
                  <Eye v-if="!showLoginPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div class="text-right">
              <a href="#" class="text-[#0D9488] text-sm font-medium hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-[#1B2A4A] text-white py-3 rounded-xl font-medium hover:bg-[#2D4A7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>
          </form>

          <div class="flex items-center gap-4 my-8">
            <div class="flex-1 border-t border-[#E5E7EB]"></div>
            <span class="text-[#6B7280] text-sm">— ou —</span>
            <div class="flex-1 border-t border-[#E5E7EB]"></div>
          </div>

          <p class="text-center text-[#6B7280]">
            Pas encore de compte ?
            <button @click="activeTab = 'register'" class="text-[#0D9488] font-medium hover:underline">
              S'inscrire →
            </button>
          </p>
        </div>

        <!-- Register Form -->
        <div v-if="activeTab === 'register'">
          <h2 class="text-2xl font-bold text-[#1B2A4A] mb-8" style="font-family: 'Playfair Display', serif;">
            Créer votre compte
          </h2>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#1A1A2E] mb-2">Prénom *</label>
                <input
                  v-model="registerForm.firstName"
                  type="text"
                  required
                  class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-4 py-3 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  placeholder="Jean"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1A1A2E] mb-2">Nom *</label>
                <input
                  v-model="registerForm.lastName"
                  type="text"
                  required
                  class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-4 py-3 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  placeholder="Dupont"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1A1A2E] mb-2">Adresse e-mail *</label>
              <input
                v-model="registerForm.email"
                type="email"
                required
                class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-4 py-3 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                placeholder="email@exemple.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1A1A2E] mb-2">Téléphone</label>
              <input
                v-model="registerForm.phone"
                type="tel"
                class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-4 py-3 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                placeholder="+229 XX XX XX XX"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1A1A2E] mb-2">Mot de passe *</label>
              <div class="relative">
                <input
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-4 py-3 pr-12 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  placeholder="••••••••"
                >
                <button
                  type="button"
                  @click="showRegisterPassword = !showRegisterPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2A4A]"
                >
                  <Eye v-if="!showRegisterPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <!-- Password Strength Indicator -->
              <div class="mt-2 flex gap-1">
                <div class="flex-1 h-1 rounded-full" :class="passwordStrength >= 1 ? 'bg-[#DC2626]' : 'bg-[#E5E7EB]'"></div>
                <div class="flex-1 h-1 rounded-full" :class="passwordStrength >= 2 ? 'bg-[#E8A020]' : 'bg-[#E5E7EB]'"></div>
                <div class="flex-1 h-1 rounded-full" :class="passwordStrength >= 3 ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'"></div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1A1A2E] mb-2">Confirmer le mot de passe *</label>
              <input
                v-model="registerForm.passwordConfirm"
                :type="showRegisterPassword ? 'text' : 'password'"
                required
                class="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg px-4 py-3 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                placeholder="••••••••"
              >
            </div>
            <div class="flex items-start gap-2">
              <input
                v-model="registerForm.terms"
                type="checkbox"
                required
                class="mt-1 rounded border-[#6B7280] text-[#0D9488] focus:ring-[#0D9488]"
              >
              <label class="text-sm text-[#6B7280]">
                J'accepte les <a href="#" class="text-[#0D9488] hover:underline">conditions d'utilisation</a> et la <a href="#" class="text-[#0D9488] hover:underline">politique de confidentialité</a>
              </label>
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-[#0D9488] text-white py-3 rounded-xl font-medium hover:bg-[#0F766E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Création en cours...' : 'Créer mon compte' }}
            </button>
          </form>

          <p class="text-center text-[#6B7280] mt-8">
            Déjà un compte ?
            <button @click="activeTab = 'login'" class="text-[#0D9488] font-medium hover:underline">
              Se connecter →
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

