<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// User management routes (RH and Admin)
Route::middleware(['auth:sanctum'])->prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index'])->middleware('role:responsable_rh,admin');
    Route::post('/', [UserController::class, 'store'])->middleware('role:responsable_rh,admin');
    Route::get('/{id}', [UserController::class, 'show'])->middleware('role:responsable_rh,admin');
    Route::put('/{id}', [UserController::class, 'update'])->middleware('role:responsable_rh,admin');
    Route::patch('/{id}/status', [UserController::class, 'updateStatus'])->middleware('role:responsable_rh,admin');
    Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('role:responsable_rh,admin');
});

Route::get('/test', fn () => response()->json([
    'status'  => true,
    'message' => 'API is working correctly 🚀',
]));