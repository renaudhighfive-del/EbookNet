<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  AUTH — Public
// ════════════════════════════════════════════════════════════════════════════
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  GESTION DES UTILISATEURS — RH + Admin
//  Permissions communes :
//    - Lister (filtre : role, status, search + pagination)
//    - Créer (RH ne peut pas créer admin — bloqué côté controller)
//    - Voir le détail
//    - Modifier infos (nom, email, téléphone, mdp)
//    - Activer ↔ Désactiver (active ↔ inactive)
//    - Archiver (soft-delete → inactive, irréversible par RH)
//    - Proposer une suspension (status → pending_suspension, admin valide)
// ════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'role:responsable_rh,admin'])
    ->prefix('hr/users')
    ->group(function () {
        Route::get('/',                       [UserController::class, 'index']);
        Route::post('/',                      [UserController::class, 'store']);
        Route::get('/{id}',                   [UserController::class, 'show']);
        Route::put('/{id}',                   [UserController::class, 'update']);
        Route::patch('/{id}/status',          [UserController::class, 'updateStatus']);       // active ↔ inactive
        Route::delete('/{id}',                [UserController::class, 'archive']);             // archivage
        Route::patch('/{id}/request-suspend', [UserController::class, 'requestSuspend']);     // RH propose suspension
        Route::patch('/{id}/approve',         [UserController::class, 'approve']);             // approuver compte inactif
    });

// ════════════════════════════════════════════════════════════════════════════
//  JOURNAL D'ACTIVITÉ — RH
// ════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'role:responsable_rh'])
    ->get('/hr/activity-logs', [ActivityLogController::class, 'indexForRH']);

// ════════════════════════════════════════════════════════════════════════════
//  ACTIONS AVANCÉES — Admin uniquement
//  Permissions supplémentaires :
//    - Approuver un compte inactif (nouvelles inscriptions)
//    - Suspendre directement
//    - Valider une suspension proposée par le RH
//    - Changer le rôle
//    - Restaurer un compte suspendu/archivé
// ════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/users')
    ->group(function () {
        Route::patch('/{id}/approve',          [UserController::class, 'approve']);         // approuver inscription
        Route::patch('/{id}/suspend',          [UserController::class, 'suspend']);         // suspension directe
        Route::patch('/{id}/validate-suspend', [UserController::class, 'validateSuspend']); // valider suspension RH
        Route::patch('/{id}/role',             [UserController::class, 'updateRole']);      // changer rôle
        Route::patch('/{id}/restore',          [UserController::class, 'restore']);         // restaurer → active
    });

// ════════════════════════════════════════════════════════════════════════════
//  STATISTIQUES ADMIN — Dashboard dynamique
// ════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/stats')
    ->group(function () {
        Route::get('/', [UserController::class, 'getStats']);
        Route::get('/deposits-by-month', [UserController::class, 'getDepositsByMonth']);
        Route::get('/references-by-category', [UserController::class, 'getReferencesByCategory']);
    });

// ════════════════════════════════════════════════════════════════════════════
//  JOURNAL D'ACTIVITÉ — Admin
// ════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/activity-logs', [ActivityLogController::class, 'indexForAdmin']);

// ════════════════════════════════════════════════════════════════════════════
//  TEST
// ════════════════════════════════════════════════════════════════════════════
Route::get('/test', fn () => response()->json(['status' => true, 'message' => 'API OK']));
