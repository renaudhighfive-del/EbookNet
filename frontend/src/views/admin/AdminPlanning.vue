<template>
  <AppLayout>
    <div class="flex gap-6 h-full">
      <!-- Sidebar with calendar, stats, legend -->
      <div class="w-80 shrink-0">
        <AdminPlanningSidebar />
      </div>

      <!-- Main content -->
      <div class="flex-1">
        <!-- Tabs -->
        <div class="flex items-center gap-4 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span v-if="tab.badge" class="ml-1 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
              {{ tab.badge }}
            </span>
          </button>
        </div>

        <!-- Content -->
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[700px]">
          <AdminPlanningCalendar v-if="activeTab === 'calendar'" />
          <AdminPlanningAppointments v-else-if="activeTab === 'appointments'" />
          <AdminPlanningAvailability v-else />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Calendar as CalendarIcon,
  ListTodo,
  Clock,
} from '@lucide/vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AdminPlanningSidebar from './AdminPlanningSidebar.vue'
import AdminPlanningCalendar from './AdminPlanningCalendar.vue'
import AdminPlanningAppointments from './AdminPlanningAppointments.vue'
import AdminPlanningAvailability from './AdminPlanningAvailability.vue'
import { useAdminPlanningStore } from '@/stores/admin-planning'

const store = useAdminPlanningStore()
const activeTab = ref('calendar')

const tabs = computed(() => [
  { id: 'calendar', label: 'Calendrier', icon: CalendarIcon },
  { id: 'appointments', label: 'Rendez-vous', icon: ListTodo, badge: pendingAppointmentsCount },
  { id: 'availability', label: 'Disponibilités', icon: Clock },
])

const pendingAppointmentsCount = computed(() => {
  return (store.appointments || []).filter(a => a.status === 'pending').length
})

onMounted(async () => {
  await store.fetchAppointments()
})
</script>
