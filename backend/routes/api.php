<?php

// ════════════════════════════════════════════════════════════════════════════
//  FICHIER PRINCIPAL DES ROUTES API
// ════════════════════════════════════════════════════════════════════════════

// 1. Authentification
require __DIR__.'/allroutes/01_auth.php';

// 2. Endpoints publics
require __DIR__.'/allroutes/02_public.php';

// 3. Espace Utilisateur Connecté
require __DIR__.'/allroutes/03_user.php';

// 4. Espace RH
require __DIR__.'/allroutes/04_hr.php';

// 5. Espace Responsable Demande
require __DIR__.'/allroutes/05_manager.php';

// 6. Espace Admin
require __DIR__.'/allroutes/06_admin.php';

// 7. Tests
require __DIR__.'/allroutes/07_test.php';
