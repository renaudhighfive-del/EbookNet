<?php

use App\Http\Controllers\ReferenceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/references/archived', [ReferenceController::class, 'archivedReferences']);
        Route::patch('/references/{id}/restore', [ReferenceController::class, 'restore']);
    });