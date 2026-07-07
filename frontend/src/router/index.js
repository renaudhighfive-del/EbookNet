import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogueView from '../views/CatalogueView.vue'
import DocumentDetailView from '../views/DocumentDetailView.vue'
import SearchView from '../views/SearchView.vue'
import AuthView from '../views/AuthView.vue'
import Dashboard from '../views/Dashboard.vue'
import MyDocuments from '../views/MyDocuments.vue'
import DepositRequest from '../views/DepositRequest.vue'
import DepositDetail from '../views/DepositDetail.vue'
import Profile from '../views/Profile.vue'
import ManagerDashboard from '../views/responsable/ManagerDashboard.vue'
import ManagerDeposits from '../views/responsable/ManagerDeposits.vue'
import ManagerDepositReview from '../views/responsable/ManagerDepositReview.vue'
import ManagerProfile from '../views/responsable/ManagerProfile.vue'
import RHDashboard from '../views/rh/RHDashboard.vue'
import RHUsers from '../views/rh/RHUsers.vue'
import RHUserForm from '../views/rh/RHUserForm.vue'
import RHUserDetail from '../views/rh/RHUserDetail.vue'
import RHProfile from '../views/rh/RHProfile.vue'
import RHActivityLogs from '../views/rh/RHActivityLogs.vue'
import RHArchive from '../views/rh/RHArchive.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
// import AdminDepositRequests from '../views/admin/AdminDepositRequests.vue'
import DepositListView from '../views/admin/deposits/DepositListView.vue'
import DepositDetailView from '../views/admin/deposits/DepositDetailView.vue'
import AdminReferencesList from '../views/admin/AdminReferencesList.vue'
import AdminUsersList from '../views/admin/AdminUsersList.vue'
import AdminCategories from '../views/admin/AdminCategories.vue'
import AdminAuthors from '../views/admin/AdminAuthors.vue'
import AdminPublishers from '../views/admin/AdminPublishers.vue'
import AdminActivityLogs from '../views/admin/AdminActivityLogs.vue'
import AdminArchive from '../views/admin/AdminArchive.vue'
import AdminPlanning from '../views/admin/AdminPlanning.vue'
import UserPlanningCalendar from '../views/UserPlanningCalendar.vue'
import { setupAuthGuards } from './guards'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { public: true },
  },
  {
    path: '/catalogue',
    name: 'catalogue',
    component: CatalogueView,
    meta: { public: true },
  },
  {
    path: '/catalogue/:id',
    name: 'document-detail',
    component: DocumentDetailView,
    meta: { public: true },
  },
  {
    path: '/recherche',
    name: 'search',
    component: SearchView,
    meta: { public: true },
  },
  {
    path: '/planning-calendrier',
    name: 'planning-calendar',
    component: UserPlanningCalendar,
    meta: { requiresAuth: true, roles: ['user'] },
  },
  {
    path: '/connexion',
    name: 'auth',
    component: AuthView,
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, roles: ['user'] },
  },
  {
    path: '/my-documents',
    name: 'my-documents',
    component: MyDocuments,
    meta: { requiresAuth: true },
  },
  {
    path: '/deposit-request',
    name: 'deposit-request',
    component: DepositRequest,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-documents/:id',
    name: 'deposit-detail',
    component: DepositDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true, roles: ['user', 'responsable_rh', 'responsable_demande', 'admin'] },
  },
  {
    path: '/manager/dashboard',
    name: 'manager-dashboard',
    component: ManagerDashboard,
    meta: { requiresAuth: true, roles: ['responsable_demande', 'admin'] },
  },
  {
    path: '/manager/deposits',
    name: 'manager-deposits',
    component: ManagerDeposits,
    meta: { requiresAuth: true, roles: ['responsable_demande', 'admin'] },
  },
  {
    path: '/manager/deposits/:id/review',
    name: 'manager-deposit-review',
    component: ManagerDepositReview,
    meta: { requiresAuth: true, roles: ['responsable_demande', 'admin'] },
  },
  {
    path: '/manager/profile',
    name: 'manager-profile',
    component: ManagerProfile,
    meta: { requiresAuth: true, roles: ['responsable_demande', 'admin'] },
  },
  {
    path: '/rh/dashboard',
    name: 'rh-dashboard',
    component: RHDashboard,
    meta: { requiresAuth: true, roles: ['responsable_rh', 'admin'] },
  },
  {
    path: '/rh/users',
    name: 'rh-users',
    component: RHUsers,
    meta: { requiresAuth: true, roles: ['responsable_rh', 'admin'] },
  },
  {
    path: '/rh/users/new',
    name: 'rh-user-new',
    component: RHUserForm,
    meta: { requiresAuth: true, roles: ['responsable_rh', 'admin'] },
  },
  {
    path: '/rh/users/:id',
    name: 'rh-user-detail',
    component: RHUserDetail,
    meta: { requiresAuth: true, roles: ['responsable_rh', 'admin'] },
  },
  {
    path: '/rh/users/:id/edit',
    name: 'rh-user-edit',
    component: RHUserForm,
    meta: { requiresAuth: true, roles: ['responsable_rh', 'admin'] },
  },
  {
    path: '/rh/profile',
    name: 'rh-profile',
    component: RHProfile,
    meta: { requiresAuth: true, roles: ['responsable_rh', 'admin'] },
  },
  {
    path: '/rh/activity-logs',
    name: 'rh-activity-logs',
    component: RHActivityLogs,
    meta: { requiresAuth: true, roles: ['responsable_rh', 'admin'] },
  },
  {
    path: '/rh/archive',
    name: 'rh-archive',
    component: RHArchive,
    meta: { requiresAuth: true, roles: ['responsable_rh', 'admin'] },
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/demandes',
    name: 'admin-demandes',
    component: DepositListView,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/demandes/:id',
    name: 'admin-deposit-detail',
    component: DepositDetailView,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/references',
    name: 'admin-references',
    component: AdminReferencesList,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/utilisateurs',
    name: 'admin-utilisateurs',
    component: AdminUsersList,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: AdminCategories,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/auteurs',
    name: 'admin-auteurs',
    component: AdminAuthors,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/editeurs',
    name: 'admin-editeurs',
    component: AdminPublishers,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/activity-logs',
    name: 'admin-activity-logs',
    component: AdminActivityLogs,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/archive',
    name: 'admin-archive',
    component: AdminArchive,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/planning',
    name: 'admin-planning',
    component: AdminPlanning,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/profile',
    name: 'admin-profile',
    component: Profile,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Setup authentication guards
setupAuthGuards(router)

export default router
