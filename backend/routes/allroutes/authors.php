<?php

use App\Http\Controllers\AuthorController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/authors')
    ->group(function () {
        Route::get('/',                [AuthorController::class, 'index']);
        Route::get('/all',             [AuthorController::class, 'all']);
        Route::post('/',               [AuthorController::class, 'store']);
        Route::get('/{id}',            [AuthorController::class, 'show']);
        Route::put('/{id}',            [AuthorController::class, 'update']);
        Route::delete('/{id}',         [AuthorController::class, 'destroy']);
    });
