<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateUserStatusRequest;
use App\Http\Requests\User\UpdateUserRoleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ─── Helper pour logs d'activité ─────────────────────────────────────────────
    private function logActivity(Request $request, string $action, ?int $targetId = null): void
    {
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'target_table' => 'users',
            'target_id' => $targetId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    // ─── RH + Admin ───────────────────────────────────────────────────────────

    /** GET /hr/users — Liste paginée (filtre : role, status, search) */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        // Exclure les admins pour les RH (seul l'admin peut voir les admins)
        if ($request->user()->role === 'responsable_rh') {
            $query->where('role', '!=', 'admin');
        }

        if ($request->filled('role'))   $query->where('role',   $request->role);
        if ($request->filled('status')) $query->where('status', $request->status);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('first_name', 'like', '%' . $search . '%')
                ->orWhere('last_name',  'like', '%' . $search . '%')
                ->orWhere('email',      'like', '%' . $search . '%')
            );
        }

        $perPage = min((int) $request->input('per_page', 10), 9999);
        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Optimisation : une seule requête pour tous les counts
        $countsQuery = User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        // Exclure admin des counts pour RH
        if ($request->user()->role === 'responsable_rh') {
            unset($countsQuery['admin']);
        }

        // S'assurer que tous les rôles sont présents
        $defaultCounts = [
            'admin' => 0,
            'responsable_rh' => 0,
            'responsable_demande' => 0,
            'user' => 0,
        ];
        
        // Pour RH, ne pas inclure admin dans les counts
        if ($request->user()->role === 'responsable_rh') {
            unset($defaultCounts['admin']);
        }
        
        $counts = array_merge($defaultCounts, $countsQuery);

        $response = $paginator->toArray();
        $response['counts'] = $counts;

        return response()->json($response);
    }

    /** GET /hr/users/:id — Détail avec relations */
    public function show(string|int $id): JsonResponse
    {
        $user = User::findOrFail((int)$id);
        $this->authorize('view', $user);
        $user->load(['depositRequests', 'depositRequestReviews', 'activityLogs']);
        return response()->json(['user' => $user]);
    }

    /** POST /hr/users — Créer un compte
     *  RH  : rôle max = responsable_demande (admin bloqué côté logique)
     *  Admin : tous les rôles autorisés
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validated();

        if (isset($validated['role'])
            && $validated['role'] === 'admin'
            && $request->user()->role !== 'admin'
        ) {
            $validated['role'] = 'user';
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['role']   ??= 'user';
        $validated['status'] ??= 'active';

        $user = User::create($validated);
        $this->logActivity($request, "Création utilisateur: {$user->first_name} {$user->last_name} ({$user->role})", $user->id);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user'    => $user,
        ], 201);
    }

    /** PUT /hr/users/:id — Modifier infos (nom, email, téléphone, mdp)
     *  RH  : ne peut pas changer le rôle
     *  Admin : peut changer le rôle via ce endpoint ou /admin/users/:id/role
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);

        $validated = $request->validated();

        if (isset($validated['role'])) {
            if ($request->user()->role === 'admin') {
            } elseif ($request->user()->role === 'responsable_rh') {
                if (!in_array($validated['role'], ['user', 'responsable_rh', 'responsable_demande'])) {
                    unset($validated['role']);
                }
            } else {
                unset($validated['role']);
            }
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);
        $this->logActivity($request, "Modification utilisateur: {$user->first_name} {$user->last_name}", $user->id);

        return response()->json(['message' => 'Utilisateur mis à jour.', 'user' => $user]);
    }

    /** PATCH /hr/users/:id/status — Changer statut active ↔ inactive (RH + Admin)
     *  La suspension passe par /hr/users/:id/request-suspend (RH propose)
     *  ou /admin/users/:id/suspend (Admin directement)
     */
    public function updateStatus(UpdateUserStatusRequest $request, int $id): JsonResponse
    {
        $user      = User::findOrFail($id);
        $this->authorize('changeStatus', $user);
        $validated = $request->validated();
        $user->update($validated);
        $this->logActivity($request, "Changement statut utilisateur: {$user->first_name} {$user->last_name} → {$validated['status']}", $user->id);
        return response()->json(['message' => 'Statut mis à jour.', 'user' => $user]);
    }

    /** DELETE /hr/users/:id — Archivage du compte (soft-delete)
     *  Passe le statut à 'archived' — le compte est conservé en BDD mais inaccessible.
     */
    public function archive(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('changeStatus', $user);
        $user->update(['status' => 'archived']);
        $this->logActivity($request, "Archivage utilisateur: {$user->first_name} {$user->last_name}", $user->id);
        return response()->json(['message' => 'Compte archivé avec succès.', 'user' => $user]);
    }

    /** PATCH /hr/users/:id/request-suspend — RH propose une suspension
     *  Passe le statut à 'pending_suspension' — l'admin doit valider
     */
    public function requestSuspend(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('changeStatus', $user);
        $user->update(['status' => 'pending_suspension']);
        $this->logActivity($request, "Demande suspension utilisateur: {$user->first_name} {$user->last_name}", $user->id);
        return response()->json(['message' => 'Demande de suspension soumise à l\'admin.', 'user' => $user]);
    }

    // ─── Admin uniquement ─────────────────────────────────────────────────────

    /** PATCH /admin/users/:id/suspend — Suspendre un compte directement (admin) */
    public function suspend(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('changeStatus', $user);
        $user->update(['status' => 'suspended']);
        $this->logActivity($request, "Suspension utilisateur: {$user->first_name} {$user->last_name}", $user->id);
        return response()->json(['message' => 'Compte suspendu.', 'user' => $user]);
    }

    /** PATCH /admin/users/:id/role — Changer le rôle */
    public function updateRole(UpdateUserRoleRequest $request, int $id): JsonResponse
    {
        $user      = User::findOrFail($id);
        $this->authorize('changeRole', $user);
        $validated = $request->validated();
        $user->update($validated);
        $this->logActivity($request, "Changement rôle utilisateur: {$user->first_name} {$user->last_name} → {$validated['role']}", $user->id);
        return response()->json(['message' => 'Rôle mis à jour.', 'user' => $user]);
    }

    /** PATCH /admin/users/:id/restore — Restaurer un compte archivé/suspendu */
    public function restore(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('changeStatus', $user);
        $user->update(['status' => 'active']);
        $this->logActivity($request, "Restauration utilisateur: {$user->first_name} {$user->last_name}", $user->id);
        return response()->json(['message' => 'Compte restauré.', 'user' => $user]);
    }

    /** PATCH /admin/users/:id/approve — Approuver un compte inactif (nouvelles inscriptions)
     *  Active le compte → l'utilisateur peut se connecter
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('changeStatus', $user);
        $user->update(['status' => 'active']);
        $this->logActivity($request, "Approbation utilisateur: {$user->first_name} {$user->last_name}", $user->id);
        return response()->json(['message' => 'Compte approuvé et activé.', 'user' => $user]);
    }

    /** PATCH /admin/users/:id/validate-suspend — Valider la suspension proposée par le RH */
    public function validateSuspend(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('changeStatus', $user);
        $user->update(['status' => 'suspended']);
        $this->logActivity($request, "Validation suspension utilisateur: {$user->first_name} {$user->last_name}", $user->id);
        return response()->json(['message' => 'Suspension validée.', 'user' => $user]);
    }

  /** GET /admin/stats — Statistiques globales pour le dashboard admin */
  public function getStats(): JsonResponse
  {
    return response()->json([
      'total_references' => \App\Models\Reference::count(),
      'pending_deposits' => \App\Models\DepositRequest::where('status', 'pending')->count(),
      'active_users' => User::where('status', 'active')->count(),
      'total_downloads' => \App\Models\Download::count(),
      'total_views' => \App\Models\View::count(),
      'unread_notifications' => \App\Models\Notification::where('is_read', false)->count(),
    ]);
  }

  /** GET /user/dashboard — Dashboard pour utilisateur connecté */
  public function getUserDashboard(Request $request): JsonResponse
  {
    $user = $request->user();
    
    // Récupérer l'ensemble des dépôts de l'utilisateur
    $deposits = $user->depositRequests()->with(['reference', 'reviews'])->get();
    
    // Compter les statistiques
    $totalDeposits = $deposits->count();
    $pendingDeposits = $deposits->where('status', 'pending')->count();
    $approvedDeposits = $deposits->where('status', 'approved')->count();
    
    $recentActivity = $this->formatUserActivity($deposits, $user);
    
    return response()->json([
      'user' => $user,
      'stats' => [
        'totalDocuments' => $totalDeposits,
        'totalDownloads' => $user->downloads()->count(),
        'pendingDeposits' => $pendingDeposits,
        'approvedDeposits' => $approvedDeposits,
      ],
      'recentActivity' => $recentActivity,
    ]);
  }

  private function formatUserActivity($deposits, $user): array
  {
    $activities = [];
    
    // Ajouter les activités de dépôt
    foreach ($deposits as $deposit) {
      $activities[] = [
        'id' => $deposit->id,
        'type' => match ($deposit->status) {
          'pending' => 'deposit_submitted',
          'approved' => 'deposit_accepted',
          'rejected' => 'deposit_rejected',
          'assigned' => 'deposit_assigned',
          'published' => 'deposit_published',
          default => 'deposit_updated',
        },
        'description' => "Votre demande de dépôt '{$deposit->title}' a été {$this->getStatusDescription($deposit->status)})",
        'reference_title' => $deposit->reference?->title,
        'created_at' => $deposit->created_at,
      ];
    }
    
    // Ajouter les activités de téléchargement
    $downloadLogs = $user->downloads()->with('reference')->latest('downloaded_at')->take(3)->get();
    
    foreach ($downloadLogs as $download) {
      $activities[] = [
        'id' => 'dl' . $download->id,
        'type' => 'download',
        'description' => "Vous avez téléchargé '" . ($download->reference?->title ?? 'Document') . "'",
        'reference_title' => $download->reference?->title,
        'created_at' => $download->downloaded_at,
      ];
    }
    
    // Trier par date de création et limiter à 10 dernières activités
    usort($activities, function ($a, $b) {
      return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    return array_slice($activities, 0, 10);
  }

  private function getStatusDescription(string $status): string
  {
    $descriptions = [
      'pending' => 'soumise pour validation',
      'approved' => 'acceptée',
      'rejected' => 'rejetée',
      'assigned' => 'assignée à un responsable',
      'published' => 'publiée',
      'cancelled' => 'annulée',
      'returned' => 'retournée pour modification',
    ];
    
    return $descriptions[$status] ?? $status;
  }

    /** GET /admin/stats/deposits-by-month — Dépôts par mois pour le graphique */
    public function getDepositsByMonth(): JsonResponse
    {
        $deposits = \App\Models\DepositRequest::selectRaw('
            DATE_FORMAT(created_at, "%Y-%m") as month,
            COUNT(*) as total,
            SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
        ')
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        return response()->json($deposits);
    }

    /** GET /admin/stats/references-by-category — Références par catégorie pour le graphique */
    public function getReferencesByCategory(): JsonResponse
    {
        $categories = \App\Models\Category::withCount('references')
            ->orderBy('references_count', 'desc')
            ->get(['id', 'name', 'references_count']);

        return response()->json($categories);
    }

    /** GET /hr/users/archived — Liste des utilisateurs archivés (RH + Admin) */
    public function archivedUsers(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::where('status', 'archived');

        // Exclure les admins pour les RH
        if ($request->user()->role === 'responsable_rh') {
            $query->where('role', '!=', 'admin');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('first_name', 'like', '%' . $search . '%')
                ->orWhere('last_name',  'like', '%' . $search . '%')
                ->orWhere('email',      'like', '%' . $search . '%')
            );
        }

        $perPage = min((int) $request->input('per_page', 10), 9999);
        return response()->json($query->orderBy('created_at', 'desc')->paginate($perPage));
    }
}
