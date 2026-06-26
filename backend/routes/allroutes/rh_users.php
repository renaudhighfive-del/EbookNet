<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

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
        Route::get('/archived',               [UserController::class, 'archivedUsers']);      // utilisateurs archivés
        Route::get('/{id}',                   [UserController::class, 'show']);
        Route::put('/{id}',                   [UserController::class, 'update']);
        Route::patch('/{id}/status',          [UserController::class, 'updateStatus']);       // active ↔ inactive
        Route::delete('/{id}',                [UserController::class, 'archive']);             // archivage
        Route::patch('/{id}/request-suspend', [UserController::class, 'requestSuspend']);     // RH propose suspension
        Route::patch('/{id}/approve',         [UserController::class, 'approve']);             // approuver compte inactif
    });
