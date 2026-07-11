<?php

namespace App\Http\Controllers;

use App\Http\Requests\Author\StoreAuthorRequest;
use App\Http\Requests\Author\UpdateAuthorRequest;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    /** GET /admin/authors — Liste paginée des auteurs */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Author::class);

        $query = Author::withCount('references');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('first_name', 'like', '%'.$search.'%')
                ->orWhere('last_name', 'like', '%'.$search.'%')
                ->orWhere('nationality', 'like', '%'.$search.'%')
            );
        }

        if ($request->filled('nationality')) {
            $query->where('nationality', $request->nationality);
        }

        $perPage = min((int) $request->input('per_page', 10), 100);
        $paginator = $query->orderBy('last_name', 'asc')->paginate($perPage);

        return response()->json($paginator);
    }

    /** GET /admin/authors/all — Liste toutes les auteurs (pour les select) */
    public function all(): JsonResponse
    {
        $this->authorize('viewAny', Author::class);

        $authors = Author::orderBy('last_name', 'asc')
            ->orderBy('first_name', 'asc')
            ->get(['id', 'first_name', 'last_name']);

        return response()->json(['authors' => $authors]);
    }

    /** GET /admin/authors/:id — Détail d'un auteur */
    public function show(int $id): JsonResponse
    {
        $author = Author::withCount('references')->findOrFail($id);
        $this->authorize('view', $author);

        return response()->json(['author' => $author]);
    }

    /** POST /admin/authors — Créer un auteur */
    public function store(StoreAuthorRequest $request): JsonResponse
    {
        $this->authorize('create', Author::class);

        $author = Author::create($request->validated());

        return response()->json(['message' => 'Auteur créé avec succès.', 'author' => $author], 201);
    }

    /** PUT /admin/authors/:id — Modifier un auteur */
    public function update(UpdateAuthorRequest $request, int $id): JsonResponse
    {
        $author = Author::withCount('references')->findOrFail($id);
        $this->authorize('update', $author);
        $author->update($request->validated());

        return response()->json(['message' => 'Auteur mis à jour avec succès.', 'author' => $author]);
    }

    /** DELETE /admin/authors/:id — Supprimer un auteur */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $author = Author::findOrFail($id);
        $this->authorize('delete', $author);

        // Vérifier si l'auteur a des références
        if ($author->references()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cet auteur car il est associé à des références.',
                'references_count' => $author->references()->count(),
            ], 400);
        }

        $author->delete();

        return response()->json(['message' => 'Auteur supprimé avec succès.']);
    }
}
