<?php

use App\Http\Controllers\DepositRequestController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  ESPACE RESPONSABLE DEMANDE — Rôle : responsable_demande
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:responsable_demande,admin'])->prefix('manager')->group(function () {  // le role admin ??
    // Gestion des demandes de dépôt
    Route::prefix('deposits')->group(function () {
        Route::get('/', [DepositRequestController::class, 'index']);
        Route::get('/{id}', [DepositRequestController::class, 'show']);
        Route::get('/{id}/file', [DepositRequestController::class, 'serveFile']);
        Route::patch('/{id}/approve', [DepositRequestController::class, 'approve']);
        Route::patch('/{id}/reject',  [DepositRequestController::class, 'reject']);
    });
});
