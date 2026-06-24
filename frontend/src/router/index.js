import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogueView from '../views/CatalogueView.vue'
import DocumentDetailView from '../views/DocumentDetailView.vue'
import SearchView from '../views/SearchView.vue'
import AuthView from '../views/AuthView.vue'
import Dashboard from '../views/Dashboard.vue'
import MyDocuments from '../views/MyDocuments.vue'
import DepositRequest from '../views/DepositRequest.vue'
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
import AdminDepositRequests from '../views/admin/AdminDepositRequests.vue'
import AdminReferencesList from '../views/admin/AdminReferencesList.vue'
import AdminUsersList from '../views/admin/AdminUsersList.vue'
import AdminCategories from '../views/admin/AdminCategories.vue'
import AdminAuteurs from '../views/admin/AdminAuteurs.vue'
import AdminEditeurs from '../views/admin/AdminEditeurs.vue'
import AdminActivityLogs from '../views/admin/AdminActivityLogs.vue'
import AdminArchive from '../views/admin/AdminArchive.vue'
import { setupAuthGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/catalogue',
      name: 'catalogue',
      component: CatalogueView,
    },
    {
      path: '/catalogue/:id',
      name: 'document-detail',
      component: DocumentDetailView,
    },
    {
      path: '/recherche',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/connexion',
      name: 'auth',
      component: AuthView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/my-documents',
      name: 'my-documents',
      component: MyDocuments,
    },
    {
      path: '/deposit-request',
      name: 'deposit-request',
      component: DepositRequest,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/manager/dashboard',
      name: 'manager-dashboard',
      component: ManagerDashboard,
    },
    {
      path: '/manager/deposits',
      name: 'manager-deposits',
      component: ManagerDeposits,
    },
    {
      path: '/manager/deposits/:id/review',
      name: 'manager-deposit-review',
      component: ManagerDepositReview,
    },
    {
      path: '/manager/profile',
      name: 'manager-profile',
      component: ManagerProfile,
    },
    {
      path: '/rh/dashboard',
      name: 'rh-dashboard',
      component: RHDashboard,
    },
    {
      path: '/rh/users',
      name: 'rh-users',
      component: RHUsers,
    },
    {
      path: '/rh/users/new',
      name: 'rh-user-new',
      component: RHUserForm,
    },
    {
      path: '/rh/users/:id',
      name: 'rh-user-detail',
      component: RHUserDetail,
    },
    {
      path: '/rh/users/:id/edit',
      name: 'rh-user-edit',
      component: RHUserForm,
    },
    {
      path: '/rh/profile',
      name: 'rh-profile',
      component: RHProfile,
    },
    {
      path: '/rh/activity-logs',
      name: 'rh-activity-logs',
      component: RHActivityLogs,
    },
    {
      path: '/rh/archive',
      name: 'rh-archive',
      component: RHArchive,
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
    },
    {
      path: '/admin/demandes',
      name: 'admin-demandes',
      component: AdminDepositRequests,
    },
    {
      path: '/admin/references',
      name: 'admin-references',
      component: AdminReferencesList,
    },
    {
      path: '/admin/utilisateurs',
      name: 'admin-utilisateurs',
      component: AdminUsersList,
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: AdminCategories,
    },
    {
      path: '/admin/auteurs',
      name: 'admin-auteurs',
      component: AdminAuteurs,
    },
    {
      path: '/admin/editeurs',
      name: 'admin-editeurs',
      component: AdminEditeurs,
    },
    {
      path: '/admin/activity-logs',
      name: 'admin-activity-logs',
      component: AdminActivityLogs,
    },
    {
      path: '/admin/archive',
      name: 'admin-archive',
      component: AdminArchive,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Setup authentication guards
setupAuthGuards(router)

export default router
