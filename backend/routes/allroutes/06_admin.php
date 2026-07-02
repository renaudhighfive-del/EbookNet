<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\PublisherController;
use App\Http\Controllers\ReferenceController;
use App\Http\Controllers\DepositRequestController;
use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  ESPACE ADMIN — Rôle : admin
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Tableau de bord & Statistiques
    Route::prefix('stats')->group(function () {
        Route::get('/', [UserController::class, 'getStats']);
        Route::get('/deposits-by-month', [UserController::class, 'getDepositsByMonth']);
        Route::get('/references-by-category', [UserController::class, 'getReferencesByCategory']);
    });

    // Gestion des Utilisateurs (Admin)
    Route::prefix('users')->group(function () {
        Route::patch('/{id}/approve',          [UserController::class, 'approve']);
        Route::patch('/{id}/suspend',          [UserController::class, 'suspend']);
        Route::patch('/{id}/validate-suspend', [UserController::class, 'validateSuspend']);
        Route::patch('/{id}/role',             [UserController::class, 'updateRole']);
        Route::patch('/{id}/restore',           [UserController::class, 'restore']);
    });

    // Gestion des Catégories
    Route::prefix('categories')->group(function () {
        Route::get('/',                [CategoryController::class, 'index']);
        Route::get('/all',             [CategoryController::class, 'all']);
        Route::post('/',               [CategoryController::class, 'store']);
        Route::get('/{id}',            [CategoryController::class, 'show']);
        Route::put('/{id}',            [CategoryController::class, 'update']);
        Route::delete('/{id}',         [CategoryController::class, 'destroy']);
        Route::patch('/{id}/status',   [CategoryController::class, 'toggleStatus']);
    });

    // Gestion des Auteurs
    Route::prefix('authors')->group(function () {
        Route::get('/',                [AuthorController::class, 'index']);
        Route::get('/all',             [AuthorController::class, 'all']);
        Route::post('/',               [AuthorController::class, 'store']);
        Route::get('/{id}',            [AuthorController::class, 'show']);
        Route::put('/{id}',            [AuthorController::class, 'update']);
        Route::delete('/{id}',         [AuthorController::class, 'destroy']);
    });

    // Gestion des Éditeurs
    Route::prefix('publishers')->group(function () {
        Route::get('/',                [PublisherController::class, 'index']);
        Route::get('/all',             [PublisherController::class, 'all']);
        Route::post('/',               [PublisherController::class, 'store']);
        Route::get('/{id}',            [PublisherController::class, 'show']);
        Route::put('/{id}',            [PublisherController::class, 'update']);
        Route::delete('/{id}',         [PublisherController::class, 'destroy']);
    });

    // Gestion des Références
    Route::prefix('references')->group(function () {
        Route::get('/',                [ReferenceController::class, 'index']);
        Route::get('/archived',         [ReferenceController::class, 'archivedReferences']);
        Route::get('/{id}',            [ReferenceController::class, 'show']);
        Route::post('/',               [ReferenceController::class, 'store']);
        Route::put('/{id}',            [ReferenceController::class, 'update']);
        Route::delete('/{id}',         [ReferenceController::class, 'destroy']);
        Route::patch('/{id}/status',   [ReferenceController::class, 'toggleStatus']);
        Route::patch('/{id}/restore',  [ReferenceController::class, 'restore']);
    });

    // Gestion des Demandes de Dépôt (Admin)
    Route::prefix('deposits')->group(function () {
        Route::get('/', [DepositRequestController::class, 'index']);
        Route::get('/{id}', [DepositRequestController::class, 'show']);
        Route::patch('/{id}/assign', [DepositRequestController::class, 'assign']);
        Route::patch('/{id}/publish', [DepositRequestController::class, 'publish']);
    });

    // Journal d'activité (Admin)
    Route::get('/activity-logs', [ActivityLogController::class, 'indexForAdmin']);
});
