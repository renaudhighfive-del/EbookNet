<?php

use App\Http\Controllers\DepositRequestController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\UserController;
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
        Route::get('/{id}', [DepositRequestController::class, 'userDepositDetail']);
        Route::get('/{id}/file', [DepositRequestController::class, 'serveFile'])->name('deposits.file');
    });  
});

// ════════════════════════════════════════════════════════════════════════════
//  Pour tous les utilisateurs authentifiés
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum'])->group(function () {
    // Profil utilisateur (pour tous les rôles)
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);

    // Mise à jour du mot de passe
    Route::patch('/password', [UserController::class, 'updatePassword']);
    
    // Planning
    Route::prefix('planning')->group(function () {
        Route::get('/availability', [PlanningController::class, 'getAvailability']);
        Route::get('/availability/month', [PlanningController::class, 'getAvailabilityMonth']);
        Route::get('/appointments', [PlanningController::class, 'calendarAppointments']);
        Route::post('/appointments', [PlanningController::class, 'createAppointment']);
        Route::get('/appointments/{id}/status', [PlanningController::class, 'getAppointmentStatus']);
        Route::post('/appointments/{id}/cancel', [PlanningController::class, 'cancelAppointment']);
    });
});
