<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  AUTHENTIFICATION — Publique & Connecté
// ════════════════════════════════════════════════════════════════════════════

// Routes publiques
Route::prefix('auth')->group(function () {
    Route::post('/register',          [AuthController::class, 'register'])->middleware('throttle:3,60');
    Route::post('/login',             [AuthController::class, 'login'])->middleware('throttle:5,60');
    Route::post('/forgot-password',   [AuthController::class, 'forgotPassword'])->middleware('throttle:3,60');
    Route::post('/reset-password',    [AuthController::class, 'resetPassword'])->middleware('throttle:3,60');
});

// Routes protégées (authentifié)
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
});
