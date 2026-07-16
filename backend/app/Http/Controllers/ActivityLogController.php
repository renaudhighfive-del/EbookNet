<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /** GET /hr/activity-logs — Logs d'activité pour RH (gestion utilisateurs unique...
    public function indexForRH(Request $request): JsonResponse
    {
        $query = ActivityLog::with(['user' => function ($q) {
            $q->select('id', 'first_name', 'last_name', 'email', 'role');
        }])
            ->where('target_table', 'users')
            ->orderBy('created_at', 'desc');

        // Filtres
        if ($request->filled('action')) {
            $query->where('action', 'like', '%'.$request->action.'%');
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $perPage = min((int) $request->input('per_page', 50), 100);

        return response()->json($query->paginate($perPage));
    }

    /** GET /admin/activity-logs — Logs d'activité pour Admin (tous les logs) */
    public function indexForAdmin(Request $request): JsonResponse
    {
        $query = ActivityLog::with(['user' => function ($q) {
            $q->select('id', 'first_name', 'last_name', 'email', 'role');
        }])
            ->orderBy('created_at', 'desc');

        // Filtres
        if ($request->filled('action')) {
            $query->where('action', 'like', '%'.$request->action.'%');
        }
        if ($request->filled('target_table')) {
            $query->where('target_table', $request->target_table);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $perPage = min((int) $request->input('per_page', 50), 100);

        return response()->json($query->paginate($perPage));
    }
}
