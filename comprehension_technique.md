# EbookNet — Compréhension Technique du Projet

## Architecture Globale

```
EbookNet/
├── backend/          → API Laravel 12 (Sanctum auth, MySQL)
└── frontend/         → SPA Vue 3 + Pinia + Vite (Tailwind CSS)
```

**Communication :** Le frontend SPA communique avec le backend Laravel via une API RESTful. L'authentification est gérée par **Laravel Sanctum** (cookie de session + token CSRF). Les rôles sont vérifiés côté backend via le middleware `CheckRole` et côté frontend via le store `auth`.

---

## 1. BACKEND (Laravel 12)

### 1.1 Système de Rôles

| Rôle | Slug | Accès |
|---|---|---|
| Utilisateur | `user` | Catalogue, soumission de dépôts, rendez-vous |
| Responsable | `responsable_demande` | Review des dépôts assignés |
| RH | `responsable_rh` | Gestion des utilisateurs |
| Admin | `admin` | Accès total |

### 1.2 Contrôleurs

#### AuthController
`POST /auth/register` — Inscription publique
`POST /auth/login` — Connexion (set cookie Sanctum)
`POST /auth/logout` — Déconnexion
`GET /auth/me` — Récupère l'utilisateur connecté
`POST /auth/forgot-password` — Email de réinitialisation
`POST /auth/reset-password` — Réinitialisation du mot de passe

#### UserController
Gère le CRUD des utilisateurs côté admin/HR :
- `index` — Liste paginée (filtres : rôle, statut, recherche)
- `store` — Création par RH
- `update` — Modification
- `archive` — Suppression logique
- `approve`, `suspend`, `requestSuspend`, `validateSuspend`, `restore` — Cycle de vie
- `updateRole` — Changement de rôle
- `getStats` — Statistiques dashboard admin
- `getDepositsByMonth`, `getReferencesByCategory` — Stats

#### CategoryController
CRUD complet des catégories de documents :
- `index` — Paginé
- `all` — Toutes (sans pagination)
- `toggleStatus` — Activer/désactiver

#### AuthorController
CRUD complet des auteurs.

#### PublisherController
CRUD complet des éditeurs.

#### ReferenceController
Gère les références (livres publiés dans le catalogue) :
- `index` — Liste paginée avec filtres (statut, catégorie, type, recherche)
- `archivedReferences` — Références archivées
- `store` — Création (avec upload de fichier)
- `update` — Modification (supporte FormData pour upload)
- `destroy` — Archive (soft delete)
- `toggleStatus` — Change le statut (published/draft)
- `restore` — Restauration depuis archive

#### DepositRequestController
Cœur du workflow de dépôt :
- `index` — Liste paginée avec filtres (statut, manager, catégorie, type, date, recherche)
- `store` — Soumission d'une demande (upload de fichier)
- `assign` — Assigner à un responsable
- `unassign` — Annuler l'assignation
- `remind` — Relancer le responsable
- `approve` — Approuver (action responsable)
- `reject` — Rejeter (action responsable)
- `secondOpinion` — Demander un second avis
- `rejectDefinitive` — Rejet définitif (admin)
- `publish` — Publier (crée une référence + marque le dépôt comme `approved_published`)
- `unpublish` — Dépublier
- `availableManagers` — Liste des responsables disponibles
- `userDeposits` — Dépôts de l'utilisateur connecté
- `serveFile` — Servir le fichier déposé

#### PlanningController
Rendez-vous côté utilisateur :
- `getAvailability` — Créneaux disponibles pour une date
- `getAvailabilityMonth` — Créneaux pour tout un mois
- `createAppointment` — Créer un rendez-vous
- `calendarAppointments` — Rendez-vous de l'utilisateur
- `getAppointmentStatus` — Statut d'un rendez-vous
- `cancelAppointment` — Annuler

#### AdminPlanningController
Gestion complète du planning côté admin :
- `availabilityRules` — CRUD des règles de disponibilité (par jour de semaine)
- `availabilityExceptions` — Exceptions (congés, fermetures)
- `appointments` — CRUD des rendez-vous + vue calendrier
- `settings` — Paramètres (min_notice_hours, max_advance_days, auto_confirm, timezone)
- `googleCalendar` — Intégration Google Calendar (status, authorize, callback, disconnect)

#### ActivityLogController
- `indexForRH` — Logs pour RH
- `indexForAdmin` — Logs pour admin

#### PublicController
Données publiques (pas d'authentification) :
- `stats` — Statistiques globales
- `categories` — Catégories actives
- `references` — Références publiées
- `latestReferences` — Dernières publiées
- `featuredReference` — Référence mise en avant
- `showReference` — Détail d'une référence
- `search` — Recherche plein texte

### 1.3 Modèles (20)

| Modèle | Table | Rôle |
|---|---|---|
| `User` | `users` | Comptes utilisateur (tous rôles) |
| `Reference` | `references` | Documents publiés dans le catalogue |
| `DepositRequest` | `deposit_requests` | Demandes de dépôt en workflow |
| `DepositRequestReview` | `deposit_request_reviews` | Avis des responsables |
| `Category` | `categories` | Catégories de documents |
| `Author` | `authors` | Auteurs |
| `Publisher` | `publishers` | Éditeurs |
| `ReferenceAuthor` | `reference_author` | Pivot N-N références/auteurs |
| `ReferenceKeyword` | `reference_keywords` | Mots-clés des références |
| `Appointment` | `appointments` | Rendez-vous |
| `AvailabilityRule` | `availability_rules` | Règles de disponibilité |
| `AvailabilityException` | `availability_exceptions` | Exceptions de disponibilité |
| `Setting` | `settings` | Paramètres de planning |
| `GoogleCalendarToken` | `google_calendar_tokens` | Tokens OAuth Google Calendar |
| `NotificationsLog` | `notifications_log` | Logs d'envoi d'emails |
| `ActivityLog` | `activity_logs` | Journal d'activité |
| `Notification` | `notifications` | Notifications in-app |
| `Download` | `downloads` | Traçage des téléchargements |
| `View` | `views` | Traçage des consultations |

### 1.4 Services

- `GoogleCalendarService` — Gère les tokens OAuth, création/suppression d'événements Google Calendar.

### 1.5 Middleware

- `CheckRole` — Vérifie que l'utilisateur authentifié possède un des rôles autorisés.

### 1.6 Machine à États (Workflow Dépôt)

```
pending → assigned → manager_approved → approved_published (→ Reference)
                    → manager_rejected → rejected
                    → second_opinion → manager_approved
                                     → manager_rejected
                                     → approved_published
                                     → rejected
```

Chaque transition est contrôlée par le `DepositRequestController` avec validation métier.

---

## 2. FRONTEND (Vue 3 + Pinia)

### 2.1 Stores Pinia (11)

#### `auth.js` — Authentification
- **État :** `user`, `isAuthenticated`, `userRole`
- **Actions :** `login()`, `register()`, `logout()`, `fetchUser()`
- **Rôle :** Gère le cookie Sanctum CSRF, redirige selon le rôle après connexion.

#### `user.js` — Gestion des utilisateurs (admin/HR)
- **État :** `users`, `pagination`, `stats`, `isLoading`
- **Actions :** `fetchUsers()`, `createUser()`, `updateUser()`, `archiveUser()`, `approveUser()`, `suspendUser()`, `restoreUser()`, `fetchArchivedUsers()`
- **Helpers :** `getRoleLabel()`, `getStatusLabel()`, `getStatusClass()`

#### `reference.js` — Gestion des références (admin)
- **État :** `references`, `archivedReferences`, `pagination`
- **Actions :** `fetchReferences()`, `fetchArchived()`, `createReference()`, `updateReference()`, `deleteReference()`, `toggleStatus()`, `restoreReference()`
- **Helpers :** `getTypeLabel()`, `getStatusLabel()`, `getLanguageLabel()`

#### `category.js` — Catégories
- **État :** `categories`, `allCategories`
- **Actions :** `fetchCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`, `toggleStatus()`

#### `author.js` — Auteurs
- **État :** `authors`, `allAuthors`
- **Actions :** `fetchAuthors()`, `createAuthor()`, `updateAuthor()`, `deleteAuthor()`

#### `publisher.js` — Éditeurs
- **État :** `publishers`, `allPublishers`
- **Actions :** `fetchPublishers()`, `createPublisher()`, `updatePublisher()`, `deletePublisher()`

#### `deposits.js` — Workflow dépôt (admin/manager)
- **État :** `deposits`, `currentDeposit`, `managers`, `pagination`, `isLoading`, `error`, `activityLogs`
- **Actions principales :**
  - `fetchDeposits()` — Liste depuis l'API (fallback mock si erreur)
  - `fetchManagers()` — Responsables depuis l'API (fallback mock)
  - `assignManager()` / `reassignManager()` — Assignation/réassignation
  - `unassignManager()` — Annulation d'assignation
  - `remindManager()` — Relance
  - `updateDepositStatus()` — Transition générique
  - `approveAndPublish()` — Publication (crée référence)
- **Helpers :**
  - `getAvailableManagers()` — Responsables disponibles (filtre charge de travail)
  - `getActiveManagers()` — Tous les responsables actifs
  - `getManagerById()` — Un responsable par ID
  - `getActionsForStatus()` — Actions possibles pour un statut donné
  - `getStepsForStatus()` — Étapes du stepper
- **Machine à états :** Définie dans `STATUS_TRANSITIONS`, `STATUS_ACTIONS`, `ACTION_REGISTRY`
- **Fallback :** `MOCK_MANAGERS`, `MOCK_USERS`, `buildMockDeposits()` si API indisponible

#### `deposit.js` — Dépôt côté utilisateur
- **État :** `myDeposits`, `currentDeposit`, `categories`
- **Actions :** `fetchMyDeposits()`, `fetchDeposit()`, `createDeposit()` (FormData avec upload)

#### `planning.js` — Planning côté utilisateur
- **État :** `availability`, `appointments`, `selectedSlot`
- **Actions :** `fetchAvailability()`, `fetchAvailabilityMonth()`, `createAppointment()`, `fetchAppointments()`, `cancelAppointment()`

#### `admin-planning.js` — Planning côté admin
- **État :** `rules`, `exceptions`, `appointments`, `settings`, `googleCalendarStatus`
- **Actions :** CRUD règles/exceptions/rendez-vous, gestion paramètres, intégration Google Calendar

#### `toast.js` — Notifications
- **État :** `toasts`
- **Actions :** `add()`, `success()`, `error()`, `info()`, `warning()` — Auto-suppression après délai.

### 2.2 Services API (8)

Chaque service encapsule les appels Axios vers une section de l'API :

| Service | Fichier | Routes |
|---|---|---|
| `auth.service.js` | `/auth/*` | login, register, logout, me |
| `user.service.js` | `/user/*` | dashboard, deposits |
| `public.service.js` | `/public/*` | stats, categories, references, search |
| `hr.service.js` | `/hr/*` | users CRUD, activity logs |
| `manager.service.js` | `/manager/*` | deposits list/review |
| `admin.service.js` | `/admin/*` | stats, users, categories, authors, publishers, references, deposits, activity logs, managers |
| `planning.service.js` | `/planning/*` | availability, appointments |
| `admin-planning.service.js` | `/admin/planning/*` | rules, exceptions, appointments, settings, google calendar |

Le fichier `api.js` configure l'instance Axios :
- `baseURL` → `http://localhost:8000/api`
- `withCredentials: true` (cookie Sanctum)
- `XSRF-TOKEN` extrait du cookie
- Timeout 30s avec 2 tentatives de retry
- Intercepteur 401 → déconnexion + redirection

### 2.3 Layouts (6)

| Layout | Utilisation |
|---|---|
| `PublicLayout.vue` | Pages publiques (home, catalogue, search, login) |
| `AuthenticatedLayout.vue` | Dashboard utilisateur, mes dépôts |
| `AdminLayout.vue` | Toutes les pages admin |
| `RHLayout.vue` | Pages RH |
| `ResponsableLayout.vue` | Pages responsable |
| `AppLayout.vue` | Layout de base |

### 2.4 Router

- **Fichier :** `frontend/src/router/index.js`
- **Guard :** `frontend/src/router/guards.js`
  - Vérifie l'authentification à chaque navigation
  - Redirige les non-connectés vers `/connexion`
  - Vérifie les rôles via `meta.roles`
  - Redirection post-connexion selon le rôle :
    - `admin` → `/admin/dashboard`
    - `responsable_rh` → `/rh/dashboard`
    - `responsable_demande` → `/manager/dashboard`
    - `user` → `/dashboard`

### 2.5 Routes Principales

```
/                                   → HomeView (public)
/catalogue                          → CatalogueView (public)
/catalogue/:id                      → DocumentDetailView (public)
/recherche                          → SearchView (public)
/connexion                          → AuthView (public)

/dashboard                          → Dashboard (user)
/mes-depots                         → MyDocuments (user)
/depot-request                      → DepositRequest (user)
/mes-depots/:id                     → DepositDetail (user)
/profil                             → Profile (user)
/planning-calendrier                → UserPlanningCalendar (user)

/manager/dashboard                  → ManagerDashboard
/manager/deposits                   → ManagerDeposits
/manager/deposits/:id/review        → ManagerDepositReview
/manager/profile                    → ManagerProfile

/rh/dashboard                       → RHDashboard
/rh/users                           → RHUsers
/rh/users/nouveau                   → RHUserForm
/rh/users/:id                       → RHUserDetail
/rh/users/:id/modifier              → RHUserForm
/rh/profil                          → RHProfile
/rh/activity-logs                   → RHActivityLogs
/rh/archives                        → RHArchive

/admin/dashboard                    → AdminDashboard
/admin/utilisateurs                 → AdminUsersList
/admin/references                   → AdminReferencesList
/admin/categories                   → AdminCategories
/admin/auteurs                      → AdminAuthors
/admin/editeurs                     → AdminPublishers
/admin/demandes                     → DepositListView
/admin/demandes/:id                 → DepositDetailView
/admin/activity-logs                → AdminActivityLogs
/admin/archives                     → AdminArchive
/admin/planning                     → AdminPlanning
```

---

## 3. FLUX MÉTIER PRINCIPAUX

### 3.1 Dépôt et Publication

```
Utilisateur                    Responsable                   Admin
    │                              │                          │
    ├── Soumet demande ───────────►│                          │
    │    (DepositRequest.store)    │                          │
    │                              │                          │
    │                              │    Attend assignation    │
    │                              │◄──── Assigne ────────────┤
    │                              │    (assign)              │
    │                              │                          │
    │                              ├── Approuve ou Rejette    │
    │                              │    (approve/reject)      │
    │                              │                          │
    │                              │◄──── Second avis ───────┤
    │                              │    (secondOpinion)       │
    │                              │    ou Rejet définitif    │
    │                              │    (rejectDefinitive)    │
    │                              │                          │
    │                              ├── Approuvé ────────────►│
    │                              │                          ├── Publie → Référence
    │                              │                          │    (publish)
    │                              │                          │
    │◄───────── Référence ─────────│──────────────────────────┤
    │         publiée              │                          │
```

### 3.2 Rendez-vous / Planning

```
Utilisateur                    Admin/Teacher
    │                              │
    ├── Consulte créneaux ─────────┤
    │    (getAvailability)         │
    │                              │
    ├── Réserve un créneau ───────►│
    │    (createAppointment)       │
    │                              │
    │◄── Confirmation/Refus ───────┤
    │                              │
    │    Google Calendar sync ─────┤
    │                              │
```

---

## 4. SÉCURITÉ

- **Authentification :** Sanctum (cookie de session SPA)
- **CSRF :** Token XSRF-TOKEN extrait du cookie, envoyé via `X-XSRF-TOKEN`
- **Rôles :** Middleware `CheckRole` sur chaque route protégée
- **Policies :** Authorization gates pour les modèles (UserPolicy, ReferencePolicy, etc.)
- **Validation :** Form Requests Laravel (règles de validation par opération)
- **CORS :** Configuré via `config/cors.php` pour les domaines SPA (`localhost:5173,5174`)
