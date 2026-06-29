/**
 * EXEMPLE DE PAYLOAD DE CRÉATION DE RÉFÉRENCE
 * Structure complète avec tous les champs requis et optionnels
 */

// ─── Création d'une référence avec TOUS les champs ──────────────────

{
  // ✅ CHAMPS OBLIGATOIRES
  "title": "Django for Beginners",                    // required, max 500
  "language": "en",                                   // required, enum: fr|en|autre
  "document_type": "livre",                           // required, enum: livre|memoire|these|article|revue|rapport|guide|autre
  "status": "published",                              // required, enum: draft|published|archived

  // ⚪ CHAMPS OPTIONNELS - MÉTADONNÉES
  "subtitle": "A Complete Guide to Web Development",  // nullable, max 500
  "abstract": "Learn Django fundamentals...",         // nullable, max 5000
  "isbn": "978-0-123456-78-9",                        // nullable, max 50 (UNIQUE)
  "publication_year": 2023,                           // nullable, integer 1000-9999
  "pages": 456,                                       // nullable, integer 1-99999

  // ⚪ CHAMPS OPTIONNELS - RELATIONS & FICHIERS
  "category_id": 5,                                   // nullable, must exist in categories
  "publisher_id": 3,                                  // nullable, must exist in publishers
  "cover_image": "uploads/covers/django-book.jpg",   // nullable, max 500
  "file_path": "storage/books/django-beginners.pdf", // nullable, max 500

  // ⚪ CHAMPS OPTIONNELS - DONNÉES LIÉES
  "authors": [1, 3, 7],                              // nullable array, IDs must exist in authors
  "keywords": ["django", "python", "web", "tutorial"] // nullable array, max 100 chars each
}

// ─── EXEMPLE DE RÉPONSE D'API (201 Created) ──────────────────────────

{
  "message": "Référence créée avec succès.",
  "reference": {
    "id": 42,
    "title": "Django for Beginners",
    "subtitle": "A Complete Guide to Web Development",
    "abstract": "Learn Django fundamentals...",
    "isbn": "978-0-123456-78-9",
    "publication_year": 2023,
    "language": "en",
    "document_type": "livre",
    "pages": 456,
    "category_id": 5,
    "publisher_id": 3,
    "uploaded_by": null,
    "cover_image": "uploads/covers/django-book.jpg",
    "file_path": "storage/books/django-beginners.pdf",
    "download_count": 0,
    "view_count": 0,
    "status": "published",
    "created_at": "2024-06-29T10:15:30.000000Z",
    "updated_at": "2024-06-29T10:15:30.000000Z",
    "category": {
      "id": 5,
      "name": "Informatique",
      "slug": "informatique",
      "status": "active"
    },
    "publisher": {
      "id": 3,
      "name": "Packt Publishing",
      "country": "UK"
    },
    "uploadedBy": null,
    "authors": [
      { "id": 1, "first_name": "William", "last_name": "Vincent" },
      { "id": 3, "first_name": "John", "last_name": "Doe" },
      { "id": 7, "first_name": "Jane", "last_name": "Smith" }
    ],
    "keywords": [
      { "id": 101, "keyword": "django" },
      { "id": 102, "keyword": "python" },
      { "id": 103, "keyword": "web" },
      { "id": 104, "keyword": "tutorial" }
    ]
  }
}

// ─── EXEMPLE D'ERREUR DE VALIDATION ──────────────────────────────────

{
  "message": "The title field is required. (and 2 more errors)",
  "errors": {
    "title": ["Le titre est requis."],
    "isbn": ["Cet ISBN existe déjà."],
    "authors.0": ["L'un des auteurs n'existe pas."]
  }
}

// ─── CAS DE MISE À JOUR (PUT /admin/references/{id}) ──────────────────

{
  "title": "Django for Beginners (2nd Edition)",  // sometimes required
  "pages": 512,                                    // sometimes required
  // Les autres champs optionnels peuvent être partiellement envoyés
  "authors": [1, 2, 4]                           // sync (remplace complètement)
}

// ─── CHECKLIST DE VALIDATION FRONTEND ────────────────────────────────

✓ Titre obligatoire (vérification client)
✓ Type de document obligatoire
✓ Langue obligatoire
✓ Statut obligatoire
✓ Catégorie optionnelle (si select)
✓ Éditeur optionnel (si select)
✓ Auteurs optionnels (multi-select)
✓ Mots-clés optionnels (avec gestion dynamique)
✓ Cover image optionnelle (chemin)
✓ File path optionnelle (chemin)
✓ ISBN unique validé au backend
✓ Année de publication entre 1000-9999
✓ Pages entre 1-99999
✓ Gestion des erreurs 422 Unprocessable Entity

// ─── ROUTES API DISPONIBLES ──────────────────────────────────────────

POST   /admin/references                  → store()       [StoreReferenceRequest]
GET    /admin/references                  → index()       [paginated]
GET    /admin/references/{id}             → show()        [details]
PUT    /admin/references/{id}             → update()      [UpdateReferenceRequest]
DELETE /admin/references/{id}             → destroy()
PATCH  /admin/references/{id}/status      → toggleStatus()
GET    /admin/references/archived         → archivedReferences()
PATCH  /admin/references/{id}/restore     → restore()
