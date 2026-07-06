<template>
  <AdminLayout>
    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-t-teal-600 border-gray-200"></div>
    </div>

    <template v-else-if="hasError">
      <div class="flex flex-col items-center justify-center py-20 text-gray-400">
        <AlertTriangle class="w-12 h-12 mb-4 text-amber-400" />
        <p class="text-lg font-medium text-gray-600 mb-1">Impossible de charger le tableau de bord</p>
        <p class="text-sm mb-6">Vérifiez que le serveur backend est en cours d'exécution.</p>
        <button
          @click="loadDashboard"
          class="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-xl font-medium hover:bg-[#0F1322] transition-colors text-sm"
        >
          Réessayer
        </button>
      </div>
    </template>

    <template v-else>

      <!-- Alert Banner -->
      <div
        v-if="stats.pending_deposits > 0"
        class="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8"
      >
        <div class="shrink-0 w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
          <AlertTriangle class="w-5 h-5 text-amber-600" />
        </div>
        <p class="text-sm text-amber-800 flex-1">
          <strong>{{ stats.pending_deposits }} demandes de dépôt</strong> sont en attente
          d'affectation depuis plus de 3 jours.
          <router-link to="/admin/demandes" class="font-semibold underline underline-offset-2 ml-1">
            Affecter maintenant →
          </router-link>
        </p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div class="w-10 h-10 bg-[#EEF1F7] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1B2A4A] transition-colors">
            <BookOpen class="w-5 h-5 text-[#1B2A4A] group-hover:text-white transition-colors" />
          </div>
          <div class="text-2xl font-mono font-bold text-[#1B2A4A] tracking-tight mb-0.5">
            {{ formatNumber(stats.total_references) }}
          </div>
          <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Références publiées</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border-l-4 border-l-amber-400 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
            <FileClock class="w-5 h-5 text-amber-500" />
          </div>
          <div class="text-2xl font-mono font-bold text-amber-500 tracking-tight mb-0.5">
            {{ stats.pending_deposits }}
          </div>
          <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Dépôts en attente</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div class="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors">
            <Users class="w-5 h-5 text-teal-600 group-hover:text-white transition-colors" />
          </div>
          <div class="text-2xl font-mono font-bold text-teal-600 tracking-tight mb-0.5">
            {{ formatNumber(stats.active_users) }}
          </div>
          <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Utilisateurs actifs</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div class="w-10 h-10 bg-[#EEF1F7] rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors">
            <FileDown class="w-5 h-5 text-[#1B2A4A] group-hover:text-white transition-colors" />
          </div>
          <div class="text-2xl font-mono font-bold text-[#1B2A4A] tracking-tight mb-0.5">
            {{ formatNumber(stats.total_downloads) }}
          </div>
          <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Téléchargements</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div class="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sky-500 transition-colors">
            <Eye class="w-5 h-5 text-sky-500 group-hover:text-white transition-colors" />
          </div>
          <div class="text-2xl font-mono font-bold text-sky-500 tracking-tight mb-0.5">
            {{ formatNumber(stats.total_views) }}
          </div>
          <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Consultations</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border-l-4 border-l-red-400 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <Bell class="w-5 h-5 text-red-500" />
          </div>
          <div class="text-2xl font-mono font-bold text-red-500 tracking-tight mb-0.5">
            {{ stats.unread_notifications }}
          </div>
          <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Notif. non lues</p>
        </div>

      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <!-- Bar Chart — Dépôts par mois (Chart.js) -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-base font-semibold text-[#1B2A4A]">Demandes de dépôt par mois</h3>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block"></span> Approuvées
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block"></span> Rejetées
              </span>
            </div>
          </div>

          <div class="relative h-52">
            <canvas ref="barChartRef"></canvas>
            <div
              v-if="!depositsByMonth.length"
              class="absolute inset-0 flex flex-col items-center justify-center text-gray-300"
            >
              <BarChart2 class="w-10 h-10 mb-2" />
              <p class="text-sm">Aucune donnée disponible</p>
            </div>
          </div>
        </div>

        <!-- Donut Chart — Références par catégorie (Chart.js) -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-base font-semibold text-[#1B2A4A] mb-5">Références par catégorie</h3>

          <div class="flex items-center gap-8">
            <!-- Canvas Chart.js -->
            <div class="relative shrink-0 w-44 h-44">
              <canvas ref="donutChartRef"></canvas>
              <!-- Total centré par-dessus le canvas -->
              <div
                v-if="referencesByCategory.length"
                class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <span class="text-xl font-mono font-bold text-[#1B2A4A]">
                  {{ formatNumber(totalReferenceCount) }}
                </span>
                <span class="text-[9px] tracking-widest text-gray-400 uppercase mt-0.5">Total</span>
              </div>
              <div
                v-if="!referencesByCategory.length"
                class="absolute inset-0 flex flex-col items-center justify-center text-gray-300"
              >
                <PieChart class="w-10 h-10 mb-2" />
                <p class="text-xs">Aucune donnée</p>
              </div>
            </div>

            <!-- Légende dynamique -->
            <div class="flex-1 space-y-2">
              <div
                v-for="(cat, i) in referencesByCategory"
                :key="cat.id"
                class="flex items-center gap-2.5"
              >
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: donutColors[i % donutColors.length] }"
                ></span>
                <span class="text-sm text-gray-700 flex-1 truncate">{{ cat.name }}</span>
                <span class="text-xs font-mono text-gray-400 ml-auto">
                  {{ getCategoryPercentage(cat.references_count) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Demandes à traiter -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-base font-semibold text-[#1B2A4A]">Demandes à traiter</h3>
            <router-link
              to="/admin/demandes"
              class="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Voir toutes →
            </router-link>
          </div>

          <div class="divide-y divide-gray-50">
            <div
              v-for="(deposit, i) in pendingDeposits"
              :key="deposit.id"
              class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group"
            >
              <span class="text-xs font-mono text-gray-300 w-4 shrink-0">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-[#1B2A4A] truncate">{{ deposit.title }}</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ deposit.applicant?.first_name }} {{ deposit.applicant?.last_name }}
                  <span class="mx-1">·</span>{{ formatDate(deposit.created_at) }}
                </p>
              </div>
              <span :class="getStatusClass(deposit.status)" class="text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                {{ getStatusLabel(deposit.status) }}
              </span>
              <router-link
                :to="`/admin/demandes/${deposit.id}`"
                class="text-xs font-semibold text-teal-600 hover:text-teal-700 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1"
              >
                Traiter →
              </router-link>
            </div>

            <div v-if="!pendingDeposits.length" class="flex flex-col items-center justify-center py-10 text-gray-300">
              <CheckCircle class="w-10 h-10 mb-2" />
              <p class="text-sm">Aucune demande en attente</p>
            </div>
          </div>
        </div>

        <!-- Activité récente -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-base font-semibold text-[#1B2A4A]">Activité récente</h3>
            <router-link to="/admin/activity-logs" class="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors">
              Journal complet →
            </router-link>
          </div>

          <div class="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            <div
              v-for="log in activityLogs"
              :key="log.id"
              class="flex items-start gap-3.5 px-6 py-3.5 hover:bg-gray-50/60 transition-colors"
            >
              <div :class="getLogIconClass(log.action)" class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <component :is="getLogIcon(log.action)" class="w-3.5 h-3.5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-700 leading-snug">{{ log.description }}</p>
                <p class="text-xs text-gray-400 mt-0.5 font-mono">{{ formatRelativeDate(log.created_at) }}</p>
              </div>
            </div>

            <div v-if="!activityLogs.length" class="flex flex-col items-center justify-center py-10 text-gray-300">
              <Activity class="w-10 h-10 mb-2" />
              <p class="text-sm">Aucune activité récente</p>
            </div>
          </div>
        </div>

      </div>

    </template>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import {
  AlertTriangle, BookOpen, FileClock, Users, FileDown, Eye, Bell,
  BarChart2, PieChart, CheckCircle, Activity,
  CheckCheck, UserPlus, BookMarked, XCircle, ClipboardList
} from '@lucide/vue'

// Chart.js — import uniquement ce dont on a besoin (tree-shaking)
import {
  Chart,
  BarController, BarElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend
} from 'chart.js'

import api from '@/services/api'

// Enregistrement des modules Chart.js nécessaires
Chart.register(
  BarController, BarElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend
)

// ─── REFS ─────────────────────────────────────────────────────────────────────

const isLoading     = ref(true)
const hasError      = ref(false)
const barChartRef   = ref(null)   // <canvas> bar chart
const donutChartRef = ref(null)   // <canvas> donut chart
let   barChart      = null        // instance Chart.js bar
let   donutChart    = null        // instance Chart.js donut

const stats = ref({
  total_references    : 0,
  pending_deposits    : 0,
  active_users        : 0,
  total_downloads     : 0,
  total_views         : 0,
  unread_notifications: 0,
})
const depositsByMonth      = ref([])
const referencesByCategory = ref([])
const pendingDeposits      = ref([])
const activityLogs         = ref([])

// ─── COULEURS ─────────────────────────────────────────────────────────────────

const donutColors = ['#1B2A4A', '#0D9488', '#DC2626', '#E8A020', '#8B5CF6', '#9CA3AF']

// ─── COMPUTED ─────────────────────────────────────────────────────────────────

const totalReferenceCount = computed(() =>
  referencesByCategory.value.reduce((s, c) => s + c.references_count, 0)
)

const getCategoryPercentage = (count) => {
  const t = totalReferenceCount.value
  return t ? Math.round((count / t) * 100) : 0
}

// ─── CHART.JS : BAR CHART ────────────────────────────────────────────────────

const buildBarChart = () => {
  if (!barChartRef.value || !depositsByMonth.value.length) return

  // Détruire l'instance précédente si elle existe
  if (barChart) { barChart.destroy(); barChart = null }

  const labels   = depositsByMonth.value.map(d => getMonthLabel(d.month))
  const approved = depositsByMonth.value.map(d => d.approved ?? 0)
  const rejected = depositsByMonth.value.map(d => d.rejected  ?? 0)

  barChart = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label      : 'Approuvées',
          data       : approved,
          backgroundColor: '#0D9488',   // teal-500
          borderRadius   : { topLeft: 0, topRight: 0, bottomLeft: 6, bottomRight: 6 },
          borderSkipped  : false,
          stack          : 'stack',
        },
        {
          label      : 'Rejetées',
          data       : rejected,
          backgroundColor: '#F87171',   // red-400
          borderRadius   : { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
          borderSkipped  : false,
          stack          : 'stack',
        },
      ],
    },
    options: {
      responsive       : true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },   // on a notre propre légende dans le template
        tooltip: {
          backgroundColor: '#1B2A4A',
          padding        : 10,
          cornerRadius   : 8,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label} : ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid   : { display: false },
          border : { display: false },
          ticks  : { color: '#9CA3AF', font: { size: 11, family: 'Inter' } },
        },
        y: {
          stacked   : true,
          beginAtZero: true,
          grid      : { color: '#F3F4F6', drawBorder: false },
          border    : { display: false, dash: [4, 4] },
          ticks     : {
            color    : '#9CA3AF',
            font     : { size: 11, family: 'JetBrains Mono' },
            stepSize : 1,
            precision: 0,
          },
        },
      },
    },
  })
}

// ─── CHART.JS : DONUT CHART ──────────────────────────────────────────────────

const buildDonutChart = () => {
  if (!donutChartRef.value || !referencesByCategory.value.length) return

  if (donutChart) { donutChart.destroy(); donutChart = null }

  const labels = referencesByCategory.value.map(c => c.name)
  const data   = referencesByCategory.value.map(c => c.references_count)
  const colors = referencesByCategory.value.map((_, i) => donutColors[i % donutColors.length])

  donutChart = new Chart(donutChartRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor   : colors,
        borderColor       : '#ffffff',
        borderWidth       : 3,
        hoverOffset       : 6,
        hoverBorderWidth  : 2,
      }],
    },
    options: {
      responsive          : true,
      maintainAspectRatio : false,
      cutout              : '68%',    // épaisseur de l'anneau
      plugins: {
        legend: { display: false },   // légende custom dans le template
        tooltip: {
          backgroundColor: '#1B2A4A',
          padding        : 10,
          cornerRadius   : 8,
          callbacks: {
            label: (ctx) => {
              const pct = getCategoryPercentage(ctx.parsed)
              return ` ${ctx.label} : ${ctx.parsed} (${pct}%)`
            },
          },
        },
      },
      animation: {
        animateRotate : true,
        animateScale  : false,
        duration      : 800,
        easing        : 'easeInOutQuart',
      },
    },
  })
}

// ─── WATCH : reconstruire les charts quand les données arrivent ───────────────

watch(depositsByMonth, async () => {
  await nextTick()
  buildBarChart()
})

watch(referencesByCategory, async () => {
  await nextTick()
  buildDonutChart()
})

// ─── STATUTS ─────────────────────────────────────────────────────────────────

const statusConfig = {
  pending             : { label: 'En attente',      cls: 'bg-gray-100 text-gray-600' },
  assigned            : { label: 'Assignée',         cls: 'bg-blue-100 text-blue-700' },
  approved_by_manager : { label: 'Validée (resp.)',  cls: 'bg-teal-100 text-teal-700' },
  rejected_by_manager : { label: 'Refusée (resp.)', cls: 'bg-orange-100 text-orange-700' },
  second_review       : { label: 'Second avis',      cls: 'bg-purple-100 text-purple-700' },
  approved            : { label: 'Approuvée',        cls: 'bg-green-100 text-green-700' },
  rejected            : { label: 'Rejetée',          cls: 'bg-red-100 text-red-700' },
  published           : { label: 'Publiée ✓',        cls: 'bg-emerald-100 text-emerald-800' },
}
const getStatusLabel = (s) => statusConfig[s]?.label ?? s
const getStatusClass = (s) => statusConfig[s]?.cls   ?? 'bg-gray-100 text-gray-500'

// ─── ICÔNES LOGS ─────────────────────────────────────────────────────────────

const getLogIcon = (action) => {
  if (!action) return Activity
  if (action.includes('publi'))                          return BookMarked
  if (action.includes('creat') || action.includes('crée')) return UserPlus
  if (action.includes('valid') || action.includes('approv')) return CheckCheck
  if (action.includes('rejet') || action.includes('refus')) return XCircle
  if (action.includes('assign'))                         return ClipboardList
  return Activity
}
const getLogIconClass = (action) => {
  if (!action) return 'bg-gray-100 text-gray-400'
  if (action.includes('publi'))                             return 'bg-emerald-100 text-emerald-600'
  if (action.includes('creat') || action.includes('crée'))  return 'bg-blue-100 text-blue-600'
  if (action.includes('valid') || action.includes('approv')) return 'bg-teal-100 text-teal-600'
  if (action.includes('rejet') || action.includes('refus')) return 'bg-red-100 text-red-500'
  if (action.includes('assign'))                            return 'bg-purple-100 text-purple-600'
  return 'bg-gray-100 text-gray-400'
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

const formatNumber = (n) => Number(n ?? 0).toLocaleString('fr-FR')

const monthLabels = {
  '01':'Jan','02':'Fév','03':'Mar','04':'Avr','05':'Mai','06':'Juin',
  '07':'Juil','08':'Août','09':'Sep','10':'Oct','11':'Nov','12':'Déc',
}
const getMonthLabel = (m) => monthLabels[String(m).split('-')[1]] ?? m

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatRelativeDate = (d) => {
  if (!d) return ''
  const diff = Math.floor((Date.now() - new Date(d)) / 60000)
  if (diff < 1)    return "À l'instant"
  if (diff < 60)   return `il y a ${diff} min`
  if (diff < 1440) return `il y a ${Math.floor(diff / 60)} h`
  return `il y a ${Math.floor(diff / 1440)} j`
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function loadDashboard() {
  hasError.value = false
  isLoading.value = true
  try {
    await Promise.all([
      api.get('/admin/stats').then(r => { stats.value = r.data }),
      api.get('/admin/stats/deposits-by-month').then(r => { depositsByMonth.value = r.data }),
      api.get('/admin/stats/references-by-category').then(r => { referencesByCategory.value = r.data }),
      api.get('/admin/deposits?status=pending,approved_by_manager,rejected_by_manager&per_page=5')
         .then(r => { pendingDeposits.value = r.data.data ?? r.data }),
      api.get('/admin/activity-logs?per_page=8')
         .then(r => { activityLogs.value = r.data.data ?? r.data }),
    ])
  } catch (e) {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDashboard)

// Nettoyage propre des instances Chart.js quand le composant est détruit
onBeforeUnmount(() => {
  if (barChart)   { barChart.destroy();   barChart   = null }
  if (donutChart) { donutChart.destroy(); donutChart = null }
})
</script>