<?php

use App\Http\Controllers\ReferenceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/references', [ReferenceController::class, 'index']);
        Route::get('/references/{id}', [ReferenceController::class, 'show']);
        Route::post('/references', [ReferenceController::class, 'store']);
        Route::put('/references/{id}', [ReferenceController::class, 'update']);
        Route::delete('/references/{id}', [ReferenceController::class, 'destroy']);
        Route::patch('/references/{id}/status', [ReferenceController::class, 'toggleStatus']);
        Route::get('/references/archived', [ReferenceController::class, 'archivedReferences']);
        Route::patch('/references/{id}/restore', [ReferenceController::class, 'restore']);
    });