<?php

namespace App\Http\Controllers;

use App\Models\Publisher;
use App\Http\Requests\Publisher\StorePublisherRequest;
use App\Http\Requests\Publisher\UpdatePublisherRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublisherController extends Controller
{
    /** GET /admin/publishers — Liste paginée des éditeurs */
    public function index(Request $request): JsonResponse
    {
        $query = Publisher::withCount('references');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('name', 'like', '%' . $search . '%')
                ->orWhere('country', 'like', '%' . $search . '%')
            );
        }

        if ($request->filled('country')) {
            $query->where('country', $request->country);
        }

        $perPage = min((int) $request->input('per_page', 10), 100);
        $paginator = $query->orderBy('name', 'asc')->paginate($perPage);

        return response()->json($paginator);
    }

    /** GET /admin/publishers/all — Liste tous les éditeurs (pour les select) */
    public function all(): JsonResponse
    {
        $publishers = Publisher::orderBy('name', 'asc')
            ->get(['id', 'name', 'country']);

        return response()->json(['publishers' => $publishers]);
    }

    /** GET /admin/publishers/:id — Détail d'un éditeur */
    public function show(int $id): JsonResponse
    {
        $publisher = Publisher::withCount('references')->findOrFail($id);
        return response()->json(['publisher' => $publisher]);
    }

    /** POST /admin/publishers — Créer un éditeur */
    public function store(StorePublisherRequest $request): JsonResponse
    {
        $publisher = Publisher::create($request->validated());

        return response()->json(['message' => 'Éditeur créé avec succès.', 'publisher' => $publisher], 201);
    }

    /** PUT /admin/publishers/:id — Modifier un éditeur */
    public function update(UpdatePublisherRequest $request, int $id): JsonResponse
    {
        $publisher = Publisher::withCount('references')->findOrFail($id);
        $publisher->update($request->validated());

        return response()->json(['message' => 'Éditeur mis à jour avec succès.', 'publisher' => $publisher]);
    }

    /** DELETE /admin/publishers/:id — Supprimer un éditeur */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $publisher = Publisher::findOrFail($id);

        if ($publisher->references()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cet éditeur car il est associé à des références.',
                'references_count' => $publisher->references()->count()
            ], 400);
        }

        $publisher->delete();

        return response()->json(['message' => 'Éditeur supprimé avec succès.']);
    }
}
