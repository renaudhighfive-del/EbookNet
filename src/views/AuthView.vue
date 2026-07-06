<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '@/services/api'
import { Eye, EyeOff, BookOpen, Library, Download, Clock, CheckCircle } from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const showForgotPassword = ref(false)
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')
const registerError = ref('')
const registerSuccess = ref(false)
const forgotForm = ref({ email: '' })
const forgotSent = ref(false)
const forgotError = ref('')

const loginForm = ref({ email: '', password: '' })
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
  let s = 0
  if (pwd.length >= 6) s++
  if (pwd.length >= 10) s++
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) s++
  return s
})

const handleLogin = async () => {
  isLoading.value = true
  loginError.value = ''
  try {
    await authStore.login({ email: loginForm.value.email, password: loginForm.value.password })
    const role = authStore.userRole
    if (role === 'admin') router.push('/admin/dashboard')
    else if (role === 'responsable_rh') router.push('/rh/dashboard')
    else if (role === 'responsable_demande') router.push('/manager/dashboard')
    else router.push('/dashboard')
  } catch (error) {
    const status = error.response?.data?.status
    if (status === 'pending_approval') {
      loginError.value =
        'Votre compte est en attente de validation. Vous serez notifié une fois activé.'
    } else if (status === 'suspended') {
      loginError.value = "Votre compte a été suspendu. Contactez l'administration."
    } else {
      loginError.value = error.response?.data?.message ?? 'Identifiants incorrects.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = async () => {
  isLoading.value = true
  forgotError.value = ''
  forgotSent.value = false
  try {
    await api.post('/auth/forgot-password', { email: forgotForm.value.email })
    forgotSent.value = true
  } catch (error) {
    forgotError.value = error.response?.data?.message
      ?? "Une erreur est survenue. Veuillez réessayer."
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  isLoading.value = true
  registerError.value = ''
  try {
    await authStore.register({
      first_name: registerForm.value.firstName,
      last_name: registerForm.value.lastName,
      email: registerForm.value.email,
      phone: registerForm.value.phone,
      password: registerForm.value.password,
    })
    registerSuccess.value = true
  } catch (error) {
    const data = error.response?.data
    if (data?.errors) {
      registerError.value = Object.values(data.errors).flat().join(' ')
    } else {
      registerError.value = data?.message ?? "Une erreur est survenue lors de l'inscription."
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Panneau gauche -->
    <div
      class="hidden lg:flex lg:w-2/5 flex-col justify-between p-12"
      style="background: linear-gradient(160deg, #1b2a4a 0%, #162040 100%)"
    >
      <div>
        <div class="flex items-center gap-3 mb-14">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            style="background: linear-gradient(135deg, #0d9488, #0a7a6f)"
          >
            <BookOpen class="w-5 h-5 text-white" />
          </div>
          <span class="text-2xl font-bold text-white font-serif">BibliNum</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-4 font-serif leading-snug">
          Accédez à des milliers de références documentaires
        </h1>
        <p class="text-gray-400 text-sm leading-relaxed mt-3">
          Bibliothèque numérique du Bénin — consultez, lisez en ligne et téléchargez des ressources
          documentaires de qualité.
        </p>
        <div class="mt-10 space-y-3.5">
          <div
            v-for="item in [
              { icon: Library, text: 'Catalogue de 1 248 références' },
              { icon: BookOpen, text: 'Lecture en ligne disponible' },
              { icon: Download, text: 'Téléchargement des ressources' },
            ]"
            :key="item.text"
            class="flex items-center gap-3 text-white/75"
          >
            <div
              class="w-8 h-8 rounded-lg bg-white/[.08] flex items-center justify-center shrink-0"
            >
              <component :is="item.icon" class="w-4 h-4" />
            </div>
            <span class="text-sm">{{ item.text }}</span>
          </div>
        </div>
      </div>
      <p class="text-gray-600 text-xs">© 2024 BibliNum — Bibliothèque Numérique</p>
      
      <!-- Bouton retour vers l'accueil -->
      <router-link
        to="/"
        class="mt-4 inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
      >
        <span>← Retour à l'accueil</span>
      </router-link>
    </div>

    <!-- Panneau droit -->
    <div class="flex-1 flex items-center justify-center p-8 bg-white">
      <div class="w-full max-w-md">
        <!-- Onglets (cachés si mot de passe oublié) -->
        <div v-if="!showForgotPassword" class="flex border-b border-gray-200 mb-8">
          <button
            @click="activeTab = 'login'"
            class="flex-1 pb-3 text-center text-sm font-semibold transition-colors"
            :class="
              activeTab === 'login'
                ? 'text-[#1B2A4A] border-b-2 border-[#1B2A4A]'
                : 'text-gray-400 hover:text-[#1B2A4A]'
            "
          >
            Connexion
          </button>
          <button
            @click="activeTab = 'register'"
            class="flex-1 pb-3 text-center text-sm font-semibold transition-colors"
            :class="
              activeTab === 'register'
                ? 'text-[#1B2A4A] border-b-2 border-[#1B2A4A]'
                : 'text-gray-400 hover:text-[#1B2A4A]'
            "
          >
            Inscription
          </button>
        </div>

        <!-- ── CONNEXION ── -->
        <div v-if="activeTab === 'login'">
          <h2 class="text-2xl font-bold text-[#1B2A4A] mb-6 font-serif">
            Connexion à votre espace
          </h2>

          <!-- Erreur connexion -->
          <div
            v-if="loginError"
            class="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5"
          >
            <div
              class="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5"
            >
              <span class="text-white text-[10px] font-bold">!</span>
            </div>
            {{ loginError }}
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Adresse e-mail</label
              >
              <input
                v-model="loginForm.email"
                type="email"
                required
                class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488]"
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Mot de passe</label
              >
              <div class="relative">
                <input
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  required
                  class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  @click="showLoginPassword = !showLoginPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B2A4A]"
                >
                  <Eye v-if="!showLoginPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="text-right">
              <button
                type="button"
                @click="showForgotPassword = true"
                class="text-[#0D9488] text-sm font-medium hover:underline"
              >Mot de passe oublié ?</button>
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-[#1B2A4A] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#162040] transition-colors disabled:opacity-50"
            >
              {{ isLoading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>

          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 border-t border-gray-200"></div>
            <span class="text-gray-400 text-xs">ou</span>
            <div class="flex-1 border-t border-gray-200"></div>
          </div>
          <p class="text-center text-sm text-gray-500">
            Pas encore de compte ?
            <button
              @click="activeTab = 'register'"
              class="text-[#0D9488] font-semibold hover:underline ml-1"
            >
              S'inscrire
            </button>
          </p>
        </div>

        <!-- ── MOT DE PASSE OUBLIÉ ── -->
        <div v-else-if="showForgotPassword">
          <button
            type="button"
            @click="showForgotPassword = false; forgotSent = false; forgotError = ''"
            class="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B2A4A] mb-6 transition-colors"
          >
            <span>← Retour à la connexion</span>
          </button>

          <h2 class="text-2xl font-bold text-[#1B2A4A] mb-2 font-serif">Mot de passe oublié</h2>
          <p class="text-sm text-gray-500 mb-6">
            Saisissez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          <div
            v-if="forgotError"
            class="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5"
          >
            <div
              class="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5"
            >
              <span class="text-white text-[10px] font-bold">!</span>
            </div>
            {{ forgotError }}
          </div>

          <div
            v-if="forgotSent"
            class="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center"
          >
            <div
              class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle class="w-6 h-6 text-[#0D9488]" />
            </div>
            <h3 class="text-lg font-bold text-[#1B2A4A] mb-2 font-serif">E-mail envoyé !</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Si cette adresse e-mail existe dans notre système, vous recevrez un lien de réinitialisation.
            </p>
          </div>

          <form v-if="!forgotSent" @submit.prevent="handleForgotPassword" class="space-y-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >Adresse e-mail</label>
              <input
                v-model="forgotForm.email"
                type="email"
                required
                class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488]"
                placeholder="email@exemple.com"
              />
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-[#0D9488] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0a7a6f] transition-colors disabled:opacity-50"
            >
              {{ isLoading ? 'Envoi...' : 'Envoyer le lien' }}
            </button>
          </form>
        </div>

        <!-- ── INSCRIPTION ── -->
        <div v-else-if="activeTab === 'register'">
          <!-- Message de succès post-inscription -->
          <div
            v-if="registerSuccess"
            class="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center"
          >
            <div
              class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4"
            >
              <Clock class="w-6 h-6 text-[#0D9488]" />
            </div>
            <h3 class="text-lg font-bold text-[#1B2A4A] mb-2 font-serif">Inscription réussie !</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Votre compte a bien été créé. Il est actuellement
              <strong>en attente de validation</strong> par un responsable RH ou un administrateur.
            </p>
            <p class="text-sm text-gray-500 mt-3">
              Vous serez notifié par e-mail dès que votre compte sera activé.
            </p>
            <button
              @click="activeTab = 'login'; registerSuccess = false"
              class="mt-5 px-5 py-2.5 bg-[#0D9488] text-white rounded-xl text-sm font-semibold hover:bg-[#0a7a6f] transition-colors"
            >
              Retour à la connexion
            </button>
          </div>

          <!-- Erreur inscription -->
          <div
            v-if="registerError"
            class="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5"
          >
            <div
              class="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5"
            >
              <span class="text-white text-[10px] font-bold">!</span>
            </div>
            {{ registerError }}
          </div>

          <!-- Formulaire d'inscription -->
          <template v-else>
            <h2 class="text-2xl font-bold text-[#1B2A4A] mb-6 font-serif">Créer votre compte</h2>
            <form @submit.prevent="handleRegister" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label
                    class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                    >Prénom *</label
                  >
                  <input
                    v-model="registerForm.firstName"
                    type="text"
                    required
                    class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488]"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                    >Nom *</label
                  >
                  <input
                    v-model="registerForm.lastName"
                    type="text"
                    required
                    class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488]"
                    placeholder="Dupont"
                  />
                </div>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                  >Adresse e-mail *</label
                >
                <input
                  v-model="registerForm.email"
                  type="email"
                  required
                  class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488]"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                  >Téléphone</label
                >
                <input
                  v-model="registerForm.phone"
                  type="tel"
                  class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488]"
                  placeholder="+229 XX XX XX XX"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                  >Mot de passe *</label
                >
                <div class="relative">
                  <input
                    v-model="registerForm.password"
                    :type="showRegisterPassword ? 'text' : 'password'"
                    required
                    minlength="8"
                    class="w-full bg-[#F8F7F4] border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    @click="showRegisterPassword = !showRegisterPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B2A4A]"
                  >
                    <Eye v-if="!showRegisterPassword" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
                <div class="flex gap-1 mt-1.5">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="flex-1 h-1 rounded-full transition-colors"
                    :class="
                      passwordStrength >= i
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
                  v-model="registerForm.passwordConfirm"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  required
                  class="w-full bg-[#F8F7F4] border rounded-xl px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2"
                  :class="
                    registerForm.passwordConfirm &&
                    registerForm.password !== registerForm.passwordConfirm
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                      : 'border-gray-200 focus:border-[#0D9488] focus:ring-teal-100'
                  "
                  placeholder="••••••••"
                />
                <p
                  v-if="
                    registerForm.passwordConfirm &&
                    registerForm.password !== registerForm.passwordConfirm
                  "
                  class="text-xs text-red-500 mt-1"
                >
                  Les mots de passe ne correspondent pas.
                </p>
              </div>
              <div class="flex items-start gap-2 pt-1">
                <input
                  v-model="registerForm.terms"
                  type="checkbox"
                  required
                  class="mt-0.5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <label class="text-xs text-gray-500 leading-relaxed">
                  J'accepte les
                  <a href="#" class="text-[#0D9488] hover:underline">conditions d'utilisation</a> et
                  la
                  <a href="#" class="text-[#0D9488] hover:underline"
                    >politique de confidentialité</a
                  >
                </label>
              </div>

              <!-- Info compte en attente -->
              <div
                class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5"
              >
                <Clock class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p class="text-xs text-amber-700 leading-relaxed">
                  Après inscription, votre compte sera <strong>en attente de validation</strong> par
                  un administrateur avant d'être activé.
                </p>
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-[#0D9488] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0a7a6f] transition-colors disabled:opacity-50"
              >
                {{ isLoading ? 'Création en cours...' : 'Créer mon compte' }}
              </button>
            </form>
            <p class="text-center text-sm text-gray-500 mt-6">
              Déjà un compte ?
              <button
                @click="activeTab = 'login'"
                class="text-[#0D9488] font-semibold hover:underline ml-1"
              >
                Se connecter
              </button>
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
