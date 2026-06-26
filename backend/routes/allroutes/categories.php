<?php

use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/categories')
    ->group(function () {
        Route::get('/',                [CategoryController::class, 'index']);
        Route::get('/all',             [CategoryController::class, 'all']);
        Route::post('/',               [CategoryController::class, 'store']);
        Route::get('/{id}',            [CategoryController::class, 'show']);
        Route::put('/{id}',            [CategoryController::class, 'update']);
        Route::delete('/{id}',         [CategoryController::class, 'destroy']);
        Route::patch('/{id}/status',   [CategoryController::class, 'toggleStatus']);
    });