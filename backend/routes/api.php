<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepositRequestController;
use Illuminate\Support\Facades\Route;

//  AUTH — Public
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

//  GESTION DES UTILISATEURS — RH 
require __DIR__ . '/allroutes/rh_users.php';

//  GESTION DES UTILISATEURS & ACTIONS AVANCÉES — ADMIN
require __DIR__ . '/allroutes/admin_users.php';

//  JOURNAL D'ACTIVITÉ — RH & ADMIN
require __DIR__ . '/allroutes/journal_activity_admin&rh.php';

//  GESTION DES CATÉGORIES — Admin uniquement
require __DIR__ . '/allroutes/categories.php';

//  GESTION DES AUTEURS — Admin uniquement
require __DIR__ . '/allroutes/authors.php';

//  STATISTIQUES ADMIN — Dashboard dynamique
require __DIR__ . '/allroutes/dashboard_admin.php';

//  DEMANDES DE DÉPÔT — Admin uniquement
Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/deposits')
    ->group(function () {
        Route::get('/', [DepositRequestController::class, 'index']);
        Route::get('/{id}', [DepositRequestController::class, 'show']);
        Route::patch('/{id}/assign', [DepositRequestController::class, 'assign']);
        Route::patch('/{id}/approve', [DepositRequestController::class, 'approve']);
        Route::patch('/{id}/reject', [DepositRequestController::class, 'reject']);
        Route::patch('/{id}/publish', [DepositRequestController::class, 'publish']);
    });

//  RÉFÉRENCES  — Admin uniquement
require __DIR__ . '/allroutes/reference_admin.php';


//  TEST
Route::get('/test', fn () => response()->json(['status' => true, 'message' => 'API OK']));
