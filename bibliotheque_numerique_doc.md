
# 📚 Bibliothèque Numérique — Documentation Technique Complète
> Stack : **Laravel 12 + Sanctum (API REST)** + **Vue.js 3 (Composition API + Pinia)**
> Version : **3.0** — Schéma de BDD aligné sur les tables définitives du projet

---

## 1. Vue d'ensemble du projet

**Nom du projet :** Bibliothèque Numérique Responsive  
**Type :** Application Web SaaS — Catalogue documentaire en ligne  
**Contexte :** Inspiré de la bibliothèque numérique nationale du Bénin, adapté aux besoins d'un établissement local.

### Objectif principal
Centraliser, sécuriser et rendre accessible un catalogue de références documentaires numériques, avec un système de validation multi-niveaux pour les dépôts de contenu.

---

## 2. Architecture Technique

### 2.1 Stack recommandé

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| Backend API | Laravel | 11.x | API REST, logique métier, authentification |
| Auth | Laravel Sanctum | Inclus L11 | Tokens SPA + Mobile |
| Base de données | MySQL | 8.x | Stockage principal |
| Cache / Queue | Redis | 7.x | Files d'attente, cache, sessions |
| Frontend | Vue.js | 3.x | SPA reactive |
| État global | Pinia | 2.x | Store centralisé |
| Routing SPA | Vue Router | 4.x | Navigation côté client |
| HTTP Client | Axios | 1.x | Requêtes API depuis Vue |
| UI Library | Tailwind CSS | 3.x | Styles utilitaires |
| Composants | PrimeVue ou shadcn/vue | — | Composants accessibles |
| Stockage fichiers | Laravel Storage + S3/MinIO | — | Documents PDF, images |
| Recherche | Laravel Scout + Meilisearch | — | Recherche full-text avancée |
| Emails | Laravel Mail + Mailtrap/Mailgun | — | Notifications |
| PDF Viewer | PDF.js | — | Lecture en ligne |
| Tests Backend | PHPUnit / Pest | — | Tests unitaires & feature |
| Tests Frontend | Vitest + Cypress | — | Tests unitaires & e2e |
| Linting | ESLint + Prettier + Pint (PHP) | — | Qualité de code |

> ⚠️ **Note sur les rôles :** Le rôle est géré via un champ `role` ENUM directement dans la table `users`.
> **`spatie/laravel-permission` n'est donc pas utilisé** dans ce projet.
> Les middlewares de protection des routes seront écrits manuellement.

### 2.2 Architecture Globale

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                  │
│          Vue.js 3 SPA — Pinia — Vue Router          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / JSON
                       │ Bearer Token (Sanctum)
┌──────────────────────▼──────────────────────────────┐
│              Laravel API (REST)                     │
│   Routes → Middleware → Controller → Service        │
│   → Repository → Model → Eloquent ORM              │
└──────┬───────────────────────────┬──────────────────┘
       │                           │
┌──────▼───────┐          ┌────────▼────────┐
│   MySQL 8    │          │  Redis (Cache)  │
│  (Données)   │          │  (Queue/Session)│
└──────────────┘          └─────────────────┘
                                   │
                          ┌────────▼────────┐
                          │  Meilisearch    │
                          │  (Full-text)    │
                          └─────────────────┘
```

---

## 3. Profils & Rôles (RBAC simplifié — ENUM dans `users`)

| Rôle | Valeur ENUM | Niveau d'accès |
|---|---|---|
| Visiteur | *(non authentifié)* | Lecture publique uniquement |
| Utilisateur inscrit | `user` | Lecture étendue + dépôt |
| Responsable RH | `responsable_rh` | Gestion des comptes utilisateurs |
| Responsable Validation | `responsable_demande` | Traitement des demandes de dépôt |
| Administrateur | `admin` | Accès total |

> **Implémentation :** Middleware Laravel custom `CheckRole` qui lit `auth()->user()->role`
> et protège les routes selon le rôle. Exemple :
> ```php
> Route::middleware(['auth:sanctum', 'role:admin'])->group(...);
> Route::middleware(['auth:sanctum', 'role:admin,responsable_demande'])->group(...);
> ```

---

## 4. Schéma de Base de Données

### Vue d'ensemble — Toutes les tables

```
┌──────────────────────────────────────────────────────────────────────┐
│                        TABLES PRINCIPALES                            │
│  users  │  categories  │  publishers  │  authors  │  references      │
└──────────────────────────────────────────────────────────────────────┘
                                  │
┌──────────────────────────────────────────────────────────────────────┐
│                          TABLES PIVOT                                │
│        reference_author        │        reference_keywords           │
└──────────────────────────────────────────────────────────────────────┘
                                  │
┌──────────────────────────────────────────────────────────────────────┐
│                       TABLES DU WORKFLOW ⭐                           │
│          deposit_requests       │      deposit_request_reviews        │
└──────────────────────────────────────────────────────────────────────┘
                                  │
┌──────────────────────────────────────────────────────────────────────┐
│                         TABLES SYSTÈME                               │
│  notifications  │  activity_logs  │  downloads  │  views             │
└──────────────────────────────────────────────────────────────────────┘
```

**Ordre de création des migrations (respect des FK) :**
```
1. users
2. categories
3. publishers
4. authors
5. references          (dépend de categories, publishers, users)
6. reference_author    (dépend de references, authors)
7. reference_keywords  (dépend de references)
8. deposit_requests    (dépend de users)
9. deposit_request_reviews (dépend de deposit_requests, users)
10. notifications      (dépend de users)
11. activity_logs      (dépend de users)
12. downloads          (dépend de users, references)
13. views              (dépend de users, references)
```

---

### 4.1 Table `users`

> Le rôle est porté directement par un champ ENUM — pas de table de rôles séparée.

```sql
users
├── id                BIGINT UNSIGNED PK AUTO_INCREMENT
├── first_name        VARCHAR(100)
├── last_name         VARCHAR(100)
├── email             VARCHAR(255) UNIQUE
├── phone             VARCHAR(50) NULL
├── password          VARCHAR(255)                        -- Hashé bcrypt
├── role              ENUM(
│                       'admin',
│                       'responsable_rh',
│                       'responsable_demande',
│                       'user'
│                     ) DEFAULT 'user'
├── status            ENUM('active','inactive','suspended') DEFAULT 'active'
├── email_verified_at TIMESTAMP NULL
├── last_login_at     TIMESTAMP NULL                      -- Mis à jour à chaque connexion
├── remember_token    VARCHAR(100) NULL
├── created_at        TIMESTAMP
└── updated_at        TIMESTAMP
```

**Champs importants :**

| Champ | Utilité |
|---|---|
| `first_name` + `last_name` | Prénom et nom séparés pour un affichage flexible |
| `role` | Détermine les droits d'accès sur toute la plateforme |
| `status` | `active` = compte utilisable, `inactive` = désactivé par RH, `suspended` = suspendu par admin |
| `last_login_at` | Mis à jour automatiquement à chaque `POST /auth/login` réussi |

**Relations :**
- Un user peut soumettre plusieurs `deposit_requests` (via `applicant_id`)
- Un user (`responsable_demande`) peut être assigné à plusieurs `deposit_requests` (via `assigned_manager_id`)
- Un user peut apparaître dans `deposit_request_reviews` (via `reviewer_id`)
- Un user peut avoir plusieurs `notifications`
- Un user peut avoir plusieurs `downloads` et `views`

---

### 4.2 Table `categories`

> Représente les **domaines thématiques** des références documentaires (Informatique, Droit, Littérature…).
> ⚠️ Ne pas confondre avec le **type de document** (`document_type` ENUM dans `references`).

```sql
categories
├── id          BIGINT UNSIGNED PK AUTO_INCREMENT
├── name        VARCHAR(255)                        -- Ex: "Sciences Juridiques"
├── slug        VARCHAR(255) UNIQUE                 -- Ex: "sciences-juridiques"
├── description TEXT NULL
├── status      ENUM('active','inactive') DEFAULT 'active'
│                 -- inactive = catégorie masquée du catalogue public
├── created_at  TIMESTAMP
└── updated_at  TIMESTAMP
```

**Relations :**
- Une catégorie peut contenir plusieurs `references`

---

### 4.3 Table `publishers`

> Maisons d'édition ou organismes ayant publié les documents.
> Séparée de `references` pour éviter la duplication et permettre la gestion centralisée.

```sql
publishers
├── id          BIGINT UNSIGNED PK AUTO_INCREMENT
├── name        VARCHAR(255)                        -- Ex: "Les Éditions du Flamboyant"
├── description TEXT NULL
├── country     VARCHAR(100) NULL
├── website     VARCHAR(500) NULL
├── created_at  TIMESTAMP
└── updated_at  TIMESTAMP
```

**Relations :**
- Un éditeur peut être lié à plusieurs `references`

---

### 4.4 Table `authors`

> Recense les auteurs des documents présents dans la bibliothèque.

```sql
authors
├── id           BIGINT UNSIGNED PK AUTO_INCREMENT
├── first_name   VARCHAR(100)
├── last_name    VARCHAR(100)
├── biography    TEXT NULL
├── nationality  VARCHAR(100) NULL
├── birth_date   DATE NULL
├── death_date   DATE NULL                          -- NULL si auteur vivant
├── created_at   TIMESTAMP
└── updated_at   TIMESTAMP
```

**Relations :**
- Un auteur peut être lié à plusieurs `references` (via `reference_author`)

---

### 4.5 Table `references` ⭐ (catalogue principal)

> Table centrale du catalogue documentaire de la bibliothèque.
> Contient toutes les références publiées et accessibles aux utilisateurs.

```sql
references
├── id                BIGINT UNSIGNED PK AUTO_INCREMENT
├── title             VARCHAR(500)
├── subtitle          VARCHAR(500) NULL
├── abstract          TEXT NULL                     -- Résumé du document
├── isbn              VARCHAR(50) NULL
├── publication_year  YEAR NULL
├── language          ENUM('fr','en','autre') DEFAULT 'fr'
├── document_type     ENUM(
│                       'livre',
│                       'memoire',
│                       'these',
│                       'article',
│                       'revue',
│                       'rapport',
│                       'guide',
│                       'autre'
│                     )
├── pages             SMALLINT UNSIGNED NULL         -- Nombre de pages
│
│   -- Relations vers d'autres tables
├── category_id       BIGINT UNSIGNED FK → categories.id NULL
├── publisher_id      BIGINT UNSIGNED FK → publishers.id NULL
├── uploaded_by       BIGINT UNSIGNED FK → users.id NULL  -- Admin ou user ayant importé
│
│   -- Fichiers
├── cover_image       VARCHAR(500) NULL              -- Chemin image de couverture
├── file_path         VARCHAR(500) NULL              -- Chemin du PDF/document
│
│   -- Compteurs (dénormalisation pour perf)
├── download_count    INT UNSIGNED DEFAULT 0         -- Mis à jour via table downloads
├── view_count        INT UNSIGNED DEFAULT 0         -- Mis à jour via table views
│
│   -- Statut de publication
├── status            ENUM('draft','published','archived') DEFAULT 'draft'
│                       -- draft     = En cours, non visible publiquement
│                       -- published = Visible dans le catalogue
│                       -- archived  = Retiré du catalogue actif
├── created_at        TIMESTAMP
└── updated_at        TIMESTAMP
```

> 💡 **Note sur `download_count` et `view_count` :** Ces compteurs sont gardés ici pour
> des performances de lecture rapide (affichage catalogue). Ils sont incrémentés à chaque
> insertion dans `downloads` et `views` via un **Observer Eloquent** ou un **Job** asynchrone.

**Relations :**
- Appartient à une `categories`
- Appartient à un `publishers`
- Appartient à un `users` (uploadeur)
- A plusieurs `authors` (via `reference_author`)
- A plusieurs mots-clés (via `reference_keywords`)
- A plusieurs `downloads`
- A plusieurs `views`

---

### 4.6 Table `reference_author` (pivot)

> Liaison Many-to-Many entre `references` et `authors`.

```sql
reference_author
├── reference_id  BIGINT UNSIGNED FK → references.id  ON DELETE CASCADE
└── author_id     BIGINT UNSIGNED FK → authors.id      ON DELETE CASCADE
PRIMARY KEY (reference_id, author_id)
```

---

### 4.7 Table `reference_keywords` (pivot enrichie)

> Associe des mots-clés textuels directement à une référence.
> ⚠️ Le mot-clé est stocké **en texte brut** dans cette table — pas de table `keywords` séparée.
> Cela simplifie la saisie mais les mots-clés ne sont pas gérés de façon centralisée.

```sql
reference_keywords
├── id            BIGINT UNSIGNED PK AUTO_INCREMENT
├── reference_id  BIGINT UNSIGNED FK → references.id  ON DELETE CASCADE
└── keyword       VARCHAR(150)                         -- Ex: "droit constitutionnel"
```

> 💡 **Conséquence :** La recherche par mot-clé se fait via `LIKE '%mot%'` ou via
> l'indexation Meilisearch. On ne peut pas lister/gérer les mots-clés indépendamment.

---

### 4.8 Table `deposit_requests` ⭐ (cœur du workflow)

> Enregistre toutes les propositions de dépôt soumises par les utilisateurs inscrits.
> Chaque demande suit un circuit de validation avant de devenir une `references` publiée.

```sql
deposit_requests
├── id                  BIGINT UNSIGNED PK AUTO_INCREMENT
├── applicant_id        BIGINT UNSIGNED FK → users.id      -- Utilisateur soumetteur
├── assigned_manager_id BIGINT UNSIGNED FK → users.id NULL -- Responsable actuellement assigné
├── title               VARCHAR(500)
├── description         TEXT NULL                           -- Commentaire du déposant
├── proposed_file       VARCHAR(500) NULL                   -- Chemin du fichier soumis
├── status              ENUM(
│                         'pending',               -- Soumise, en attente d'affectation
│                         'approved_by_manager',   -- Validée par responsable → attend admin
│                         'rejected_by_manager',   -- Refusée par responsable → attend admin
│                         'second_review',         -- Admin demande un 2ème avis
│                         'approved',              -- Approuvée par admin → prête à publier
│                         'rejected',              -- Rejetée définitivement par admin
│                         'published'              -- Publiée → référence créée dans `references`
│                       ) DEFAULT 'pending'
├── reference_id        BIGINT UNSIGNED FK → references.id NULL
│                         -- Rempli automatiquement après publication
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

**Règles métier sur les statuts :**

| Statut | Déclencheur | Acteur |
|---|---|---|
| `pending` | Soumission initiale | User |
| `approved_by_manager` | Responsable valide | `responsable_demande` |
| `rejected_by_manager` | Responsable refuse (justification obligatoire) | `responsable_demande` |
| `second_review` | Admin demande un 2ème avis → réaffecte | Admin |
| `approved` | Admin approuve (ou passe outre le refus) | Admin |
| `rejected` | Admin rejette définitivement (justification obligatoire) | Admin |
| `published` | Admin publie → crée la `reference` | Admin |

---

### 4.9 Table `deposit_request_reviews` ⭐ (historique des décisions)

> Conserve l'**historique complet et immuable** de toutes les décisions prises sur chaque demande.
> C'est la table "historiques" — chaque ligne est un événement horodaté dans le workflow.

```sql
deposit_request_reviews
├── id                  BIGINT UNSIGNED PK AUTO_INCREMENT
├── deposit_request_id  BIGINT UNSIGNED FK → deposit_requests.id  ON DELETE CASCADE
├── reviewer_id         BIGINT UNSIGNED FK → users.id              -- Qui a agi
├── reviewer_role       ENUM('responsable_demande','admin')        -- Rôle au moment de l'action
├── decision            ENUM(
│                         'approved',                  -- Validation (responsable ou admin)
│                         'rejected',                  -- Refus (responsable ou admin)
│                         'override',                  -- Admin passe outre le refus du responsable
│                         'second_opinion_requested'   -- Admin demande un 2ème avis
│                       )
├── justification       TEXT NULL
│                         -- OBLIGATOIRE si decision IN ('rejected', 'override')
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

**Règle de validation (à implémenter dans `FormRequest`) :**
```php
// Dans DepositReviewRequest.php
'justification' => [
    Rule::requiredIf(fn() => in_array($this->decision, ['rejected', 'override']))
]
```

**Ce qu'une ligne de `deposit_request_reviews` représente :**

| `decision` | `reviewer_role` | `justification` | Signification |
|---|---|---|---|
| `approved` | `responsable_demande` | Optionnelle | Responsable valide la demande |
| `rejected` | `responsable_demande` | **Obligatoire** | Responsable refuse avec motif |
| `approved` | `admin` | Optionnelle | Admin approuve directement |
| `rejected` | `admin` | **Obligatoire** | Admin rejette définitivement |
| `override` | `admin` | **Obligatoire** | Admin passe outre le refus (doit expliquer) |
| `second_opinion_requested` | `admin` | Optionnelle | Admin demande un 2ème avis |

---

### 4.10 Table `notifications`

> Centralise les notifications envoyées aux utilisateurs (cloche 🔔 dans l'interface).
> Table custom — pas la table UUID standard de Laravel Notifications.

```sql
notifications
├── id         BIGINT UNSIGNED PK AUTO_INCREMENT
├── user_id    BIGINT UNSIGNED FK → users.id  ON DELETE CASCADE  -- Destinataire
├── title      VARCHAR(255)                                        -- Titre court
├── message    TEXT                                               -- Contenu détaillé
├── type       ENUM('system','validation','publication','information') DEFAULT 'information'
├── is_read    BOOLEAN DEFAULT FALSE
├── created_at TIMESTAMP
└── updated_at TIMESTAMP
```

**Déclencheurs de notification :**

| Événement | `type` | Destinataire |
|---|---|---|
| Demande assignée à un responsable | `validation` | `responsable_demande` assigné |
| Responsable valide → transmis admin | `validation` | Admin |
| Responsable refuse → transmis admin | `validation` | Admin |
| Admin approuve la demande | `validation` | Déposant (`applicant_id`) |
| Admin rejette définitivement | `validation` | Déposant (`applicant_id`) |
| Admin passe outre le refus | `system` | Responsable concerné |
| Document publié | `publication` | Déposant (`applicant_id`) |

---

### 4.11 Table `activity_logs`

> Journal d'audit des actions importantes réalisées sur la plateforme.
> Visible uniquement par l'administrateur dans le tableau de bord.

```sql
activity_logs
├── id            BIGINT UNSIGNED PK AUTO_INCREMENT
├── user_id       BIGINT UNSIGNED FK → users.id NULL  -- NULL si action système
├── action        VARCHAR(255)
│                   -- Ex: 'login', 'logout', 'create_reference',
│                   --     'delete_user', 'publish_deposit', 'download_file'
├── target_table  VARCHAR(100) NULL                   -- Ex: 'references', 'users'
├── target_id     BIGINT UNSIGNED NULL                -- ID de l'enregistrement concerné
├── ip_address    VARCHAR(45) NULL                    -- IPv4 ou IPv6
├── user_agent    TEXT NULL                           -- Navigateur / client
├── created_at    TIMESTAMP
└── updated_at    TIMESTAMP
```

> 💡 **Implémentation recommandée :** Créer un `ActivityLogService` appelé depuis les
> Controllers ou via des **Observers Eloquent** pour les événements sur les modèles.

---

### 4.12 Table `downloads`

> Historise chaque téléchargement d'une référence.
> Permet des statistiques précises (qui a téléchargé quoi, quand).

```sql
downloads
├── id            BIGINT UNSIGNED PK AUTO_INCREMENT
├── user_id       BIGINT UNSIGNED FK → users.id NULL
│                   -- NULL si téléchargement par un visiteur non connecté
├── reference_id  BIGINT UNSIGNED FK → references.id  ON DELETE CASCADE
├── downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── ip_address    VARCHAR(45) NULL                    -- Pour stats anonymes visiteurs
```

> 💡 À chaque insertion dans `downloads`, un **Observer** incrémente `references.download_count`.

---

### 4.13 Table `views`

> Enregistre chaque consultation d'une fiche de référence.
> Permet des statistiques de popularité des documents.

```sql
views
├── id           BIGINT UNSIGNED PK AUTO_INCREMENT
├── user_id      BIGINT UNSIGNED FK → users.id NULL
│                  -- NULL si consultation par un visiteur non connecté
├── reference_id BIGINT UNSIGNED FK → references.id  ON DELETE CASCADE
├── viewed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── ip_address   VARCHAR(45) NULL
```

> 💡 À chaque insertion dans `views`, un **Observer** incrémente `references.view_count`.
> Pour éviter les doublons (même user, même doc, même session), ajouter une logique de
> déduplication : ne pas compter 2 vues du même user sur la même référence en moins de 30 min.

---

## 5. Diagramme Complet des Relations

```
users (id, first_name, last_name, role, status...)
  │
  ├──[1:N]──→ deposit_requests (applicant_id)
  │                │
  │                ├── assigned_manager_id ──→ users
  │                ├── reference_id ──→ references (après publication)
  │                └──[1:N]──→ deposit_request_reviews
  │                                 └── reviewer_id ──→ users
  │
  ├──[1:N]──→ notifications (user_id)
  ├──[1:N]──→ activity_logs (user_id)
  ├──[1:N]──→ downloads (user_id)
  ├──[1:N]──→ views (user_id)
  └──[1:N]──→ references (uploaded_by)


references (id, title, document_type, status...)
  ├──[N:1]──→ categories (category_id)
  ├──[N:1]──→ publishers (publisher_id)
  ├──[N:1]──→ users (uploaded_by)
  ├──[N:N]──→ authors (via reference_author)
  ├──[1:N]──→ reference_keywords (mots-clés texte brut)
  ├──[1:N]──→ downloads
  └──[1:N]──→ views


categories ──[1:N]──→ references
publishers  ──[1:N]──→ references
authors     ──[N:N]──→ references (via reference_author)
```

---

## 6. API REST — Endpoints par rôle

### Auth (public)
```
POST   /api/auth/register           -- Créer un compte (role='user' par défaut)
POST   /api/auth/login              -- Connexion → token + màj last_login_at
POST   /api/auth/logout             -- Révoque le token [auth:sanctum]
GET    /api/auth/me                 -- Profil connecté [auth:sanctum]
POST   /api/auth/forgot-password    -- Demande reset password
POST   /api/auth/reset-password     -- Réinitialiser le password
```

### Catalogue (public + auth)
```
GET    /api/references              -- Liste paginée (filtre: category, type, language, year, status=published)
GET    /api/references/{id}         -- Fiche détail → incrémente views si nouveau
GET    /api/references/{id}/read    -- Lecture en ligne [auth:sanctum]
GET    /api/references/{id}/download -- Téléchargement → insère dans downloads [auth:sanctum]
GET    /api/categories              -- Liste catégories actives
GET    /api/authors                 -- Liste auteurs
GET    /api/publishers              -- Liste éditeurs
GET    /api/search?q=&type=&category_id=&language=&year= -- Recherche avancée
```

### Utilisateur inscrit [auth:sanctum + role:user]
```
GET    /api/user/deposits           -- Mes demandes de dépôt
POST   /api/user/deposits           -- Soumettre une demande (upload fichier)
GET    /api/user/deposits/{id}      -- Détail + reviews (historique) de ma demande
GET    /api/user/notifications      -- Mes notifications
PATCH  /api/user/notifications/{id}/read       -- Marquer une notif comme lue
PATCH  /api/user/notifications/read-all        -- Tout marquer comme lu
GET    /api/user/profile            -- Mon profil
PUT    /api/user/profile            -- Modifier mon profil
```

### Responsable Validation [auth:sanctum + role:responsable_demande]
```
GET    /api/manager/deposits        -- Demandes qui me sont assignées (assigned_manager_id = moi)
GET    /api/manager/deposits/{id}   -- Détail complet + fichier à examiner
POST   /api/manager/deposits/{id}/approve  -- Valider (insère dans deposit_request_reviews)
POST   /api/manager/deposits/{id}/reject   -- Refuser (justification obligatoire)
```

### Responsable RH [auth:sanctum + role:responsable_rh]
```
GET    /api/hr/users                -- Liste utilisateurs (filtres: role, status)
POST   /api/hr/users                -- Créer un compte utilisateur
GET    /api/hr/users/{id}           -- Détail utilisateur
PUT    /api/hr/users/{id}           -- Modifier (sauf role si pas admin)
PATCH  /api/hr/users/{id}/status    -- Changer status (active/inactive/suspended)
DELETE /api/hr/users/{id}           -- Supprimer (soft delete recommandé)
```

### Admin [auth:sanctum + role:admin]
```
-- Gestion des demandes de dépôt
GET    /api/admin/deposits                              -- Toutes les demandes + filtres
GET    /api/admin/deposits/{id}                         -- Détail + reviews complètes
POST   /api/admin/deposits/{id}/assign                  -- Affecter un responsable_demande
POST   /api/admin/deposits/{id}/second-review           -- Réaffecter pour 2ème avis
POST   /api/admin/deposits/{id}/approve                 -- Approuver
POST   /api/admin/deposits/{id}/override-rejection      -- Passer outre le refus (justification obligatoire)
POST   /api/admin/deposits/{id}/reject                  -- Rejeter définitivement (justification obligatoire)
POST   /api/admin/deposits/{id}/publish                 -- Publier → crée la référence

-- Gestion des références publiées
GET    /api/admin/references
POST   /api/admin/references                            -- Créer directement (sans workflow)
GET    /api/admin/references/{id}
PUT    /api/admin/references/{id}                       -- Modifier
PATCH  /api/admin/references/{id}/status                -- published / archived
DELETE /api/admin/references/{id}

-- Référentiels
CRUD   /api/admin/categories        -- Inclut activation/désactivation (status)
CRUD   /api/admin/publishers
CRUD   /api/admin/authors

-- Gestion des utilisateurs
GET    /api/admin/users
PUT    /api/admin/users/{id}
PATCH  /api/admin/users/{id}/role   -- Changer le rôle d'un user

-- Statistiques & monitoring
GET    /api/admin/stats             -- KPIs: total références, dépôts en attente, users actifs...
GET    /api/admin/activity-logs     -- Journal avec filtres (user, action, date)
GET    /api/admin/downloads         -- Stats téléchargements
GET    /api/admin/views             -- Stats consultations
```

---

## 7. Workflow de Validation — Diagramme d'états

```
  [User soumet la demande]
           │
           ▼
        PENDING
           │
    Admin affecte → assigned_manager_id renseigné
           │
           ▼
  (Responsable reçoit notification)
           │
     Responsable examine
           │
     ┌─────┴──────┐
     │            │
  Approuve      Refuse
     │         (justification
     │          OBLIGATOIRE)
     ▼            ▼
 approved_     rejected_
 by_manager   by_manager
     │            │
     └─────┬──────┘
           │
     Admin reçoit notification + examine
           │
    ┌──────┼────────────────────────┐
    │      │                        │
Approuve  Override refus       Rejette        Demande
(approve) (justification      définitive-    2ème avis
    │      OBLIGATOIRE)        ment           (second_review)
    │           │            (justification       │
    │           │             OBLIGATOIRE)         │
    ▼           ▼                  ▼               │
 approved    approved           rejected    Admin réaffecte
    │           │                              à nouveau
    └─────┬─────┘               responsable_demande
          │                            │
    Admin publie               ┌───────┴───────┐
          │                    │               │
          ▼                Approuve         Refuse
       published                │               │
          │              approved_by_    rejected_by_
          │                manager        manager
          ▼                    │               │
   Création automatique        └──────┬────────┘
   dans `references`                  │
   reference_id renseigné       Admin tranche
   dans deposit_requests         (approve ou reject)
```

---

## 8. Logiques métier importantes

### 8.1 Publication d'une demande → Création de la référence

Quand l'admin publie une demande (`POST /admin/deposits/{id}/publish`), le Service doit :

```
1. Récupérer les données de deposit_requests (title, description, proposed_file...)
2. Créer un enregistrement dans `references` avec status='published'
3. Déplacer / copier le fichier vers le répertoire définitif
4. Mettre à jour deposit_requests.status = 'published'
5. Mettre à jour deposit_requests.reference_id = (id de la référence créée)
6. Insérer dans deposit_request_reviews (decision='approved', reviewer_role='admin')
7. Envoyer une notification au déposant (applicant_id)
8. Logger dans activity_logs
```

### 8.2 Compteurs `download_count` et `view_count`

Deux stratégies possibles :

**Option A — Observer Eloquent (simple) :**
```php
// Dans DownloadObserver
public function created(Download $download): void {
    $download->reference->increment('download_count');
}
```

**Option B — Job asynchrone (recommandé en production) :**
```php
// Dispatch un job via Redis Queue pour ne pas ralentir la réponse API
IncrementReferenceCounter::dispatch($referenceId, 'download_count');
```

### 8.3 Déduplication des vues

```php
// Avant d'insérer dans `views`, vérifier :
$alreadyViewed = View::where('reference_id', $id)
    ->where('user_id', auth()->id())  // ou IP si visiteur
    ->where('viewed_at', '>=', now()->subMinutes(30))
    ->exists();

if (!$alreadyViewed) {
    View::create([...]);
    // + incrémenter view_count
}
```

---

## 9. Structure des Modules Vue.js

```
src/
├── api/                              -- Appels Axios centralisés
│   ├── auth.js
│   ├── references.js
│   ├── categories.js
│   ├── authors.js
│   ├── publishers.js
│   ├── depositRequests.js
│   └── admin.js
│
├── stores/                           -- Pinia stores
│   ├── auth.js                       -- User connecté, token, rôle
│   ├── catalog.js                    -- Références, filtres, pagination
│   ├── depositRequests.js            -- Mes demandes + statuts
│   └── notifications.js             -- Cloche + compteur non lus
│
├── router/
│   ├── index.js
│   └── guards.js                     -- Guards par rôle (lecture de store.auth.user.role)
│
├── views/
│   ├── public/
│   │   ├── HomeView.vue
│   │   ├── CatalogView.vue
│   │   ├── ReferenceDetailView.vue   -- Fiche + lecture + téléchargement
│   │   └── SearchView.vue
│   │
│   ├── auth/
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ForgotPasswordView.vue
│   │   └── ResetPasswordView.vue
│   │
│   ├── user/
│   │   ├── DashboardView.vue
│   │   ├── MyDepositsView.vue        -- Liste avec badges de statut
│   │   ├── DepositDetailView.vue     -- Détail + timeline des reviews
│   │   ├── SubmitDepositView.vue     -- Formulaire multi-étapes
│   │   └── ProfileView.vue
│   │
│   ├── manager/                      -- role: responsable_demande
│   │   ├── AssignedDepositsView.vue
│   │   └── ReviewDepositView.vue     -- Valider / Refuser + justification
│   │
│   ├── hr/                           -- role: responsable_rh
│   │   ├── UsersListView.vue
│   │   ├── UserFormView.vue
│   │   └── UserDetailView.vue
│   │
│   └── admin/
│       ├── DashboardView.vue         -- KPIs + graphiques
│       ├── DepositsView.vue          -- Workflow complet
│       ├── ReferencesView.vue        -- CRUD références
│       ├── CategoriesView.vue
│       ├── AuthorsView.vue
│       ├── PublishersView.vue        -- ← Nouveau (table publishers)
│       ├── UsersView.vue
│       └── ActivityLogsView.vue
│
├── components/
│   ├── ui/                           -- Button, Badge, Modal, Toast, Spinner...
│   ├── catalog/                      -- ReferenceCard, FilterSidebar, PDFViewer
│   ├── deposit/                      -- DepositForm, StatusBadge, ReviewTimeline
│   └── admin/                        -- StatsCard, DataTable, WorkflowPanel
│
└── layouts/
    ├── PublicLayout.vue
    ├── AuthLayout.vue
    ├── UserLayout.vue
    ├── ManagerLayout.vue
    └── AdminLayout.vue
```

---

## 10. Sécurité & Bonnes pratiques

### Backend (Laravel)
- Authentification via **Sanctum tokens** (Bearer Token dans header `Authorization`)
- Middleware custom `CheckRole` qui lit `$user->role` et protège les routes
- **Form Requests** pour valider chaque input + règle `justification` obligatoire selon la `decision`
- **Policies** Eloquent pour vérifier qu'un responsable n'accède qu'à ses demandes assignées
- **Rate Limiting** sur les routes sensibles (login → 5 tentatives/min, upload → 10/heure)
- Stockage des fichiers hors `public/` avec **URL temporaires signées**
- **CORS** configuré uniquement pour le domaine Vue.js
- Validation : fichiers PDF uniquement, taille max configurable (ex: 50 Mo)
- Mise à jour de `last_login_at` à chaque connexion réussie

### Frontend (Vue.js)
- Token stocké dans **httpOnly cookie** (recommandé) ou `localStorage`
- Guards de navigation dans Vue Router selon `store.auth.user.role`
- Axios interceptors : ajout automatique du Bearer Token + gestion 401/403
- Pas d'affichage de fichiers sensibles sans vérification préalable côté API

---

## 11. Roadmap de Développement

### 🟥 Sprint 1 — Fondations
1. Setup Laravel 11 + Sanctum
2. Migrations (ordre des dépendances respecté)
3. Seeders : catégories exemples, publishers exemples, compte admin par défaut
4. Middleware `CheckRole` custom
5. API Auth (register, login, logout, me, reset-password + màj `last_login_at`)
6. Setup Vue.js 3 + Pinia + Vue Router + Axios + Tailwind

### 🟧 Sprint 2 — Catalogue public
7. CRUD references (admin) + API liste/détail publique
8. CRUD categories, authors, publishers (admin)
9. Filtres, tri, pagination
10. Recherche (Scout + Meilisearch)
11. Lecteur PDF en ligne (PDF.js)
12. Téléchargement sécurisé → insertion dans `downloads`

### 🟨 Sprint 3 — Workflow dépôt
13. Soumission de demande (user) + upload fichier
14. Module responsable : consultation, validation, refus (avec justification)
15. Module admin : workflow complet (assign, approve, override, second-review, publish)
16. Publication → création automatique dans `references`
17. Notifications (DB) + envoi email via Redis Queue

### 🟩 Sprint 4 — Admin & Polish
18. Module RH (gestion utilisateurs + statuts)
19. Dashboard stats + graphiques (ApexCharts)
20. `activity_logs` + `views` + `views` analytics
21. Tests backend (Pest) + Tests e2e (Cypress)
22. Optimisations : index BDD, cache Redis, déduplication vues

---

## 12. Variables d'environnement (`.env`)

```env
APP_NAME="Bibliothèque Numérique"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bibliotheque_db
DB_USERNAME=root
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

FILESYSTEM_DISK=local          # Changer en 's3' en production
# AWS_BUCKET=bibliotheque-docs

SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://localhost:7700

MAIL_MAILER=smtp
MAIL_FROM_ADDRESS="no-reply@bibliotheque.bj"
MAIL_FROM_NAME="Bibliothèque Numérique"

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost

# Frontend Vue.js (.env)
VITE_API_URL=http://localhost:8000/api
```
DOCEOF
echo "✅ Doc v3 créée"
Sortie

✅ Doc v3 créée
