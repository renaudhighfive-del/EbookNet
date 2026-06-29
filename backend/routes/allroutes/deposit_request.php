<?php

use App\Http\Controllers\DepositRequestController;
use Illuminate\Support\Facades\Route;

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
