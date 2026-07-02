# Développement d'un module de prise de rendez-vous pour le site du Dr Gérard EDJIYATO

## Contexte

Nous avons développé le site officiel du **Dr Gérard EDJIYATO**, Maître de conférences à l'Université Paris 8. Le site est réalisé avec **Nuxt 3** et est actuellement généré en mode **SSG (Static Site Generation)**. Il ne dispose donc pas de backend.

On souhaite désormais ajouter une nouvelle fonctionnalité permettant à ses étudiants de réserver en ligne des créneaux d'entretien de 30 minutes.

L'objectif est de proposer une solution similaire à Calendly, mais entièrement intégrée à son site.

Nous prévoyons donc de développer une **API Laravel** qui communiquera avec le frontend Nuxt.

***

# Architecture envisagée

```
Nuxt 3 (Frontend)
        │
        ▼
Laravel API
        │
        ▼
MySQL
        │
        ▼
Google Calendar API
```

Le frontend affichera les créneaux disponibles et enverra les demandes de réservation à l'API Laravel.

***

# Fonctionnalités attendues

## 1. Gestion des disponibilités

Le professeur doit pouvoir définir :

- les jours disponibles (lundi, mardi, etc.)
- les heures de début
- les heures de fin
- la durée d'un créneau (30 minutes par défaut)

L'application devra générer automatiquement les créneaux correspondants.

Exemple :

Disponibilité :

```
Lundi
09h00 → 12h00
```

Créneaux générés :

```
09h00
09h30
10h00
10h30
11h00
11h30

12h00
12h30
13h00
13h30
14h00
14h30
15h00
15h30
16h00
16h30
17h00
17h30
18h00
```

***

## 2. Consultation des créneaux

Le frontend devra pouvoir récupérer les créneaux disponibles via une API.

Exemple :

```
GET /api/slots?date=2026-07-15
```

Chaque créneau devra indiquer s'il est disponible ou non.

***

## 3. Réservation

Créer un endpoint permettant de réserver un créneau.

Informations demandées :

- Nom
- Prénom
- Email
- Téléphone
- Formation
- Niveau
- Sujet de l'entretien (optionnel)

Lors de la réservation :

- vérifier que le créneau est toujours libre
- enregistrer la réservation
- rendre le créneau indisponible

***

### Workflow de réservation d'un entretien

Choix de la date → Choix du créneau → Informations → Confirmation → Rendez-vous en attente →  Rendez-vous validé

## 4. Interface d'administration

Créer une interface permettant de :

- gérer les disponibilités
- consulter les réservations
- rechercher une réservation
- modifier ou annuler une réservation

***

## 5. Notifications email

Après réservation :

- envoyer un email de confirmation à l'étudiant
- envoyer une notification au professeur

***

## 6. Synchronisation Google Calendar

Prévoir l'intégration avec Google Calendar.

À terme :

- chaque réservation devra créer automatiquement un événement dans l'agenda Google du professeur ;
- les événements déjà présents dans Google Calendar devront être pris en compte afin de ne pas proposer des créneaux déjà occupés.

Même si cette fonctionnalité n'est pas finalisée dans un premier temps, l'architecture devra être pensée pour faciliter son intégration.

***

# Technologies

Backend :

- Laravel 12
- MySQL
- API REST
- Laravel Mail
- Laravel Sanctum (si une authentification est nécessaire)

Frontend :

- Nuxt 3
- Composition API
- TypeScript si possible

***

L'objectif est de réaliser une première version fonctionnelle (MVP), qui pourra ensuite être enrichie avec des fonctionnalités supplémentaires selon les besoins du client.
