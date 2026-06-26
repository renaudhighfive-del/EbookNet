<?php
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  ACTIONS AVANCÉES — Admin uniquement
//  Permissions supplémentaires :
//    - Approuver un compte inactif (nouvelles inscriptions)
//    - Suspendre directement
//    - Valider une suspension proposée par le RH
//    - Changer le rôle
//    - Restaurer un compte suspendu/archivé
// ════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/users')
    ->group(function () {
        Route::patch('/{id}/approve',          [UserController::class, 'approve']);         // approuver inscription
        Route::patch('/{id}/suspend',          [UserController::class, 'suspend']);         // suspension directe
        Route::patch('/{id}/validate-suspend', [UserController::class, 'validateSuspend']); // valider suspension RH
        Route::patch('/{id}/role',             [UserController::class, 'updateRole']);      // changer rôle
        Route::patch('/{id}/restore',          [UserController::class, 'restore']);         // restaurer → active
    });
