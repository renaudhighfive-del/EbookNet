<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActivityLogController;

// ════════════════════════════════════════════════════════════════════════════
//  JOURNAL D'ACTIVITÉ — RH & ADMIN
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:responsable_rh'])
    ->get('/hr/activity-logs', [ActivityLogController::class, 'indexForRH']);


Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/activity-logs', [ActivityLogController::class, 'indexForAdmin']);

