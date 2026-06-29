<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

//  AUTH — Public
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register'])->middleware('throttle:3,60');
    Route::post('/login',           [AuthController::class, 'login'])->middleware('throttle:5,60');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,60');
    Route::post('/reset-password',  [AuthController::class, 'resetPassword'])->middleware('throttle:3,60');

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

//  GESTION DES ÉDITEURS — Admin uniquement
require __DIR__ . '/allroutes/publishers.php';

//  STATISTIQUES ADMIN — Dashboard dynamique
require __DIR__ . '/allroutes/dashboard_admin.php';

//  DEMANDES DE DÉPÔT — Admin uniquement
require __DIR__ . '/allroutes/deposit_request.php';

//  RÉFÉRENCES — Admin uniquement
require __DIR__ . '/allroutes/reference_admin.php';


//  TEST
Route::get('/test', fn () => response()->json(['status' => true, 'message' => 'API OK']));
