<?php

namespace App\Http\Controllers;

use App\Models\DepositRequest;
use App\Models\Reference;
use App\Models\Author;
use App\Models\ActivityLog;
use App\Models\User;
use App\Http\Requests\Deposit\AssignDepositRequest;
use App\Http\Requests\Deposit\RejectDepositRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepositRequestController extends Controller
{
    // Statuts qui indiquent qu'un responsable a déjà un dossier en cours d'examen
    // (même liste métier que MANAGER_BUSY_STATUSES côté store front — à garder
    // synchronisée si l'une des deux évolue).
    private const MANAGER_BUSY_STATUSES = ['assigned', 'approved_by_manager', 'rejected_by_manager', 'second_review'];

    // Libellés d'action affichés dans l'historique (doivent rester alignés avec
    // ce qu'attend le front, qui les affiche tels quels sans reformattage).
    private const ACTION_LABELS = [
        'submitted'                 => 'Soumission',
        'assigned'                  => 'Assignation',
        'reassigned'                => 'Réassignation',
        'unassigned'                => 'Annulation assignation',
        'reminder_sent'             => 'Relance responsable',
        'approved'                  => 'Approbation responsable',
        'rejected_by_manager'       => 'Rejet responsable',
        'second_opinion_requested'  => 'Demande de second avis',
        'published'                 => 'Approbation et publication',
        'published_override'       => 'Passer outre et publier',
        'unpublished'               => 'Dépublication',
        'rejected_definitive'       => 'Rejet définitif',
    ];

    /**
     * Enregistre une entrée d'historique pour un dépôt donné.
     */
    private function logActivity(Request $request, int $depositId, string $actionKey, ?string $comment = null): void
    {
        ActivityLog::create([
            'user_id'      => $request->user()->id,
            'action'       => $actionKey,
            'comment'      => $comment,
            'target_table' => 'deposit_requests',
            'target_id'    => $depositId,
            'ip_address'   => $request->ip(),
            'user_agent'   => $request->userAgent(),
        ]);
    }

    /**
     * Construit le tableau d'historique au format attendu par le front
     * ({actor, role, action, comment, at}) à partir des ActivityLog.
     */
    private function buildHistory(int $depositId): array
    {
        return ActivityLog::forTarget('deposit_requests', $depositId)
            ->with('user:id,first_name,last_name,role')
            ->orderBy('created_at')
            ->get()
            ->map(function (ActivityLog $log) {
                return [
                    'actor'   => $log->user ? trim("{$log->user->first_name} {$log->user->last_name}") : 'Système',
                    'role'    => $this->roleLabel($log->user->role ?? null),
                    'action'  => self::ACTION_LABELS[$log->action] ?? $log->action,
                    'comment' => $log->comment,
                    'at'      => $log->created_at?->toIso8601String(),
                ];
            })
            ->all();
    }

    private function roleLabel(?string $role): string
    {
        return match ($role) {
            'admin'               => 'Administrateur',
            'responsable_demande' => 'Responsable',
            default               => 'Utilisateur',
        };
    }

    /**
     * GET /admin/deposits/managers — Liste dynamique des responsables avec leur charge de travail
     */
    public function availableManagers(Request $request): JsonResponse
    {
        $managers = User::where('role', 'responsable_demande')
            ->where('status', 'active')
            ->withCount(['assignedDepositRequests as open_deposits' => function ($query) {
                $query->whereIn('status', self::MANAGER_BUSY_STATUSES);
            }])
            ->get();

        return response()->json($managers);
    }

    /** GET /user/deposits — Liste des dépôts de l'utilisateur connecté */
    public function userDeposits(Request $request): JsonResponse
    {
        $deposits = DepositRequest::with(['applicant', 'assignedManager', 'category', 'reviews.reviewer', 'reference'])
            ->where('applicant_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($deposits);
    }

    /** GET /user/deposits/{id} — Détail d'un dépôt pour l'utilisateur connecté */
    public function userDepositDetail(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::with(['applicant', 'assignedManager', 'category', 'reviews.reviewer', 'reference'])
            ->where('applicant_id', $request->user()->id)
            ->findOrFail($id);

        $payload = $deposit->toArray();
        $payload['history'] = $this->buildHistory($deposit->id);

        return response()->json(['deposit_request' => $payload]);
    }

    /** POST /deposits — Créer une demande de dépôt (utilisateur) */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', DepositRequest::class);

        $rules = [
            'title'            => 'required|string|max:500',
            'description'      => 'nullable|string|max:5000',
            'author'           => 'nullable|string|max:500',
            'publication_year' => 'nullable|integer|min:1000|max:9999',
            'category_id'      => 'nullable|exists:categories,id',
            'publisher'        => 'nullable|string|max:500',
            'isbn'             => 'nullable|string|max:20',
            'language'         => 'nullable|string|max:10',
            'type'             => 'nullable|string|max:50',
            'keywords'         => 'nullable|array',
            'keywords.*'       => 'string|max:100',
            'cover_image'      => 'nullable|string',
        ];

        if ($request->hasFile('proposed_file')) {
            $rules['proposed_file'] = 'nullable|file|mimes:pdf,epub,docx,doc|max:102400';
        } else {
            $rules['proposed_file'] = 'nullable|string|max:500';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('proposed_file')) {
            $validated['proposed_file'] = $request->file('proposed_file')->store('deposits', 'public');
        }

        $deposit = DepositRequest::create(array_merge($validated, [
            'applicant_id' => $request->user()->id,
            'status'       => 'pending',
        ]));

        $this->logActivity($request, $deposit->id, 'submitted');

        return response()->json([
            'message'         => 'Demande de dépôt créée avec succès.',
            'deposit_request' => $deposit->load(['applicant', 'category']),
        ], 201);
    }

    /** GET /admin/deposits — Liste filtrée et paginée pour l'administration */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', DepositRequest::class);

        $query = DepositRequest::with(['applicant', 'assignedManager', 'category']);

        if ($request->filled('status')) {
            $query->whereIn('status', explode(',', $request->status));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('applicant', fn ($q) => $q->where('first_name', 'like', "%{$search}%")
                                                    ->orWhere('last_name', 'like', "%{$search}%"));
            });
        }

        $deposits = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($deposits);
    }

    /** GET /admin/deposits/{id} — Détail complet d'une demande, historique inclus */
    public function show(int $id): JsonResponse
    {
        $deposit = DepositRequest::with(['applicant', 'assignedManager', 'category', 'reviews.reviewer'])
            ->findOrFail($id);

        $this->authorize('view', $deposit);

        $payload = $deposit->toArray();
        $payload['history'] = $this->buildHistory($deposit->id);

        return response()->json(['deposit_request' => $payload]);
    }

    /** PATCH /admin/deposits/{id}/assign — Assigner (ou réassigner) à un responsable */
    public function assign(AssignDepositRequest $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('assign', $deposit);

        if (!in_array($deposit->status, ['pending', 'assigned'], true)) {
            return response()->json(['message' => 'Cette demande ne peut plus être assignée dans son état actuel.'], 400);
        }

        // Vérification serveur (et non plus seulement côté front) que le
        // responsable ciblé n'a pas déjà un dossier ouvert en cours d'examen.
        $alreadyBusy = DepositRequest::where('assigned_manager_id', $request->assigned_manager_id)
            ->whereIn('status', self::MANAGER_BUSY_STATUSES)
            ->where('id', '!=', $id)
            ->exists();

        if ($alreadyBusy) {
            return response()->json(['message' => 'Ce responsable a déjà une demande en cours d\'examen.'], 409);
        }

        $isReassignment = $deposit->status === 'assigned';

        $deposit->update([
            'assigned_manager_id' => $request->assigned_manager_id,
            'status'              => 'assigned',
        ]);

        $this->logActivity($request, $id, $isReassignment ? 'reassigned' : 'assigned', $request->input('comment'));

        return response()->json([
            'message'         => 'Demande assignée avec succès.',
            'deposit_request' => $deposit->load('assignedManager'),
        ]);
    }

    /** PATCH /admin/deposits/{id}/unassign — Annuler l'assignation (retour à 'pending') */
    public function unassign(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('assign', $deposit);

        if ($deposit->status !== 'assigned') {
            return response()->json(['message' => 'Seule une demande assignée peut être désassignée.'], 400);
        }

        $deposit->update(['assigned_manager_id' => null, 'status' => 'pending']);
        $this->logActivity($request, $id, 'unassigned');

        return response()->json(['message' => 'Assignation annulée.', 'deposit_request' => $deposit]);
    }

    /** PATCH /admin/deposits/{id}/remind — Relancer le responsable assigné */
    public function remind(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('assign', $deposit);

        if ($deposit->status !== 'assigned' || !$deposit->assigned_manager_id) {
            return response()->json(['message' => 'Aucun responsable à relancer pour cette demande.'], 400);
        }

        // TODO: envoyer une notification/email réelle au responsable assigné
        // (Mail::to($deposit->assignedManager->email)->send(...)) — non
        // implémenté ici, hors périmètre de cette correction.
        $this->logActivity($request, $id, 'reminder_sent');

        return response()->json(['message' => 'Relance envoyée au responsable.']);
    }

    /** PATCH /admin/deposits/{id}/approve — Validation par le manager/responsable */
    public function approve(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('review', $deposit);

        // Accepte aussi 'second_review' : un responsable peut revalider après
        // qu'un second avis a été demandé (sinon aucun retour en arrière possible).
        if (!in_array($deposit->status, ['assigned', 'second_review'], true)) {
            return response()->json(['message' => 'Cette demande doit être assignée avant d\'être approuvée.'], 400);
        }

        $comment = $request->validate(['comment' => 'nullable|string|max:2000'])['comment'] ?? null;

        $deposit->update(['status' => 'approved_by_manager']);
        $this->logActivity($request, $id, 'approved', $comment);

        return response()->json([
            'message'         => 'Demande approuvée par le manager.',
            'deposit_request' => $deposit,
        ]);
    }

    /** PATCH /admin/deposits/{id}/reject — Rejet par le manager/responsable (non terminal) */
    public function reject(RejectDepositRequest $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('review', $deposit);

        if (!in_array($deposit->status, ['assigned', 'second_review'], true)) {
            return response()->json(['message' => 'Cette demande doit être assignée avant d\'être rejetée.'], 400);
        }

        $deposit->update([
            'status'           => 'rejected_by_manager',
            'rejection_reason' => $request->justification,
        ]);

        $this->logActivity($request, $id, 'rejected_by_manager', $request->justification);

        return response()->json([
            'message'         => 'Demande rejetée par le manager.',
            'deposit_request' => $deposit,
        ]);
    }

    /** PATCH /admin/deposits/{id}/second-opinion — L'admin demande un second avis au responsable */
    public function secondOpinion(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('review', $deposit);

        if (!in_array($deposit->status, ['approved_by_manager', 'rejected_by_manager'], true)) {
            return response()->json(['message' => 'Un second avis ne peut être demandé qu\'après une décision du responsable.'], 400);
        }

        $validated = $request->validate(['comment' => 'required|string|min:20|max:2000']);

        $deposit->update(['status' => 'second_review']);
        $this->logActivity($request, $id, 'second_opinion_requested', $validated['comment']);

        return response()->json(['message' => 'Second avis demandé.', 'deposit_request' => $deposit]);
    }

    /** PATCH /admin/deposits/{id}/reject-definitive — Rejet terminal par l'administrateur */
    public function rejectDefinitive(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('review', $deposit);

        // Couvre les 3 cas front : rejet direct (pending), rejet définitif
        // (approved_by_manager), confirmation de rejet (rejected_by_manager).
        if (!in_array($deposit->status, ['pending', 'approved_by_manager', 'rejected_by_manager', 'second_review'], true)) {
            return response()->json(['message' => 'Cette demande ne peut pas être rejetée définitivement dans son état actuel.'], 400);
        }

        $minLength = $deposit->status === 'pending' ? 30 : 20;
        $validated = $request->validate(['comment' => "required|string|min:{$minLength}|max:2000"]);

        $deposit->update(['status' => 'rejected']);
        $this->logActivity($request, $id, 'rejected_definitive', $validated['comment']);

        return response()->json(['message' => 'Demande rejetée définitivement.', 'deposit_request' => $deposit]);
    }

    /** PATCH /admin/deposits/{id}/publish — Publication définitive dans le catalogue (Admin final) */
    public function publish(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::with('category')->findOrFail($id);
        $this->authorize('review', $deposit);

        // 'second_review' (et non 'second_opinion', qui n'est qu'un nom côté
        // front) : l'admin peut publier directement après un second avis.
        if (!in_array($deposit->status, ['approved_by_manager', 'rejected_by_manager', 'second_review'], true)) {
            return response()->json(['message' => 'Cette demande n\'est pas dans un état publiable.'], 400);
        }

        $isOverride = $deposit->status === 'rejected_by_manager';
        $overrideComment = null;

        if ($isOverride) {
            $validated = $request->validate(['comment' => 'required|string|min:50|max:2000']);
            $overrideComment = $validated['comment'];
        }

        $reference = Reference::create([
            'title'            => $deposit->title,
            'abstract'         => $deposit->description,
            'publication_year' => $deposit->publication_year,
            'category_id'      => $deposit->category_id,
            'file_path'        => $deposit->proposed_file,
            'status'           => 'published',
            'uploaded_by'      => $deposit->applicant_id,
            'isbn'             => $deposit->isbn,
            'language'         => $deposit->language,
            'document_type'    => $deposit->type,
            'cover_image'      => $deposit->cover_image,
        ]);

        if (!empty($deposit->author)) {
            $authorNames = array_map('trim', explode(',', $deposit->author));
            $authorIds = [];
            foreach ($authorNames as $name) {
                if (empty($name)) continue;
                $parts = explode(' ', $name, 2);
                $author = Author::firstOrCreate([
                    'first_name' => $parts[0] ?? '',
                    'last_name'  => $parts[1] ?? '',
                ]);
                $authorIds[] = $author->id;
            }
            if (!empty($authorIds)) {
                $reference->authors()->attach($authorIds);
            }
        }

        $deposit->update([
            'status'         => 'published',
            'reference_id'   => $reference->id,
            'admin_override' => $isOverride,
        ]);

        $this->logActivity($request, $id, $isOverride ? 'published_override' : 'published', $overrideComment);

        return response()->json([
            'message'         => 'Référence publiée avec succès.',
            'reference'       => $reference->load('category'),
            'deposit_request' => $deposit,
        ]);
    }

    /** PATCH /admin/deposits/{id}/unpublish — Retire une référence publiée du catalogue */
    public function unpublish(Request $request, int $id): JsonResponse
    {
        $deposit = DepositRequest::findOrFail($id);
        $this->authorize('review', $deposit);

        if ($deposit->status !== 'published') {
            return response()->json(['message' => 'Seule une demande publiée peut être dépubliée.'], 400);
        }

        $validated = $request->validate(['comment' => 'required|string|min:30|max:2000']);

        if ($deposit->reference_id) {
            Reference::where('id', $deposit->reference_id)->update(['status' => 'archived']);
        }

        $deposit->update(['status' => 'pending', 'reference_id' => null]);
        $this->logActivity($request, $id, 'unpublished', $validated['comment']);

        return response()->json(['message' => 'Demande dépubliée.', 'deposit_request' => $deposit]);
    }
}