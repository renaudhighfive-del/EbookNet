<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  ESPACE RH — Rôle : responsable_rh
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:responsable_rh'])->prefix('hr')->group(function () { // le rôle admin ??? à revoir
    // Gestion des utilisateurs
    Route::prefix('users')->group(function () {
        Route::get('/',                       [UserController::class, 'index']);
        Route::post('/',                      [UserController::class, 'store']);
        Route::get('/archived',               [UserController::class, 'archivedUsers']);
        Route::get('/{id}',                   [UserController::class, 'show']);
        Route::put('/{id}',                   [UserController::class, 'update']);
        Route::patch('/{id}/status',          [UserController::class, 'updateStatus']);
        Route::delete('/{id}',                [UserController::class, 'archive']);
        Route::patch('/{id}/request-suspend', [UserController::class, 'requestSuspend']);
        Route::patch('/{id}/approve',         [UserController::class, 'approve']);
    });

    // Journal d'activité
    Route::get('/activity-logs', [ActivityLogController::class, 'indexForRH']);
});
