<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\PublisherController;
use App\Http\Controllers\ReferenceController;
use App\Http\Controllers\DepositRequestController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminPlanningController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  ESPACE ADMIN — Rôle : admin
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Tableau de bord & Statistiques
    Route::prefix('stats')->group(function () {
        Route::get('/', [UserController::class, 'getStats']);
        Route::get('/deposits-by-month', [UserController::class, 'getDepositsByMonth']);
        Route::get('/references-by-category', [UserController::class, 'getReferencesByCategory']);
    });

    // Gestion des Utilisateurs (Admin)
    Route::prefix('users')->group(function () {
        Route::patch('/{id}/approve',          [UserController::class, 'approve']);
        Route::patch('/{id}/suspend',          [UserController::class, 'suspend']);
        Route::patch('/{id}/validate-suspend', [UserController::class, 'validateSuspend']);
        Route::patch('/{id}/role',             [UserController::class, 'updateRole']);
        Route::patch('/{id}/restore',           [UserController::class, 'restore']);
    });

    // Gestion des Catégories
    Route::prefix('categories')->group(function () {
        Route::get('/',                [CategoryController::class, 'index']);
        Route::get('/all',             [CategoryController::class, 'all']);
        Route::post('/',               [CategoryController::class, 'store']);
        Route::get('/{id}',            [CategoryController::class, 'show']);
        Route::put('/{id}',            [CategoryController::class, 'update']);
        Route::delete('/{id}',         [CategoryController::class, 'destroy']);
        Route::patch('/{id}/status',   [CategoryController::class, 'toggleStatus']);
    });

    // Gestion des Auteurs
    Route::prefix('authors')->group(function () {
        Route::get('/',                [AuthorController::class, 'index']);
        Route::get('/all',             [AuthorController::class, 'all']);
        Route::post('/',               [AuthorController::class, 'store']);
        Route::get('/{id}',            [AuthorController::class, 'show']);
        Route::put('/{id}',            [AuthorController::class, 'update']);
        Route::delete('/{id}',         [AuthorController::class, 'destroy']);
    });

    // Gestion des Éditeurs
    Route::prefix('publishers')->group(function () {
        Route::get('/',                [PublisherController::class, 'index']);
        Route::get('/all',             [PublisherController::class, 'all'])->middleware('role:admin,user');
        Route::post('/',               [PublisherController::class, 'store']);
        Route::get('/{id}',            [PublisherController::class, 'show']);
        Route::put('/{id}',            [PublisherController::class, 'update']);
        Route::delete('/{id}',         [PublisherController::class, 'destroy']);
    });

    // Gestion des Références
    Route::prefix('references')->group(function () {
        Route::get('/',                [ReferenceController::class, 'index']);
        Route::get('/archived',         [ReferenceController::class, 'archivedReferences']);
        Route::get('/{id}',            [ReferenceController::class, 'show']);
        Route::post('/',               [ReferenceController::class, 'store']);
        Route::put('/{id}',            [ReferenceController::class, 'update']);
        Route::delete('/{id}',         [ReferenceController::class, 'destroy']);
        Route::patch('/{id}/status',   [ReferenceController::class, 'toggleStatus']);
        Route::patch('/{id}/restore',  [ReferenceController::class, 'restore']);
    });

    // Gestion des Demandes de Dépôt (Admin)
    // IMPORTANT : /managers est déclarée AVANT /{id} pour éviter que Laravel
    // ne l'interprète comme un id (les routes statiques doivent précéder les
    // routes à segment dynamique sur le même verbe HTTP).
    Route::prefix('deposits')->group(function () {
        Route::get('/managers',                 [DepositRequestController::class, 'availableManagers']);
        Route::get('/',                         [DepositRequestController::class, 'index']);
        Route::get('/{id}',                     [DepositRequestController::class, 'show']);
        Route::get('/{id}/file',                [DepositRequestController::class, 'serveFile']);
        Route::patch('/{id}/assign',            [DepositRequestController::class, 'assign']);
        Route::patch('/{id}/unassign',          [DepositRequestController::class, 'unassign']);
        Route::patch('/{id}/remind',            [DepositRequestController::class, 'remind']);
        Route::patch('/{id}/second-opinion',    [DepositRequestController::class, 'secondOpinion']);
        Route::patch('/{id}/reject-definitive', [DepositRequestController::class, 'rejectDefinitive']);
        Route::patch('/{id}/publish',           [DepositRequestController::class, 'publish']);
        Route::patch('/{id}/unpublish',         [DepositRequestController::class, 'unpublish']);
    });

    // Journal d'activité (Admin)
    Route::get('/activity-logs', [ActivityLogController::class, 'indexForAdmin']);

    // Planning admin
    Route::prefix('planning')->group(function () {
        Route::get('/availability-rules', [AdminPlanningController::class, 'getAvailabilityRules']);
        Route::post('/availability-rules', [AdminPlanningController::class, 'createAvailabilityRule']);
        Route::put('/availability-rules/{id}', [AdminPlanningController::class, 'updateAvailabilityRule']);
        Route::delete('/availability-rules/{id}', [AdminPlanningController::class, 'deleteAvailabilityRule']);
        Route::post('/availability-exceptions', [AdminPlanningController::class, 'createAvailabilityException']);
        Route::get('/appointments', [AdminPlanningController::class, 'getAppointments']);
        Route::get('/appointments/calendar', [AdminPlanningController::class, 'getCalendarAppointments']);
        Route::get('/appointments/{id}', [AdminPlanningController::class, 'getAppointment']);
        Route::post('/appointments/manual', [AdminPlanningController::class, 'createManualAppointment']);
        Route::put('/appointments/{id}', [AdminPlanningController::class, 'updateAppointment']);
        Route::post('/appointments/{id}/cancel', [AdminPlanningController::class, 'cancelAppointment']);
        Route::get('/settings', [AdminPlanningController::class, 'getSettings']);
        Route::put('/settings', [AdminPlanningController::class, 'updateSettings']);
        Route::get('/google-calendar/status', [AdminPlanningController::class, 'getGoogleCalendarStatus']);
        Route::get('/google-calendar/authorize', [AdminPlanningController::class, 'authorizeGoogleCalendar']);
        Route::get('/google-calendar/callback', [AdminPlanningController::class, 'handleGoogleCalendarCallback'])
                ->withoutMiddleware(['auth:sanctum', 'role:admin']);
        Route::post('/google-calendar/disconnect', [AdminPlanningController::class, 'disconnectGoogleCalendar']);
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  ESPACE RESPONSABLE — Rôle : responsable_demande
//  PROPOSITION : à fusionner avec un groupe existant si vous en avez déjà un
//  (ex: liste des dossiers qui lui sont assignés). Ce bloc ne fait que
//  raccorder les méthodes approve()/reject() du contrôleur, qui existaient
//  déjà mais n'étaient routées nulle part.
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:responsable_demande'])->prefix('responsable')->group(function () {
    Route::prefix('deposits')->group(function () {
        Route::patch('/{id}/approve', [DepositRequestController::class, 'approve']);
        Route::patch('/{id}/reject',  [DepositRequestController::class, 'reject']);
    });
});
