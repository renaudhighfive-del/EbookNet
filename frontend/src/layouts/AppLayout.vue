<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  BookOpen,
  Bell,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  LayoutDashboard,
  Users,
  FileClock,
  Book,
  Folder,
  PenTool,
  Building,
  Activity,
  BookMarked,
  FileUp,
  ClipboardList,
  Archive,
} from '@lucide/vue'

const props = defineProps({
  notifCount: { type: Number, default: 0 },
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(true)
const profileOpen = ref(false)
const profileRef = ref(null)

// ── Fermer dropdown si clic extérieur ────────────────────────────────────────
function onClickOutside(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    profileOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

// ── Utilisateur ───────────────────────────────────────────────────────────────
const userRole = computed(() => authStore.user?.role ?? 'user')
const fullName = computed(() => {
  const u = authStore.user
  return u ? `${u.first_name} ${u.last_name}` : '—'
})
const shortName = computed(() => {
  const u = authStore.user
  if (!u) return '—'
  return `${u.first_name} ${u.last_name?.[0]}.`
})
const initials = computed(() => {
  const u = authStore.user
  return u ? `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() : '?'
})

// ── Avatar gradient par rôle ──────────────────────────────────────────────────
const avatarGradient = computed(
  () =>
    ({
      admin: 'linear-gradient(135deg,#1B2A4A,#2F52A5)',
      responsable_rh: 'linear-gradient(135deg,#92400e,#D97706)',
      responsable_demande: 'linear-gradient(135deg,#0D9488,#0a7a6f)',
      user: 'linear-gradient(135deg,#4B5563,#6B7280)',
    })[userRole.value] ?? 'linear-gradient(135deg,#4B5563,#6B7280)',
)

// ── Badge sidebar ─────────────────────────────────────────────────────────────
const roleBadgeClass = computed(
  () =>
    ({
      admin: 'bg-white/[.12] text-white/70',
      responsable_rh: 'bg-amber-500/20 text-amber-300',
      responsable_demande: 'bg-teal-500/20 text-teal-300',
      user: 'bg-white/[.08] text-white/50',
    })[userRole.value] ?? 'bg-white/[.08] text-white/50',
)

// ── Badge topbar ──────────────────────────────────────────────────────────────
const roleBadgeClassLight = computed(
  () =>
    ({
      admin: 'bg-[#dde5f5] text-[#264186]',
      responsable_rh: 'bg-amber-100 text-amber-700',
      responsable_demande: 'bg-teal-100 text-teal-700',
      user: 'bg-gray-100 text-gray-600',
    })[userRole.value] ?? 'bg-gray-100 text-gray-600',
)

const roleLabel = computed(
  () =>
    ({
      admin: 'Administrateur',
      responsable_rh: 'Responsable RH',
      responsable_demande: 'Resp. Demandes',
      user: 'Utilisateur',
    })[userRole.value] ?? userRole.value,
)

// ── Item actif (couleur accent par rôle) ─────────────────────────────────────
const activeItemBg = computed(
  () =>
    ({
      admin: '#0D9488',
      responsable_rh: '#D97706',
      responsable_demande: '#0D9488',
      user: '#0D9488',
    })[userRole.value] ?? '#0D9488',
)

const homePath = computed(
  () =>
    ({
      admin: '/',
      responsable_rh: '/',
      responsable_demande: '/',
      user: '/',
    })[userRole.value] ?? '/',
)

// ── Lien profil selon rôle ────────────────────────────────────────────────────
const profilePath = computed(
  () =>
    ({
      admin: '/admin/profile',
      responsable_rh: '/rh/profile',
      responsable_demande: '/manager/profile',
      user: '/profile',
    })[userRole.value] ?? '/profile',
)

// ── Navigation selon rôle ─────────────────────────────────────────────────────
const navItems = computed(() => {
  if (userRole.value === 'admin')
    return [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
      { separator: 'Workflow' },
      { to: '/admin/demandes', icon: FileClock, label: 'Demandes de dépôt' },
      { to: '/admin/references', icon: Book, label: 'Références' },
      { separator: 'Référentiels' },
      { to: '/admin/categories', icon: Folder, label: 'Catégories' },
      { to: '/admin/auteurs', icon: PenTool, label: 'Auteurs' },
      { to: '/admin/editeurs', icon: Building, label: 'Éditeurs' },
      { separator: 'Journal' },
      { to: '/admin/activity-logs', icon: Activity, label: "Journal d'activité" },
      { separator: 'Administration' },
      { to: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
      { to: '/admin/archive', icon: Archive, label: 'Archives' },
    ]
  if (userRole.value === 'responsable_rh')
    return [
      { to: '/rh/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
      { separator: 'Gestion' },
      { to: '/rh/users', icon: Users, label: 'Gestion des utilisateurs' },
      { to: '/rh/archive', icon: Archive, label: 'Archives' },
      { separator: 'Journal' },
      { to: '/rh/activity-logs', icon: Activity, label: "Journal d'activité" },
      { separator: 'Compte' },
      { to: '/rh/profile', icon: User, label: 'Mon profil' },
    ]
  if (userRole.value === 'responsable_demande')
    return [
      { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
      { separator: 'Workflow' },
      { to: '/manager/deposits', icon: ClipboardList, label: 'Demandes assignées' },
      { separator: 'Compte' },
      { to: '/manager/profile', icon: User, label: 'Mon profil' },
    ]
  return [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { separator: 'Catalogue' },
    { to: '/catalogue', icon: Book, label: 'Catalogue' },
    { separator: 'Mes dépôts' },
    { to: '/my-documents', icon: BookMarked, label: 'Mes demandes' },
    { to: '/deposit-request', icon: FileUp, label: 'Déposer un document' },
    { separator: 'Compte' },
    { to: '/profile', icon: User, label: 'Mon profil' },
  ]
})

// ── Titre automatique ─────────────────────────────────────────────────────────
const pageTitle = computed(() => {
  const p = route.path
  const map = {
    '/admin/dashboard': 'Tableau de bord',
    '/admin/demandes': 'Demandes de dépôt',
    '/admin/references': 'Références',
    '/admin/categories': 'Catégories',
    '/admin/auteurs': 'Auteurs',
    '/admin/editeurs': 'Éditeurs',
    '/admin/utilisateurs': 'Utilisateurs',
    '/admin/activity-logs': "Journal d'activité",
    '/admin/profile': 'Mon profil',
    '/rh/dashboard': 'Tableau de bord RH',
    '/rh/users': 'Gestion des utilisateurs',
    '/rh/activity-logs': "Journal d'activité",
    '/rh/profile': 'Mon profil',
    '/manager/dashboard': 'Tableau de bord',
    '/manager/deposits': 'Demandes assignées',
    '/manager/profile': 'Mon profil',
    '/dashboard': 'Tableau de bord',
    '/catalogue': 'Catalogue',
    '/my-documents': 'Mes demandes',
    '/deposit-request': 'Déposer un document',
    '/profile': 'Mon profil',
  }
  return Object.entries(map).find(([k]) => p === k || p.startsWith(k + '/'))?.[1] ?? ''
})

function isActive(item) {
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

async function handleLogout() {
  profileOpen.value = false
  await authStore.logout()
  router.push('/')
}
</script>


<template>
  <div class="min-h-screen flex bg-[#F1F0EC]">
    <!-- ══════════════════════ SIDEBAR ══════════════════════ -->
    <aside
      class="fixed left-0 top-0 h-screen flex flex-col z-40 transition-all duration-300 overflow-hidden"
      :class="sidebarOpen ? 'w-64' : 'w-15'"
      style="background: linear-gradient(180deg, #1b2a4a 0%, #162040 100%)"
    >
      <!-- Logo + toggle -->
      <div
        class="h-16 flex items-center shrink-0 border-b border-white/[.07]"
        :class="sidebarOpen ? 'px-4' : 'px-0 justify-center'"
      >
        <router-link
          :to="homePath"
          class="flex items-center gap-3 min-w-0 flex-1 overflow-hidden"
          :class="sidebarOpen ? '' : 'justify-center'"
        >
          <div
            class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center"
            style="background: linear-gradient(135deg, #0d9488, #0a7a6f)"
          >
            <BookOpen class="w-5 h-5 text-white" />
          </div>
          <span
            v-if="sidebarOpen"
            class="text-white font-sans font-semibold text-lg leading-none truncate whitespace-nowrap"
          >
            Lectoria
          </span>
        </router-link>
        <!-- Toggle toujours visible -->
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          :class="sidebarOpen ? 'ml-1' : 'absolute right-1.5'"
          title="Réduire / Agrandir"
        >
          <ChevronLeft v-if="sidebarOpen" class="w-4 h-4" />
          <ChevronRight v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Avatar utilisateur -->
      <div
        class="shrink-0 border-b border-white/[.07]"
        :class="sidebarOpen ? 'px-3 py-3' : 'px-0 py-3 flex justify-center'"
      >
        <div class="flex items-center gap-2.5" :class="sidebarOpen ? '' : 'justify-center'">
          <div
            class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
            :style="`background:${avatarGradient};`"
          >
            {{ initials }}
          </div>
          <div v-if="sidebarOpen" class="min-w-0 flex-1">
            <p class="text-white text-sm font-semibold truncate leading-snug">{{ fullName }}</p>
            <span
              class="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
              :class="roleBadgeClass"
              >{{ roleLabel }}</span
            >
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-2 space-y-0.5" :class="sidebarOpen ? 'px-2' : 'px-1'">
        <template v-for="item in navItems" :key="item.to ?? item.separator">
          <p
            v-if="item.separator && sidebarOpen"
            class="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/25"
          >
            {{ item.separator }}
          </p>
          <div
            v-else-if="item.separator && !sidebarOpen"
            class="my-1 mx-2 border-t border-white/10"
          />

          <router-link
            v-else
            :to="item.to"
            class="flex items-center rounded-xl text-sm font-medium transition-all duration-150"
            :class="[
              sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5',
              isActive(item) ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/[.07]',
            ]"
            :style="isActive(item) ? `background:${activeItemBg};` : ''"
            :title="!sidebarOpen ? item.label : undefined"
          >
            <component :is="item.icon" class="w-4.25 h-4.25 shrink-0" />
            <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
            <span
              v-if="item.badge && sidebarOpen"
              class="ml-auto shrink-0 min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-red-500 text-white"
            >
              {{ item.badge > 9 ? '9+' : item.badge }}
            </span>
          </router-link>
        </template>
      </nav>

      <!-- Déconnexion (sidebar) -->
      <div
        class="shrink-0 border-t border-white/[.07]"
        :class="sidebarOpen ? 'px-2 py-2' : 'px-1 py-2'"
      >
        <button
          @click="handleLogout"
          class="w-full flex items-center rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/[.07] transition-all"
          :class="sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'"
          :title="!sidebarOpen ? 'Se déconnecter' : undefined"
        >
          <LogOut class="w-4.25 h-4.25 shrink-0" />
          <span v-if="sidebarOpen">Se déconnecter</span>
        </button>
      </div>
    </aside>

    <!-- ══════════════════════ MAIN ══════════════════════ -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300"
      :class="sidebarOpen ? 'ml-64' : 'ml-15'"
    >
      <!-- Topbar -->
      <header
        class="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4"
      >
        <!-- Titre page -->
        <h1 class="flex-1 font-serif font-bold text-[#1B2A4A] text-lg truncate">
          <slot name="title">{{ pageTitle }}</slot>
        </h1>

        <slot name="breadcrumb" />

        <!-- Cloche -->
        <button
          class="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1B2A4A] transition-colors"
        >
          <Bell class="w-4.5 h-4.5" />
          <span
            v-if="notifCount > 0"
            class="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {{ notifCount > 9 ? '9+' : notifCount }}
          </span>
        </button>

        <!-- Séparateur -->
        <div class="w-px h-5 bg-gray-200"></div>

        <!-- Profil clickable → dropdown -->
        <div class="relative" ref="profileRef">
          <button
            @click="profileOpen = !profileOpen"
            class="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
              :style="`background:${avatarGradient};`"
            >
              {{ initials }}
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-semibold text-[#1B2A4A] leading-tight">{{ shortName }}</p>
              <span
                class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                :class="roleBadgeClassLight"
                >{{ roleLabel }}</span
              >
            </div>
            <ChevronDown
              class="w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform duration-150"
              :class="profileOpen ? 'rotate-180' : ''"
            />
          </button>

          <!-- Dropdown profil -->
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-1"
          >
            <div
              v-if="profileOpen"
              class="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden"
            >
              <!-- Entête dropdown -->
              <div class="px-4 py-3 border-b border-gray-50">
                <p class="text-sm font-semibold text-[#1B2A4A]">{{ fullName }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ authStore.user?.email }}</p>
              </div>
              <!-- Lien profil -->
              <router-link
                :to="profilePath"
                @click="profileOpen = false"
                class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User class="w-4 h-4 text-gray-400" />
                <span>Mon profil</span>
              </router-link>
              <!-- Déconnexion -->
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut class="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </transition>
        </div>
      </header>

      <!-- Contenu -->
      <main class="flex-1 p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

