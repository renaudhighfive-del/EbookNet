<?php

namespace App\Http\Controllers\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Schema;

trait LogsActivity
{
    /**
     * Log an activity if ActivityLog model/table exists.
     */
    protected function logActivity($request, string $action, ?int $targetId = null, ?string $targetTable = null): void
    {
        try {
            // Vérifier si la table existe et si le modèle est disponible
            if (!class_exists(ActivityLog::class) || !Schema::hasTable('activity_logs')) {
                return;
            }

            ActivityLog::create([
                'user_id' => $request->user()?->id,
                'action' => $action,
                'target_table' => $targetTable,
                'target_id' => $targetId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Ne pas bloquer la requête si le log échoue
            \Log::warning('Failed to log activity: ' . $e->getMessage());
        }
    }
}
