<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\DepositRequestController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  ESPACE UTILISATEUR — Rôle : user
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:user'])->prefix('user')->group(function () {
    // Dashboard
    Route::get('/dashboard', [UserController::class, 'getUserDashboard']);
    
    // Demandes de dépôt
    Route::prefix('deposits')->group(function () {
        Route::get('/', [DepositRequestController::class, 'userDeposits']);
        Route::post('/', [DepositRequestController::class, 'store']);
    });
});
