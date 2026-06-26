<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// ════════════════════════════════════════════════════════════════════════════
//  STATISTIQUES ADMIN — Dashboard dynamique
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/stats')
    ->group(function () {
        Route::get('/', [UserController::class, 'getStats']);
        Route::get('/deposits-by-month', [UserController::class, 'getDepositsByMonth']);
        Route::get('/references-by-category', [UserController::class, 'getReferencesByCategory']);
    });


