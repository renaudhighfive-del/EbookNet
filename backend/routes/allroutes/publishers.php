<?php

use App\Http\Controllers\PublisherController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/publishers')
    ->group(function () {
        Route::get('/',                [PublisherController::class, 'index']);
        Route::get('/all',             [PublisherController::class, 'all']);
        Route::post('/',               [PublisherController::class, 'store']);
        Route::get('/{id}',            [PublisherController::class, 'show']);
        Route::put('/{id}',            [PublisherController::class, 'update']);
        Route::delete('/{id}',         [PublisherController::class, 'destroy']);
    });
