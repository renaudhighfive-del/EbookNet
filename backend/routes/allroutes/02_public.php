<?php

use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  ESPACE PUBLIC
// ════════════════════════════════════════════════════════════════════════════

Route::prefix('public')->group(function () {
    Route::get('/stats', [PublicController::class, 'stats']);
    Route::get('/categories', [PublicController::class, 'categories']);
    Route::get('/references', [PublicController::class, 'references']);
    Route::get('/references/latest', [PublicController::class, 'latestReferences']);
    Route::get('/references/featured', [PublicController::class, 'featuredReference']);
    Route::get('/references/{id}', [PublicController::class, 'showReference']);
    Route::get('/search', [PublicController::class, 'search']);
});
