# Module Planning — Prise de rendez-vous (type Calendly)

Deux profils uniquement :
- **Admin / Enseignant** (un seul compte, ou plusieurs si tu veux évoluer plus tard)
- **Étudiant / User** (celui qui réserve)

---

## 1. Modèle de données

### 1.1 `users`
Table commune, un champ `role` distingue les deux profils.

| Colonne | Type | Description |
|---|---|---|
| id | UUID / INT PK | |
| role | ENUM('admin','student') | |
| first_name | VARCHAR | |
| last_name | VARCHAR | |
| email | VARCHAR UNIQUE | |
| phone | VARCHAR | nullable pour admin |
| password_hash | VARCHAR | nullable si l'étudiant réserve sans compte |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

> Si tu veux permettre la réservation **sans compte étudiant** (mode "invité", comme Calendly), les infos du réservant (nom, prénom, email, tel) sont stockées directement dans `appointments` et `student_id` reste nullable.

### 1.2 `availability_rules`
Règles récurrentes définies par l'enseignant (jour de la semaine + heures).

| Colonne | Type | Description |
|---|---|---|
| id | PK | |
| teacher_id | FK → users.id | |
| day_of_week | INT (0=lundi...6=dimanche) | |
| start_time | TIME | ex: 09:00 |
| end_time | TIME | ex: 18:00 |
| slot_duration_minutes | INT | défaut 30 |
| buffer_minutes | INT | pause entre 2 créneaux (défaut 0) |
| is_active | BOOLEAN | permet de désactiver une règle sans la supprimer |

### 1.3 `availability_exceptions`
Pour gérer les jours fériés, absences ponctuelles, ou disponibilités exceptionnelles hors règle récurrente.

| Colonne | Type | Description |
|---|---|---|
| id | PK | |
| teacher_id | FK | |
| date | DATE | |
| type | ENUM('blocked','extra') | blocked = indispo, extra = dispo ponctuelle ajoutée |
| start_time | TIME | nullable (si toute la journée) |
| end_time | TIME | nullable |
| reason | VARCHAR | ex: "Congé", "Conférence" |

### 1.4 `appointments` (le cœur du module)

| Colonne | Type | Description |
|---|---|---|
| id | PK | |
| teacher_id | FK → users.id | |
| student_id | FK → users.id | nullable si réservation invité |
| first_name | VARCHAR | |
| last_name | VARCHAR | |
| email | VARCHAR | |
| phone | VARCHAR | |
| subject | TEXT | optionnel — sujet de l'entretien |
| date | DATE | |
| start_time | TIME | |
| end_time | TIME | |
| status | ENUM('pending','confirmed','cancelled','completed','no_show') | |
| google_event_id | VARCHAR | nullable, rempli après sync Google Calendar |
| cancel_reason | VARCHAR | nullable |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Contrainte unique très importante** : `UNIQUE(teacher_id, date, start_time)` sur les statuts actifs (`pending`, `confirmed`) → empêche le double-booking au niveau base de données, même en cas de requêtes simultanées.

### 1.5 `notifications_log`
Traçabilité des emails envoyés (utile pour debug + réenvoi).

| Colonne | Type | Description |
|---|---|---|
| id | PK | |
| appointment_id | FK | |
| type | ENUM('confirmation_student','notification_teacher','reminder','cancellation','validation') | |
| status | ENUM('sent','failed') | |
| sent_at | TIMESTAMP | |

### 1.6 `google_calendar_tokens`
Un seul enregistrement puisqu'un seul enseignant/admin.

| Colonne | Type | Description |
|---|---|---|
| id | PK | |
| teacher_id | FK | |
| access_token | TEXT (chiffré) | |
| refresh_token | TEXT (chiffré) | |
| expiry | TIMESTAMP | |
| calendar_id | VARCHAR | défaut "primary" |
| connected_at | TIMESTAMP | |

### 1.7 `settings`
Paramètres globaux du planning.

| Colonne | Type | Description |
|---|---|---|
| id | PK | |
| teacher_id | FK | |
| min_notice_hours | INT | ex: pas de réservation à moins de 2h du créneau |
| max_advance_days | INT | ex: pas de réservation à plus de 30 jours |
| auto_confirm | BOOLEAN | si true → skip l'étape "pending", passe direct en "confirmed" |
| timezone | VARCHAR | défaut "Africa/Porto-Novo" ou selon ton besoin |

---

## 2. Logique métier

### 2.1 Génération des créneaux — **ne pas stocker tous les créneaux en base**

Recommandation : **ne pas matérialiser** une table `slots` avec chaque créneau (09h00, 09h30, ...). C'est redondant et ça se désynchronise vite. À la place :

1. Le back calcule les créneaux **à la volée** à partir de `availability_rules` (+ exceptions) pour une date donnée.
2. Il retire les créneaux déjà présents dans `appointments` (status `pending`/`confirmed`).
3. Il retire les créneaux occupés dans **Google Calendar** (via `freebusy.query`).
4. Il applique `min_notice_hours` (pas de créneau trop proche dans le temps) et `max_advance_days`.
5. Résultat renvoyé au front : liste de créneaux avec un flag `available: true/false`.

```
Pseudo-code — GET /api/slots?date=2026-07-10

rules = availability_rules.where(teacher_id, day_of_week = date.weekday, is_active=true)
if exceptions.blocked(date) → return []
slots = []
for each rule:
    t = rule.start_time
    while t + rule.slot_duration <= rule.end_time:
        slots.push({start: t, end: t + duration})
        t += duration + rule.buffer_minutes

booked = appointments.where(teacher_id, date, status IN ('pending','confirmed'))
busy_google = googleCalendar.freebusy(date)

for slot in slots:
    slot.available = not overlaps(slot, booked) and not overlaps(slot, busy_google)
                      and slot.start > now + min_notice_hours

return slots
```

Côté front (vue étudiant), les créneaux `available:false` sont affichés **grisés / désactivés**, non cliquables — conforme à ta demande.

### 2.2 Workflow de réservation

```
1. Choix de la date        → GET /api/slots?date=...
2. Choix du créneau        → sélection front, pas d'appel serveur nécessaire
3. Informations             → formulaire (nom, prénom, email, tel, sujet optionnel)
4. Confirmation              → POST /api/appointments (crée en status "pending")
                                → email de confirmation à l'étudiant
                                → email/notif à l'enseignant "nouvelle demande"
5. Rendez-vous en attente   → status = pending, visible dans l'admin
6. Rendez-vous validé        → admin clique "Valider" → status = confirmed
                                → création event Google Calendar (google_event_id stocké)
                                → email de confirmation finale à l'étudiant
```

> Si tu préfères un flow plus simple (pas de validation manuelle), active `settings.auto_confirm = true` : l'étape 5 est sautée, la réservation passe direct en `confirmed` à l'étape 4, et l'event Google Calendar est créé immédiatement.

### 2.3 Prévention du double-booking (concurrence)

Même si le front vérifie la disponibilité, deux étudiants peuvent cliquer "Réserver" en même temps. Protection à 2 niveaux :
- **Contrainte unique** en base sur `(teacher_id, date, start_time)` filtrée sur statuts actifs.
- Le POST `/api/appointments` doit catcher l'erreur de contrainte unique et renvoyer `409 Conflict` → le front affiche "Ce créneau vient d'être réservé, merci d'en choisir un autre" et rafraîchit la liste.

### 2.4 Synchronisation Google Calendar

**Sens 1 — écriture (appointment → Google) :**
- À la confirmation d'un RDV : `POST /calendar/v3/calendars/{calendarId}/events` avec titre, description (sujet + coordonnées étudiant), date/heure, et invité = email de l'étudiant.
- Stocker `google_event_id` dans `appointments`.
- À l'annulation : `DELETE` de l'event via `google_event_id`.

**Sens 2 — lecture (Google → disponibilités) :**
- Utiliser l'API `freebusy.query` sur le calendrier de l'admin pour récupérer les plages occupées (RDV perso, réunions, etc.) et les exclure des créneaux proposés à l'étudiant (voir 2.1).

**Auth :** OAuth2 Google, un seul compte à connecter (celui de l'admin) depuis l'interface admin → bouton "Connecter Google Calendar" → tokens stockés dans `google_calendar_tokens`.

### 2.5 Notifications email

| Événement | Destinataire | Déclencheur |
|---|---|---|
| Nouvelle demande de RDV | Enseignant | création `appointment` (pending) |
| Confirmation de réservation | Étudiant | création `appointment` |
| RDV validé | Étudiant | passage à `confirmed` |
| RDV annulé | Étudiant + Enseignant | passage à `cancelled` |
| Rappel (optionnel, J-1) | Étudiant | tâche planifiée (cron) |

Chaque envoi est loggé dans `notifications_log`.

---

## 3. Endpoints API (proposition REST)

### Public (étudiant)
```
GET    /api/availability?date=YYYY-MM-DD          → créneaux dispos/indispos pour une date
GET    /api/availability/month?month=2026-07      → jours ayant au moins 1 créneau libre (pour le calendrier)
POST   /api/appointments                           → créer une réservation
GET    /api/appointments/:id/status                → suivi de statut (optionnel, via lien envoyé par email)
POST   /api/appointments/:id/cancel                → annulation par l'étudiant (via token du lien email)
```

### Admin (enseignant)
```
POST   /api/auth/login
GET    /api/admin/availability-rules
POST   /api/admin/availability-rules
PUT    /api/admin/availability-rules/:id
DELETE /api/admin/availability-rules/:id
POST   /api/admin/availability-exceptions
GET    /api/admin/appointments?status=&date=&search=
GET    /api/admin/appointments/:id
PUT    /api/admin/appointments/:id                 → valider / modifier
POST   /api/admin/appointments/:id/cancel
GET    /api/admin/google-calendar/connect
GET    /api/admin/google-calendar/callback
GET    /api/admin/settings
PUT    /api/admin/settings
```

---

## 4. Machine à états du statut `appointment`

```
pending ──(admin valide)──► confirmed ──(date passée)──► completed
   │                             │
   └──(annulation)──► cancelled ◄┘
```

- `pending` : en attente de validation admin (ou état transitoire si `auto_confirm`)
- `confirmed` : validé, event Google Calendar créé
- `cancelled` : annulé par étudiant ou admin
- `completed` : passé automatiquement après la date (job cron ou calcul à la volée)
- `no_show` : optionnel, marqué manuellement par l'admin après coup
