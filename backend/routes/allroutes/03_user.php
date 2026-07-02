<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\DepositRequestController;
use App\Http\Controllers\PlanningController;
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

// ════════════════════════════════════════════════════════════════════════════
//  PLANNING — Pour tous les utilisateurs authentifiés
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum'])->prefix('planning')->group(function () {
    Route::get('/availability',       [PlanningController::class, 'getAvailability']);
    Route::get('/availability/month', [PlanningController::class, 'getAvailabilityMonth']);
    Route::post('/appointments',      [PlanningController::class, 'createAppointment']);
    Route::get('/appointments/{id}/status', [PlanningController::class, 'getAppointmentStatus']);
    Route::post('/appointments/{id}/cancel', [PlanningController::class, 'cancelAppointment']);
});
