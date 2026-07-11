<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  AUTHENTIFICATION — Publique & Connecté
// ════════════════════════════════════════════════════════════════════════════

// Routes publiques
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,60');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,60');
});

// Routes protégées (authentifié)
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// Vérification d'email
Route::middleware('auth:sanctum')->prefix('email')->group(function () {
    Route::get('/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
    Route::post('/verification-notification', [AuthController::class, 'resendVerification'])->name('verification.send');
});
