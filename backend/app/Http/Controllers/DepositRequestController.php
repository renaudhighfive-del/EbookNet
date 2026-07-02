<?php

namespace App\Http\Controllers;

use App\Models\DepositRequest;
use App\Http\Requests\Deposit\AssignDepositRequest;
use App\Http\Requests\Deposit\RejectDepositRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepositRequestController extends Controller
{
    /** GET /user/deposits — Liste des dépôts de l'utilisateur connecté */
    public function userDeposits(Request $request): JsonResponse
    {
        $deposits = DepositRequest::with(['applicant', 'assignedManager', 'category', 'reviews.reviewer', 'reference'])
            ->where('applicant_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($deposits);
    }

    /** POST /deposits — Créer une demande de dépôt (utilisateur) */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', DepositRequest::class);

        $validated = $request->validate([
            'title'            => 'required|string|max:500',
            'description'      => 'nullable|string|max:5000',
            'author'           => 'nullable|string|max:500',
            'publication_year' => 'nullable|integer|min:1000|max:9999',
            'category_id'      => 'nullable|exists:categories,id',
            'proposed_file'    => 'nullable|string|max:500',
        ]);

        $deposit = DepositRequest::create([
            'applicant_id'    => $request->user()->id,
            'title'           => $validated['title'],
            'description'     => $validated['description'] ?? null,
            'author'          => $validated['author'] ?? null,
            'publication_year'=> $validated['publication_year'] ?? null,
            'category_id'     => $validated['category_id'] ?? null,
            'proposed_file'   => $validated['proposed_file'] ?? null,
            'status'          => 'pending',
        ]);

        return response()->json([
            'message'         => 'Demande de dépôt créée avec succès.',
            'deposit_request' => $deposit->load(['applicant', 'category']),
        ], 201);
    }

    /** GET /admin/deposits — Liste des demandes de dépôt pour l'admin/responsable */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', DepositRequest::class);

        $query = DepositRequest::with(['applicant', 'assignedManager', 'category']);

        // Filtrer par statut
        if ($request->filled('status')) {
            $statuses = explode(',', $request->status);
            $query->whereIn('status', $statuses);
        }

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhereHas('applicant', fn($q) => $q->where('first_name', 'like', '%' . $search . '%')
                                                    ->orWhere('last_name', 'like', '%' . $search . '%'));
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

        $this->authorize('view', $deposit);

        return response()->json(['deposit_request' => $deposit]);
    }

    /** PATCH /admin/deposits/{id}/assign — Assigner un responsable à une demande */
    public function assign(AssignDepositRequest $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('assign', $deposit);
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
        $this->authorize('review', $deposit);

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
    public function reject(RejectDepositRequest $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('review', $deposit);

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
        $deposit = DepositRequest::with('category')->findOrFail($id);
        $this->authorize('review', $deposit);

        if ($deposit->status !== 'approved_by_manager') {
            return response()->json(['message' => 'Cette demande doit être approuvée par le manager avant publication.'], 400);
        }

        // Créer la référence publiée
        $reference = \App\Models\Reference::create([
            'title' => $deposit->title,
            'abstract' => $deposit->description,
            'publication_year' => $deposit->publication_year,
            'category_id' => $deposit->category_id,
            'file_path' => $deposit->proposed_file,
            'status' => 'published',
            'uploaded_by' => $deposit->applicant_id,
        ]);

        // Transférer les auteurs : parser le champ string author et créer/lier les entités Author
        if (!empty($deposit->author)) {
            $authorNames = array_map('trim', explode(',', $deposit->author));
            $authorIds = [];
            foreach ($authorNames as $name) {
                if (empty($name)) continue;
                $parts = explode(' ', $name, 2);
                $firstName = $parts[0] ?? '';
                $lastName = $parts[1] ?? '';
                $author = \App\Models\Author::firstOrCreate(
                    ['first_name' => $firstName, 'last_name' => $lastName]
                );
                $authorIds[] = $author->id;
            }
            if (!empty($authorIds)) {
                $reference->authors()->attach($authorIds);
            }
        }

        // Associer le dépôt à la référence créée
        $deposit->update([
            'status' => 'published',
            'reference_id' => $reference->id,
        ]);

        return response()->json([
            'message' => 'Référence publiée avec succès.',
            'reference' => $reference->load('category'),
            'deposit_request' => $deposit,
        ]);
    }
}
