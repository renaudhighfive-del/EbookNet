# 1. Présentation du projet

## 1.1 Contexte

Votre client, une bibliothèque, souhaite mettre en place une **application web de bibliothèque numérique responsive** permettant aux usagers de consulter ses références en ligne depuis un ordinateur, une tablette ou un smartphone.

Cette plateforme s'inspirera des bonnes pratiques observées sur la bibliothèque numérique nationale du Bénin tout en étant adaptée aux besoins spécifiques de l'établissement et de ses utilisateurs.

## 1.2 Description du projet

Le projet consiste à développer une application web moderne, sécurisée et ergonomique offrant un accès centralisé à un catalogue de références documentaires numériques.

L'application devra permettre aux utilisateurs de :

* consulter les références disponibles ;
* lire en ligne les documents autorisés ;
* télécharger les ressources mises à disposition ;
* effectuer des recherches simples et avancées dans le catalogue ;
* soumettre une demande de dépôt d'une nouvelle référence documentaire.

### Processus de validation des demandes de dépôt

Les demandes de dépôt de références suivent un circuit de validation garantissant la qualité et la pertinence des contenus publiés sur la plateforme.

1. **Soumission de la demande** : un utilisateur soumet une demande de dépôt d'une nouvelle référence documentaire.

2. **Première vérification** : la demande est affectée à un responsable chargé d'en contrôler la conformité, la qualité et la pertinence.

3. **Décision du responsable** :

   * **Si la demande est jugée conforme**, le responsable la valide et la transmet à l'administrateur pour publication.
   * **Si la demande est jugée non conforme**, le responsable la refuse en fournissant obligatoirement une justification détaillée. La décision et son justificatif sont ensuite transmis à l'administrateur.

4. **Examen par l'administrateur** :

   * **Validation du refus** : si l'administrateur estime que le refus est fondé, il rejette définitivement la demande. Celle-ci est alors classée comme refusée avec le motif correspondant.
   * **Invalidation du refus** : si l'administrateur considère que le refus n'est pas justifié, il peut passer outre cette décision, approuver la demande et procéder à sa publication. Dans ce cas, il renseigne également une justification expliquant les raisons de son choix, laquelle est communiquée au responsable ayant émis le refus.
   * **Demande d'un second avis** : si l'administrateur souhaite obtenir une évaluation complémentaire, il peut affecter la demande à un autre responsable pour une nouvelle vérification indépendante.

5. **Traitement du second avis** :

   * Si le second responsable confirme le refus, l'administrateur peut décider de rejeter définitivement la demande.
   * Si le second responsable émet un avis favorable, l'administrateur peut valider la demande et autoriser sa publication sur la plateforme.

Ce mécanisme assure une prise de décision transparente, documentée et équitable, tout en permettant un contrôle qualité renforcé avant la diffusion des références documentaires.


## 1.4 Portée du projet

L'application couvrira notamment les fonctionnalités suivantes :

* gestion d'un catalogue numérique de références ;
* consultation et lecture en ligne des documents autorisés ;
* téléchargement des ressources disponibles ;
* recherche multicritère des références ;
* gestion des comptes utilisateurs et des droits d'accès ;
* dépôt collaboratif de nouvelles références avec circuit de validation ;
* administration complète des contenus et des utilisateurs ;
* interface responsive garantissant une expérience optimale sur tous les types d'appareils.
---

# 2. Profils d'utilisateurs

L'application distingue plusieurs catégories d'utilisateurs, chacune disposant de droits et de responsabilités spécifiques.

## 3.1 Visiteur

Le visiteur est un utilisateur non authentifié qui accède librement à certaines fonctionnalités publiques de la plateforme.

### Principales permissions

* Consulter la page d'accueil et les informations générales.
* Parcourir le catalogue public des références.
* Effectuer des recherches simples ou avancées.
* Consulter les fiches descriptives des références accessibles au public.
* Visualiser les statistiques ou contenus mis en avant par la bibliothèque, si disponibles.

### Restrictions

* Ne peut pas déposer de nouvelles références.
* Ne peut pas télécharger ou lire les documents réservés aux utilisateurs inscrits, selon les règles définies par la bibliothèque.
* Ne dispose pas d'un espace personnel.

---

## 3.2 Utilisateur inscrit

L'utilisateur inscrit possède un compte créé sur la plateforme et bénéficie de fonctionnalités supplémentaires.

### Principales permissions

* Se connecter à son espace personnel.
* Consulter les références disponibles.
* Lire les documents en ligne lorsque cela est autorisé.
* Télécharger les ressources accessibles.
* Soumettre une demande de dépôt d'une nouvelle référence.
* Suivre l'état d'avancement de ses demandes (en attente, validée, refusée ou publiée).
* Consulter les éventuelles justifications associées aux décisions concernant ses demandes.
* Mettre à jour certaines informations de son profil.

### Responsabilités

* Fournir des informations exactes lors des propositions de dépôt.
* Respecter les droits d'auteur et les règles de la plateforme.

---

## 3.3 Responsables

L'application distingue deux catégories de responsables, chacune disposant de missions et de droits spécifiques.

### 3.3.1 Responsable RH

Le Responsable RH est chargé de la gestion opérationnelle des utilisateurs de la plateforme et de certaines tâches administratives liées aux comptes.

#### Principales permissions

* Consulter la liste des utilisateurs inscrits.
* Créer, modifier, activer, désactiver ou supprimer des comptes utilisateurs, selon les règles définies par l'administration.
* Gérer les profils et les informations des utilisateurs.
* Attribuer ou retirer certains rôles ou autorisations qui relèvent de ses compétences.
* Réinitialiser des accès ou assister les utilisateurs en cas de difficultés liées à leur compte.
* Consulter l'historique des actions relatives à la gestion des utilisateurs.

#### Responsabilités

* Veiller à la bonne gestion des comptes et des profils utilisateurs.
* Garantir l'exactitude et la mise à jour des informations administratives.
* Assurer un suivi rigoureux des opérations de gestion des utilisateurs dans le respect des politiques de la bibliothèque.

---

### 3.3.2 Responsable chargé de la gestion des demandes

Le Responsable chargé de la gestion des demandes est chargé d'examiner les propositions de dépôt de nouvelles références avant leur transmission à l'administrateur.

#### Principales permissions

* Accéder aux demandes qui lui sont attribuées.
* Consulter les informations et documents associés à chaque demande.
* Vérifier la conformité, la qualité et la pertinence des références proposées.
* Valider une demande et la transmettre à l'administrateur pour publication.
* Refuser une demande en renseignant obligatoirement une justification détaillée.
* Participer à une seconde évaluation lorsqu'une demande lui est réaffectée par l'administrateur pour obtenir un avis complémentaire.

#### Responsabilités

* Réaliser une analyse impartiale et documentée de chaque demande.
* Justifier toute décision de refus afin d'assurer la transparence du processus de validation.
* Contribuer au maintien de la qualité et de la fiabilité des références publiées sur la plateforme.


---

## 3.4 Administrateur

L'administrateur dispose des droits les plus étendus et assure la supervision générale de la plateforme.

### Principales permissions

* Gérer les comptes utilisateurs et leurs rôles.
* Gérer les responsables de validation et les affectations des demandes.
* Consulter l'ensemble des demandes de dépôt et leur historique.
* Publier les références validées.
* Confirmer ou invalider un refus émis par un responsable.
* Justifier toute décision lorsqu'il passe outre un refus.
* Demander un second avis en réaffectant une demande à un autre responsable.
* Rejeter définitivement ou approuver une demande après examen des différents avis.
* Modifier ou supprimer les références publiées si nécessaire.
* Administrer les catégories, auteurs, mots-clés et autres données de référence.
* Consulter les tableaux de bord, statistiques et journaux d'activité de la plateforme.

### Responsabilités

* Garantir la qualité, la cohérence et la fiabilité des contenus diffusés.
* Veiller au bon fonctionnement du processus de validation.
* Assurer la sécurité, l'intégrité et la maintenance fonctionnelle de l'application.

