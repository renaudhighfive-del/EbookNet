You are generating UI screens for "BibliNum" — a SaaS Digital Library platform for academic and public libraries in francophone Africa (Bénin context).

================================================================
GLOBAL PROJECT CONTEXT & ARCHITECTURE
================================================================
BibliNum is a web application that centralizes, secures, and provides access to a catalog of digital documentary references. It has 5 distinct user roles, each with their own dedicated interface:
- Visitor (unauthenticated): browse public catalog, search, view document details
- Registered User (role: user): all visitor rights + read online + download + submit deposit requests + track their requests
- Validation Manager (role: responsable_demande): review deposit requests assigned to them, validate or reject with mandatory justification
- HR Manager (role: responsable_rh): manage user accounts (create, edit, activate/deactivate/suspend)
- Administrator (role: admin): full access — manage all deposit requests workflow, publish references, manage all users, manage catalog data, view activity logs

DEPOSIT REQUEST WORKFLOW (critical business logic)
1. User submits a deposit request → status: "pending"
2. Admin assigns it to a validation manager → status: "assigned"
3. Manager reviews and either:
   - Validates → status: "approved_by_manager" → transmitted to admin
   - Rejects (justification MANDATORY) → status: "rejected_by_manager" → transmitted to admin
4. Admin examines and either:
   - Approves → status: "approved" → then publishes → status: "published" (creates reference in catalog)
   - Overrides rejection (justification MANDATORY) → status: "approved"
   - Confirms rejection (justification MANDATORY) → status: "rejected" (final)
   - Requests second opinion → reassigns to another manager → status: "second_review"
5. Second manager reviews → admin takes final decision

Every action on a deposit request is logged in an audit trail timeline, visible to all involved parties.

DATABASE TABLES (reference for mock data)
- users (id, first_name, last_name, email, phone, role ENUM, status ENUM, last_login_at)
- categories (id, name, slug, description, status)
- publishers (id, name, description, country, website)
- authors (id, first_name, last_name, biography, nationality, birth_date, death_date)
- references (id, title, subtitle, abstract, isbn, publication_year, language, document_type, category_id, publisher_id, cover_image, file_path, pages, download_count, view_count, status)
- reference_author (pivot: reference_id, author_id)
- reference_keywords (id, reference_id, keyword)
- deposit_requests (id, applicant_id, assigned_manager_id, title, description, proposed_file, status, reference_id)
- deposit_request_reviews (id, deposit_request_id, reviewer_id, reviewer_role, decision, justification, created_at)
- notifications (id, user_id, title, message, type, is_read)
- activity_logs (id, user_id, action, target_table, target_id, ip_address, created_at)
- downloads (id, user_id, reference_id, downloaded_at)
- views (id, user_id, reference_id, viewed_at)

TECH STACK FOR GENERATION
Using Next.js App Router, shadcn/ui components, Tailwind CSS, and lucide-react icons.
Generate realistic French mock data for all screens.

================================================================
BRAND & VISUAL IDENTITY System
================================================================
Color Palette:
- Primary:    Deep Navy  #1B2A4A  (trust, knowledge, authority)
- Secondary:  Warm Amber #E8A020  (energy, discovery, highlights)
- Accent:     Teal       #0D9488  (CTA, validation, links)
- Success:    #16A34A  |  Warning: #D97706  |  Danger: #DC2626
- Background: #F8F7F4  (warm off-white, paper-like feel)
- Surface:    #FFFFFF  |  Surface2: #F1F0EC
- Text:       #1A1A2E  |  Muted: #6B7280  |  Placeholder: #9CA3AF

Typography:
- Headings / Display : Playfair Display (serif)
- Body / UI labels   : Inter
- Metadata / codes   : JetBrains Mono (for ISBNs, dates, IDs, stats)

Design Language:
- Inspired by JSTOR, Gallica, BnF Numérique — premium academic library aesthetic
- Clean, editorial, book-like feel with subtle warm paper texture on backgrounds
- Generous white space, 8pt grid, consistent spacing
- Cards: border-radius 12px, soft shadow (0 2px 12px rgba(0,0,0,0.08)), hover lift effect
- Status badges: always color-coded pill shape, consistent across ALL screens
- Responsive mobile-first: works on 320px → 1440px+
- Accessible: WCAG 2.1 AA — visible focus rings, sufficient contrast

Navigation Pattern:
- PUBLIC pages: top navbar only (Logo + nav links + "Connexion" button, no sidebar)
- AUTHENTICATED pages: persistent left sidebar (250px, collapsible on mobile) + top bar
  · Top bar: hamburger | page title | notification bell (red badge count) | avatar + name + role badge + dropdown
  · Each role has its OWN sidebar with ONLY the links for that role

Status Badge Color System (use consistently on every screen):
- "En attente"              → gray   #6B7280  pill
- "Assignée"                → blue   #3B82F6  pill
- "Validée (responsable)"   → teal   #0D9488  pill
- "Refusée (responsable)"   → orange #F97316  pill
- "Second avis"             → purple #8B5CF6  pill
- "Approuvée"               → green  #16A34A  pill
- "Rejetée"                 → red    #DC2626  pill
- "Publiée"                 → dark green #15803D pill + ✓ checkmark
- "Brouillon"               → yellow #D97706  pill
- "Archivée"                → gray   #9CA3AF  pill
- "Actif"                   → green  #16A34A  pill
- "Inactif"                 → gray   #6B7280  pill
- "Suspendu"                → red    #DC2626  pill

Global Components to include on all authenticated screens:
- Left sidebar with role-specific nav items + logo at top + logout at bottom
- Top bar with notification bell + user avatar + role badge
- Breadcrumb navigation on all inner pages
- Toast notifications for actions (success green, error red, info blue)
- Loading skeletons for async content
- Empty states with SVG illustration + message + CTA button

Language & Tone:
- French throughout all UI text
- Professional, academic, institutional tone
- Action verbs: "Consulter" | "Télécharger" | "Soumettre" | "Valider" | "Refuser" | "Publier" | "Affecter"
- Rejection always requires confirmation modal + mandatory justification textarea (min 50 chars)
- Destructive actions always require confirmation modal

================================================================
PROFIL 1: VISITEUR (non authentifié) — ALL 5 SCREENS
================================================================
NO sidebar on any of these screens. Top navbar only.

SCREEN V-1 — Page d'accueil publique (/)
Layout: Full-width, top navbar only (no sidebar)
- Top navbar: Logo "BibliNum" (left) + nav links: "Accueil | Catalogue | Recherche" (center) + "Connexion" button (right, navy outlined)
- Hero section: full-width banner with warm library background image overlay (dark navy gradient)
  · Headline large (Playfair Display): "Explorez notre catalogue documentaire"
  · Subtitle (Inter, muted): "Bibliothèque Numérique du Bénin — 1 248 références disponibles en ligne"
  · Centered search bar (large, rounded, white): placeholder "Rechercher un titre, auteur, mot-clé..."
  · Two CTA buttons below search: "Parcourir le catalogue" (primary teal filled) | "S'inscrire gratuitement" (white outlined)
- Stats bar below hero (Background #F1F0EC, 4 counters with icons):
  · 📚 1 248 Références | ✍️ 342 Auteurs | 🗂️ 18 Catégories | ⬇️ 5 621 Téléchargements
- Section "Catégories populaires" (title: Playfair, section header):
  · Horizontal scroll row of 6 category cards (each: icon + name + "X documents" + hover teal border)
  · Mock categories: Droit & Législation (124), Informatique (89), Sciences de la Santé (76), Littérature (65), Histoire & Géographie (58), Économie (47)
- Section "Dernières références ajoutées":
  · Section title + "Voir tout →" link
  · 4-column grid (2 tablet, 1 mobile) of document cards:
    Each card: cover image placeholder (3/4 aspect ratio, navy gradient with document icon), title (2 lines max bold), authors names (muted small), category badge (teal), type tag (small pill), year (mono), lock icon if restricted
  · Mock documents: "Introduction au Droit Constitutionnel" | "Algorithmique et Structures de Données" | "Histoire du Bénin Précolonial" | "Mémoire sur la Santé Publique en Afrique"
- Section "À la une" (featured document):
  · Large card: big cover (left 40%) + full description right (title, author, abstract excerpt, category, stats, "Voir la fiche" button)
- Footer: dark navy background, BibliNum logo, address, links (Accueil, Catalogue, Connexion), copyright 2024

SCREEN V-2 — Catalogue public (/catalogue)
Layout: Top navbar + 2-column (left sidebar filters 280px + main content area)
- Top navbar: same as V-1
- Page title below navbar: "Catalogue documentaire" + results count badge "1 248 références"
- LEFT SIDEBAR FILTERS (sticky, scrollable):
  · Search within filters: small search input
  · Section "Catégorie" (accordion, open by default):
    checkboxes with counts: Droit & Législation (124) | Informatique (89) | Sciences de la Santé (76) | Littérature (65) | Histoire (58) | Économie (47) | "Voir plus..." link
  · Section "Type de document" (accordion):
    checkboxes: Livre (312) | Mémoire (245) | Thèse (198) | Article (156) | Revue (134) | Rapport (98) | Guide (67) | Autre (38)
  · Section "Langue" (accordion):
    checkboxes: Français (987) | Anglais (198) | Autre (63)
  · Section "Année de publication":
    Range slider: 1950 → 2024, handles draggable, showing "1990 — 2024"
  · Section "Accès":
    Radio buttons: Tous ● | Public seulement ○ | Inscrits seulement ○
  · "Réinitialiser tous les filtres" link (teal, bottom)
- MAIN CONTENT:
  · Top bar: active filter chips (removable × tags) + sort dropdown "Trier par: Pertinence ▾"
  · 3-column grid desktop (2 tablet, 1 mobile) of document cards:
    Card: cover image (3/4 ratio) | title (bold, 2 lines) | authors (muted) | category badge | type pill | year (mono) | 🔓/🔒 access icon
    Hover: lift shadow + teal "Voir la fiche" overlay button
  · Show 12 cards with realistic mock data
  · Pagination bar: ← 1 [2] 3 4 ... 104 → + "12 par page" selector

SCREEN V-3 — Fiche détail d'une référence (/catalogue/introduction-droit-constitutionnel)
Layout: Top navbar + full-width content (no sidebar)
- Breadcrumb: Accueil > Catalogue > Introduction au Droit Constitutionnel
- Amber info banner at top (if not logged in):
  "📖 Connectez-vous pour accéder à la lecture en ligne et au téléchargement"
  + "Se connecter" (teal button) | "S'inscrire" (outlined button)
- Main content 2-column:
  LEFT (1/3):
  · Large cover image (book cover mockup, 3/4 ratio, shadow)
  · Access badge: "🔒 Réservé aux membres inscrits" (amber pill)
  · Stats below cover: 👁️ 1 247 vues | ⬇️ 389 téléchargements
  RIGHT (2/3):
  · Title (Playfair, large): "Introduction au Droit Constitutionnel Béninois"
  · Subtitle (muted italic): "Principes fondamentaux et jurisprudence"
  · Authors: avatar initials circles (navy) + "Prof. Koffi Adanlété, Dr. Marie Zannou"
  · Metadata grid (2 cols, label muted + value mono font):
    Éditeur: Les Presses Universitaires du Bénin | Année: 2021
    ISBN: 978-99919-0-467-3 | Langue: Français
    Type: Livre | Catégorie: Droit & Législation
    Pages: 342 | Téléchargements: 389
  · Keywords: teal outlined pill tags: "droit constitutionnel" "Bénin" "juridique" "constitution" "jurisprudence"
  · Abstract (expandable, "Voir plus..." link after 3 lines):
    "Cet ouvrage propose une analyse approfondie des principes du droit constitutionnel béninois, depuis l'indépendance jusqu'à la Constitution de 1990..."
  · Action buttons (DISABLED state for visitor):
    "🔒 Lire en ligne" (gray, disabled, tooltip on hover: "Connexion requise")
    "🔒 Télécharger" (gray, disabled, tooltip: "Connexion requise")
- Section "Documents similaires" (horizontal scroll, 4 cards, same category)
- Section "Informations bibliographiques complètes" (collapsible table with all metadata)

SCREEN V-4 — Recherche avancée (/recherche)
Layout: Top navbar + centered search interface (max-width 900px centered)
- Page title: "Recherche avancée" (Playfair)
- Large search bar (full-width, prominent, auto-focused): placeholder "Rechercher dans le catalogue..."
- Toggle: "Recherche simple ○ | Recherche avancée ●"
- Advanced filters panel (visible, card with shadow):
  · "Rechercher dans" (checkboxes row): ☑ Titre | ☑ Auteurs | ☑ Résumé | ☑ Mots-clés | ☐ Éditeur | ☐ ISBN
  · Row 2: Catégorie (select dropdown) | Type de document (select dropdown) | Langue (select dropdown)
  · Row 3: Année de (year input) | à (year input) | Accès (radio: Tous / Public / Inscrits)
  · "Lancer la recherche" button (teal, full-width)
- Results section (below, after mock search for "droit"):
  · "12 résultats pour 'droit'" (count header)
  · List view (not grid) for advanced search: cover thumb (small) + full metadata inline + abstract excerpt
  · Same pagination as V-2
- No results state: "Aucun résultat pour 'votre recherche'" + suggestions list + "Réinitialiser la recherche" button

SCREEN V-5 — Connexion & Inscription (/connexion)
Layout: Full viewport split screen — Left branding panel (40%) + Right form area (60%)
- LEFT PANEL (dark navy #1B2A4A background):
  · BibliNum logo (white, large, top)
  · Tagline (Playfair white): "Accédez à des milliers de références documentaires"
  · Subtle decorative pattern (books/library silhouette)
  · 3 feature highlights (icon + text, white):
    📚 "Catalogue de 1 248 références"
    📖 "Lecture en ligne disponible"
    ⬇️ "Téléchargement des ressources"
  · Bottom: "© 2024 BibliNum — Bibliothèque Numérique"
- RIGHT PANEL (white background, centered form):
  · Tab switcher at top: "Connexion" | "Inscription" (underline tab style)
  
  LOGIN TAB (default active):
  · Title: "Connexion à votre espace" (Playfair, dark)
  · Email field (floating label: "Adresse e-mail")
  · Password field (floating label: "Mot de passe" + show/hide eye icon)
  · "Mot de passe oublié ?" (teal link, right-aligned below password)
  · "Se connecter" button (full-width, navy primary, large)
  · Divider: "— ou —"
  · "Pas encore de compte ? S'inscrire →" (teal link)
  
  REGISTER TAB:
  · Title: "Créer votre compte" (Playfair)
  · 2-col row: Prénom * | Nom *
  · Email * (full width)
  · Téléphone (optional, full width, placeholder "+229 XX XX XX XX")
  · Password * (with strength indicator bar below)
  · Confirmer le mot de passe *
  · Checkbox: "J'accepte les conditions d'utilisation et la politique de confidentialité"
  · "Créer mon compte" button (full-width, teal primary)
  · "Déjà un compte ? Se connecter →" link
  Also show: Password forgotten modal (overlay) with email input + "Envoyer le lien" button

================================================================
PROFIL 2: UTILISATEUR INSCRIT (role: user) — ALL 6 SCREENS
================================================================
All screens have LEFT SIDEBAR + TOP BAR (authenticated layout).
Sidebar nav items: 🏠 Tableau de bord | 📚 Catalogue | 📥 Mes dépôts | 👤 Mon profil
Role badge in sidebar/topbar: "Utilisateur" (gray pill)

SCREEN U-1 — Tableau de bord utilisateur (/user/dashboard)
Layout: Left sidebar (navy) + main content
- LEFT SIDEBAR:
  · Logo "BibliNum" (white, top)
  · User avatar (initials circle "AK") + "Adjoua Koffi" + "Utilisateur" role badge (gray pill)
  · Nav items with icons (active item: teal left border + teal text):
    🏠 Tableau de bord (ACTIVE) | 📚 Catalogue | 📥 Mes dépôts | 👤 Mon profil
  · Bottom: 🚪 Se déconnecter
- TOP BAR: hamburger (mobile) | "Tableau de bord" title | 🔔 bell (3 unread, red badge) | avatar + dropdown
- MAIN CONTENT:
  · Welcome banner: "Bonjour, Adjoua 👋" (Playfair) + "Vendredi 14 juin 2024" (muted mono)
  · 4 KPI cards row (icons + numbers + labels):
    📥 "3 Demandes soumises" (navy border) | ⏳ "1 En cours" (amber border)
    ✅ "1 Publiée" (green border) | ❌ "1 Refusée" (red border)
  · Section "Mes dernières demandes" (table card):
    Title + "Voir toutes mes demandes →" link (top right)
    Table columns: Titre | Type | Date soumission | Statut | Actions
    Row 1: "Introduction à la Comptabilité..." | 📗 Livre | 10 juin 2024 | "En attente" gray badge | "Voir" button
    Row 2: "Mémoire sur le Droit..." | 📄 Mémoire | 02 mai 2024 | "Publiée ✓" dark green badge | "Voir" button
    Row 3: "Rapport sur la Santé..." | 📊 Rapport | 15 avr. 2024 | "Rejetée" red badge | "Voir" button
  · RIGHT COLUMN — "Activité récente" (timeline feed card):
    ✅ "Votre demande 'Mémoire sur le Droit...' a été publiée" — il y a 2 jours (green dot)
    ❌ "Votre demande 'Rapport sur la Santé...' a été rejetée — voir le motif" — il y a 1 semaine (red dot)
    📥 "Vous avez soumis 'Introduction à la Comptabilité...'" — il y a 4 jours (blue dot)
  · Section "Derniers documents consultés" (bottom, 4 small horizontal cards)
  · Floating CTA button bottom-right: "➕ Nouvelle demande" (teal, rounded-full, shadow)

SCREEN U-2 — Soumettre une demande de dépôt (/user/deposits/new)
Layout: Left sidebar + centered content (max-width 800px)
- TOP: 5-step progress stepper (horizontal, connecting line):
  [1 Type ●] ——— [2 Informations ○] ——— [3 Fichiers ○] ——— [4 Mots-clés ○] ——— [5 Confirmation ○]
  Active step: filled teal circle. Done steps: filled navy with checkmark. Future: gray outline. Step labels below each circle.

  SHOWING ALL STATES EXPECTED FOR THE FORM CODES:
  STEP 1 — Type de document (Default Active):
  · Title: "Quel type de document souhaitez-vous déposer ?" (Playfair)
  · 4×2 visual card grid (icons large, centered): 📗 Livre | 📄 Mémoire | 🎓 Thèse | 📰 Article | 📋 Revue | 📊 Rapport | 📌 Guide | 📁 Autre
  · "Livre" card selected state: navy border (#1B2A4A) + teal checkmark top-right + slight scale up + navy background tint
  · Unselected cards: white bg, gray border, hover teal border
  · Bottom nav: "Suivant →" button (teal, right-aligned, disabled until selection made)

  STEP 2 — Informations bibliographiques:
  · Form fields (2-col grid): Titre * (full width, floating label) | Sous-titre (full width, optional)
  · Authors section: "Auteurs *" label + rows of [Prénom | Nom | ✕ remove] + "➕ Ajouter un auteur" link
  · Éditeur * (text input with autocomplete dropdown showing existing publishers)
  · Année de publication * (year select 1900-2024) | ISBN (text, conditional)
  · Langue * (radio pills: Français ● | Anglais ○ | Autre ○)
  · Catégorie * (select dropdown: Droit & Législation ▾)
  · Résumé / Description (textarea, 4 rows, "247/500 caractères" counter bottom-right)
  · Bottom nav: "← Précédent" (ghost) + "Suivant →" (teal)

  STEP 3 — Fichiers:
  · Cover image upload zone: Dashed border box, cloud upload icon, "Glissez votre image de couverture ici" or "cliquez pour sélectionner" link | "JPG, PNG — max 5 Mo". FILLED STATE: image thumbnail preview (book cover) + filename + size + "✕ supprimer"
  · Document file upload zone: Dashed border box (larger), PDF icon, "Glissez votre document PDF ici" or "cliquez pour sélectionner" link | "PDF uniquement — max 50 Mo". UPLOADING STATE: progress bar (teal, 67%) + filename + "Annuler". DONE STATE: green checkmark + filename "these_droit.pdf" + "2.4 Mo" + "✕"
  · Bottom nav: "← Précédent" + "Suivant →"

  STEP 4 — Mots-clés:
  · Tag input field: existing tags shown as teal pills with × | type and press Enter to add. Tags: "droit constitutionnel" × | "Bénin" × | "juridique" × | "2021" ×. Autocomplete suggestion list. Tag count: "4/10 mots-clés ajoutés"
  · Bottom nav: "← Précédent" + "Suivant →"

  STEP 5 — Récapitulatif & Confirmation:
  · Title: "Vérifiez votre demande avant soumission" (Playfair)
  · Recap card (shadow, all data): cover thumbnail (left) + all metadata (right)
  · Edit links next to each section: "Modifier ✏️" (teal small link)
  · Checkbox: "☑ Je certifie que ce document respecte les droits d'auteur et les règles de la bibliothèque"
  · Bottom: "← Précédent" (ghost) + "✅ Soumettre ma demande" (teal, large, full-width)
  · "Enregistrer comme brouillon" link (muted, below button)

SCREEN U-3 — Liste de mes demandes (/user/deposits)
Layout: Left sidebar + full-width content
- Header: "Mes demandes de dépôt" (Playfair) + "3 demandes" badge + "➕ Nouvelle demande" button (top right, teal)
- Filter tabs (underline style): Toutes (3) | En cours (1) | Approuvées (1) | Refusées (1) | Publiées (1)
- Search bar: "Rechercher par titre..."
- Data table (card with shadow):
  Columns: Cover | Titre | Type | Date soumission | Statut | Actions
  Row 1: [cover thumb] | "Introduction à la Comptabilité Générale" (bold) | 📗 Livre pill | 10 juin 2024 | "En attente" gray badge | "Voir →" button
  Row 2: [cover thumb] | "Mémoire sur le Droit du Travail au Bénin" | 📄 Mémoire pill | 02 mai 2024 | "Publiée ✓" dark green badge | "Voir →" button
  Row 3: [cover thumb] | "Rapport sur la Santé Publique dans le Borgou" | 📊 Rapport pill | 15 avr. 2024 | "Rejetée" red badge | "Voir →" button
- Empty state (for empty tabs): SVG inbox illustration + "Aucune demande dans cette catégorie" + CTA

SCREEN U-4 — Détail d'une demande + Historique (/user/deposits/3)
Layout: Left sidebar + 2-column content
- Breadcrumb: Tableau de bord > Mes demandes > Rapport sur la Santé Publique...
- Status background banner (red full-width): "❌ Statut actuel : Rejetée définitivement"
- 2-column layout:
  LEFT (2/3) — "Ma demande":
  · Document card (shadow): cover image + all submitted metadata
    Titre: "Rapport sur la Santé Publique dans le Borgou" | Type: 📊 Rapport | Soumis le: 15 avril 2024 | Catégorie: Sciences de la Santé | Langue: Français | Fichier: "rapport_sante_borgou.pdf" (2.1 Mo) | 📄 Télécharger mon fichier
    Résumé: "Ce rapport analyse l'état de la santé publique dans le département du Borgou..."
  RIGHT (1/3) — "Historique des décisions":
  · Vertical timeline card:
    Node 1 ✅ (blue): "Demande soumise" — Adjoua Koffi — 15 avr. 2024 à 10h23
    Node 2 📋 (navy): "Assignée à un responsable" — Admin — 17 avr. 2024 à 09h00
    Node 3 ❌ (orange): "Refusée par le responsable" — Dr. Léon Houessou (Responsable) — 20 avr. 2024 à 14h35
      Justification block (amber bg, left border): "Le rapport ne respecte pas les normes bibliographiques requises. Les références sont incomplètes et le fichier PDF contient des pages manquantes (p. 45-52). Veuillez soumettre une version corrigée."
    Node 4 ❌ (red, final): "Rejet définitif" — Admin — 22 avr. 2024 à 11h00
      Justification block (red bg, left border): "Après examen, le refus du responsable est confirmé. Le document ne répond pas aux critères de qualité de la bibliothèque."
  · Timeline connector line between nodes (dashed navy)

SCREEN U-5 — Lecteur PDF en ligne (/user/read/42)
Layout: Fullscreen (no sidebar, minimal chrome)
- Top bar (dark navy, full-width):
  · Left: "← Retour au catalogue" link (white)
  · Center: "Introduction au Droit Constitutionnel Béninois" (white) + "Prof. Koffi Adanlété" (muted white small)
  · Right: page counter "Page 12 / 342" + zoom controls (- 100% +) + fullscreen icon + close ×
- PDF viewer area (gray bg): white PDF page centered, realistic text content
- Bottom bar: page navigation (← prev page | [12] | next page →) + page jump input

SCREEN U-6 — Mon profil (/user/profile)
Layout: Left sidebar + centered form (max-width 640px)
- Title: "Mon profil" (Playfair)
- Avatar section: large circle avatar (navy, initials "AK") + "Changer la photo" link below
- Form card (shadow):
  Section "Informations personnelles": Prénom * | Nom * (2 cols) | Adresse e-mail (read-only, grayed, lock icon) | Téléphone (optional, "+229 97 XX XX XX")
  Section "Sécurité" (separate card): Mot de passe actuel | Nouveau mot de passe | Confirmer (3 rows) | Password strength indicator bar | "Mettre à jour le mot de passe" button (outlined navy)
- Account info card (bottom, muted bg): "Membre depuis : 12 janvier 2024" | "Rôle : Utilisateur" | "Statut : ✅ Actif" | "Dernière connexion : il y a 2 heures"
- Buttons: "Enregistrer les modifications" button (teal, full-width) | "Annuler" link

================================================================
PROFIL 3: RESPONSABLE DEMANDES (role: responsable_demande) — ALL 4 SCREENS
================================================================
All screens have LEFT SIDEBAR + TOP BAR (authenticated layout).
Sidebar nav: 🏠 Tableau de bord | 📋 Mes demandes assignées | 👤 Mon profil
Role badge: "Responsable — Demandes" (teal pill)
CRITICAL: Screen M-3 is the split review interface.

SCREEN M-1 — Tableau de bord responsable (/manager/dashboard)
Layout: Left sidebar (navy, role badge "Responsable — Demandes" teal pill) + main content
- LEFT SIDEBAR: Logo "BibliNum" top | Avatar "LH" + "Dr. Léon Houessou" + "Responsable — Demandes" (teal pill) | Full Nav List | Bottom: Se déconnecter
- TOP BAR: bell (2 unread) | "Tableau de bord" | avatar
- MAIN CONTENT:
  · Role description banner (teal bg, light): "📋 Votre rôle : Examiner les demandes de dépôt qui vous sont assignées et émettre un avis motivé."
  · 3 KPI cards: 📋 "5 Demandes assignées" (navy) | ⏳ "3 À examiner" (amber) | ✅ "2 Traitées" (green)
  · Section "Demandes à traiter en priorité" (table, sorted by oldest first):
    Columns: Titre | Déposant | Assignée le | Type | Urgence | Action
    Row 1: "Étude sur le Commerce..." | Marie Zannou | 10 juin 2024 | Mémoire | ⚠️ "4 jours" (amber badge) | "Examiner →" (teal btn)
    Row 2: "Guide Pratique de..." | Kofi Mensah | 12 juin 2024 | Guide | — | "Examiner →"
    Row 3: "Rapport Économique..." | Afi Dossou | 13 juin 2024 | Rapport | — | "Examiner →"
  · Section "Traitées récemment" (last 2 decisions, right column):
    "Introduction au Droit..." | ✅ Validée | 08 juin 2024
    "Analyse du Marché..." | ❌ Refusée | 05 juin 2024
  · Notification panel: 2 unread notifications listed

SCREEN M-2 — Liste des demandes assignées (/manager/deposits)
Layout: Left sidebar + main content
- Header: "Demandes qui me sont assignées" (Playfair) + "3 à examiner" red badge
- Filter tabs: À examiner (3) | Validées (1) | Refusées (1) | Toutes (5)
- Card grid (2 cols desktop) — 3 cards for "À examiner" tab:
  CARD 1 (oldest, priority): Left: document type icon (📄 Mémoire circle) | Right: Title: "Étude sur le Commerce Transfrontalier au Bénin" | Déposant: "Marie Zannou" | Type: 📄 Mémoire (teal pill) | Date assignation: "10 juin 2024" | "⚠️ Assignée il y a 4 jours" (amber badge) | Status: "En attente d'examen" (gray pill) | Bottom: "Examiner la demande →" button (teal, full-width)
  CARD 2 (normal): "Guide Pratique de Comptabilité Appliquée" | Kofi Mensah | 📌 Guide | "Assignée il y a 2 jours"
  CARD 3: "Rapport sur l'Économie Rurale du Zou" | Afi Dossou | 📊 Rapport | "Assignée aujourd'hui"
- Empty state for "Validées" tab: ✅ illustration + "Aucune demande validée pour le moment"

SCREEN M-3 — Examiner une demande (/manager/deposits/7/review)
Layout: Left sidebar + SPLIT VIEW review interface (most important screen)
- Status banner (blue, full-width): "📋 Demande assignée le 10 juin 2024 — En attente de votre examen"
- ⚠️ Warning banner (amber): "⚠️ Cette demande est en attente depuis 4 jours"
- SPLIT VIEW (50/50 desktop layout):
  LEFT PANEL — "Informations de la demande" (scrollable white card):
  · Panel header: "📄 Détails de la demande" (navy bg light tint) | Cover image book mockup | Metadata list: Titre, Sous-titre, Type, Auteurs, Éditeur, Année, Langue, Pages, Catégorie, ISBN, Mots-clés (teal pills), Résumé, Déposant, Soumis le.
  · "📥 Télécharger le fichier pour examen" button (navy outlined) + "(PDF • 4.2 Mo)" text
  RIGHT PANEL — "Prévisualisation du document" (PDF viewer):
  · Panel header: "📖 Prévisualisation" (navy bg light tint) | PDF.js viewer area showing realistic text layout
  · Toolbar: page counter "3 / 187" | zoom: - 85% + | fullscreen icon | Scrollable content
- DECISION SECTION (below both panels, full width prominent card, border-top: 4px teal):
  · Section header: "⚖️ Votre décision" (Playfair) | Subtitle: "Votre avis sera transmis..."
  · Two large decision buttons: LEFT: "✅ Valider cette demande" (green filled) | RIGHT: "❌ Refuser cette demande" (red filled)
  
  SHOW REJECTION STATE COMPONENT (Active view simulated):
  · "Refuser" button shows selected active ring. Justification textarea animated below:
    Label: "Justification du refus *" (red asterisk) | Helper: "La justification est obligatoire..."
    Textarea (6 rows, red border active): placeholder for reason details. Character counter: "0 / minimum 50 caractères" (red). Error message: "⚠️ La justification doit contenir au moins 50 caractères"
  · Submit button: "Soumettre ma décision" (teal, DISABLED gray state shown)
  · Confirmation modal overlay: "Confirmer votre décision" | "Vous êtes sur le point de REFUSER..." | Buttons: "Annuler" + "Confirmer le refus" (red filled)
- RIGHT SIDEBAR (sticky, 280px): Compact timeline view showing submission date, assignment date, and current pulsing pending status.

SCREEN M-4 — Mon profil responsable (/manager/profile)
Layout: Left sidebar + centered form (max-width 640px)
- Same structure as User profile (U-6) but: Role badge: "Responsable — Demandes" (teal) | Avatar: "LH" initials | Name: "Dr. Léon Houessou" | Account info stats: "5 demandes traitées". Pre-filled fields, password change, "Enregistrer" button.

================================================================
PROFIL 4: RESPONSABLE RH (role: responsable_rh) — ALL 4 SCREENS
================================================================
All screens have LEFT SIDEBAR + TOP BAR (authenticated layout).
Sidebar nav: 🏠 Tableau de bord | 👥 Gestion des utilisateurs | 👤 Mon profil
Role badge: "Responsable RH" (amber/orange pill)
KEY RULE: RH can set roles: Utilisateur, Responsable RH, Responsable Demandes. RH CANNOT set "Administrateur".

SCREEN RH-1 — Tableau de bord RH (/hr/dashboard)
Layout: Left sidebar + main content
- LEFT SIDEBAR: Logo "BibliNum" | Avatar "FA" + "Fatou Agbodji" + "Responsable RH" (amber pill #E8A020) | Active Nav links | Bottom: Se déconnecter
- TOP BAR: bell (1 unread) | "Tableau de bord RH" | avatar
- MAIN CONTENT:
  · 4 KPI cards row: 👥 "248 Utilisateurs inscrits" (navy) | ✅ "231 Comptes actifs" (green) | ⏸️ "12 Comptes inactifs" (gray) | 🚫 "5 Comptes suspendus" (red)
  · Section "Derniers comptes créés" (table): Title + "Voir tous les utilisateurs →" link
    Columns: Avatar | Nom Prénom | Email | Rôle | Date inscription | Statut | Actions
    Row 1: "KM" circle | Kofi Mensah | kofi.m@email.com | "Utilisateur" gray pill | 13 juin 2024 | "Actif" green pill | ✏️ 🗑️
    Row 2: "AA" | Afi Agossou | afi.a@email.com | "Utilisateur" | 12 juin 2024 | "Actif" | ✏️ 🗑️
    Row 3: "BT" | Brice Tokplo | brice.t@email.com | "Responsable — Demandes" teal pill | 10 juin 2024 | "Actif" | ✏️ 🗑️
    Row 4: "MD" | Marie Dossou | marie.d@email.com | "Utilisateur" | 08 juin 2024 | "Inactif" gray pill | ✏️ 🗑️
    Row 5: "YG" | Yao Gbédji | yao.g@email.com | "Utilisateur" | 05 juin 2024 | "Suspendu" red pill | ✏️ 🗑️
  · Section "Mes actions récentes" (feed column): Logs of created, reset, or suspended accounts.
  · Quick action button: "➕ Créer un compte utilisateur" (teal)

SCREEN RH-2 — Liste des utilisateurs (/hr/users)
Layout: Left sidebar + full-width table content
- Header: "Gestion des utilisateurs" (Playfair) + "248 utilisateurs" badge + "➕ Créer un compte" button (teal)
- Filters bar: Search input | Role filter: "Tous les rôles ▾" (Utilisateur, Responsable RH, Responsable Demandes — NO Admin option) | Status filter
- Data table:
  Columns: Checkbox | Avatar | Nom & Prénom | Email | Téléphone | Rôle | Statut | Dernière connexion | Inscription | Actions
  Row 1: "KM" | Kofi Mensah | kofi.mensah@email.com | +229 97 34 56 78 | "Utilisateur" gray pill | Toggle switch ON green | il y a 2h | 13 juin 2024 | ✏️ 🔑 🗑️
  Row 2: "LH" | Dr. Léon Houessou | leon.h@bibli.bj | +229 95 12 34 56 | "Responsable — Demandes" teal pill | Toggle ON | il y a 30 min | 15 janv. 2024 | ✏️ 🔑 🗑️
  Row 3 (Row slightly grayed): "MD" | Marie Dossou | marie.d@email.com | — | "Utilisateur" | Toggle OFF gray | il y a 5 jours | 08 juin 2024 | ✏️ 🔑 🗑️
  Row 4 (Row red-tinted bg): "YG" | Yao Gbédji | yao.g@email.com | +229 96 78 90 12 | "Utilisateur" | "Suspendu" red pill (no toggle) | il y a 2 sem. | 05 juin 2024 | ✏️ 🔑 —
- Bulk actions bar (appears when checked): "2 utilisateurs sélectionnés" + "Activer" (green) | "Désactiver" (gray)
- Pagination controls at bottom.

SCREEN RH-3 — Créer / Modifier un utilisateur (/hr/users/new)
Layout: Left sidebar + centered form card (max-width 680px)
- Form card fields layout:
  Section "Informations personnelles": Prénom * | Nom * (2-col) | Email * | Téléphone (optional)
  Section "Accès & Rôle": Rôle * dropdown (Utilisateur, Responsable RH, Responsable Demandes). Info notice box below: "ℹ️ Le rôle Administrateur ne peut être attribué que par un administrateur." (italic, info icon). Statut * radio horizontal pills: Actif green, Inactif gray, Suspendu red.
  Section "Mot de passe initial": Radio choices: "Définir manuellement" or "Générer automatiquement" (Selected). AUTO state shows read-only password field: "K#9mPx2qL!" + copy button + "Régénérer" link. Checkbox: "☑ Envoyer les accès par email".
- Action buttons: "Créer le compte" (teal filled) | "Annuler" (ghost)
- SHOW EDIT STATE SIMULATION (/hr/users/12/edit): Title changes to "Modifier le compte de Kofi Mensah". Pre-filled fields. Password section replaced by "Réinitialiser le mot de passe" button. Red danger zone block card at bottom: "Zone dangereuse" -> "Supprimer ce compte" button (red outlined) triggering confirmation modal: "Êtes-vous sûr... ? Cette action est irréversible." Buttons: "Annuler" + "Supprimer définitivement" (red filled).

SCREEN RH-4 — Détail d'un utilisateur (/hr/users/12)
Layout: Left sidebar + 2-column content
- Header: "Kofi Mensah" + "Actif" green badge + actions top right.
- LEFT COLUMN (1/3) — User Summary Card: Large avatar circle ("KM", 80px), name, email, phone, role/status badges. Metadata lines for creation, login, last edit. Action list buttons vertical stack.
- RIGHT COLUMN (2/3): Card "Activité du compte" displaying submitted deposits, downloads, views, and login IP metrics. Card "Historique des actions RH" timeline. Card "Réinitialisation de mot de passe" link tool block.

================================================================
PROFIL 5: ADMINISTRATEUR (role: admin) — ALL 9 SCREENS
================================================================
All screens have FULL LEFT SIDEBAR + TOP BAR (authenticated layout).
Sidebar nav (all items): 🏠 Tableau de bord | 📥 Demandes de dépôt | 📚 Références | 🗂️ Catégories | ✍️ Auteurs | 🏢 Éditeurs | 👥 Utilisateurs | 📋 Journal d'activité
Role badge: "Administrateur" (navy/dark pill)
CRITICAL: Screen A-2 contains the comprehensive context-aware workflow actions panel.

SCREEN A-1 — Tableau de bord admin (/admin/dashboard)
Layout: Full sidebar + main content (widest layout)
- TOP BAR: bell (7 unread, red badge) | "Tableau de bord"
- ALERT BANNER (amber, full-width, top of content area): "⚠️ 2 demandes de dépôt sont en attente d'affectation depuis plus de 3 jours. Affecter maintenant →"
- 6 KPI CARDS ROW: 📚 "1 248 Références publiées" (navy) | 📥 "8 Dépôts en attente" (amber) | 👥 "231 Utilisateurs actifs" (green) | ⬇️ "1 247 Téléchargements ce mois" (teal) | 👁️ "4 389 Consultations ce mois" (blue) | 🔔 "7 Notifications non lues" (red)
- CHARTS SECTION (2-col grid):
  LEFT: Bar chart "Demandes de dépôt par mois" (Last 6 months, stacked bars: green=approuvées / red=rejetées).
  RIGHT: Donut chart "Références par catégorie" (Slices: Droit 22%, Informatique 18%, Santé 15%, Littérature 12%, Histoire 10%, Autres 23%. Center text: "1 248 total").
- BOTTOM ROW (2-col grid):
  LEFT: Table "Demandes à traiter" (5 rows, urgent first): Columns for ID, Titre, Déposant, Statut (color badge), Date, Action link. Includes mock rows for pending, approved by manager, and rejected by manager states. "Voir toutes les demandes →" bottom link.
  RIGHT: Feed "Activité récente" text log timeline (10 entries, scrollable).

SCREEN A-2 —  Gestion des demandes de dépôt (/admin/deposits)
Layout: Full sidebar + full-width table — MOST COMPLEX WORKFLOW INTERFACE
- Header: "Demandes de dépôt" + total count badge
- FILTER TABS WITH COUNTS: Toutes (24) | En attente (3) | Assignées (5) | Validées resp. (4) | Refusées resp. (2) | Second avis (1) | Approuvées (3) | Rejetées (4) | Publiées (2). Active tab: "Validées resp." (4) with teal underline.
- MAIN DATA TABLE (full-width): Columns with checkboxes: # | Cover | Titre | Déposant | Responsable assigné | Date soumission | Statut | Actions
  
  SIMULATE ROW 1 EXPANDED STATE — status: "Validée (responsable)"
  · Row: "7" | 📗 thumb | "Étude sur le Commerce Transfrontalier..." | Marie Zannou | Dr. Léon Houessou | 07 juin | "Validée (resp.)" teal badge | "Voir" btn + chevron ▲ (expanded)
  
  EXPANDED INLINE WORKFLOW PANEL COMPONENT (Render below Row 1, light teal bg, full-width):
  ┌─────────────────────────────────────────────────────────────┐
  │ LEFT (50%) — Aperçu de la demande:                         │
  │ Cover + Titre + Déposant + Type + lien "Voir le fichier PDF"│
  │ Historique compact (timeline 2 nodes):                      │
  │  ✅ Soumise — Marie Zannou — 07 juin                        │
  │  📋 Assignée à Dr. Houessou — Admin — 10 juin               │
  │  ✅ Validée par Dr. Houessou — 14 juin (teal node)          │
  │    "Document de qualité, complet et pertinent."             │
  ├─────────────────────────────────────────────────────────────┤
  │ RIGHT (50%) — "⚖️ Actions disponibles":                     │
  │ Current status info:                                        │
  │ ✅ "Validée par Dr. Léon Houessou le 14 juin 2024"          │
  │ "Le responsable recommande la publication."                 │
  │                                                             │
  │ Three action buttons (stacked):                             │
  │ [✅ Approuver & Publier] — GREEN filled, full-width, large  │
  │ [🔁 Demander un 2ème avis] — AMBER outlined, full-width     │
  │ [❌ Rejeter définitivement] — RED outlined, full-width       │
  │                                                             │
  │ Simulation: "Rejeter" click displays embedded textarea:      │
  │ "Justification du rejet *" label, Textarea (4 rows, red     │
  │ border, required), "Confirmer le rejet" button (red)         │
  └─────────────────────────────────────────────────────────────┘

  ROW 2 — status: "Refusée (responsable)" [Collapsed]: "5" | 📊 thumb | "Rapport sur la Santé Publique..." | Adjoua Koffi | Dr. Léon Houessou | 15 avr. | "Refusée (resp.)" orange badge | "Voir" + chevron ▼
  ROW 3 — status: "En attente" [Collapsed]: "12" | 📗 thumb | "Introduction à la Comptabilité..." | Kofi Mensah | — (non assignée) | 10 juin | "En attente" gray | "Voir" + chevron ▼

  WORKFLOW STATES TO INCLUDE IN GENERATION SYSTEM LOGIC:
  · Collapsed "En attente" state panel expansion shows: "Affecter un responsable" select dropdown (Dr. Léon Houessou, Prof. Brice Tokplo, Mme Afi Sossou) + "Affecter →" button (teal).
  · Collapsed "Refusée (responsable)" panel expansion shows: Orange warning message alert, Justification block text from previous reviewer, and 3 buttons: [⚠️ Passer outre le refus] (Amber filled, opens justification input), [🔁 Demander un 2ème avis] (Blue outlined), [❌ Confirmer le rejet définitif] (Red outlined).

SCREEN A-3 — Détail complet d'une demande (/admin/deposits/7)
Layout: Full sidebar + full-width detail view
- Header: Full title + "Validée (responsable)" teal badge. Breadcrumbs hierarchy bar.
- Status timeline bar (horizontal graphic layout, top of content area): 5 steps visual indicators -> [✅ Soumise] → [✅ Assignée] → [✅ Validée resp.] → [○ Approuvée] → [○ Publiée]. Step 3 filled, remaining steps grayed.
- 2-column layout:
  LEFT (60%) — "Document soumis": Cover, full read-only metadata parameters, embedded layout scrollable PDF panel window, download file CTA button.
  RIGHT (40%) — "Historique complet" + Actions: Full audit trail node sequence showing times, roles, and comments. Action panel card component with matching configuration as the active screen A-2 expanded button sets.

SCREEN A-4 — Gestion des références publiées (/admin/references)
Layout: Full sidebar + table
- Header: "Références" title, reference counter metrics, "➕ Ajouter une référence" button (teal). Filter block layer.
- Data table: Columns with row selection options, covers, title text, author strings, category tags, type indicators, color-coded custom status capsules (Publiée, Archivée, Brouillon), view metrics, download counters, custom icons action grid (✏️, 📁, 🗑️).
- Bulk action toolbar overlay at bottom activated upon selection.
- ADD/EDIT REFERENCE FULL FORM MODAL LAYER COMPONENT included on layout frame.

SCREEN A-5 — Gestion des catégories (/admin/categories)
Layout: Full sidebar + CRUD layout template list
- Header area with "➕ Ajouter" category tool. Full-width category data spreadsheet displaying row numbers, names, slug paths, descriptions, document counter integers, toggle status switch fields (Actif green / Inactif gray), edit controls.
- INLINE EDIT STATE VISUALIZATION: Displays a row with active text input layers, toggle states, save disk indicator icon, close icon.
- ADD CATEGORY SLIDE-OVER SIDE PANEL (400px wide, absolute right-aligned) form component asset.
- DELETE GUARD safety check alert overlay modal layout box block.

SCREEN A-6 — Gestion des auteurs (/admin/authors)
Layout: Full sidebar + table list
- Author index spreadsheet showing circle avatar photo mock spaces, first/last names, nationalities, life chronology dates, count values, CRUD action tool links.
- ADD/EDIT AUTHOR SLIDE-OVER input frame card configuration drawer.

SCREEN A-7 — Gestion des éditeurs (/admin/publishers)
Layout: Full sidebar + table list
- Institutional publisher spreadsheet showing name, descriptions, country values, web link shortcuts, reference counters, action sets. Add/Edit panel drawer component setup.

SCREEN A-8 — Gestion des utilisateurs (admin) (/admin/users)
Layout: Full sidebar + user account control panel table view
- Header: "Utilisateurs" + "➕ Créer un compte" button. Quick role filter tabs: Tous (248) | Admins (1) | Resp. RH (3) | Resp. Demandes (8) | Utilisateurs (236).
- Full data table data rows covering ALL system roles including active user profiles, administrative personnel, HR accounts, validation managers, suspended rows (red-tinted background). Admin role can configure any checkbox toggle or select fields.
- EDIT USER FULL WINDOW MODAL OVERLAY COMPONENT: Title "Modifier le compte de...". Personal parameter inputs. Role select dropdown showing ALL 4 system roles (Utilisateur, Responsable RH, Responsable Demandes, Administrateur). Security warning below selection: "⚠️ Attribuer le rôle Administrateur donne un accès complet à la plateforme". Status radio array panel. Save buttons.

SCREEN A-9 — Journal d'activité (/admin/activity-logs)
Layout: Full sidebar + log audit management screen console
- Header: "Journal d'activité" + "⬇️ Exporter CSV" button. Dense advanced search filter panel layer.
- Log data grid layout table rows utilizing a systematic color system tag for different operation logs: 🟢 Création | 🔵 Modification/Action | ⚪ Authentification | 🔴 Suppression | 🟠 Workflow. Rows feature index values, logged user avatars, transaction verbs, source targets, metadata reference IDs, IP locations, granular timestamps.
- INDIVIDUAL ROW AUDIT DATA DIALOG MODAL: Opens a monospace stylized panel showing internal details, full User Agent fields, precise transaction timings, syntax highlighted JSON metadata code box window block showing structural raw entry logs.
- Pagination element toolbar block. Color legend box component layer.