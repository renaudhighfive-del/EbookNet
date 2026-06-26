<?php

namespace App\Http\Controllers;

use App\Models\DepositRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepositRequestController extends Controller
{
    /** GET /admin/deposits — Liste des demandes de dépôt pour l'admin */
    public function index(Request $request): JsonResponse
    {
        $query = DepositRequest::with(['applicant', 'assignedManager', 'category']);

        // Filtrer par statut
        if ($request->filled('status')) {
            $statuses = explode(',', $request->status);
            $query->whereIn('status', $statuses);
        }

        // Recherche
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhereHas('applicant', fn($q) => $q->where('first_name', 'like', "%{$s}%")
                                                    ->orWhere('last_name', 'like', "%{$s}%"));
            });
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $deposits = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($deposits);
    }

    /** GET /admin/deposits/{id} — Détail d'une demande de dépôt */
    public function show(int $id): JsonResponse
    {
        $deposit = DepositRequest::with(['applicant', 'assignedManager', 'category', 'reviews.reviewer'])
            ->findOrFail($id);

        return response()->json(['deposit_request' => $deposit]);
    }

    /** PATCH /admin/deposits/{id}/assign — Assigner un responsable à une demande */
    public function assign(Request $request, int $id): JsonResponse
    {
        $request->validate(['assigned_manager_id' => 'required|exists:users,id']);

        $deposit = DepositRequest::findOrFail($id);
        $deposit->update([
            'assigned_manager_id' => $request->assigned_manager_id,
            'status' => 'assigned',
        ]);

        return response()->json([
            'message' => 'Demande assignée avec succès.',
            'deposit_request' => $deposit->load('assignedManager'),
        ]);
    }

    /** PATCH /admin/deposits/{id}/approve — Approuver une demande (manager) */
    public function approve(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);

        if ($deposit->status !== 'assigned') {
            return response()->json(['message' => 'Cette demande doit être assignée avant d\'être approuvée.'], 400);
        }

        $deposit->update(['status' => 'approved_by_manager']);

        return response()->json([
            'message' => 'Demande approuvée par le manager.',
            'deposit_request' => $deposit,
        ]);
    }

    /** PATCH /admin/deposits/{id}/reject — Rejeter une demande (manager) */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate(['justification' => 'required|string']);

        $deposit = DepositRequest::findOrFail($id);

        if ($deposit->status !== 'assigned') {
            return response()->json(['message' => 'Cette demande doit être assignée avant d\'être rejetée.'], 400);
        }

        $deposit->update([
            'status' => 'rejected_by_manager',
            'rejection_reason' => $request->justification,
        ]);

        return response()->json([
            'message' => 'Demande rejetée.',
            'deposit_request' => $deposit,
        ]);
    }

    /** PATCH /admin/deposits/{id}/publish — Publier une référence (admin final) */
    public function publish(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);

        if ($deposit->status !== 'approved_by_manager') {
            return response()->json(['message' => 'Cette demande doit être approuvée par le manager avant publication.'], 400);
        }

        // Créer la référence publiée
        $reference = \App\Models\Reference::create([
            'title' => $deposit->title,
            'abstract' => $deposit->description,
            'publication_year' => $deposit->publication_year,
            'category_id' => $deposit->category_id,
            'status' => 'published',
            'uploaded_by' => $deposit->applicant_id,
        ]);

        // Marquer la demande comme publiée
        $deposit->update(['status' => 'published']);

        return response()->json([
            'message' => 'Référence publiée avec succès.',
            'reference' => $reference,
            'deposit_request' => $deposit,
        ]);
    }
}
